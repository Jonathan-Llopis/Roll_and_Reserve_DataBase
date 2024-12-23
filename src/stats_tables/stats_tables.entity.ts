import { TablesEntity } from 'src/tables/tables.entitiy';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class StateTablesEntity {
  @PrimaryGeneratedColumn()
  id_state_table: number;

  @Column()
  description: string;

  @OneToMany(() => TablesEntity, (table) => table.state_of_table)
  states_in_tables: TablesEntity;
}
