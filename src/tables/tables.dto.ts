import { IsNumber, IsOptional } from 'class-validator';

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
