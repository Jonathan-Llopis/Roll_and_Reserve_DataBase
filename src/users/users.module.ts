import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UtilsModule } from '../utils/utils.module';
import { UserEntity } from './users.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from '../Autentication/auth.service';
import { ReservesEntity } from '../reserves/reserves.entity';
import { UserReserveEntity } from '../users_reserves/users_reserves.entity';

@Module({
  imports: [
    UtilsModule,
    TypeOrmModule.forFeature([UserEntity, ReservesEntity, UserReserveEntity]),
  ,
  ],
  exports: [TypeOrmModule, UsersService],
  controllers: [UsersController],
  providers: [UsersService, AuthService],
})
export class UsersModule {}
