// game.dto.ts
import { IsString, IsOptional, IsNumber, Length } from 'class-validator';

export class CreateGameDto {
  @IsString()
  @Length(1, 500)
  name: string;

  @IsOptional()
  @IsNumber()
  difficulty_of_game_id?: number;

  @IsOptional()
  @IsNumber()
  category_of_game_id?: number;
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
