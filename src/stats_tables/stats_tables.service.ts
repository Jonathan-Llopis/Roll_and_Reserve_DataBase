import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StatsTablesEntity } from './stats_tables.entity';

@Injectable()
export class StatsTablesService {
  constructor(
    @InjectRepository(StatsTablesEntity)
    private readonly statsTablesRepository: Repository<StatsTablesEntity>,
  ) {}

  async getStatsTables() {
    return await this.statsTablesRepository.find();
  }

  async getStatsTableById(id: string) {
    return await this.statsTablesRepository.findOne({
      where: { id_stats_table: parseInt(id) },
    });
  }

  async createStatsTable(statsTable: any) {
    const newStatsTable = this.statsTablesRepository.create(statsTable);
    return await this.statsTablesRepository.save(newStatsTable);
  }

  async updateStatsTable(id: string, statsTable: any) {
    const updatedStatsTable = await this.statsTablesRepository.findOne({
      where: { id_stats_table: parseInt(id) },
    });
    if (!updatedStatsTable) {
      throw new Error('Stats table not found');
    }
    Object.assign(updatedStatsTable, statsTable);
    return await this.statsTablesRepository.save(updatedStatsTable);
  }

  async deleteStatsTable(id: string) {
    const statsTable = await this.statsTablesRepository.findOne({
      where: { id_stats_table: parseInt(id) },
    });
    if (!statsTable) {
      throw new Error('Stats table not found');
    }
    return await this.statsTablesRepository.delete(id);
  }
}
