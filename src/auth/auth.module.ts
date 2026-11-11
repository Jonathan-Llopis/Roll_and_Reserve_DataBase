import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserEntity } from '../users/users.entity';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') ||
          'supersecretjwtkeyforrollandreservedatabase2026',
        signOptions: {
          expiresIn:
            configService.get<string>('JWT_EXPIRES_IN') ||
            configService.get<string>('JWT_EXPIRATION') ||
            '30d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, AuthGuard, JwtStrategy, JwtAuthGuard],
  exports: [
    AuthService,
    AuthGuard,
    JwtStrategy,
    JwtAuthGuard,
    PassportModule,
    JwtModule,
  ],
})
export class AuthModule {}
