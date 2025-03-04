import { GameCategoryEntity } from '../game_category/game_category.entity';
import { ReservesEntity } from '../reserves/reserves.entity';
import { ShopsEntity } from '../shops/shops.entity';
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

  @Column({ type: 'text' })
  description: string;

  @ManyToOne(
    () => GameCategoryEntity,
    (gameCategory) => gameCategory.game_category,
  )
  @JoinColumn({ name: 'game_category_id' })
  gameCategory: GameCategoryEntity;

  @ManyToMany(() => ShopsEntity, (shop) => shop.games)
  @JoinTable()
  shop: ShopsEntity[];

  @ManyToMany(() => ReservesEntity, (reserve) => reserve.reserve_of_game)
  @JoinTable()
  game_reserve: GamesEntity[];
}
