import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { GamesEntity } from '../games/games.entity';
import { RulesAssistantService } from './rules_assistant.service';
import { RulesAssistantCacheService } from './rules_assistant_cache.service';
import { RulesAssistantController } from './rules_assistant.controller';

@Module({
  imports: [TypeOrmModule.forFeature([GamesEntity]), ConfigModule],
  controllers: [RulesAssistantController],
  providers: [RulesAssistantService, RulesAssistantCacheService],
  exports: [RulesAssistantService, RulesAssistantCacheService],
})
export class RulesAssistantModule {}
