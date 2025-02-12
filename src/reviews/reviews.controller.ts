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
import { ApiOperation, ApiResponse, ApiTags, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto } from './reviews.dto';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new review' })
  @ApiResponse({ status: 201, description: 'Review created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Review not found.' })
  createReviews(@Body() createReviewsDto: CreateReviewDto) {
    try {
      return this.reviewsService.createReview(createReviewsDto);
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Failed to create review',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a review by ID' })
  @ApiResponse({ status: 200, description: 'Review updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid Reviews ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Review not found.' })
  @ApiParam({ name: 'id', description: 'ID of the review', example: '1' })
  updateReview(
    @Param('id') id: string,
    @Body() updateReviewsDto: UpdateReviewDto,
  ) {
    try {
      const reviewsId = parseInt(id);
      if (isNaN(reviewsId)) {
        throw new HttpException('Invalid Reviews ID', HttpStatus.BAD_REQUEST);
      }
      return this.reviewsService.updateReviews(
        {
          ...updateReviewsDto,
          id_review: reviewsId,
        },
        reviewsId,
      );
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Failed to update review',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all reviews' })
  @ApiResponse({ status: 200, description: 'Reviews retrieved successfully.' })
  @ApiResponse({ status: 204, description: 'No content.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getAllReviews() {
    try {
      return this.reviewsService.getAllReviews();
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Failed to retrieve reviews',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a review by ID' })
  @ApiResponse({ status: 200, description: 'Review retrieved successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid Reviews ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Review not found.' })
  @ApiParam({ name: 'id', description: 'ID of the review', example: '1' })
  getReview(@Param('id') id: string) {
    try {
      const reviewsId = parseInt(id);
      if (isNaN(reviewsId)) {
        throw new HttpException('Invalid Reviews ID', HttpStatus.BAD_REQUEST);
      }
      return this.reviewsService.getReviews(reviewsId);
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Failed to retrieve review',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('/shop/:idShop')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all reviews by shop ID' })
  @ApiResponse({ status: 200, description: 'Reviews retrieved successfully.' })
  @ApiResponse({ status: 204, description: 'No content.' })
  @ApiResponse({ status: 400, description: 'Invalid Shop ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Review not found.' })
  @ApiParam({ name: 'idShop', description: 'ID of the shop', example: '1' })
  getAllReviewsByShop(@Param('idShop') idShop: string) {
    try {
      const shopId = parseInt(idShop);
      if (isNaN(shopId)) {
        throw new HttpException('Invalid Shop ID', HttpStatus.BAD_REQUEST);
      }
      return this.reviewsService.getAllReviewsByShop(shopId);
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Failed to retrieve reviews by shop ID',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('/writter/:idUser')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all reviews by writer ID' })
  @ApiResponse({ status: 200, description: 'Reviews retrieved successfully.' })
  @ApiResponse({ status: 204, description: 'No content.' })
  @ApiResponse({ status: 400, description: 'Invalid User ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Review not found.' })
  @ApiParam({ name: 'idUser', description: 'ID of the writer', example: '1' })
  getAllReviewsByWritter(@Param('idUser') idUser: string) {
    try {
      if (!idUser) {
        throw new HttpException('Invalid User ID', HttpStatus.BAD_REQUEST);
      }
      return this.reviewsService.getAllReviewsByWritter(idUser);
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Failed to retrieve reviews by writer ID',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('/user/:idUser')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all reviews by user ID' })
  @ApiResponse({ status: 200, description: 'Reviews retrieved successfully.' })
  @ApiResponse({ status: 204, description: 'No content.' })
  @ApiResponse({ status: 400, description: 'Invalid User ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Review not found.' })
  @ApiParam({ name: 'idUser', description: 'ID of the user', example: '1' })
  getAllReviewsByUser(@Param('idUser') idUser: string) {
    try {
      if (!idUser) {
        throw new HttpException('Invalid User ID', HttpStatus.BAD_REQUEST);
      }
      return this.reviewsService.getAllReviewsByUser(idUser);
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Failed to retrieve reviews by user ID',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a review by ID' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid Reviews ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Review not found.' })
  @ApiParam({ name: 'id', description: 'ID of the review', example: '1' })
  deleteReview(@Param('id') id: string) {
    try {
      const reviewsId = parseInt(id);
      if (isNaN(reviewsId)) {
        throw new HttpException('Invalid Reviews ID', HttpStatus.BAD_REQUEST);
      }
      return this.reviewsService.deleteReview(reviewsId);
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Failed to delete review',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
