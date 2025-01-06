import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { StatsTablesService } from './stats_tables.service';

@Controller('stats-tables')
export class StatsTablesController {
  constructor(private readonly statsTablesService: StatsTablesService) {}

  @Get()
  async getStatsTables() {
    return this.statsTablesService.getStatsTables();
  }

  @Get(':id')
  async getStatsTableById(@Param('id') id: string) {
    return this.statsTablesService.getStatsTableById(id);
  }

  @Post()
  async createStatsTable(@Body() statsTable: any) {
    return this.statsTablesService.createStatsTable(statsTable);
  }

  @Put(':id')
  async updateStatsTable(@Param('id') id: string, @Body() statsTable: any) {
    return this.statsTablesService.updateStatsTable(id, statsTable);
  }

  @Delete(':id')
  async deleteStatsTable(@Param('id') id: string) {
    return this.statsTablesService.deleteStatsTable(id);
  }
}
