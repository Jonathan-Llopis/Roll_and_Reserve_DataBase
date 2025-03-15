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
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ReviewsEntity)
    private readonly reviewsRepository: Repository<ReviewsEntity>,
    @InjectRepository(ShopsEntity)
    private readonly shopRepository: Repository<ShopsEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly usersService: UsersService,
  ) {}

  private handleError(err: any) {
    if (err instanceof HttpException) {
      throw err;
    }
    throw new BadRequestException('An unexpected error occurred');
  }

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
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createReview(
    createReviewsDto: CreateReviewDto,
  ): Promise<ReviewsEntity> {
    try {
      const review = this.reviewsRepository.create(createReviewsDto);
      const writer = await this.userRepository.findOneBy({
        id_google: createReviewsDto.writter_id,
      });
      if (!writer) {
        throw new HttpException('Writer not found', HttpStatus.NOT_FOUND);
      }
      review.writer = writer;

      if(createReviewsDto.reviewed_id){
        const reviewed = await this.userRepository.findOneBy({
          id_google: createReviewsDto.reviewed_id,
        });
        if (!reviewed) {
          throw new HttpException(
            'Reviewed user not found',
            HttpStatus.NOT_FOUND,
          );
        }
        review.reviewed = reviewed;
        this.usersService.updateAverageRating(reviewed.id_google);
      }
     
      if(createReviewsDto.shop_reviews_id){
        const shop = await this.shopRepository.findOne({
          where: { id_shop: createReviewsDto.shop_reviews_id },
        });
        if (!shop) {
          throw new HttpException('Shop not found', HttpStatus.NOT_FOUND);
        }
        review.shop_reviews = shop;
      }
      
      await this.reviewsRepository.save(review);
      return review;

    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
