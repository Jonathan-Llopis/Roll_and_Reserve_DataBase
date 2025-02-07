// game.dto.ts
import { IsString, IsOptional, IsNumber, Length } from 'class-validator';

export class CreateGameDto {
  @IsString()
  @Length(1, 500)
  name: string;

  @IsString()
  @Length(1, 1000)
  description: string;

  @IsNumber()
  difficulty_id: number;
}

export class UpdateGameDto {
  @IsOptional()
  @IsString()
  @Length(1, 500)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(1, 1000)
  description?: string;

  @IsOptional()
  @IsNumber()
  difficulty_id?: number;
}
