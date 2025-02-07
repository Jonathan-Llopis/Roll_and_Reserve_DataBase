import { Module } from '@nestjs/common';
import { ReservesController } from './reserves.controller';
import { ReservesService } from './reserves.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservesEntity } from './reserves.entity';
import { UserReserveEntity } from '../users_reserves/user_reserves.entity';
import { FcmNotificationModule } from '../fcm-notification/fcm-notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReservesEntity, UserReserveEntity]),
    FcmNotificationModule,
  ],
  controllers: [ReservesController],
  providers: [ReservesService],
})
export class ReservesModule {}
