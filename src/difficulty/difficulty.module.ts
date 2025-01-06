import { Module } from '@nestjs/common';
import { DifficultyController } from './difficulty.controller';
import { DifficultyService } from './difficulty.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DifficultyEntity } from './difficulty.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DifficultyEntity])],
  controllers: [DifficultyController],
  providers: [DifficultyService],
})
export class DifficultyModule {}
