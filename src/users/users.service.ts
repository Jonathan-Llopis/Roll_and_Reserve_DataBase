import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UtilsService } from '../utils/utils.service';
import { UserEntity } from './users.entity';
import { CreateUserDto, UpdateUserDto } from './users.dto';

@Injectable()
export class UsersService {
  /**
   * UsersService constructor.
   * @param utilsService The service for managing various utility functions.
   * @param usersRepository The TypeORM repository for the UserEntity.
   */
  constructor(
    private readonly utilsService: UtilsService,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}
  /**
   * Throws an HttpException for the given error, or a default BAD_REQUEST
   * error if the given error is not an HttpException.
   *
   * @param err - The error to throw.
   */

  private handleError(err: any) {
    if (err instanceof HttpException) {
      throw err;
    }
    throw new HttpException('Request failed', HttpStatus.BAD_REQUEST);
  }

  /**
   * Get all users.
   *
   * This function returns all users in the database.
   * It also includes the users_reserve, receivedReviews, writtenReviews, and shop_owned relationships.
   *
   * HTTP Responses:
   * - `200 OK`: Users retrieved successfully. Example: [ { "id_user": 1, "email": "user@example.com", ... }, ... ]
   * - `204 No Content`: No users found.
   * - `400 Bad Request`: Invalid request.
   * - `401 Unauthorized`: Unauthorized access.
   */
  async getAllUser(): Promise<UserEntity[] | string> {
    try {
      const users = await this.usersRepository.find({
        relations: [
          'users_reserve',
          'receivedReviews',
          'writtenReviews',
          'shop_owned',
        ],
      });

      if (users.length === 0) {
        throw new HttpException('No Content', HttpStatus.NO_CONTENT);
      }

      return users;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Creates a new user in the database.
   *
   * This function creates a new user based on the CreateUserDto passed.
   * It also hashes the password before saving the user.
   *
   * HTTP Responses:
   * - `201 Created`: User created successfully. Example: { "id_user": 1, "email": "user@example.com", ... }
   * - `400 Bad Request`: Invalid request.
   * - `401 Unauthorized`: Unauthorized access.
   */
  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    try {
      const usuario = this.usersRepository.create(createUserDto);
      const passwordHash = await bcrypt.hash(usuario.password, 10);
      usuario.password = passwordHash;
      return this.usersRepository.save(usuario);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Gets a user by their id_user.
   *
   * This function retrieves a user based on the given id_user.
   * It also fetches the user's reserves, received reviews, written reviews, and owned shops.
   *
   * HTTP Responses:
   * - `200 OK`: User retrieved successfully. Example: { "id_user": 1, "email": "user@example.com", ... }
   * - `400 Bad Request`: Invalid User ID.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: User not found with the given id_user.
   */
  async getUser(id_user: string): Promise<UserEntity | string> {
    try {
      const userEntity = await this.usersRepository.findOne({
        where: { id_user: parseInt(id_user) },
        relations: [
          'users_reserve',
          'receivedReviews',
          'writtenReviews',
          'shop_owned',
        ],
      });

      if (!userEntity) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return userEntity;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Gets a user by their Google ID.
   *
   * This function retrieves a user based on the given Google ID.
   * It also fetches the user's reserves, received reviews, written reviews, and owned shops.
   *
   * HTTP Responses:
   * - `200 OK`: User retrieved successfully. Example: { "id_user": 1, "email": "user@example.com", ... }
   * - `400 Bad Request`: Invalid User ID.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: User not found with the given Google ID.
   */
  async getUserByGoogleId(id_google: string): Promise<UserEntity | string> {
    try {
      const userEntity = await this.usersRepository.findOne({
        where: { id_google },
        relations: [
          'users_reserve',
          'receivedReviews',
          'writtenReviews',
          'shop_owned',
        ],
      });

      if (!userEntity) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return userEntity;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Updates a user by its ID.
   *
   * This function updates a user based on the UpdateUserDto passed.
   * It also fetches the user's reserves, received reviews, written reviews, and owned shops.
   *
   * HTTP Responses:
   * - `200 OK`: User updated successfully. Example: { "id_user": 1, "email": "user@example.com", ... }
   * - `400 Bad Request`: Invalid request.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: User not found with the given id_user.
   */
  async updateUser(
    updateUserDto: UpdateUserDto,
    id_user: string,
  ): Promise<UserEntity> {
    try {
      const userEntity = await this.usersRepository.findOne({
        where: { id_google: id_user },
      });

      if (!userEntity) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      userEntity.email = updateUserDto.email;
      userEntity.name = updateUserDto.name;
      userEntity.username = updateUserDto.username;
      userEntity.role = updateUserDto.role;

      return this.usersRepository.save(userEntity);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Deletes a user by its ID.
   *
   * HTTP Responses:
   * - `204 No Content`: User deleted successfully.
   * - `400 Bad Request`: Invalid request.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: User not found with the given id_user.
   */
  async deleteUser(id_google: string): Promise<void> {
    try {
      const result = await this.usersRepository.delete({ id_google });
      if (result.affected === 0) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Validates a user by their email and password.
   * Method: POST /users/login
   * Description: Validates a user with the given email and password.
   * Input Parameters:
   * - `email` (string, required): The email of the user.
   * - `password` (string, required): The password of the user.
   * Example Request (JSON format):
   * {
   *   "email": "john@example.com",
   *   "password": "StrongP@ssw0rd"
   * }
   * HTTP Responses:
   * - `200 OK`: User validated successfully. Example: { "id_user": 1, "email": "user@example.com", ... }
   * - `401 Unauthorized`: Invalid credentials.
   * - `404 Not Found`: User not found with the given email.
   * - `5XX Internal Server Error`: Something went wrong on our side.
   */
  async validateUser(
    email: string,
    password: string,
  ): Promise<UserEntity | null> {
    try {
      const user = await this.usersRepository.findOne({ where: { email } });
      if (!user) {
        throw new HttpException('No Content', HttpStatus.NO_CONTENT);
      }
      if (user && (await bcrypt.compare(password, user.password))) {
        return user;
      }
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Links a file to a user as its avatar.
   *
   * Method: PATCH /users/:id_user/avatar/:id_archivo
   * Description: Links a file to a user as its avatar.
   * Input Parameters:
   * - `id_user` (string, required): The id of the user.
   * - `id_archivo` (string, required): The id of the file to link.
   * HTTP Responses:
   * - `200 OK`: File linked successfully. Example: { "id_user": 1, "email": "user@example.com", ... }
   * - `400 Bad Request`: Invalid request.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: User not found with the given id_user.
   * - `5XX Internal Server Error`: Something went wrong on our side.
   */
  async vincularArchivo(
    id_user: string,
    id_archivo: string,
  ): Promise<UserEntity> {
    try {
      const user = await this.usersRepository.findOne({
        where: { id_google: id_user },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      user.avatar = id_archivo.toString();
      return this.usersRepository.save(user);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Updates the notification token for a user.
   *
   * Method: PATCH /users/:id_user/token
   * Description: Updates the notification token for a user.
   * Input Parameters:
   * - `id_user` (string, required): The id of the user.
   * - `token` (string, required): The notification token to update.
   * HTTP Responses:
   * - `200 OK`: Token updated successfully. Example: { "id_user": 1, "email": "user@example.com", ... }
   * - `400 Bad Request`: Invalid request.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: User not found with the given id_user.
   * - `5XX Internal Server Error`: Something went wrong on our side.
   */
  async updateNotificationToken(
    id_user: string,
    token: string,
  ): Promise<UserEntity> {
    try {
      const userEntity = await this.usersRepository.findOne({
        where: { id_google: id_user },
      });

      if (!userEntity) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      userEntity.token_notification = token;
      return this.usersRepository.save(userEntity);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Validates a user's password.
   *
   * Method: POST /users/:id_user/validate
   * Description: Validates a user's password.
   * Input Parameters:
   * - `id_user` (string, required): The id of the user.
   * - `oldPassword` (string, required): The old password of the user to validate.
   * HTTP Responses:
   * - `200 OK`: The password is valid.
   * - `400 Bad Request`: Invalid request.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: User not found with the given id_user.
   * - `5XX Internal Server Error`: Something went wrong on our side.
   */
  async validateUserPassword(
    id_user: string,
    oldPassword: string,
  ): Promise<boolean> {
    try {
      const user = await this.usersRepository.findOne({
        where: { id_google: id_user },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return await bcrypt.compare(oldPassword, user.password);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Updates a user's password.
   *
   * Method: PUT /users/:id_user/password
   * Description: Updates a user's password.
   * Input Parameters:
   * - `id_user` (string, required): The id of the user.
   * - `newPassword` (string, required): The new password of the user.
   * HTTP Responses:
   * - `200 OK`: The password was updated successfully.
   * - `400 Bad Request`: Invalid request.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: User not found with the given id_user.
   * - `5XX Internal Server Error`: Something went wrong on our side.
   */
  async updateUserPassword(
    id_user: string,
    newPassword: string,
  ): Promise<UserEntity> {
    try {
      const user = await this.usersRepository.findOne({
        where: { id_google: id_user },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);
      user.password = passwordHash;
      return this.usersRepository.save(user);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Updates the average rating of a user.
   *
   * Method: PUT /users/:id_user/rating
   * Description: Updates the average rating of a user.
   * Input Parameters:
   * - `id_user` (string, required): The id of the user.
   * HTTP Responses:
   * - `200 OK`: The average rating was updated successfully.
   * - `400 Bad Request`: Invalid request.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: User not found with the given id_user.
   * - `204 No Content`: No reviews found for the user.
   * - `5XX Internal Server Error`: Something went wrong on our side.
   */
  async updateAverageRating(id_user: string): Promise<UserEntity> {
    try {
      console.log(`Fetching user with id_google: ${id_user}`);
      const user = await this.usersRepository.findOne({
        where: { id_google: id_user },
        relations: ['receivedReviews'],
      });

      if (!user) {
        console.error(`User with id_google: ${id_user} not found`);
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      console.log(`User with id_google: ${id_user} found`);
      const reviews = user.receivedReviews;
      if (reviews.length === 0) {
        console.warn(`No reviews found for user with id_google: ${id_user}`);
        throw new HttpException(
          'No reviews found for user',
          HttpStatus.NO_CONTENT,
        );
      }

      console.log(
        `Calculating average rating for user with id_google: ${id_user}`,
      );
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.raiting,
        0,
      );
      const averageRating = totalRating / reviews.length;

      console.log(
        `Total rating: ${totalRating}, Number of reviews: ${reviews.length}, Average rating: ${averageRating}`,
      );
      user.average_raiting = averageRating;
      console.log(
        `Updated average rating for user ${id_user}: ${averageRating}`,
      );
      return this.usersRepository.save(user);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }
}
