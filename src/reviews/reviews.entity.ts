import { ShopsEntity } from '../shops/shops.entity';
import { UserEntity } from '../users/users.entity';
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

  @ManyToOne(() => UserEntity, (user) => user.writtenReviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'writter_id' })
  writer: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.receivedReviews, {
    nullable: true,
  })
  @JoinColumn({ name: 'reviwed_id' })
  reviewed: UserEntity;

  @ManyToOne(() => ShopsEntity, (shop) => shop.reviews_shop, {
    nullable: true,
  })
  @JoinColumn({ name: 'shop_reviews' })
  shop_reviews: ShopsEntity;
}
