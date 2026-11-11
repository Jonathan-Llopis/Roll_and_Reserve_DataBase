import { Test, TestingModule } from '@nestjs/testing';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { UsersService } from '../users/users.service';
import { ShopsService } from '../shops/shops.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../users/users.entity';
import { ShopsEntity } from '../shops/shops.entity';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('FilesController (HTTP Cache & GridFS)', () => {
  let controller: FilesController;
  let filesService: FilesService;

  const mockFile = {
    _id: '507f1f77bcf86cd799439011',
    filename: 'logo.png',
    contentType: 'image/png',
    md5: 'd41d8cd98f00b204e9800998ecf8427e',
    length: 1024,
    chunkSize: 256,
    uploadDate: new Date(),
  };

  const mockStream = {
    pipe: jest.fn().mockImplementation((res) => res),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        {
          provide: FilesService,
          useValue: {
            findInfo: jest.fn(),
            readStream: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {},
        },
        {
          provide: ShopsService,
          useValue: {},
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {},
        },
        {
          provide: getRepositoryToken(ShopsEntity),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<FilesController>(FilesController);
    filesService = module.get<FilesService>(FilesService);
  });

  it('should serve file with Cache-Control and ETag headers on cache miss', async () => {
    jest.spyOn(filesService, 'findInfo').mockResolvedValue(mockFile as any);
    jest.spyOn(filesService, 'readStream').mockResolvedValue(mockStream as any);

    const headers: Record<string, string> = {};
    const res: any = {
      header: jest.fn((k, v) => {
        headers[k] = v;
      }),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const req: any = { headers: {} };

    await controller.getFile('507f1f77bcf86cd799439011', req, res);

    expect(res.header).toHaveBeenCalledWith(
      'Cache-Control',
      'public, max-age=604800, immutable',
    );
    expect(res.header).toHaveBeenCalledWith(
      'ETag',
      '"d41d8cd98f00b204e9800998ecf8427e"',
    );
    expect(res.header).toHaveBeenCalledWith('Content-Type', 'image/png');
    expect(mockStream.pipe).toHaveBeenCalledWith(res);
  });

  it('should return 304 Not Modified when client provides matching If-None-Match ETag', async () => {
    jest.spyOn(filesService, 'findInfo').mockResolvedValue(mockFile as any);
    const readStreamSpy = jest.spyOn(filesService, 'readStream');

    const res: any = {
      header: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const req: any = {
      headers: {
        'if-none-match': '"d41d8cd98f00b204e9800998ecf8427e"',
      },
    };

    await controller.getFile('507f1f77bcf86cd799439011', req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_MODIFIED);
    expect(res.send).toHaveBeenCalled();
    // GridFS readStream must NOT be called on 304 hit, saving IO and bandwidth
    expect(readStreamSpy).not.toHaveBeenCalled();
  });

  it('should throw 404 when file does not exist', async () => {
    jest.spyOn(filesService, 'findInfo').mockResolvedValue(null);
    const res: any = { header: jest.fn() };
    const req: any = { headers: {} };

    await expect(controller.getFile('non-existent-id', req, res)).rejects.toThrow(
      HttpException,
    );
  });
});
