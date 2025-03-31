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
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from '../Autentication/auth.service';
import { CreateUserDto, UpdateUserDto } from './users.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  /**
   * CreateUser
   * Method: POST /users
   * Description: Creates a new user.
   * Input Parameters:
   * - `name` (string, required): The name of the user.
   * - `email` (string, required): The email of the user.
   * - `password` (string, required): The password of the user.
   * - `username` (string, required): The username of the user.
   * Example Request (JSON format):
   * {
   *   "name": "John Doe",
   *   "email": "john@example.com",
   *   "password": "StrongP@ssw0rd",
   *   "username": "johndoe"
   * }
   * HTTP Responses:
   * - `201 Created`: The user was created successfully.
   *   - Example JSON structure:
   *     {
   *       "id_user": 1,
   *       "name": "John Doe",
   *       "email": "john@example.com",
   *       "username": "johndoe",
   *       "role": 0,
   *       "id_google": null
   *     }
   * - `400 Bad Request`: The request is invalid.
   * - `401 Unauthorized`: The user is not authorized to create a new user.
   * - `5XX Internal Server Error`: Something went wrong on our side.
   */
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.usersService.createUser(createUserDto);
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('login')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'User successfully logged in.' })
  @ApiResponse({
    status: 400,
    description: 'Username and password are required.',
  })
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
  /**
   * User login
   * Method: POST /users/login
   * Description: Logs in a user.
   * Input Parameters:
   * - `email` (string, required): The email of the user.
   * - `password` (string, required): The password of the user.
   * Example Request (JSON format):
   * {
   *   "email": "john@example.com",
   *   "password": "StrongP@ssw0rd"
   * }
   * HTTP Responses:
   * - `200 OK`: The user was logged in successfully.
   *   - Example JSON structure:
   *     {
   *       "token": "some token"
   *     }
   * - `400 Bad Request`: The request is invalid.
   * - `401 Unauthorized`: The user is not authorized to log in.
   * - `5XX Internal Server Error`: Something went wrong on our side.
   */
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
      throw new HttpException(
        err.message,
        err.status || HttpStatus.UNAUTHORIZED,
      );
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
  /**
   * Updates a user by its ID.
   * Method: PUT /users/:id
   * Description: Updates a user with the given ID.
   * Input Parameters:
   * - `id` (string, required): The ID of the user to be updated.
   * - `name` (string, optional): The new name of the user.
   * - `email` (string, optional): The new email of the user.
   * - `username` (string, optional): The new username of the user.
   * - `password` (string, optional): The new password of the user.
   * Example Request (JSON format):
   * {
   *   "name": "John Doe",
   *   "email": "john@example.com",
   *   "username": "johndoe",
   *   "password": "StrongP@ssw0rd"
   * }
   * HTTP Responses:
   * - `200 OK`: The user was updated successfully.
   *   - Example JSON structure:
   *     {
   *       "id_user": 1,
   *       "name": "John Doe",
   *       "email": "john@example.com",
   *       "username": "johndoe",
   *       "role": 0,
   *       "id_google": null
   *     }
   * - `400 Bad Request`: The request is invalid.
   * - `401 Unauthorized`: The user is not authorized to update a user.
   * - `404 Not Found`: The user with the given ID does not exist.
   * - `5XX Internal Server Error`: Something went wrong on our side.
   */
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      return await this.usersService.updateUser(updateUserDto, id);
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':id/token')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update notification token' })
  @ApiResponse({
    status: 200,
    description: 'Notification token updated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'User ID and notification token are required.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiParam({ name: 'id', example: '12345' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token_notificacion: {
          type: 'string',
          example: 'notification-token-12345',
        },
      },
      required: ['token_notificacion'],
    },
  })
