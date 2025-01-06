import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto } from './reviews.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  getAllReviews() {
    try {
      return this.reviewsService.getAllReviews();
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: err,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          cause: err,
        },
      );
    }
  }

  @Get(':id')
  getReview(@Param('id') id: string) {
    const reviewsId = id;
    if (!reviewsId) {
      throw new HttpException('Invalid Reviews ID', HttpStatus.BAD_REQUEST);
    }
    return this.reviewsService.getReviews(reviewsId);
  }

  @Post()
  createReviews(@Body() createReviewsDto: CreateReviewDto) {
    return this.reviewsService.createReview(createReviewsDto);
  }

  @Put(':id')
  updateReview(
    @Param('id') id: string,
    @Body() updateReviewsDto: UpdateReviewDto,
  ) {
    const reviewsId = id;
    if (!reviewsId) {
      throw new HttpException('Invalid Reviews ID', HttpStatus.BAD_REQUEST);
    }
    return this.reviewsService.updateReviews(
      {
        ...updateReviewsDto,
        id_review: parseInt(id),
      },
      reviewsId,
    );
  }

  @Delete(':id')
  deleteReview(@Param('id') id: string) {
    const reviewsId = parseInt(id);
    if (isNaN(reviewsId)) {
      throw new HttpException('Invalid Reviews ID', HttpStatus.BAD_REQUEST);
    }
    return this.reviewsService.deleteReview(reviewsId);
  }
}
