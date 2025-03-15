import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import gamesData from '../../../data/games';
import { GamesEntity } from '../../../games/games.entitiy';
import { GameCategoryEntity } from '../../../game_category/game_category.entity';

export class GamesSeeder implements Seeder {
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
