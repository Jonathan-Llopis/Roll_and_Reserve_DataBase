import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
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
    const passwordHash = await bcrypt.hash(await usuario.password, 10);
    usuario.password = passwordHash;
    return this.usersRepository.save(usuario);
  }

  async getUser(
    id_user: string,
    xml?: string,
  ): Promise<UserEntity | string | null> {
    const UserEntity = await this.usersRepository.findOneBy({ id_user });

    if (UserEntity != null) {
      if (xml == 'true') {
        const jsonformatted = JSON.stringify(UserEntity);
        return this.utilsService.convertJSONtoXML(jsonformatted);
      } else {
        return UserEntity;
      }
    } else {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
  }

  async updateUser(updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const UserEntity = await this.usersRepository.findOne({
      where: { id_user: updateUserDto.id_user },
    });

    if (!UserEntity) {
      throw new Error('Usuario no encontrado');
    }

    this.usersRepository.merge(UserEntity, updateUserDto);
    return this.usersRepository.save(UserEntity);
  }

  async deleteUser(id_user: number): Promise<void> {
    await this.usersRepository.delete(id_user);
  }
  async validateUser(
    email: string,
    password: string,
  ): Promise<UserEntity | null> {
    const UserEntity = await this.usersRepository.findOne({ where: { email } });
    if (UserEntity && (await bcrypt.compare(password, UserEntity.password))) {
      return UserEntity;
    }
    return null;
  }

  async vincularArchivo(id_user: string, id_archivo: string) {
    const user = await this.usersRepository.findOne({
      where: { id_user: id_user },
    });

    if (!user) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }
    user.avatar = id_archivo.toString();
    return this.usersRepository.save(user);
  }
}
