import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsTablesEntity } from './stats_tables.entity';
import { StatsTablesController } from './stats_tables.controller';
import { StatsTablesService } from './stats_tables.service';

@Module({
  imports: [TypeOrmModule.forFeature([StatsTablesEntity])],
  controllers: [StatsTablesController],
  providers: [StatsTablesService],
  exports: [StatsTablesService],
})
export class StatsTablesModule {}
