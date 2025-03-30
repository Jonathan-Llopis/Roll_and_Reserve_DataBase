import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('FilesService', () => {
    let service: FilesService;
    let connection: Connection;
    let bucket: GridFSBucket;

    beforeEach(async () => {
        const mockConnection = {
            db: {
                collection: jest.fn().mockReturnThis(),
                findOne: jest.fn(),
                find: jest.fn().mockReturnThis(),
                toArray: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FilesService,
                {
                    provide: getConnectionToken(),
                    useValue: mockConnection,
                },
            ],
        }).compile();

        service = module.get<FilesService>(FilesService);
        connection = module.get<Connection>(getConnectionToken());
        bucket = new GridFSBucket(connection.db, { bucketName: 'fs' });
        service['bucket'] = bucket;
    });

    it('should return a file read stream', async () => {
        const mockStream = {};
        jest.spyOn(bucket, 'openDownloadStream').mockReturnValue(mockStream as any);

        const result = await service.readStream(new ObjectId().toString());
        expect(result).toBe(mockStream);
    });

    it('should throw HttpException when file is not found in readStream', async () => {
        jest.spyOn(bucket, 'openDownloadStream').mockImplementation(() => {
            throw new Error('File not found');
        });

        await expect(service.readStream(new ObjectId().toString())).rejects.toThrow(
            new HttpException('File not found', HttpStatus.NOT_FOUND),
        );
    });

    it('should return file info', async () => {
        const mockFile = {
            _id: new ObjectId(),
            filename: 'test.txt',
            length: 123,
            chunkSize: 256,
            contentType: 'text/plain',
        };
        jest.spyOn(connection.db.collection('fs.files'), 'findOne').mockResolvedValue(mockFile);

        const result = await service.findInfo(new ObjectId().toString());
        expect(result).toEqual({
            filename: mockFile.filename,
            length: mockFile.length,
            chunkSize: mockFile.chunkSize,
            contentType: mockFile.contentType,
        });
    });

    it('should throw HttpException when file info is not found', async () => {
        jest.spyOn(connection.db.collection('fs.files'), 'findOne').mockResolvedValue(null);

        await expect(service.findInfo(new ObjectId().toString())).rejects.toThrow(
            new HttpException('File not found', HttpStatus.NOT_FOUND),
        );
    });

    it('should delete a file', async () => {
        jest.spyOn(bucket, 'delete').mockResolvedValue(undefined);

        const result = await service.deleteFile(new ObjectId().toString());
        expect(result).toBe(true);
    });

    it('should throw HttpException when deleting a non-existent file', async () => {
        jest.spyOn(bucket, 'delete').mockImplementation(() => {
            throw new Error('File not found');
        });

        await expect(service.deleteFile(new ObjectId().toString())).rejects.toThrow(
            new HttpException('File not found', HttpStatus.NOT_FOUND),
        );
    });

    it('should return all files', async () => {
        const mockFiles = [
            {
                _id: new ObjectId(),
                filename: 'file1.txt',
                length: 123,
                chunkSize: 256,
                contentType: 'text/plain',
            },
            {
                _id: new ObjectId(),
                filename: 'file2.txt',
                length: 456,
                chunkSize: 512,
                contentType: 'text/plain',
            },
        ];
        jest.spyOn(connection.db.collection('fs.files'), 'find').mockReturnValue({
            toArray: jest.fn().mockResolvedValue(mockFiles),
        } as any);

        const result = await service.findAll();
        expect(result).toEqual(
            mockFiles.map((file) => ({
                id: file._id.toString(),
                file: {
                    filename: file.filename,
                    length: file.length,
                    chunkSize: file.chunkSize,
                    contentType: file.contentType,
                },
            })),
        );
    });

    it('should throw HttpException when no files are found', async () => {
        jest.spyOn(connection.db.collection('fs.files'), 'find').mockReturnValue({
            toArray: jest.fn().mockResolvedValue([]),
        } as any);

        await expect(service.findAll()).rejects.toThrow(
            new HttpException('No Content', HttpStatus.NO_CONTENT),
        );
    });
});