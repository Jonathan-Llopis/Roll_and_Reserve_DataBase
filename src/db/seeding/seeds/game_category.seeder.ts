import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import gameCategoryData from '../../../data/game_category';
import { GameCategoryEntity } from '../../../game_category/game_category.entity';

export class GameCategorySeeder implements Seeder {
  /**
   * Seeds the game categories table with data defined in src/data/game_category.ts.
   * It creates a new instance of GameCategoryEntity for each item in the data and saves them using the repository's save method.
   * Logs a success message upon completion.
   *
   * @param dataSource The DataSource object used to interact with the database.
   * @returns A promise that resolves when the operation is complete.
   */
  public async run(dataSource: DataSource): Promise<any> {
    const gameCategoryRepository = dataSource.getRepository(GameCategoryEntity);

    const gameCategoryEntries = await Promise.all(
      gameCategoryData.map(async (item) => {
        const gameCategoryEntry = new GameCategoryEntity();
        gameCategoryEntry.description = item.description;

        return gameCategoryEntry;
      }),
    );

    await gameCategoryRepository.save(gameCategoryEntries);

    console.log('Game categories seeding completed!');
  }
}
