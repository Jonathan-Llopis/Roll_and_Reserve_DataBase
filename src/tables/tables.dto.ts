import { IsNumber, IsString } from 'class-validator';

export class CreateTableDto {
  @IsNumber()
  number_table: number;

  @IsString()
  free_places: string;

  @IsNumber()
  shop_id: number;

  @IsNumber()
  state_id: number;
}

export class UpdateTableDto {
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
}
