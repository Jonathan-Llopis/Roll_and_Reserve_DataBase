import { DifficultyEntity } from 'src/difficulty/difficulty.entity';
import { GameCategoryEntity } from 'src/game_category/game_category.entity';
import { GamesEntity } from 'src/games/game.entitiy';
import { ShopsEntity } from 'src/shops/shops.entity';
import { TablesEntity } from 'src/tables/tables.entitiy';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Entity()
export class ReservesEntity {
  @PrimaryGeneratedColumn()
  id_reserve: number;

  @Column()
  number_players: number;

  @Column()
  review: string;

  @Column()
  hour_start: Date;

  @Column()
  hour_end: Date;

  @Column()
  description: string;

  @Column()
  required_material: string;

  @ManyToOne(() => DifficultyEntity, (difficulty) => difficulty.info_difficulty)
  @JoinColumn({ name: 'difficulty_id' })
  difficulty: DifficultyEntity;

  @ManyToOne(
    () => GameCategoryEntity,
    (game_category) => game_category.game_category_reserve,
  )
  @JoinColumn({ name: 'game_category_reserve' })
  reserve_game_category: ShopsEntity;

  @ManyToOne(() => GamesEntity, (game) => game.game_reserve)
  @JoinColumn({ name: 'game_reserve' })
  reserve_of_game: GamesEntity;

  @ManyToOne(() => TablesEntity, (table) => table.reserves_of_table)
  @JoinColumn({ name: 'reserves_of_table' })
  reserve_table: TablesEntity;
}
