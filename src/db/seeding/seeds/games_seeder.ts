import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import gamesData from '../../../data/games';
import { DifficultyEntity } from '../../../difficulty/difficulty.entity';
import { GameCategoryEntity } from '../../../game_category/game_category.entity';
import { GamesEntity } from '../../../games/game.entitiy';

export class GamesSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const gamesRepository = dataSource.getRepository(GamesEntity);
    const difficultyRepository = dataSource.getRepository(DifficultyEntity);
    const gameCategoryRepository = dataSource.getRepository(GameCategoryEntity);

    const gamesEntries = await Promise.all(
      gamesData.map(async (item) => {
        const gamesEntry = new GamesEntity();
        gamesEntry.name = item.name;
        gamesEntry.difficulty_of_game = await difficultyRepository.findOne({
          where: { difficulty_rate: item.difficulty_id },
        });
        return gamesEntry;
      }),
    );

    await gamesRepository.save(gamesEntries);

    console.log('Games seeding completed!');
  }
}
