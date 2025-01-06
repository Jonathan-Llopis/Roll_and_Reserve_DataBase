import { Module } from '@nestjs/common';
import { GameCategoryController } from './game_category.controller';
import { GameCategoryService } from './game_category.service';
import { GameCategoryEntity } from './game_category.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([GameCategoryEntity])],
  controllers: [GameCategoryController],
  providers: [GameCategoryService],
})
export class GameCategoryModule {}
