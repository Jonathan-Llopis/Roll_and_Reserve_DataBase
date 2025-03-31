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
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
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
  /**
   * Create a new review.
   * Method: POST /reviews
   * Description: Create a new review in the database.
   * Input Parameters:
   * - `raiting` (number, required): The rating of the review.
   * - `review` (string, required): The content of the review.
   * - `writter_id` (string, required): The ID of the writer.
   * - `reviewed_id` (string, optional): The ID of the reviewed entity.
   * - `shop_reviews_id` (number, optional): The ID of the shop review.
   * Example Request (JSON format):
   * {
   *   "raiting": 5,
   *   "review": "Great product!",
   *   "writter_id": "1",
   *   "reviewed_id": "2",
   *   "shop_reviews_id": 3
   * }
   * HTTP Responses:
   * - `201 Created`: The review was created successfully.
   * - `400 Bad Request`: Invalid data.
   * - `401 Unauthorized`: Unauthorized.
   * - `404 Not Found`: Review not found.
   */
  createReviews(@Body() createReviewsDto: CreateReviewDto) {
    try {
      return this.reviewsService.createReview(createReviewsDto);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException(
       'Bad Request',
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
/**
 * DOC: Update a review by ID
 * Method: PUT /reviews/:id
 * Description: Updates an existing review with the provided details by ID.
 * Input Parameters:
 * - `id` (string, required): The ID of the review to be updated.
 * - `updateReviewsDto` (UpdateReviewDto, required): The updated review data.
 * Example Request (JSON format):
 * {
 *   "raiting": 4,
 *   "review": "Updated review content",
 *   "writter_id": "1",
 *   "reviewed_id": "2",
 *   "shop_reviews_id": 3
 * }
 * HTTP Responses:
 * - `200 OK`: Review updated successfully. Example:
 *   {
 *     "id_review": 1,
 *     "raiting": 4,
 *     "review": "Updated review content",
 *     "writter_id": "1",
 *     "reviewed_id": "2",
 *     "shop_reviews_id": 3
 *   }
 * - `400 Bad Request`: Invalid Reviews ID or input data.
 * - `401 Unauthorized`: Unauthorized access.
 * - `404 Not Found`: Review not found.
 */

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
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException(
       'Bad Request',
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
/**
 * DOC: Get All Reviews
 * Method: GET /reviews
 * Description: Retrieve all reviews from the database.
 * Input Parameters: None
 * Example Request (JSON format): None
 * HTTP Responses:
 * - `200 OK`: Reviews retrieved successfully. Example: [{ "id_review": 1, "raiting": 5, "review": "Great product!", ... }]
 * - `204 No Content`: No reviews available.
 * - `400 Bad Request`: Invalid request.
 * - `401 Unauthorized`: Unauthorized access.
 */

  getAllReviews() {
    try {
      return this.reviewsService.getAllReviews();
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException(
       'Bad Request',
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

/**
 * DOC: Get a review by ID
 * Method: GET /reviews/:id
 * Description: Retrieves a review by its ID.
 * Input Parameters:
 * - `id` (string, required): The ID of the review.
 * Example Request (JSON format): None
 * HTTP Responses:
 * - `200 OK`: Review retrieved successfully. Example: { "id_review": 1, "raiting": 5, "review": "Great product!", ... }
 * - `400 Bad Request`: Invalid Reviews ID.
 * - `401 Unauthorized`: Unauthorized access.
 * - `404 Not Found`: Review not found.
 */
  getReview(@Param('id') id: string) {
    try {
      const reviewsId = parseInt(id);
      if (isNaN(reviewsId)) {
        throw new HttpException('Invalid Reviews ID', HttpStatus.BAD_REQUEST);
      }
      return this.reviewsService.getReviews(reviewsId);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException(
       'Bad Request',
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
/**
 * DOC: Get all reviews by shop ID
 * Method: GET /reviews/shop/:idShop
 * Description: Retrieves all reviews by the shop ID.
 * Input Parameters:
 * - `idShop` (string, required): The ID of the shop.
 * Example Request (JSON format): None
 * HTTP Responses:
 * - `200 OK`: Reviews retrieved successfully. Example: [ { "id_review": 1, "raiting": 5, "review": "Great product!", ... }, ... ]
 * - `400 Bad Request`: Invalid Shop ID.
 * - `401 Unauthorized`: Unauthorized access.
 * - `404 Not Found`: Review not found.
 * - `204 No Content`: No content.
 */
  getAllReviewsByShop(@Param('idShop') idShop: string) {
    try {
      const shopId = parseInt(idShop);
      if (isNaN(shopId)) {
        throw new HttpException('Invalid Shop ID', HttpStatus.BAD_REQUEST);
      }
      return this.reviewsService.getAllReviewsByShop(shopId);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException(
       'Bad Request',
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
/**
 * Retrieve all reviews by writer ID.
 * Method: GET /reviews/writter/:idUser
 * Description: Fetches all reviews written by a specific user.
 * Input Parameters:
 * - `idUser` (string, required): The ID of the writer.
 * Example Request (JSON format): None
 * HTTP Responses:
 * - `200 OK`: Reviews retrieved successfully.
 * - `204 No Content`: No reviews found.
 * - `400 Bad Request`: Invalid User ID.
 * - `401 Unauthorized`: Unauthorized access.
 * - `404 Not Found`: Reviews not found for the user.
 */

  getAllReviewsByWritter(@Param('idUser') idUser: string) {
    try {
      if (!idUser) {
        throw new HttpException('Invalid User ID', HttpStatus.BAD_REQUEST);
      }
      return this.reviewsService.getAllReviewsByWritter(idUser);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException(
       'Bad Request',
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
/**
 * DOC: Get all reviews by user ID
 * Method: GET /reviews/user/:idUser
 * Description: Retrieves all reviews received by a specific user.
 * Input Parameters:
 * - `idUser` (string, required): The ID of the user.
 * Example Request (JSON format): None
 * HTTP Responses:
 * - `200 OK`: Reviews retrieved successfully. Example: [ { "id_review": 1, "raiting": 5, "review": "Great product!", ... }, ... ]
 * - `400 Bad Request`: Invalid User ID.
 * - `401 Unauthorized`: Unauthorized access.
 * - `404 Not Found`: Reviews not found for the user.
 * - `204 No Content`: No reviews found.
 */
  getAllReviewsByUser(@Param('idUser') idUser: string) {
    try {
      if (!idUser) {
        throw new HttpException('Invalid User ID', HttpStatus.BAD_REQUEST);
      }
      return this.reviewsService.getAllReviewsByUser(idUser);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException(
       'Bad Request',
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
/**
 * Delete a review by ID.
 * Method: DELETE /reviews/:id
 * Description: Deletes a review with the given ID.
 * Input Parameters:
 * - `id` (string, required): The ID of the review to be deleted.
 * HTTP Responses:
 * - `200 OK`: Review deleted successfully.
 * - `400 Bad Request`: Invalid Reviews ID.
 * - `401 Unauthorized`: Unauthorized access.
 * - `404 Not Found`: Review not found.
 */

  deleteReview(@Param('id') id: string) {
    try {
      const reviewsId = parseInt(id);
      if (isNaN(reviewsId)) {
        throw new HttpException('Invalid Reviews ID', HttpStatus.BAD_REQUEST);
      }
      return this.reviewsService.deleteReview(reviewsId);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException(
       'Bad Request',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
