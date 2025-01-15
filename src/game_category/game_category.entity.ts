import { ReservesEntity } from '../reserves/reserves.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class GameCategoryEntity {
  @PrimaryGeneratedColumn()
  id_game_category: number;

  @Column()
  description: string;

  @OneToMany(() => ReservesEntity, (reserve) => reserve.reserve_game_category)
  game_category_reserve: ReservesEntity[];
}
