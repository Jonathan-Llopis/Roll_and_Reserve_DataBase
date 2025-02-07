import { Module } from '@nestjs/common';
import { UsersReservesController } from './users_reserves.controller';
import { UsersReservesService } from './users_reserves.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/users.entity';
import { TablesModule } from '../tables/tables.module';
import { ReservesEntity } from '../reserves/reserves.entity';
import { UserReserveEntity } from './user_reserves.entity';
import { FcmNotificationModule } from '../fcm-notification/fcm-notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, ReservesEntity, UserReserveEntity]),
    TablesModule,
    FcmNotificationModule,
  ],
  controllers: [UsersReservesController],
  providers: [UsersReservesService],
  exports: [UsersReservesService],
})
export class UsersReservesModule {}
