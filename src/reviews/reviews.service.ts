import { Injectable, NotFoundException, BadRequestException, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewsEntity } from './reviews.entity';
import { CreateReviewDto, UpdateReviewDto } from './reviews.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ReviewsEntity)
    private readonly reviewsRepository: Repository<ReviewsEntity>,
  ) {}

  private handleError(err: any) {
    if (err instanceof HttpException) {
      throw err;
    }
    throw new BadRequestException('An unexpected error occurred');
  }

  async getAllReviews(): Promise<ReviewsEntity[]> {
    try {
      return await this.reviewsRepository.find({
        relations: ['writer', 'reviewed', 'shop_reviews'],
      });
    } catch (err) {
      this.handleError(err);
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
      this.handleError(err);
    }
  }

  async getAllReviewsByShop(idShop: number): Promise<ReviewsEntity[]> {
    try {
      return await this.reviewsRepository.find({
        relations: ['writer', 'reviewed', 'shop_reviews'],
        where: { shop_reviews: { id_shop: idShop } },
      });
    } catch (err) {
      this.handleError(err);
    }
  }

  async getAllReviewsByWritter(id_google: string): Promise<ReviewsEntity[]> {
    try {
      return await this.reviewsRepository.find({
        relations: ['writer', 'reviewed', 'shop_reviews'],
        where: { writer: { id_google: id_google } },
      });
    } catch (err) {
      this.handleError(err);
    }
  }

  async getAllReviewsByUser(id_google: string): Promise<ReviewsEntity[]> {
    try {
      return await this.reviewsRepository.find({
        relations: ['writer', 'reviewed', 'shop_reviews'],
        where: { reviewed: { id_google: id_google } },
      });
    } catch (err) {
      this.handleError(err);
    }
  }

  async createReview(
    createReviewsDto: CreateReviewDto,
  ): Promise<ReviewsEntity> {
    try {
      const review = this.reviewsRepository.create(createReviewsDto);
      await this.reviewsRepository.save(review);
      return review;
    } catch (err) {
      this.handleError(err);
    }
  }

  async updateReviews(
    updateReviewsDto: UpdateReviewDto,
    id: number,
  ): Promise<ReviewsEntity> {
    try {
      const review = await this.reviewsRepository.findOne({
        where: { id_review: id },
      });
      if (!review) {
        throw new NotFoundException('Review not found');
      }
      Object.assign(review, updateReviewsDto);
      await this.reviewsRepository.save(review);
      return review;
    } catch (err) {
      this.handleError(err);
    }
  }

  async deleteReview(id: number): Promise<void> {
    try {
      const result = await this.reviewsRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException('Review not found');
      }
    } catch (err) {
      this.handleError(err);
    }
  }
}
