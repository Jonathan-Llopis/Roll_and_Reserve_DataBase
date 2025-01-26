import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../users/users.entity';
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
    expirationDate.setMonth(expirationDate.getMonth() + 1);

    await this.userRepository.update(
      { id_google: id_user },
      {
        token: token,
        tokenExpiration: expirationDate,
      },
    );

    return token;
  }

  async validateToken(token: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { token: token } });
    if (!user) return false;

    const now = new Date();
    if (user.tokenExpiration < now) {
      await this.userRepository.update(
        { id_google: user.id_google },
        {
          token: null,
          tokenExpiration: null,
        },
      );
      return false;
    }

    return true;
  }

  async clearToken(id_user: string): Promise<void> {
    await this.userRepository.update(
      { id_google: id_user },
      {
        token: null,
        tokenExpiration: null,
      },
    );
  }
}
