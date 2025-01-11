import {
  IsArray,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ShopsEntity } from '../shops/shops.entity';
import { StatsTablesEntity } from '../stats_tables/stats_tables.entity';
import { ReservesEntity } from '../reserves/reserves.entity';

export class CreateTableDto {
  @IsOptional()
  @IsNumber()
  id_table: number;

  @IsNumber()
  number_table: number;

  @IsString()
  free_places: string;

  @IsNumber()
  shop_id: number;

  @IsNumber()
  state_id: number;

  @IsOptional()
  @IsObject()
  tables_of_shop: ShopsEntity;

  @IsOptional()
  @IsObject()
  stats_of_table: StatsTablesEntity;

  @IsOptional()
  @IsArray()
  reserves_of_table: ReservesEntity[];
}

export class UpdateTableDto {
  @IsOptional()
  @IsNumber()
  id_table: number;

  @IsOptional()
  @IsNumber()
  number_table: number;

  @IsOptional()
  @IsString()
  free_places: string;

  @IsOptional()
  @IsNumber()
  shop_id: number;

  @IsOptional()
  @IsNumber()
  state_id: number;
}
