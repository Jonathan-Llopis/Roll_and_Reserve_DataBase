import { Module } from '@nestjs/common';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamesEntity } from './games.entitiy';
import { HttpModule } from '../http/http.module';
import { GameCategoryModule } from '../game_category/game_category.module';
import { GameCategoryEntity } from '../game_category/game_category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([GamesEntity, GameCategoryEntity]),
    GameCategoryModule,
    HttpModule.forFeature({
      serviceName: 'Bgg-Api',
      config: {
        baseURL: 'http://localhost:8070/api',
      },
    }),
  ],
  controllers: [GamesController],
  providers: [GamesService],
  exports: [GamesService],
})
export class GamesModule {}
