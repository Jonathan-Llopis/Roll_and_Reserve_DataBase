import { Module } from '@nestjs/common';
import { ShopGamesController } from './shop_games.controller';
import { ShopGamesService } from './shop_games.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamesEntity } from '../games/game.entitiy';
import { ShopsEntity } from '../shops/shops.entity';
import { DifficultyModule } from 'src/difficulty/difficulty.module';
import { DifficultyEntity } from 'src/difficulty/difficulty.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShopsEntity, GamesEntity, DifficultyEntity]), DifficultyModule],
  controllers: [ShopGamesController],
  providers: [ShopGamesService],
})
export class ShopGamesModule {}
