import { GamesEntity } from '../games/game.entitiy';
import { ReviewsEntity } from '../reviews/reviews.entity';
import { TablesEntity } from '../tables/tables.entity';
import { UserEntity } from '../users/users.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity()
export class ShopsEntity {
  @PrimaryGeneratedColumn()
  id_shop: number;

  @Column()
  address: string;

  @Column()
  logo: string;

  @ManyToOne(() => UserEntity, (user) => user.shop_owned)
  @JoinColumn({ name: 'owner_id' })
  owner: UserEntity;

  @OneToMany(() => ReviewsEntity, (reviews) => reviews.shop_reviews)
  reviews_shop: ReviewsEntity[];

  @ManyToMany(() => GamesEntity, (game) => game.shop)
  @JoinTable()
  games: GamesEntity[];

  @OneToMany(() => TablesEntity, (table) => table.tables_of_shop)
  tables_in_shop: TablesEntity[];
}
