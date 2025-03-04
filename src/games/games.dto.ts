import { IsString, IsOptional, Length } from 'class-validator';
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
    maxLength: 1000,
    example: 'A strategic board game',
  })
  @IsString()
  @Length(1, 1000)
  description: string;

  @ApiProperty({
    description: 'The difficulty ID of the game',
    minimum: 1,
    example: 3,
  })
  @IsString()
  category_name?: string;
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
    maxLength: 1000,
    example: 'A strategic board game',
  })
  @IsOptional()
  @IsString()
  @Length(1, 1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'The difficulty ID of the game',
    minimum: 1,
    example: 3,
  })
  @IsOptional()
  @IsString()
  category_name?: string;
}
