import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../Autentication/auth.service';
import { MailService } from '../mail/mail.service';
import { CreateUserDto, UpdateUserDto } from './users.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly mailService: MailService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.usersService.createUser(createUserDto);
    } catch (err) {
      throw new HttpException(err.message, err.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Post('login')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'User successfully logged in.' })
  @ApiResponse({ status: 400, description: 'Username and password are required.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'johndoe@example.com' },
        password: { type: 'string', example: 'StrongP@ssw0rd' },
      },
      required: ['email', 'password'],
    },
  })
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    if (!email || !password) {
      throw new HttpException(
        'Username and password are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const user = await this.usersService.validateUser(email, password);
      const token = await this.authService.generateToken(user.id_google);
      return { token };
    } catch (err) {
      throw new HttpException(err.message, err.status || HttpStatus.UNAUTHORIZED);
    }
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid user ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiParam({ name: 'id', example: '12345' })
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      return await this.usersService.updateUser(updateUserDto, id);
    } catch (err) {
      throw new HttpException(err.message, err.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':id/token')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update notification token' })
  @ApiResponse({ status: 200, description: 'Notification token updated successfully.' })
  @ApiResponse({ status: 400, description: 'User ID and notification token are required.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiParam({ name: 'id', example: '12345' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token_notificacion: { type: 'string', example: 'notification-token-12345' },
      },
      required: ['token_notificacion'],
    },
  })
  async updateTokenNotification(
    @Param('id') id: string,
    @Body('token_notificacion') tokenNotificacion: string,
  ) {
    if (!id || !tokenNotificacion) {
      throw new HttpException(
        'User ID and notification token are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      return await this.usersService.updateNotificationToken(id, tokenNotificacion);
    } catch (err) {
      throw new HttpException(err.message, err.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':id/password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user password' })
  @ApiResponse({ status: 200, description: 'Password updated successfully.' })
  @ApiResponse({ status: 400, description: 'User ID, old password, and new password are required.' })
  @ApiResponse({ status: 401, description: 'Old password is invalid.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 400, description: 'Failed to update password.' })
  @ApiParam({ name: 'id', example: '12345' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        oldPassword: { type: 'string', example: 'oldPassword123' },
        newPassword: { type: 'string', example: 'newPassword123' },
      },
      required: ['oldPassword', 'newPassword'],
    },
  })
  async updatePassword(
    @Param('id') id: string,
    @Body('oldPassword') oldPassword: string,
    @Body('newPassword') newPassword: string,
  ) {
    if (!id || !oldPassword || !newPassword) {
      throw new HttpException(
        'User ID, old password, and new password are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const isOldPasswordValid = await this.usersService.validateUserPassword(id, oldPassword);
      if (!isOldPasswordValid) {
        throw new HttpException(
          'Old password is invalid',
          HttpStatus.UNAUTHORIZED,
        );
      }

      return await this.usersService.updateUserPassword(id, newPassword);
    } catch (err) {
      throw new HttpException(err.message, err.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully.' })
  @ApiResponse({ status: 204, description: 'No content.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getAllUser() {
    try {
      return await this.usersService.getAllUser();
    } catch (err) {
      throw new HttpException(err.message, err.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid user ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiParam({ name: 'id', example: '12345' })
  async getUser(@Param('id') id: string) {
    try {
      return await this.usersService.getUser(id);
    } catch (err) {
      throw new HttpException(err.message, err.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Get('google/:id_google')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by Google ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid Google user ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiParam({ name: 'id_google', example: 'google-12345' })
  async getUserByGoogleId(@Param('id_google') idGoogle: string) {
    try {
      return await this.usersService.getUserByGoogleId(idGoogle);
    } catch (err) {
      throw new HttpException(err.message, err.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid user ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiParam({ name: 'id', example: '12345' })
  async deleteUser(@Param('id') id: string) {
    try {
      return await this.usersService.deleteUser(id);
    } catch (err) {
      throw new HttpException(err.message, err.status || HttpStatus.BAD_REQUEST);
    }
  }
}