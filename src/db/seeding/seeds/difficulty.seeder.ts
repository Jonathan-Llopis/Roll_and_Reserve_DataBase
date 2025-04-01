import { DifficultyEntity } from '../../../difficulty/difficulty.entity';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import difficultyData from '../../../data/difficulty';

export class DifficultySeeder implements Seeder {
  /**
   * Seeds the difficulty table with data defined in src/data/difficulty.ts.
   * It creates a new instance of DifficultyEntity for each item in the data and saves them using the repository's save method.
   * Logs a success message upon completion.
   *
   * @param dataSource The DataSource object used to interact with the database.
   * @returns A promise that resolves when the operation is complete.
   */
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
