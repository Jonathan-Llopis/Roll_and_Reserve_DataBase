import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import gamesData from '../../../data/games';
import { GamesEntity } from '../../../games/games.entitiy';
import { GameCategoryEntity } from '../../../game_category/game_category.entity';

export class GamesSeeder implements Seeder {
  /**
   * Seeds the games table with data defined in src/data/games.ts.
   * It creates a new instance of GamesEntity for each item in the data and associates it with a game category using the game category ID.
   * The entries are then saved using the repository's save method.
   * Logs a success message upon completion.
   *
   * @param dataSource The DataSource object used to interact with the database.
   * @returns A promise that resolves when the operation is complete.
   */
  public async run(dataSource: DataSource): Promise<any> {
    const gamesRepository = dataSource.getRepository(GamesEntity);
    const gameCategoryRepository = dataSource.getRepository(GameCategoryEntity);

    const gamesEntries = await Promise.all(
      gamesData.map(async (item) => {
        const gamesEntry = new GamesEntity();
        gamesEntry.name = item.name;
        gamesEntry.description = item.description;
        gamesEntry.bgg_id = item.bgg_id;
        gamesEntry.gameCategory = await gameCategoryRepository.findOne({
          where: { id_game_category: item.game_category_id },
        });
        return gamesEntry;
      }),
    );

    await gamesRepository.save(gamesEntries);

    console.log('Games seeding completed!');
  }
}
