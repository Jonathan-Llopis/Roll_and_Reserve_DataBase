import { Module } from '@nestjs/common';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamesEntity } from './games.entitiy';

@Module({
  imports: [TypeOrmModule.forFeature([GamesEntity])],
  controllers: [GamesController],
  providers: [GamesService],
})
export class GamesModule {}
