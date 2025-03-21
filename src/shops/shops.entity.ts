import { GamesEntity } from '../games/games.entitiy';
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
} from 'typeorm';

@Entity()
export class ShopsEntity {
  @PrimaryGeneratedColumn()
  id_shop: number;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  logo: string;

  @Column({ type: 'double precision', nullable: false })
  latitud: number;

  @Column({ type: 'double precision', nullable: false })
  longitud: number;

  @ManyToOne(() => UserEntity, (user) => user.shop_owned)
  @JoinColumn({ name: 'owner_id' })
  owner: UserEntity;

  @OneToMany(() => ReviewsEntity, (reviews) => reviews.shop_reviews, {
    onDelete: 'CASCADE',
  })
  reviews_shop: ReviewsEntity[];

  @ManyToMany(() => GamesEntity, (game) => game.shop)
  games: GamesEntity[];

  @OneToMany(() => TablesEntity, (table) => table.tables_of_shop, {
    onDelete: 'CASCADE',
  })
  tables_in_shop: TablesEntity[];
}
