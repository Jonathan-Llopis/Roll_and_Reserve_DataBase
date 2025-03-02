import { Module } from '@nestjs/common';
import { ReservesController } from './reserves.controller';
import { ReservesService } from './reserves.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservesEntity } from './reserves.entity';
import { UserReserveEntity } from '../users_reserves/users_reserves.entity';
import { FcmNotificationModule } from '../fcm-notification/fcm-notification.module';
import { ShopsEntity } from '../shops/shops.entity';
import { GamesEntity } from '../games/games.entitiy';
import { TablesEntity } from '../tables/tables.entity';
import { DifficultyEntity } from '../difficulty/difficulty.entity';
import { GameCategoryEntity } from '../game_category/game_category.entity';
import { HttpModule } from '../http/http.module';
import { GamesModule } from '../games/games.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReservesEntity,
      UserReserveEntity,
      ShopsEntity,
      GamesEntity,
      TablesEntity,
      DifficultyEntity,
      GameCategoryEntity,
    ]),
    FcmNotificationModule,
    HttpModule.forFeature({
      serviceName: 'Bgg-Api',
      config: {
        baseURL: 'http://localhost:8070/api',
      },
    }),
    GamesModule,
  ],
  controllers: [ReservesController],
  providers: [ReservesService],
})
export class ReservesModule {}
