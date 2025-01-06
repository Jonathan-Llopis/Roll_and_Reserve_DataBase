import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import gameCategoryData from '../../../data/game_category';
import { GameCategoryEntity } from '../../../game_category/game_category.entity';

export class GameCategorySeeder implements Seeder {
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
