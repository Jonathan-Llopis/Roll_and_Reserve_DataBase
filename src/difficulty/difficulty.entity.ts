import { GamesEntity } from '../games/game.entitiy';
import { ReservesEntity } from '../reserves/reserves.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity()
export class DifficultyEntity {
  @PrimaryGeneratedColumn()
  id_difficulty: number;

  @Column()
  description: string;

  @Column()
  difficulty_rate: number;

  @OneToMany(() => ReservesEntity, (reserve) => reserve.difficulty)
  @JoinColumn()
  info_difficulty: ReservesEntity;

  @OneToMany(() => GamesEntity, (game) => game.difficulty_of_game)
  @JoinColumn()
  game_difficulty: GamesEntity;
}