/**
 * Updates the notification token for a user.
 * Method: PUT /users/:id/token
 * Description: Updates the notification token of the user with the given ID.
 * Input Parameters:
 * - `id` (string, required): The ID of the user whose notification token is to be updated.
 * - `token_notificacion` (string, required): The new notification token of the user.
 * HTTP Responses:
 * - `200 OK`: The notification token was updated successfully.
 * - `400 Bad Request`: The user ID or notification token is missing.
 * - `404 Not Found`: The user with the given ID does not exist.
 * - `401 Unauthorized`: The user is not authorized to update the notification token.
 * - `5XX Internal Server Error`: Something went wrong on our side.
 */

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
      return await this.usersService.updateNotificationToken(
        id,
        tokenNotificacion,
      );
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':id/password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user password' })
  @ApiResponse({ status: 200, description: 'Password updated successfully.' })
  @ApiResponse({
    status: 400,
    description: 'User ID, old password, and new password are required.',
  })
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
  /**
   * Updates the password of the user with the given ID.
   * Method: PUT /users/:id/password
   * Description: Updates the password of the user with the given ID.
   * Input Parameters:
   * - `id` (string, required): The ID of the user whose password is to be updated.
   * - `oldPassword` (string, required): The old password of the user.
   * - `newPassword` (string, required): The new password of the user.
   * HTTP Responses:
   * - `200 OK`: The password was updated successfully.
   * - `400 Bad Request`: The user ID, old password, or new password is missing.
   * - `401 Unauthorized`: The old password is invalid or the user is not authorized to update the password.
   * - `404 Not Found`: The user with the given ID does not exist.
   * - `5XX Internal Server Error`: Something went wrong on our side.
   */
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
      const isOldPasswordValid = await this.usersService.validateUserPassword(
        id,
        oldPassword,
      );
      if (!isOldPasswordValid) {
        throw new HttpException(
          'Old password is invalid',
          HttpStatus.UNAUTHORIZED,
        );
      }

      return await this.usersService.updateUserPassword(id, newPassword);
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully.' })
  @ApiResponse({ status: 204, description: 'No content.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
/**
 * Retrieves all users.
 * Method: GET /users
 * Description: Fetches a list of all users from the database.
 * Input Parameters: None
 * HTTP Responses:
 * - `200 OK`: Users retrieved successfully.
 * - `204 No Content`: No users found.
 * - `400 Bad Request`: If an error occurs during the process.
 * - `401 Unauthorized`: Unauthorized access.
 */

  async getAllUser() {
    try {
      return await this.usersService.getAllUser();
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status || HttpStatus.BAD_REQUEST,
      );
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
  /**
   * Retrieves a user by their ID.
   * Method: GET /users/:id
   * Description: Fetches a user from the database by their ID.
   * Input Parameters:
   * - `id` (string, required): ID of the user to be retrieved.
   * HTTP Responses:
   * - `200 OK`: User retrieved successfully.
   * - `400 Bad Request`: Invalid user ID.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: User not found.
   */
  async getUser(@Param('id') id: string) {
    try {
      return await this.usersService.getUser(id);
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status || HttpStatus.BAD_REQUEST,
      );
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
  /**
   * Retrieves a user by their Google ID.
   * Method: GET /users/google/:id_google
   * Description: Fetches a user from the database by their Google ID.
   * Input Parameters:
   * - `id_google` (string, required): Google ID of the user to be retrieved.
   * HTTP Responses:
   * - `200 OK`: User retrieved successfully.
   * - `400 Bad Request`: Invalid Google user ID.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: User not found.
   */
  async getUserByGoogleId(@Param('id_google') idGoogle: string) {
    try {
      return await this.usersService.getUserByGoogleId(idGoogle);
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status || HttpStatus.BAD_REQUEST,
      );
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
  /**
   * Deletes a user by their ID.
   * Method: DELETE /users/:id
   * Description: Deletes a user from the database by their ID.
   * Input Parameters:
   * - `id` (string, required): ID of the user to be deleted.
   * HTTP Responses:
   * - `200 OK`: User deleted successfully.
   * - `400 Bad Request`: Invalid user ID.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: User not found.
   */
  async deleteUser(@Param('id') id: string) {
    try {
      return await this.usersService.deleteUser(id);
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}
