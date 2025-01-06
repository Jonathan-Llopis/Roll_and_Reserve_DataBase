import { Module } from '@nestjs/common';
import { ShopGamesController } from './shop_games.controller';
import { ShopGamesService } from './shop_games.service';

@Module({
  controllers: [ShopGamesController],
  providers: [ShopGamesService],
})
export class ShopGamesModule {}
