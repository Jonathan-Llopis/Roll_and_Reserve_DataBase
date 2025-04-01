import {
  Entity,
  Column,
  ManyToOne,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { UserReserveEntity } from '../users_reserves/users_reserves.entity';
import { DifficultyEntity } from '../difficulty/difficulty.entity';
import { TablesEntity } from '../tables/tables.entity';
import { UserEntity } from '../users/users.entity';
import { GamesEntity } from '../games/games.entitiy';

@Entity()
export class ReservesEntity {
  @PrimaryGeneratedColumn()
  id_reserve: number;

  @Column()
  total_places: number;

  @Column()
  reserver_id: string;

  @Column()
  hour_start: Date;

  @Column()
  hour_end: Date;

  @Column()
  description: string;

  @Column()
  required_material: string;

  @Column()
  shop_event: boolean;

  @Column({ nullable: true })
  event_id?: string;

  @Column({ default: false })
  confirmation_notification: boolean;

  @ManyToOne(() => DifficultyEntity, (difficulty) => difficulty.info_difficulty, { onDelete: 'CASCADE',})
  @JoinColumn({ name: 'difficulty_id' })
  difficulty: DifficultyEntity;

  @ManyToOne(() => GamesEntity, (game) => game.game_reserve, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'game_reserve' })
  reserve_of_game: GamesEntity;

  @ManyToOne(() => TablesEntity, (table) => table.reserves_of_table, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reserves_of_table' })
  reserve_table: TablesEntity;

  @ManyToMany(() => UserEntity, (user) => user.users_reserve, {
    onDelete: 'CASCADE',
  })
  @JoinTable()
  users_in_reserve: UserEntity[];

  @OneToMany(() => UserReserveEntity, (userReserve) => userReserve.reserve, { onDelete: 'CASCADE',})
  userReserves: UserReserveEntity[];
}
