import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UtilsService } from '../utils/utils.service';
import { UserEntity } from './users.entity';
import { CreateUserDto, UpdateUserDto } from './user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly utilsService: UtilsService,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) { }

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

      return users;
    } catch (err) {
      this.handleError(err);
    }
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    try {
      const usuario = this.usersRepository.create(createUserDto);
      const passwordHash = await bcrypt.hash(usuario.password, 10);
      usuario.password = passwordHash;
      return this.usersRepository.save(usuario);
    } catch (err) {
      this.handleError(err);
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
      this.handleError(err);
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
      this.handleError(err);
    }
  }

  async updateUser(updateUserDto: UpdateUserDto, id_user: string): Promise<UserEntity> {
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
      this.handleError(err);
    }
  }

  async deleteUser(id_google: string): Promise<void> {
    try {
      const result = await this.usersRepository.delete({ id_google });
      if (result.affected === 0) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      this.handleError(err);
    }
  }

  async validateUser(email: string, password: string): Promise<UserEntity | null> {
    try {
      const user = await this.usersRepository.findOne({ where: { email } });
      if (user && await bcrypt.compare(password, user.password)) {
        return user;
      }
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    } catch (err) {
      this.handleError(err);
    }
  }

  async vincularArchivo(id_user: string, id_archivo: string): Promise<UserEntity> {
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
      this.handleError(err);
    }
  }

  async updateNotificationToken(id_user: string, token: string): Promise<UserEntity> {
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
      this.handleError(err);
    }
  }

  async validateUserPassword(id_user: string, oldPassword: string): Promise<boolean> {
    try {
      const user = await this.usersRepository.findOne({
        where: { id_google: id_user },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return await bcrypt.compare(oldPassword, user.password);
    } catch (err) {
      this.handleError(err);
    }
  }

  async updateUserPassword(id_user: string, newPassword: string): Promise<UserEntity> {
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
      this.handleError(err);
    }
  }
}
