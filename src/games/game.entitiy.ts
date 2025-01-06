import { DifficultyEntity } from 'src/difficulty/difficulty.entity';
import { GameCategoryEntity } from 'src/game_category/game_category.entity';
import { ReservesEntity } from 'src/reserves/reserves.entity';
import { ShopsEntity } from 'src/shops/shops.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity()
export class GamesEntity {
  @PrimaryGeneratedColumn()
  id_game: number;

  @Column()
  name: string;

  @ManyToOne(() => DifficultyEntity, (difficulty) => difficulty.game_difficulty)
  @JoinColumn({ name: 'difficulty_id' })
  difficulty_of_game: DifficultyEntity;

  @ManyToOne(
    () => GameCategoryEntity,
    (game_category) => game_category.game_category,
  )
  @JoinColumn({ name: 'game_category_id' })
  category_of_game: GameCategoryEntity;

  @ManyToMany(() => ShopsEntity, (shop) => shop.games)
  @JoinTable()
  shop: ShopsEntity[];

  @ManyToMany(() => ReservesEntity, (reserve) => reserve.reserve_of_game)
  @JoinTable()
  game_reserve: GamesEntity[];
}
