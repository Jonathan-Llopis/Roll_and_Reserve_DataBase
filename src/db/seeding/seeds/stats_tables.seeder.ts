import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import statsTablesData from '../../../data/stats_tables';
import { StatsTablesEntity } from '../../../stats_tables/stats_tables.entity';

export class StatsTablesSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const statsTablesRepository = dataSource.getRepository(StatsTablesEntity);

    const statsTablesEntries = await Promise.all(
      statsTablesData.map(async (item) => {
        const statsTablesEntry = new StatsTablesEntity();
        statsTablesEntry.description = item.description;
        return statsTablesEntry;
      }),
    );

    await statsTablesRepository.save(statsTablesEntries);

    console.log('Stats tables seeding completed!');
  }
}
