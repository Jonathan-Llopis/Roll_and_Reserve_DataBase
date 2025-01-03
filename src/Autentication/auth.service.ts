import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/users.entity';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async generateToken(id_user: string): Promise<string> {
    const token = uuidv4();
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getMonth() + 1);

    await this.userRepository.update(id_user, {
      token,
      tokenExpiration: expirationDate,
    });

    return token;
  }

  async validateToken(token: string): Promise<boolean> {
    const UserEntity = await this.userRepository.findOne({ where: { token } });
    if (!UserEntity) return false;

    const now = new Date();
    if (UserEntity.tokenExpiration < now) {
      await this.userRepository.update(UserEntity.id_user, {
        token: null,
        tokenExpiration: null,
      });
      return false;
    }

    return true;
  }

  async clearToken(id_user: number): Promise<void> {
    await this.userRepository.update(id_user, {
      token: null,
      tokenExpiration: null,
    });
  }
}
