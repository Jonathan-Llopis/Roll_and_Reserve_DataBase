import { ReservesEntity } from 'src/reserves/reserves.entity';
import { ShopsEntity } from 'src/shops/shops.entity';
import { StateTablesEntity } from 'src/stats_tables/stats_tables.entity';
import { UserEntity } from 'src/users/users.entity';
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

  @ManyToOne(() => StateTablesEntity, (state) => state.states_in_tables)
  @JoinColumn({ name: 'states_of_table' })
  state_of_table: StateTablesEntity;

  @ManyToMany(() => UserEntity, (user) => user.users_tables)
  @JoinTable()
  users_in_table: UserEntity[];

  @OneToMany(() => ReservesEntity, (reserve) => reserve.reserve_table)
  reserves_of_table: ReservesEntity[];
}
