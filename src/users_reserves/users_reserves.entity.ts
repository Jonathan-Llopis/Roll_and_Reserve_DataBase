import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../users/users.entity';
import { ReservesEntity } from '../reserves/reserves.entity';

@Entity()
export class UserReserveEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reserva_confirmada: boolean;

  @ManyToOne(() => UserEntity, (user) => user.userReserves)
  user: UserEntity;

  @ManyToOne(() => ReservesEntity, (reserve) => reserve.userReserves, { onDelete: 'CASCADE', })
  reserve: ReservesEntity;
}
