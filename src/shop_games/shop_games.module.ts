import { Module } from '@nestjs/common';
import { ShopGamesController } from './shop_games.controller';
import { ShopGamesService } from './shop_games.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamesEntity } from '../games/game.entitiy';
import { ShopsEntity } from '../shops/shops.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShopsEntity, GamesEntity])],
  controllers: [ShopGamesController],
  providers: [ShopGamesService],
})
export class ShopGamesModule {}
