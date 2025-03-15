import { IsString, IsOptional, Length, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGameDto {
  @ApiProperty({
    description: 'The name of the game',
    minLength: 1,
    maxLength: 500,
    example: 'Chess',
  })
  @IsString()
  @Length(1, 500)
  name: string;

  @ApiProperty({
    description: 'The description of the game',
    minLength: 1,
    maxLength: 5000,
    example: 'A strategic board game',
  })
  @IsString()
  @Length(1, 5000)
  description: string;

  @ApiProperty({
    description: 'The difficulty ID of the game',
    minimum: 1,
    example: 3,
  })
  @IsString()
  category_name?: string;

  @ApiProperty({
    description: 'The ID of the board game geek',
    minimum: 1,
    example: 1,
  })
  @IsNumber()
  bgg_id: number;
}

export class UpdateGameDto {
  @ApiPropertyOptional({
    description: 'The name of the game',
    minLength: 1,
    maxLength: 500,
    example: 'Chess',
  })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  name?: string;

  @ApiPropertyOptional({
    description: 'The description of the game',
    minLength: 1,
    maxLength: 5000,
    example: 'A strategic board game',
  })
  @IsOptional()
  @IsString()
  @Length(1, 5000)
  description?: string;

  @ApiPropertyOptional({
    description: 'The difficulty ID of the game',
    minimum: 1,
    example: 3,
  })
  @IsOptional()
  @IsString()
  category_name?: string;

  @ApiPropertyOptional({
    description: 'The ID of the board game geek',
    minimum: 1,
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  bgg_id?: number;
}
