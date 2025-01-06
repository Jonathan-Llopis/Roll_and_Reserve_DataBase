import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UtilsService } from '../utils/utils.service';
import { UserEntity } from './users.entity';
import { CreateUserDto, UpdateUserDto } from './user.dto';
@Injectable()
export class UsersService {
  constructor(
    private readonly utilsService: UtilsService,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async getAllUser(xml?: string): Promise<UserEntity[] | string> {
    const users = await this.usersRepository.find();
    if (xml === 'true') {
      const jsonformatted = JSON.stringify({
        users,
      });
      return this.utilsService.convertJSONtoXML(jsonformatted);
    } else {
      return users;
    }
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const usuario = await this.usersRepository.create(createUserDto);
    return this.usersRepository.save(usuario);
  }

  async getUser(
    id_user: string,
    xml?: string,
  ): Promise<UserEntity | string | null> {
    const userEntity = await this.usersRepository.findOne({
      where: { id_google: id_user },
    });

    if (userEntity != null) {
      if (xml == 'true') {
        const jsonformatted = JSON.stringify(userEntity);
        return this.utilsService.convertJSONtoXML(jsonformatted);
      } else {
        return userEntity;
      }
    } else {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
  }

  async updateUser(
    updateUserDto: UpdateUserDto,
    id_user: string,
  ): Promise<UserEntity> {
    const userEntity = await this.usersRepository.findOne({
      where: { id_google: id_user },
    });

    if (!userEntity) {
      throw new Error('Usuario no encontrado');
    }

    if (userEntity.email != updateUserDto.email) {
      userEntity.email = updateUserDto.email;
    }

    userEntity.name = updateUserDto.name;
    userEntity.username = updateUserDto.username;
    userEntity.role = updateUserDto.role;

    return this.usersRepository.save(userEntity);
  }
  async deleteUser(id_user: number): Promise<void> {
    await this.usersRepository.delete(id_user);
  }
  async validateUser(email: string): Promise<UserEntity | null> {
    const UserEntity = await this.usersRepository.findOne({ where: { email } });
    if (UserEntity) {
      return UserEntity;
    }
    return null;
  }

  async vincularArchivo(id_user: string, id_archivo: string) {
    const user = await this.usersRepository.findOne({
      where: { id_google: id_user },
    });

    if (!user) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }
    user.avatar = id_archivo.toString();
    return this.usersRepository.save(user);
  }
}
