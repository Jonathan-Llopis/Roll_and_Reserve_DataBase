// difficulty.dto.ts
import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDifficultyDto {
  @ApiProperty({
    description: 'The description of the difficulty',
    example: 'Easy',
    maxLength: 500,
  })
  @IsString()
  @Length(1, 500)
  description: string;

  @ApiProperty({
    description: 'The difficulty rate, ranging from 0 to 100',
    example: 50,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  difficulty_rate: number;
}

export class UpdateDifficultyDto {
  @ApiProperty({
    description: 'The unique identifier of the difficulty',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  id_difficulty?: number;

  @ApiProperty({
    description: 'The description of the difficulty',
    example: 'Easy',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @Length(1, 500)
  description?: string;

  @ApiProperty({
    description: 'The difficulty rate, ranging from 0 to 100',
    example: 50,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  difficulty_rate?: number;
}
