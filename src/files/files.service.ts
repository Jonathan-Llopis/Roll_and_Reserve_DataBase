import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { GridFSBucket, GridFSBucketReadStream, ObjectId } from 'mongodb';
import { FileInfoVm } from './view-models/file-info-vm.model';

@Injectable()
export class FilesService {
  private bucket: GridFSBucket;

  constructor(@InjectConnection() private readonly connection: Connection) {
    this.bucket = new GridFSBucket(this.connection.db, { bucketName: 'fs' });
  }

  private handleError(
    err: any,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ): never {
    if (err instanceof HttpException) {
      throw err;
    }
    throw new HttpException(err.message || 'Request failed', status);
  }

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

  async deleteFile(id: string): Promise<boolean> {
    try {
      const objectId = new ObjectId(id);
      await this.bucket.delete(objectId);
      return true;
    } catch (err) {
      this.handleError(err, HttpStatus.NOT_FOUND);
    }
  }

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
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
