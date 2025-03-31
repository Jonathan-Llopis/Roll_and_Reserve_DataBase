import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewsEntity } from './reviews.entity';
import { CreateReviewDto, UpdateReviewDto } from './reviews.dto';
import { ShopsEntity } from '../shops/shops.entity';
import { UserEntity } from '../users/users.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class ReviewsService {
  /**
   * Constructor of the ReviewsService.
   * @param reviewsRepository The repository for the ReviewsEntity.
   * @param shopRepository The repository for the ShopsEntity.
   * @param userRepository The repository for the UserEntity.
   * @param usersService The service for managing users.
   */
  constructor(
    @InjectRepository(ReviewsEntity)
    private readonly reviewsRepository: Repository<ReviewsEntity>,
    @InjectRepository(ShopsEntity)
    private readonly shopRepository: Repository<ShopsEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Throws an HttpException for the given error, or a default BAD_REQUEST
   * error if the given error is not an HttpException.
   *
   * @param err - The error to throw.
   */
  private handleError(err: any) {
    if (err instanceof HttpException) {
      throw err;
    }
    throw new BadRequestException('An unexpected error occurred');
  }

  /**
   * DOC: Get all reviews
   * Method: GET /reviews
   * Description: Retrieves all reviews.
   * HTTP Responses:
   * - `200 OK`: Reviews retrieved successfully. Example: [ { "id_review": 1, "raiting": 5, "review": "Great product!", ... }, ... ]
   * - `400 Bad Request`: Invalid request.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: Reviews not found.
   * - `204 No Content`: No reviews found.
   */
  async getAllReviews(): Promise<ReviewsEntity[]> {
    try {
      const reviews = await this.reviewsRepository.find({
        relations: ['writer', 'reviewed', 'shop_reviews'],
      });
      if (reviews.length === 0) {
        throw new HttpException('No Content', HttpStatus.NO_CONTENT);
      }
      return reviews;
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

  /**
   * DOC: Get a review by ID
   * Method: GET /reviews/:id
   * Description: Retrieves a review by its ID.
   * Input Parameters:
   * - `id` (number, required): The ID of the review.
   * Example Request (JSON format): None
   * HTTP Responses:
   * - `200 OK`: Review retrieved successfully. Example: { "id_review": 1, "raiting": 5, "review": "Great product!", ... }
   * - `400 Bad Request`: Invalid Reviews ID.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: Review not found.
   */
  async getReviews(id: number): Promise<ReviewsEntity> {
    try {
      const review = await this.reviewsRepository.findOne({
        where: { id_review: id },
      });
      if (!review) {
        throw new NotFoundException('Review not found');
      }
      return review;
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



/**
 * DOC: Get all reviews by shop ID
 * Method: GET /reviews/shop/:idShop
 * Description: Retrieves all reviews for a specific shop by its ID.
 * Input Parameters:
 * - `idShop` (number, required): The ID of the shop.
 * Example Request (JSON format): None
 * HTTP Responses:
 * - `200 OK`: Reviews retrieved successfully. Example: [ { "id_review": 1, "raiting": 5, "review": "Great product!", ... }, ... ]
 * - `400 Bad Request`: Invalid Shop ID.
 * - `401 Unauthorized`: Unauthorized access.
 * - `404 Not Found`: Shop not found.
 * - `204 No Content`: No reviews found for the shop.
 */
  async getAllReviewsByShop(idShop: number): Promise<ReviewsEntity[]> {
    try {
      const reviews = await this.reviewsRepository.find({
        relations: ['writer', 'reviewed', 'shop_reviews'],
        where: { shop_reviews: { id_shop: idShop } },
      });
      if (reviews.length === 0) {
        throw new HttpException('No Content', HttpStatus.NO_CONTENT);
      }
      return reviews;
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

/**
 * DOC: Get all reviews by writer ID
 * Method: GET /reviews/writer/:id_google
 * Description: Retrieves all reviews written by a specific writer using their Google ID.
 * Input Parameters:
 * - `id_google` (string, required): The Google ID of the writer.
 * Example Request (JSON format): None
 * HTTP Responses:
 * - `200 OK`: Reviews retrieved successfully. Example: [ { "id_review": 1, "raiting": 5, "review": "Great product!", ... }, ... ]
 * - `400 Bad Request`: Invalid request.
 * - `401 Unauthorized`: Unauthorized access.
 * - `404 Not Found`: Writer not found.
 * - `204 No Content`: No reviews found for the writer.
 */

  async getAllReviewsByWritter(id_google: string): Promise<ReviewsEntity[]> {
    try {
      const reviews = await this.reviewsRepository.find({
        relations: ['writer', 'reviewed', 'shop_reviews'],
        where: { writer: { id_google: id_google } },
      });
      if (reviews.length === 0) {
        throw new HttpException('No Content', HttpStatus.NO_CONTENT);
      }
      return reviews;
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

/**
 * DOC: Get all reviews by user ID
 * Method: GET /reviews/user/:id_google
 * Description: Retrieves all reviews received by a specific user using their Google ID.
 * Input Parameters:
 * - `id_google` (string, required): The Google ID of the user.
 * Example Request (JSON format): None
 * HTTP Responses:
 * - `200 OK`: Reviews retrieved successfully. Example: [ { "id_review": 1, "raiting": 5, "review": "Great product!", ... }, ... ]
 * - `400 Bad Request`: Invalid request.
 * - `401 Unauthorized`: Unauthorized access.
 * - `404 Not Found`: User not found.
 * - `204 No Content`: No reviews found for the user.
 */

  async getAllReviewsByUser(id_google: string): Promise<ReviewsEntity[]> {
    try {
      const reviews = await this.reviewsRepository.find({
        relations: ['writer', 'reviewed', 'shop_reviews'],
        where: { reviewed: { id_google: id_google } },
      });
      if (reviews.length === 0) {
        throw new HttpException('No Content', HttpStatus.NO_CONTENT);
      }
      return reviews;
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

  /**
   * DOC: Create a new review.
   * Method: POST /reviews
   * Description: Create a new review in the database.
   * Input Parameters:
   * - `raiting` (number, required): The rating of the review.
   * - `review` (string, required): The content of the review.
   * - `writter_id` (string, required): The Google ID of the writer.
   * - `reviewed_id` (string, optional): The Google ID of the reviewed entity.
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
   * - `400 Bad Request`: Invalid request.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: Writer not found.
   * - `204 No Content`: No content.
   */
  async createReview(
    createReviewsDto: CreateReviewDto,
  ): Promise<ReviewsEntity> {
    try {
      const review = this.reviewsRepository.create(createReviewsDto);
      console.log('review', createReviewsDto);
      const writer = await this.userRepository.findOne({
        where: { id_google: createReviewsDto.writter_id },
      });
      if (!writer) {
        throw new HttpException('Writer not found', HttpStatus.NOT_FOUND);
      }
      console.log('writer', writer);
      review.writer = writer;

      if (createReviewsDto.reviewed_id) {
        const reviewed = await this.userRepository.findOne({
          where: { id_google: createReviewsDto.reviewed_id },
        });
        if (!reviewed) {
          throw new HttpException(
            'Reviewed user not found',
            HttpStatus.NOT_FOUND,
          );
        }
        review.reviewed = reviewed;
        console.log('reviewed', reviewed);
      }

      if (createReviewsDto.shop_reviews_id) {
        const shop = await this.shopRepository.findOne({
          where: { id_shop: createReviewsDto.shop_reviews_id },
        });
        if (!shop) {
          throw new HttpException('Shop not found', HttpStatus.NOT_FOUND);
        }
        review.shop_reviews = shop;
      }

      await this.reviewsRepository.save(review);
      if (review.reviewed) {
        await this.usersService.updateAverageRating(review.reviewed.id_google);
      }
      return review;
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

  /**
   * DOC: Update a review.
   * Method: PATCH /reviews/:id
   * Description: Updates a review in the database.
   * Input Parameters:
   * - `id` (number, required): The ID of the review.
   * - `raiting` (number, optional): The rating of the review.
   * - `review` (string, optional): The content of the review.
   * - `writter_id` (string, optional): The Google ID of the writer.
   * - `reviewed_id` (string, optional): The Google ID of the reviewed entity.
   * - `shop_reviews_id` (number, optional): The ID of the shop review.
   * Example Request (JSON format):
   * {
   *   "id": 1,
   *   "raiting": 5,
   *   "review": "Great product!",
   *   "writter_id": "1",
   *   "reviewed_id": "2",
   *   "shop_reviews_id": 3
   * }
   * HTTP Responses:
   * - `200 OK`: The review was updated successfully. Example: { "id_review": 1, "raiting": 5, "review": "Great product!", ... }
   * - `400 Bad Request`: Invalid request.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: Review not found.
   */
  async updateReviews(
    updateReviewsDto: UpdateReviewDto,
    id: number,
  ): Promise<ReviewsEntity> {
    try {
      const review = await this.reviewsRepository.findOne({
        where: { id_review: id },
        relations: ['writer', 'reviewed', 'shop_reviews'],
      });
      if (!review) {
        throw new NotFoundException('Review not found');
      }

      if (updateReviewsDto.writter_id) {
        const writer = await this.userRepository.findOne({
          where: { id_google: updateReviewsDto.writter_id },
        });
        if (!writer) {
          throw new NotFoundException('Writer not found');
        }
        review.writer = writer;
      }

      if (updateReviewsDto.reviewed_id) {
        const reviewed = await this.userRepository.findOne({
          where: { id_google: updateReviewsDto.reviewed_id },
        });
        if (!reviewed) {
          throw new NotFoundException('Reviewed user not found');
        }
        review.reviewed = reviewed;
      }

      if (updateReviewsDto.shop_reviews_id) {
        const shop = await this.shopRepository.findOne({
          where: { id_shop: updateReviewsDto.shop_reviews_id },
        });
        if (!shop) {
          throw new NotFoundException('Shop not found');
        }
        review.shop_reviews = shop;
      }

      this.reviewsRepository.merge(review, updateReviewsDto);
      await this.reviewsRepository.save(review);
      return review;
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

  /**
   * DOC: Delete a review.
   * Method: DELETE /reviews/:id
   * Description: Deletes a review from the database.
   * Input Parameters:
   * - `id` (number, required): The ID of the review.
   * HTTP Responses:
   * - `204 No Content`: The review was deleted successfully.
   * - `404 Not Found`: Review not found.
   */
  async deleteReview(id: number): Promise<void> {
    try {
      const result = await this.reviewsRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException('Review not found');
      }
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
