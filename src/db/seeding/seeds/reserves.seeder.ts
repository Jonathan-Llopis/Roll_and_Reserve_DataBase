import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import reservesData from '../../../data/reserves';
import { ReservesEntity } from '../../../reserves/reserves.entity';
import { DifficultyEntity } from '../../../difficulty/difficulty.entity';
import { TablesEntity } from '../../../tables/tables.entity';
import { GamesEntity } from '../../../games/game.entitiy';

export class ReservesSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const reservesRepository = dataSource.getRepository(ReservesEntity);
    const difficultyRepository = dataSource.getRepository(DifficultyEntity);
    const gamesRepository = dataSource.getRepository(GamesEntity);
    const tablesRepository = dataSource.getRepository(TablesEntity);

    const reservesEntries = await Promise.all(
      reservesData.map(async (item) => {
        const reservesEntry = new ReservesEntity();
        reservesEntry.hour_start = new Date(item.hour_start);
        reservesEntry.hour_end = new Date(item.hour_end);
        reservesEntry.description = item.description;
        reservesEntry.total_places = item.number_players;
        reservesEntry.required_material = item.required_material;
        reservesEntry.shop_event = item.shop_event;
        reservesEntry.event_id = item.event_id;
        reservesEntry.difficulty = await difficultyRepository.findOne({
          where: { id_difficulty: item.difficulty_id },
        });
        reservesEntry.reserve_of_game = await gamesRepository.findOne({
          where: { id_game: item.game_reserve },
        });
        reservesEntry.reserve_table = await tablesRepository.findOne({
          where: { id_table: item.reserve_table },
        });

        return reservesEntry;
      }),
    );

    await reservesRepository.save(reservesEntries);

    console.log('Reserves seeding completed!');
  }
}
