import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { GridFSBucket, GridFSBucketReadStream, ObjectId } from 'mongodb';
import { FileInfoVm } from './view-models/file-info-vm.model';

@Injectable()
export class FilesService {
  private bucket: GridFSBucket;

  /**
   * Initialize the GridFSBucket for the given connection.
   *
   * @param {Connection} connection - The MongoDB connection.
   */
  constructor(@InjectConnection() private readonly connection: Connection) {
    this.bucket = new GridFSBucket(this.connection.db, { bucketName: 'fs' });
  }

  /**
   * Throws an HttpException for the given error, or a default BAD_REQUEST
   * error if the given error is not an HttpException.
   *
   * @param err - The error to throw.
   * @param status - The HTTP status code to use, defaults to BAD_REQUEST.
   */
  private handleError(
    err: any,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ): never {
    if (err instanceof HttpException) {
      throw err;
    }
    throw new HttpException(err.message || 'Request failed', status);
  }

  /**
   * Streams a file from GridFS.
   *
   * Method: GET /files/:id/stream
   * Description: Streams a file from GridFS.
   * Input Parameters:
   * - `id` (string, required): The ID of the file to stream.
   * Example Request (JSON format): N/A
   * HTTP Responses:
   * - `200 OK`: The file is streamed back to the client.
   * - `404 NOT FOUND`: The file is not found.
   */
  async readStream(id: string): Promise<GridFSBucketReadStream> {
    try {
      const objectId = new ObjectId(id);
      const stream = this.bucket.openDownloadStream(objectId);
      if (!stream) {
        this.handleError(new Error('File not found'), HttpStatus.NOT_FOUND);
      }
      return stream;
    } catch (err) {
      this.handleError(err, HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Retrieves the file metadata by its ID.
   *
   * Method: GET /files/info/:id
   * Description: Retrieves the file metadata by its ID.
   * Input Parameters:
   * - `id` (string, required): The ID of the file to retrieve.
   * HTTP Responses:
   * - `200 OK`: Successfully retrieved file info.
   * - `404 NOT FOUND`: The file is not found.
   */
  async findInfo(id: string): Promise<FileInfoVm> {
    try {
      const objectId = new ObjectId(id);
      const file = await this.connection.db
        .collection('fs.files')
        .findOne({ _id: objectId });

      if (!file) {
        this.handleError(new Error('File not found'), HttpStatus.NOT_FOUND);
      }

      return {
        filename: file.filename,
        length: file.length,
        chunkSize: file.chunkSize,
        contentType: file.contentType,
      };
    } catch (err) {
      this.handleError(err, HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Deletes a file from GridFS.
   *
   * Method: DELETE /files/:id
   * Description: Deletes a file from GridFS.
   * Input Parameters:
   * - `id` (string, required): The ID of the file to delete.
   * HTTP Responses:
   * - `200 OK`: The file is deleted.
   * - `404 NOT FOUND`: The file is not found.
   */
  async deleteFile(id: string): Promise<boolean> {
    try {
      const objectId = new ObjectId(id);
      await this.bucket.delete(objectId);
      return true;
    } catch (err) {
      this.handleError(err, HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Retrieves all files from GridFS.
   *
   * Method: GET /files
   * Description: Retrieves all files from GridFS.
   * HTTP Responses:
   * - `200 OK`: Successfully retrieved all files.
   * - `204 NO CONTENT`: No files found.
   * - `400 BAD REQUEST`: An unexpected error occurred.
   */
  async findAll(): Promise<{ id: string; file: FileInfoVm }[]> {
    try {
      const files = await this.connection.db
        .collection('fs.files')
        .find({})
        .toArray();

      if (files.length === 0) {
        throw new HttpException('No Content', HttpStatus.NO_CONTENT);
      }

      return files.map((file) => ({
        id: file._id.toString(),
        file: {
          filename: file.filename,
          length: file.length,
          chunkSize: file.chunkSize,
          contentType: file.contentType,
        },
      }));
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException(
       'Bad Request',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
