import { GamesEntity } from 'src/games/game.entitiy';
import { ReservesEntity } from 'src/reserves/reserves.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class GameCategoryEntity {
  @PrimaryGeneratedColumn()
  id_game_category: number;

  @Column()
  description: string;

  @OneToMany(() => GamesEntity, (game) => game.category_of_game)
  game_category: GamesEntity[];

  @OneToMany(() => ReservesEntity, (reserve) => reserve.reserve_game_category)
  game_category_reserve: ReservesEntity[];
}
