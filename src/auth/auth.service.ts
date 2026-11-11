import { Injectable, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../users/users.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  /**
   * Creates an instance of AuthService.
   *
   * @param userRepository - The repository for managing UserEntity instances.
   * @param jwtService - Optional JWT service for signing and verifying tokens.
   */

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @Optional()
    private jwtService?: JwtService,
  ) {}

  /**
   * Generates a new token for the given user and saves it to the user
   * with the given id_user. The token will expire after one month.
   *
   * @param id_user - The id of the user to generate a token for.
   * @param email - Optional email for JWT claims.
   * @param role - Optional role for JWT claims.
   * @returns The generated token.
   */
  async generateToken(
    id_user: string | number,
    email?: string,
    role?: number,
  ): Promise<string> {
    const idNum = typeof id_user === 'number' ? id_user : parseInt(id_user);
    const sub = !isNaN(idNum) ? idNum : id_user;

    let token: string;
    if (this.jwtService) {
      token = this.jwtService.sign({
        sub,
        email,
        role: role ?? 0,
      });
    } else {
      token = uuidv4();
    }

    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + 1);

    if (!isNaN(idNum) && idNum > 0 && idNum <= 2147483647) {
      await this.userRepository.update(idNum, {
        token: token,
        tokenExpiration: expirationDate,
      });
    } else {
      await this.userRepository.update(
        { id_google: String(id_user) },
        {
          token: token,
          tokenExpiration: expirationDate,
        },
      );
    }

    return token;
  }

  async validateToken(token: string): Promise<boolean> {
    if (this.jwtService) {
      try {
        this.jwtService.verify(token);
        return true;
      } catch {
        // Fall back to database lookup for legacy or pre-existing tokens
      }
    }

    const user = await this.userRepository.findOne({ where: { token: token } });
    if (!user) return false;

    const now = new Date();
    if (user.tokenExpiration && user.tokenExpiration < now) {
      await this.userRepository.update(user.id_user, {
        token: null,
        tokenExpiration: null,
      });
      return false;
    }

    return true;
  }

  async clearToken(id_user: string | number): Promise<void> {
    const idNum = typeof id_user === 'number' ? id_user : parseInt(id_user);
    if (!isNaN(idNum) && idNum > 0 && idNum <= 2147483647) {
      await this.userRepository.update(idNum, {
        token: null,
        tokenExpiration: null,
      });
    } else {
      await this.userRepository.update(
        { id_google: String(id_user) },
        {
          token: null,
          tokenExpiration: null,
        },
      );
    }
  }
}
