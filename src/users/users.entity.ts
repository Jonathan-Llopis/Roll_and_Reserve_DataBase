import { ReviewsEntity } from 'src/reviews/reviews.entity';
import { ShopsEntity } from 'src/shops/shops.entity';
import { TablesEntity } from 'src/tables/tables.entitiy';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id_user: number;

  @Column()
  name: string;

  @Column()
  surname: string;

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

  @OneToMany(() => ReviewsEntity, (reviews) => reviews.writer)
  receivedReviews: ReviewsEntity[];

  @OneToMany(() => ReviewsEntity, (reviews) => reviews.reviewed)
  writtenReviews: ReviewsEntity[];

  @OneToMany(() => ShopsEntity, (shop) => shop.owner)
  shop_owned: ShopsEntity[];

  @ManyToMany(() => TablesEntity, (table) => table.users_in_table)
  @JoinTable()
  users_tables: TablesEntity[];
}
