import { Module } from '@nestjs/common';
import { StatsTablesController } from './stats_tables.controller';
import { StatsTablesService } from './stats_tables.service';

@Module({
  controllers: [StatsTablesController],
  providers: [StatsTablesService],
})
export class StatsTablesModule {}
