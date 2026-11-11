import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/users.entity';

export interface JwtPayload {
  sub: number | string;
  email?: string;
  role?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') ||
        'supersecretjwtkeyforrollandreservedatabase2026',
    });
  }

  async validate(payload: JwtPayload): Promise<UserEntity> {
    const idNum = Number(payload.sub);
    const filter =
      !isNaN(idNum) && Number.isInteger(idNum) && idNum > 0 && idNum <= 2147483647
        ? [{ id_user: idNum }, { id_google: String(payload.sub) }]
        : { id_google: String(payload.sub) };

    const user = await this.userRepository.findOne({ where: filter });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
