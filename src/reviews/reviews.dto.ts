import { IsString, IsOptional, IsNumber, Length } from 'class-validator';

export class CreateReviewDto {
  @IsNumber()
  raiting: number;

  @IsString()
  @Length(1, 500)
  review: string;

  @IsString()
  writter_id: string;

  @IsOptional()
  @IsString()
  reviwed_id: string;
  @IsOptional()
  @IsNumber()
  shop_reviews_id: number;
}

export class UpdateReviewDto {
  @IsOptional()
  @IsNumber()
  id_review?: number;

  @IsOptional()
  @IsNumber()
  raiting?: number;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  review?: string;

  @IsOptional()
  @IsNumber()
  writter_id?: number;

  @IsOptional()
  @IsNumber()
  reviewed_id?: number;

  @IsOptional()
  @IsNumber()
  shop_reviews_id?: number;
}
