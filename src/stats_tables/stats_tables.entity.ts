import { TablesEntity } from '../tables/tables.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class StatsTablesEntity {
  @PrimaryGeneratedColumn()
  id_stats_table: number;

  @Column()
  description: string;

  @OneToMany(() => TablesEntity, (table) => table.stats_of_table)
  stats_in_tables: TablesEntity[];
}
