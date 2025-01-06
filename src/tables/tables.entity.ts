import { ReservesEntity } from '../reserves/reserves.entity';
import { ShopsEntity } from '../shops/shops.entity';
import { StatsTablesEntity } from '../stats_tables/stats_tables.entity';
import { UserEntity } from '../users/users.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';

@Entity()
export class TablesEntity {
  @PrimaryGeneratedColumn()
  id_table: number;

  @Column()
  number_table: number;

  @Column()
  free_places: string;

  @ManyToOne(() => ShopsEntity, (shop) => shop.tables_in_shop)
  @JoinColumn({ name: 'tables_of_shop' })
  tables_of_shop: ShopsEntity;

  @ManyToOne(() => StatsTablesEntity, (state) => state.stats_in_tables)
  @JoinColumn({ name: 'stats_of_table' })
  stats_of_table: StatsTablesEntity;

  @ManyToMany(() => UserEntity, (user) => user.users_tables)
  @JoinTable()
  users_in_table: UserEntity[];

  @OneToMany(() => ReservesEntity, (reserve) => reserve.reserve_table)
  reserves_of_table: ReservesEntity[];
}
