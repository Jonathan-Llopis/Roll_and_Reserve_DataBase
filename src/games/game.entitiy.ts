import { DifficultyEntity } from '../difficulty/difficulty.entity';
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

  @ManyToOne(() => DifficultyEntity, (difficulty) => difficulty.game_difficulty)
  @JoinColumn({ name: 'difficulty_id' })
  difficulty_of_game: DifficultyEntity;

  @ManyToMany(() => ShopsEntity, (shop) => shop.games)
  @JoinTable()
  shop: ShopsEntity[];

  @ManyToMany(() => ReservesEntity, (reserve) => reserve.reserve_of_game)
  @JoinTable()
  game_reserve: GamesEntity[];
}
