import { GamesEntity } from '../games/games.entitiy';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class GameCategoryEntity {
  @PrimaryGeneratedColumn()
  id_game_category: number;

  @Column()
  description: string;

  @OneToMany(() => GamesEntity, (game) => game.gameCategory)
  game_category: GamesEntity[];
}
