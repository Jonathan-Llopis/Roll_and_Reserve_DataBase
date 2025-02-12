import {
  Post,
  Get,
  Param,
  Res,
  Controller,
  UseInterceptors,
  UploadedFiles,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { FileResponseVm } from './view-models/file-response-vm.model';
import { UsersService } from '../users/users.service';
import { FileInfoVm } from './view-models/file-info-vm.model';
import { ShopsService } from '../shops/shops.service';
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { ShopsEntity } from 'src/shops/shops.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/users/users.entity';

@Controller('/files')
export class FilesController {
  constructor(
    private filesService: FilesService,
     @InjectRepository(UserEntity)
        private readonly usersRepository: Repository<UserEntity>,
    private readonly userService: UsersService,
    @InjectRepository(ShopsEntity)
        private readonly shopRepository: Repository<ShopsEntity>,
    private readonly shopService: ShopsService,
  ) {}

  @Post('')
  @UseInterceptors(FilesInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { 
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload files' })
  @ApiResponse({ status: 201, description: 'Files successfully uploaded.' })
  @ApiResponse({ status: 400, description: 'An error occurred while uploading files.' })
  async upload(@UploadedFiles() files) {
    const response = [];
    files.forEach((file) => {
      const fileReponse = {
        originalname: file.originalname,
        encoding: file.encoding,
        mimetype: file.mimetype,
        id: file.id,
        filename: file.filename,
        metadata: file.metadata,
        bucketName: file.bucketName,
        chunkSize: file.chunkSize,
        size: file.size,
        md5: file.md5,
        uploadDate: file.uploadDate,
        contentType: file.contentType,
      };
      response.push(fileReponse);
    });
    return response;
  }

  @Get('')
  @ApiOperation({ summary: 'Get all files' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved all files.', type: [FileInfoVm] })
  @ApiResponse({ status: 204, description: 'No content.' })
  @ApiResponse({ status: 400, description: 'An error occurred while retrieving files.' })
  async getAllFiles(): Promise<{ id: string; file: FileInfoVm }[]> {
    const files = await this.filesService.findAll();
    return files;
  }

  @Get('info/:id')
  @ApiOperation({ summary: 'Get file info by ID' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved file info.', type: FileResponseVm })
  @ApiResponse({ status: 400, description: 'Invalid file ID.' })
  @ApiResponse({ status: 404, description: 'File not found.' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID of the file', example: '12345' })
  async getFileInfo(@Param('id') id: string): Promise<FileResponseVm> {
    const file = await this.filesService.findInfo(id);
    const filestream = await this.filesService.readStream(id);
    if (!filestream) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }
    return {
      message: 'File has been detected',
      file: file,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file by ID' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved file.' })
  @ApiResponse({ status: 400, description: 'Invalid file ID.' })
  @ApiResponse({ status: 404, description: 'File not found.' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID of the file', example: '12345' })
  async getFile(@Param('id') id: string, @Res() res) {
    const file = await this.filesService.findInfo(id);
    const filestream = await this.filesService.readStream(id);
    if (!filestream) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }
    res.header('Content-Type', file.contentType);
    return filestream.pipe(res);
  }

  @Get('download/:id')
  @ApiOperation({ summary: 'Download file by ID' })
  @ApiResponse({ status: 200, description: 'Successfully downloaded file.' })
  @ApiResponse({ status: 400, description: 'Invalid file ID.' })
  @ApiResponse({ status: 404, description: 'File not found.' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID of the file', example: '12345' })
  async downloadFile(@Param('id') id: string, @Res() res) {
    const file = await this.filesService.findInfo(id);
    const filestream = await this.filesService.readStream(id);
    if (!filestream) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }
    res.header('Content-Type', file.contentType);
    res.header('Content-Disposition', 'attachment; filename=' + file.filename);
    return filestream.pipe(res);
  }

  @Get('delete/:id')
  @ApiOperation({ summary: 'Delete file by ID' })
  @ApiResponse({ status: 200, description: 'Successfully deleted file.', type: FileResponseVm })
  @ApiResponse({ status: 400, description: 'Invalid file ID.' })
  @ApiResponse({ status: 404, description: 'File not found.' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID of the file', example: '12345' })
  async deleteFile(@Param('id') id: string): Promise<FileResponseVm> {
    const file = await this.filesService.findInfo(id);
    const filestream = await this.filesService.deleteFile(id);
    if (!filestream) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }
    return {
      message: 'File has been deleted',
      file: file,
    };
  }

  @Post('avatar/:id')
  @UseInterceptors(
    FilesInterceptor('file', 10, {
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          return callback(new HttpException('Only image files are allowed', HttpStatus.BAD_REQUEST), false);
        }
        callback(null, true);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { 
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload avatar for user by ID' })
  @ApiResponse({ status: 200, description: 'Successfully uploaded avatar.' })
  @ApiResponse({ status: 400, description: 'Invalid user ID or file type.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID of the user', example: '12345' })
  async uploadAvatar(@UploadedFiles() files, @Param('id') idUser: string) {
    const user = await this.usersRepository.findOne({ where: { id_google: idUser } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const response = [];
    files.forEach((file) => {
      const fileReponse = {
        originalname: file.originalname,
        encoding: file.encoding,
        mimetype: file.mimetype,
        id: file.id,
        filename: file.filename,
        metadata: file.metadata,
        bucketName: file.bucketName,
        chunkSize: file.chunkSize,
        size: file.size,
        md5: file.md5,
        uploadDate: file.uploadDate,
        contentType: file.contentType,
      };
      this.userService.vincularArchivo(idUser, file.id);
      response.push(fileReponse);
    });
    return response;
  }

  @Post('logo/:id')
  @UseInterceptors(
    FilesInterceptor('file', 10, {
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          return callback(new HttpException('Only image files are allowed', HttpStatus.BAD_REQUEST), false);
        }
        callback(null, true);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { 
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload logo for shop by ID' })
  @ApiResponse({ status: 200, description: 'Successfully uploaded logo.' })
  @ApiResponse({ status: 400, description: 'Invalid shop ID or file type.' })
  @ApiResponse({ status: 404, description: 'Shop not found.' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID of the shop', example: '12345' })
  async uploadShopLogo(@UploadedFiles() files, @Param('id') idShop: string) {
    if (isNaN(Number(idShop))) {
      throw new HttpException('Invalid shop ID. ID must be a number.', HttpStatus.BAD_REQUEST);
    }
    const shop = await this.shopRepository.findOne({ where: { id_shop: parseInt(idShop) } });
    if (!shop) {
      throw new HttpException('Shop not found', HttpStatus.NOT_FOUND);
    }
    const response = [];
    files.forEach((file) => {
      const fileReponse = {
        originalname: file.originalname,
        encoding: file.encoding,
        mimetype: file.mimetype,
        id: file.id,
        filename: file.filename,
        metadata: file.metadata,
        bucketName: file.bucketName,
        chunkSize: file.chunkSize,
        size: file.size,
        md5: file.md5,
        uploadDate: file.uploadDate,
        contentType: file.contentType,
      };
      this.shopService.vincularArchivo(idShop, file.id);
      response.push(fileReponse);
    });
    return response;
  }
}
