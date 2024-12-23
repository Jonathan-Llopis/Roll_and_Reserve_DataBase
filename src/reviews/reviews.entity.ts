import { ShopsEntity } from 'src/shops/shops.entity';
import { UserEntity } from 'src/users/users.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Entity()
export class ReviewsEntity {
  @PrimaryGeneratedColumn()
  id_review: number;

  @Column()
  raiting: number;

  @Column()
  review: string;

  @ManyToOne(() => UserEntity, (user) => user.writtenReviews)
  @JoinColumn({ name: 'writter_id' })
  writer: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.receivedReviews)
  @JoinColumn({ name: 'reviwed_id' })
  reviewed: UserEntity;

  @ManyToOne(() => ShopsEntity, (shop) => shop.reviews_shop)
  @JoinColumn({ name: 'shop_reviews' })
  shop_reviews: ShopsEntity;
}