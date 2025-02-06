// difficulty.dto.ts
import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  Length,
} from 'class-validator';

export class CreateDifficultyDto {
  @IsString()
  @Length(1, 500)
  description: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  difficulty_rate: number;
}

export class UpdateDifficultyDto {
  @IsOptional()
  @IsNumber()
  id_difficulty?: number;

  @IsString()
  @IsOptional()
  @Length(1, 500)
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  difficulty_rate?: number;
}
