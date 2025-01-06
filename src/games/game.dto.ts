// game.dto.ts
import {
  IsString,
  IsOptional,
  IsNumber,
  Length,
  ValidateNested,
} from 'class-validator';
import { DifficultyEntity } from '../difficulty/difficulty.entity';
import { GameCategoryEntity } from '../game_category/game_category.entity';

export class CreateGameDto {
  @IsNumber()
  id_game: number;

  @IsString()
  @Length(1, 500)
  name: string;

  @ValidateNested()
  difficulty_of_game?: DifficultyEntity;

  @IsOptional()
  @IsNumber()
  category_of_game?: GameCategoryEntity;
}

export class UpdateGameDto {
  @IsOptional()
  @IsNumber()
  id_game?: number;

  @IsString()
  @IsOptional()
  @Length(1, 500)
  name?: string;

  @IsOptional()
  @IsNumber()
  difficulty_of_game_id?: number;

  @IsOptional()
  @IsNumber()
  category_of_game_id?: number;
}
