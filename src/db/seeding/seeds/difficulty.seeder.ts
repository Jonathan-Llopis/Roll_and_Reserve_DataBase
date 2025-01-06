import { DifficultyEntity } from '../../../difficulty/difficulty.entity';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import difficultyData from '../../../data/difficulty';

export class DifficultySeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const difficultyRepository = dataSource.getRepository(DifficultyEntity);

    const difficultyEntries = await Promise.all(
      difficultyData.map(async (item) => {
        const difficultyEntry = new DifficultyEntity();
        difficultyEntry.description = item.description;
        difficultyEntry.difficulty_rate = item.difficulty_rate;

        return difficultyEntry;
      }),
    );

    await difficultyRepository.save(difficultyEntries);

    console.log('Difficulties seeding completed!');
  }
}
