import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../users/users.entity';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  /**
   * Creates an instance of AuthService.
   * 
   * @param userRepository - The repository for managing UserEntity instances.
   */

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  /**
   * Generates a new token for the given user and saves it to the user
   * with the given id_user. The token will expire after one month.
   *
   * @param id_user - The id of the user to generate a token for.
   * @returns The generated token.
   */
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

  /**
   * Validates the given token by checking if it exists and is still valid.
   * If the token is expired, it clears the token and its expiration date
   * from the user's record.
   *
   * @param token - The token to be validated.
   * @returns A boolean indicating whether the token is valid.
   */

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

  /**
   * Clears the token and its expiration date from the user record.
   *
   * @param id_user - The id of the user whose token is to be cleared.
   */
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
