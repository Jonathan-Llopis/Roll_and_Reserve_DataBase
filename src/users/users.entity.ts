import { Entity, Column, OneToMany, ManyToMany, JoinTable, PrimaryColumn } from 'typeorm';
import { UserReserveEntity } from '../users_reserves/user_reserves.entity';
import { ReservesEntity } from '../reserves/reserves.entity';
import { ReviewsEntity } from '../reviews/reviews.entity';
import { ShopsEntity } from '../shops/shops.entity';

@Entity()
export class UserEntity {
  @PrimaryColumn()
  id_google: string;

  @Column()
  username: string;

  @Column()
  name: string;

  @Column()
  password: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: 0 })
  role: number;

  @Column({ type: 'timestamp', nullable: true })
  tokenExpiration: Date;

  @Column({ nullable: true })
  token: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  average_raiting: number;

  @OneToMany(() => ReviewsEntity, (reviews) => reviews.writer, { onDelete: 'CASCADE' })
  writtenReviews: ReviewsEntity[];

  @OneToMany(() => ReviewsEntity, (reviews) => reviews.reviewed, { onDelete: 'CASCADE' })
  receivedReviews: ReviewsEntity[];

  @OneToMany(() => ShopsEntity, (shop) => shop.owner, { onDelete: 'CASCADE' })
  shop_owned: ShopsEntity[];

  @ManyToMany(() => ReservesEntity, (reserve) => reserve.users_in_reserve, { onDelete: 'CASCADE' })
  @JoinTable()
  users_reserve: ReservesEntity[];

  @OneToMany(() => UserReserveEntity, (userReserve) => userReserve.user)
  userReserves: UserReserveEntity[];
}