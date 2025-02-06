// game-category.dto.ts
import { IsString, IsOptional, Length, IsNumber } from 'class-validator';
import { ReservesEntity } from '../reserves/reserves.entity';

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

