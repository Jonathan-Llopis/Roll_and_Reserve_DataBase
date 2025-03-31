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
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { ShopsEntity } from '../shops/shops.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/users.entity';

@Controller('/files')
export class FilesController {
/**
 * Initializes the FilesController with necessary services and repositories.
 *
 * @param filesService - Handles file-related operations.
 * @param usersRepository - Repository for accessing UserEntity data.
 * @param userService - Provides user-related services.
 * @param shopRepository - Repository for accessing ShopsEntity data.
 * @param shopService - Provides shop-related services.
 */

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
  @ApiBearerAuth()
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
  @ApiResponse({
    status: 400,
    description: 'An error occurred while uploading files.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  /**
   * Uploads multiple files.
   *
   * Method: POST /files
   *
   * Description: Uploads up to 10 files. Each file is limited to 10MB.
   *
   * Input Parameters:
   * - `files` (array of file objects, required): Files to upload.
   *   - `file` (object, required): File to upload.
   *     - `originalname` (string, required): Original filename.
   *     - `encoding` (string, required): Encoding type.
   *     - `mimetype` (string, required): MIME type.
   *     - `id` (string, required): Unique ID assigned by GridFS.
   *     - `filename` (string, required): Filename after upload.
   *     - `metadata` (object, optional): Metadata associated with file.
   *     - `bucketName` (string, required): Name of GridFS bucket.
   *     - `chunkSize` (number, required): File chunk size.
   *     - `size` (number, required): File size in bytes.
   *     - `md5` (string, required): MD5 hash of file.
   *     - `uploadDate` (Date, required): Timestamp of upload.
   *     - `contentType` (string, required): MIME type of file.
   *
   * HTTP Responses:
   * - `201 Created`: Files successfully uploaded.
   *   - Response body: Array of file objects.
   *   - Example: [
   *     {
   *       "originalname": "example.txt",
   *       "encoding": "7bit",
   *       "mimetype": "text/plain",
   *       "id": "5e9f8f8f8f8f8f8f",
   *       "filename": "5e9f8f8f8f8f8f8f-example.txt",
   *       "metadata": {},
   *       "bucketName": "fs",
   *       "chunkSize": 261120,
   *       "size": 12345,
   *       "md5": "d41d8cd98f00b204e9800998ecf8427e",
   *       "uploadDate": "2020-04-08T19:30:00.000Z",
   *       "contentType": "text/plain"
   *     }
   *   ]
   * - `400 Bad Request`: An error occurred while uploading files.
   * - `401 Unauthorized`: Unauthorized.
   */
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

  @Post('avatar/:id')
  @ApiBearerAuth()
  @UseInterceptors(
    FilesInterceptor('file', 10, {
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          return callback(
            new HttpException(
              'Only image files are allowed',
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
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
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'ID of the user',
    example: '12345',
  })
  /**
   * Uploads an avatar image for a user.
   *
   * Method: POST /files/avatar/:id
   *
   * Description: Uploads an avatar image for a user with the given ID.
   *              The avatar image is limited to 2MB.
   *
   * Input Parameters:
   * - `id` (string, required): ID of the user.
   * - `file` (file object, required): Avatar image to upload.
   *   - `originalname` (string, required): Original filename.
   *   - `encoding` (string, required): Encoding type.
   *   - `mimetype` (string, required): MIME type.
   *   - `id` (string, required): Unique ID assigned by GridFS.
   *   - `filename` (string, required): Filename after upload.
   *   - `metadata` (object, optional): Metadata associated with file.
   *   - `bucketName` (string, required): Name of GridFS bucket.
   *   - `chunkSize` (number, required): File chunk size.
   *   - `size` (number, required): File size in bytes.
   *   - `md5` (string, required): MD5 hash of file.
   *   - `uploadDate` (Date, required): Timestamp of upload.
   *   - `contentType` (string, required): MIME type of file.
   *
   * HTTP Responses:
   * - `201 Created`: Avatar image successfully uploaded.
   *   - Response body: Array of file objects.
   *   - Example: [
   *     {
   *       "originalname": "example.txt",
   *       "encoding": "7bit",
   *       "mimetype": "text/plain",
   *       "id": "5e9f8f8f8f8f8f8f",
   *       "filename": "5e9f8f8f8f8f8f8f-example.txt",
   *       "metadata": {},
   *       "bucketName": "fs",
   *       "chunkSize": 261120,
   *       "size": 12345,
   *       "md5": "d41d8cd98f00b204e9800998ecf8427e",
   *       "uploadDate": "2020-04-08T19:30:00.000Z",
   *       "contentType": "text/plain"
   *     }
   *   ]
   * - `400 Bad Request`: An error occurred while uploading avatar image.
   * - `401 Unauthorized`: Unauthorized.
   * - `404 Not Found`: User not found.
   */
  async uploadAvatar(@UploadedFiles() files, @Param('id') idUser: string) {
    const user = await this.usersRepository.findOne({
      where: { id_google: idUser },
    });
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
  @ApiBearerAuth()
  @UseInterceptors(
    FilesInterceptor('file', 10, {
  /**
   * Only image files are allowed.
   *
   * Method: POST /files/logo/:id
   *
   * Description: Uploads a logo image for a given shop.
   *
   * Input Parameters:
   * - `file` (object, required): File to upload.
   *   - `mimetype` (string, required): MIME type.
   *   - `size` (number, required): File size in bytes.
   * Example Request (JSON format):
   * {
   *   "file": {
   *     "mimetype": "image/jpeg",
   *     "size": 12345
   *   }
   * }
   * HTTP Responses:
   * - `201 Created`: Logo image successfully uploaded.
   * - `400 Bad Request`: An error occurred while uploading logo image.
   * - `401 Unauthorized`: Unauthorized.
   * - `404 Not Found`: Shop not found.
   */
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          return callback(
            new HttpException(
              'Only image files are allowed',
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
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
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Shop not found.' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'ID of the shop',
    example: '12345',
  })
/**
 * Uploads a logo image for a specified shop.
 *
 * Method: POST /files/shop-logo/:id
 *
 * Description: Uploads a logo image for the shop with the given ID. The image
 *              is linked to the shop and stored in the database.
 *
 * Input Parameters:
 * - `id` (string, required): ID of the shop.
 * - `files` (array of file objects, required): Files to upload.
 *   - `file` (object, required): File to upload.
 *     - `originalname` (string, required): Original filename.
 *     - `encoding` (string, required): Encoding type.
 *     - `mimetype` (string, required): MIME type.
 *     - `id` (string, required): Unique ID assigned by GridFS.
 *     - `filename` (string, required): Filename after upload.
 *     - `metadata` (object, optional): Metadata associated with file.
 *     - `bucketName` (string, required): Name of GridFS bucket.
 *     - `chunkSize` (number, required): File chunk size.
 *     - `size` (number, required): File size in bytes.
 *     - `md5` (string, required): MD5 hash of file.
 *     - `uploadDate` (Date, required): Timestamp of upload.
 *     - `contentType` (string, required): MIME type of file.
 *
 * Example Request (JSON format):
 * {
 *   "files": [
 *     {
 *       "originalname": "logo.png",
 *       "encoding": "7bit",
 *       "mimetype": "image/png"
 *     }
 *   ]
 * }
 *
 * HTTP Responses:
 * - `200 OK`: Logo successfully uploaded and linked to the shop.
 *   - Response body: Array of file objects with metadata.
 * - `400 Bad Request`: Invalid shop ID or file type.
 * - `401 Unauthorized`: Unauthorized access.
 * - `404 Not Found`: Shop not found.
 */

  async uploadShopLogo(@UploadedFiles() files, @Param('id') idShop: string) {
    if (isNaN(Number(idShop))) {
      throw new HttpException(
        'Invalid shop ID. ID must be a number.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const shop = await this.shopRepository.findOne({
      where: { id_shop: parseInt(idShop) },
    });
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

  @Get('')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all files' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all files.',
    type: [FileInfoVm],
  })
  @ApiResponse({ status: 204, description: 'No content.' })
  @ApiResponse({
    status: 400,
    description: 'An error occurred while retrieving files.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
/**
 * DOC: Get All Files
 * Method: GET /files
 * Description: Retrieves a list of all files stored in the system, along with their metadata.
 * Input Parameters: None
 * Example Request (JSON format): N/A
 * HTTP Responses:
 * - `200 OK`: Successfully retrieved all files. Example response:
 *   [
 *     {
 *       "id": "5e9f8f8f8f8f8f8f",
 *       "file": {
 *         "filename": "example.txt",
 *         "length": 12345,
 *         "chunkSize": 261120,
 *         "contentType": "text/plain"
 *       }
 *     }
 *   ]
 * - `204 No Content`: No files found.
 * - `400 Bad Request`: An error occurred while retrieving files.
 */

  async getAllFiles(): Promise<{ id: string; file: FileInfoVm }[]> {
    const files = await this.filesService.findAll();
    return files;
  }

  @Get('info/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get file info by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved file info.',
    type: FileResponseVm,
  })
  @ApiResponse({ status: 400, description: 'Invalid file ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'File not found.' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'ID of the file',
    example: '12345',
  })
  /**
   * DOC: Get File Info by ID
   * Method: GET /files/info/:id
   * Description: Retrieves the file metadata by its ID.
   * Input Parameters:
   * - `id` (string, required): ID of the file.
   * HTTP Responses:
   * - `200 OK`: Successfully retrieved file info. Example response:
   *   {
   *     "message": "File has been detected",
   *     "file": {
   *       "filename": "example.txt",
   *       "length": 12345,
   *       "chunkSize": 261120,
   *       "contentType": "text/plain"
   *     }
   *   }
   * - `400 Bad Request`: Invalid file ID.
   * - `401 Unauthorized`: Unauthorized.
   * - `404 Not Found`: File not found.
   */
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get file by ID' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved file.' })
  @ApiResponse({ status: 400, description: 'Invalid file ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'File not found.' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'ID of the file',
    example: '12345',
  })
  /**
   * DOC: Get File by ID
   * Method: GET /files/:id
   * Description: Retrieves the file by its ID.
   * Input Parameters:
   * - `id` (string, required): ID of the file.
   * HTTP Responses:
   * - `200 OK`: Successfully retrieved file. Returns the file as binary data.
   * - `400 Bad Request`: Invalid file ID.
   * - `401 Unauthorized`: Unauthorized.
   * - `404 Not Found`: File not found.
   */
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Download file by ID' })
  @ApiResponse({ status: 200, description: 'Successfully downloaded file.' })
  @ApiResponse({ status: 400, description: 'Invalid file ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'File not found.' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'ID of the file',
    example: '12345',
  })
  /**
   * DOC: Download file by ID
   * Method: GET /files/download/:id
   * Description: Downloads a file by its ID.
   * Input Parameters:
   * - `id` (string, required): ID of the file.
   * HTTP Responses:
   * - `200 OK`: Successfully downloaded file. Returns the file as binary data.
   * - `400 Bad Request`: Invalid file ID.
   * - `401 Unauthorized`: Unauthorized.
   * - `404 Not Found`: File not found.
   */
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete file by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully deleted file.',
    type: FileResponseVm,
  })
  @ApiResponse({ status: 400, description: 'Invalid file ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'File not found.' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'ID of the file',
    example: '12345',
  })
  /**
   * DOC: Delete file by ID
   * Method: GET /files/delete/:id
   * Description: Deletes a file by its ID.
   * Input Parameters:
   * - `id` (string, required): ID of the file.
   * HTTP Responses:
   * - `200 OK`: Successfully deleted file. Example response:
   *   {
   *     "message": "File has been deleted",
   *     "file": {
   *       "filename": "example.txt",
   *       "length": 12345,
   *       "chunkSize": 261120,
   *       "contentType": "text/plain"
   *     }
   *   }
   * - `400 Bad Request`: Invalid file ID.
   * - `401 Unauthorized`: Unauthorized.
   * - `404 Not Found`: File not found.
   */
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
}
