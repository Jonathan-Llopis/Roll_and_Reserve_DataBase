import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UtilsService } from '../utils/utils.service';
import { UserEntity } from './users.entity';
import { CreateUserDto, UpdateUserDto } from './users.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly utilsService: UtilsService,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  private handleError(err: any) {
    if (err instanceof HttpException) {
      throw err;
    }
    throw new HttpException('Request failed', HttpStatus.BAD_REQUEST);
  }

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
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
