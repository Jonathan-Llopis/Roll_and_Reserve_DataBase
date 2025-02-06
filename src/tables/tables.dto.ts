import {
  IsArray,
  IsNumber,
  IsObject,
  IsOptional,
} from 'class-validator';
import { ShopsEntity } from '../shops/shops.entity';
import { ReservesEntity } from '../reserves/reserves.entity';

export class CreateTableDto {
  @IsOptional()
  @IsNumber()
  id_table: number;

  @IsNumber()
  number_table: number;

  @IsNumber()
  shop_id: number;
}

export class UpdateTableDto {
  @IsOptional()
  @IsNumber()
  id_table: number;

  @IsOptional()
  @IsNumber()
  number_table: number;

  @IsOptional()
  @IsNumber()
  shop_id: number;

}
