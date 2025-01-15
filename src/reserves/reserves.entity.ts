import { UserEntity } from '../users/users.entity';
import { DifficultyEntity } from '../difficulty/difficulty.entity';
import { GameCategoryEntity } from '../game_category/game_category.entity';
import { GamesEntity } from '../games/game.entitiy';
import { ShopsEntity } from '../shops/shops.entity';
import { TablesEntity } from '../tables/tables.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity()
export class ReservesEntity {
  @PrimaryGeneratedColumn()
  id_reserve: number;

  @Column()
  total_places: number;

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

  @ManyToOne(() => GamesEntity, (game) => game.game_reserve,  { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'game_reserve' })
  reserve_of_game: GamesEntity;

  @ManyToOne(() => TablesEntity, (table) => table.reserves_of_table,  { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reserves_of_table' })
  reserve_table: TablesEntity;

  @ManyToMany(() => UserEntity, (user) => user.users_reserve, { onDelete: 'CASCADE' } )
  @JoinTable()
  users_in_reserve: UserEntity[];
}
