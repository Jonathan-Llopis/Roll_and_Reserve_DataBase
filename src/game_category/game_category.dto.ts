// game-category.dto.ts
import { IsString, IsOptional, Length, IsNumber } from 'class-validator';

export class CreateGameCategoryDto {
  @IsString()
  @Length(1, 500)
  description: string;
}

export class UpdateGameCategoryDto {
  @IsOptional()
  @IsNumber()
  id_game_category?: number;

  @IsString()
  @IsOptional()
  @Length(1, 500)
  description?: string;
}
