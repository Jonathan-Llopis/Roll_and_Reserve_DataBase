import { ReservesEntity } from '../reserves/reserves.entity';
import { ShopsEntity } from '../shops/shops.entity';
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

  @ManyToOne(() => ShopsEntity, (shop) => shop.tables_in_shop, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tables_of_shop' })
  tables_of_shop: ShopsEntity;

  @OneToMany(() => ReservesEntity, (reserve) => reserve.reserve_table, {
    onDelete: 'CASCADE',
  })
  reserves_of_table: ReservesEntity[];
}
