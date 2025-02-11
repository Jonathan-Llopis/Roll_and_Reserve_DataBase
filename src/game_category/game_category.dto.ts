import { IsString, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGameCategoryDto {
  @ApiProperty({
    description: 'The description of the game category',
    minimum: 1,
    default: 1,
    example: 'Action'
  })
  @IsString()
  @Length(1, 500)
  description: string;
}

export class UpdateGameCategoryDto {
  @ApiProperty({
    description: 'The description of the game category',
    minimum: 1,
    default: 1,
    example: 'Adventure'
  })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  description?: string;
}
