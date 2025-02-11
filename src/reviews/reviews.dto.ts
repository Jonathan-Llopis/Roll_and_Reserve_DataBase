import { IsString, IsOptional, IsNumber, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({
    description: 'The rating of the review',
    example: 5,
  })
  @IsNumber()
  raiting: number;

  @ApiProperty({
    description: 'The content of the review',
    minLength: 1,
    maxLength: 500,
    example: 'Great product!',
  })
  @IsString()
  @Length(1, 500)
  review: string;

  @ApiProperty({
    description: 'The ID of the writer',
    example: 1,
  })
  @IsNumber()
  writter_id: number;

  @ApiPropertyOptional({
    description: 'The ID of the reviewed entity',
    example: 2,
  })
  @IsOptional()
  @IsNumber()
  reviewed_id?: number;

  @ApiPropertyOptional({
    description: 'The ID of the shop review',
    example: 3,
  })
  @IsOptional()
  @IsNumber()
  shop_reviews_id?: number;
}

export class UpdateReviewDto {
  @ApiPropertyOptional({
    description: 'The ID of the review',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  id_review?: number;

  @ApiPropertyOptional({
    description: 'The rating of the review',
    example: 4,
  })
  @IsOptional()
  @IsNumber()
  raiting?: number;

  @ApiPropertyOptional({
    description: 'The content of the review',
    minLength: 1,
    maxLength: 500,
    example: 'Updated review content',
  })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  review?: string;

  @ApiPropertyOptional({
    description: 'The ID of the writer',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  writter_id?: number;

  @ApiPropertyOptional({
    description: 'The ID of the reviewed entity',
    example: 2,
  })
  @IsOptional()
  @IsNumber()
  reviewed_id?: number;

  @ApiPropertyOptional({
    description: 'The ID of the shop review',
    example: 3,
  })
  @IsOptional()
  @IsNumber()
  shop_reviews_id?: number;
}
