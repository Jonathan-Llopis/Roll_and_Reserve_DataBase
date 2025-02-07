// game-category.dto.ts
import { IsString, IsOptional, Length } from 'class-validator';

export class CreateGameCategoryDto {
  @IsString()
  @Length(1, 500)
  description: string;
}

export class UpdateGameCategoryDto {
  @IsOptional()
  @IsString()
  @Length(1, 500)
  description?: string;
}
