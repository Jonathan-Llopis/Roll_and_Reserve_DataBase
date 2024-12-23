import { Module } from '@nestjs/common';
import { GameCategoryController } from './game_category.controller';
import { GameCategoryService } from './game_category.service';

@Module({
  controllers: [GameCategoryController],
  providers: [GameCategoryService],
})
export class GameCategoryModule {}
