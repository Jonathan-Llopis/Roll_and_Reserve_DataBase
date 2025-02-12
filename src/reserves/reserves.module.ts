import { Module } from '@nestjs/common';
import { ReservesController } from './reserves.controller';
import { ReservesService } from './reserves.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservesEntity } from './reserves.entity';
import { UserReserveEntity } from '../users_reserves/users_reserves.entity';
import { FcmNotificationModule } from '../fcm-notification/fcm-notification.module';
import { ShopsEntity } from 'src/shops/shops.entity';
import { GamesEntity } from 'src/games/games.entitiy';
import { TablesEntity } from 'src/tables/tables.entity';
import { DifficultyEntity } from 'src/difficulty/difficulty.entity';
import { GameCategoryEntity } from 'src/game_category/game_category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReservesEntity, UserReserveEntity, ShopsEntity, GamesEntity, TablesEntity, DifficultyEntity, GameCategoryEntity]),
    FcmNotificationModule,
  ],
  controllers: [ReservesController],
  providers: [ReservesService],
})
export class ReservesModule {}
