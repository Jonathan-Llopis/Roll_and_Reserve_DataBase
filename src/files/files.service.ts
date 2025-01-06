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

  async readStream(id: string): Promise<GridFSBucketReadStream> {
    try {
      const objectId = new ObjectId(id);
      return this.bucket.openDownloadStream(objectId);
    } catch (error) {
      console.error('Error al obtener el stream:', error);
      throw new HttpException(
        'Error al obtener el stream',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findInfo(id: string): Promise<FileInfoVm> {
    try {
      const objectId = new ObjectId(id);
      const files = await this.connection.db
        .collection('fs.files')
        .findOne({ _id: objectId });

      if (!files) {
        throw new HttpException('File not found', HttpStatus.NOT_FOUND);
      }

      return {
        filename: files.filename,
        length: files.length,
        chunkSize: files.chunkSize,
        contentType: files.contentType,
      };
    } catch (error) {
      console.error('Error al buscar archivo:');
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Error code:', error.code);
      console.error('Error name:', error.name);
      throw new HttpException(
        'Error al buscar archivo',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteFile(id: string): Promise<boolean> {
    try {
      const objectId = new ObjectId(id);
      await this.bucket.delete(objectId);
      return true;
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      throw new HttpException(
        'Error al eliminar archivo',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(): Promise<{ id: string; file: FileInfoVm }[]> {
    try {
      const files = await this.connection.db
        .collection('fs.files')
        .find({})
        .toArray();

      return files.map((file) => ({
        id: file._id.toString(),
        file: {
          filename: file.filename,
          length: file.length,
          chunkSize: file.chunkSize,
          contentType: file.contentType,
        },
      }));
    } catch (error) {
      console.error('Error al obtener todos los archivos:', error);
      throw new HttpException(
        'Error al obtener todos los archivos',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
