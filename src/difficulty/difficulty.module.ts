import { Module } from '@nestjs/common';
import { DifficultyController } from './difficulty.controller';
import { DifficultyService } from './difficulty.service';

@Module({
  controllers: [DifficultyController],
  providers: [DifficultyService],
})
export class DifficultyModule {}
