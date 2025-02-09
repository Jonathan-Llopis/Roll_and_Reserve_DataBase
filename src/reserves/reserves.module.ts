import { Module } from '@nestjs/common';
import { ReservesController } from './reserves.controller';
import { ReservesService } from './reserves.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservesEntity } from './reserves.entity';
import { UserReserveEntity } from '../users_reserves/user_reserves.entity';
import { FcmNotificationModule } from '../fcm-notification/fcm-notification.module';
import { ShopsEntity } from 'src/shops/shops.entity';
import { GamesEntity } from 'src/games/game.entitiy';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReservesEntity, UserReserveEntity, ShopsEntity, GamesEntity]),
    FcmNotificationModule,
  ],
  controllers: [ReservesController],
  providers: [ReservesService],
})
export class ReservesModule {}
