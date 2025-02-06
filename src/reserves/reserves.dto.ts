import {
  IsString,
  IsOptional,
  IsNumber,
  IsDate,
  Length,
  IsBoolean,
} from 'class-validator';

export class CreateReserveDto {
  @IsNumber()
  total_places: number;

  @IsDate()
  hour_start: Date;

  @IsDate()
  hour_end: Date;

  @IsString()
  @Length(1, 500)
  description: string;

  @IsBoolean()
  shop_event: boolean;

  @IsString()
  @Length(1, 500)
  required_material: string;

  @IsOptional()
  @IsNumber()
  difficulty_id?: number;

  @IsOptional()
  @IsNumber()
  reserve_game_category_id?: number;

  @IsOptional()
  @IsNumber()
  reserve_of_game_id?: number;

  @IsOptional()
  @IsNumber()
  reserve_table_id?: number;

}

export class UpdateReserveDto {
  @IsOptional()
  @IsNumber()
  id_reserve?: number;

  @IsOptional()
  @IsNumber()
  total_places?: number;

  @IsOptional()
  @IsDate()
  hour_start?: Date;

  @IsOptional()
  @IsDate()
  hour_end?: Date;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  description?: string;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  required_material?: string;

  @IsOptional()
  @IsBoolean()
  shop_event?: boolean;

  @IsOptional()
  @IsNumber()
  difficulty_id?: number;

  @IsOptional()
  @IsNumber()
  reserve_game_category_id?: number;

  @IsOptional()
  @IsNumber()
  reserve_of_game_id?: number;

  @IsOptional()
  @IsNumber()
  reserve_table_id?: number;

}
