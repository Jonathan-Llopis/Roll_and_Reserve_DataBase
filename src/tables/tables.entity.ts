import { ReservesEntity } from '../reserves/reserves.entity';
import { ShopsEntity } from '../shops/shops.entity';
import { StatsTablesEntity } from '../stats_tables/stats_tables.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export class TablesEntity {
  @PrimaryGeneratedColumn()
  id_table: number;

  @Column()
  number_table: number;

  @ManyToOne(() => ShopsEntity, (shop) => shop.tables_in_shop)
  @JoinColumn({ name: 'tables_of_shop' })
  tables_of_shop: ShopsEntity;

  @ManyToOne(() => StatsTablesEntity, (state) => state.stats_in_tables)
  @JoinColumn({ name: 'stats_of_table' })
  stats_of_table: StatsTablesEntity;

  @OneToMany(() => ReservesEntity, (reserve) => reserve.reserve_table)
  reserves_of_table: ReservesEntity[];
}
