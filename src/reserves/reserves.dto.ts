// reserve.dto.ts
import {
  IsString,
  IsOptional,
  IsNumber,
  IsDate,
  Length,
} from 'class-validator';

export class CreateReserveDto {
  @IsNumber()
  total_places: number;

  @IsString()
  @Length(1, 500)
  review: string;

  @IsDate()
  hour_start: Date;

  @IsDate()
  hour_end: Date;

  @IsString()
  @Length(1, 500)
  description: string;

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

  @IsNumber()
  @IsOptional()
  total_places?: number;

  @IsString()
  @IsOptional()
  @Length(1, 500)
  review?: string;

  @IsDate()
  @IsOptional()
  hour_start?: Date;

  @IsDate()
  @IsOptional()
  hour_end?: Date;

  @IsString()
  @IsOptional()
  @Length(1, 500)
  description?: string;

  @IsString()
  @IsOptional()
  @Length(1, 500)
  required_material?: string;

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
