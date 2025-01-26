import { Injectable } from '@nestjs/common';
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

  async getAllReviews(): Promise<ReviewsEntity[]> {
    try {
      const reviews = await this.reviewsRepository.find({
        relations: ['writer', 'reviewed', 'shop_reviews'],
      });
      return reviews;
    } catch (err) {
      throw new Error(err);
    }
  }

  async getReviews(id: string): Promise<ReviewsEntity> {
    try {
      const review = await this.reviewsRepository.findOne({
        where: { id_review: parseInt(id) },
      });
      if (!review) {
        throw new Error('Review not found');
      }
      return review;
    } catch (err) {
      throw new Error(err);
    }
  }

  async getAllReviewsByShop(idShop: number): Promise<ReviewsEntity[]> {
    try {
      const reviews = await this.reviewsRepository.find({
        relations: ['writer', 'reviewed', 'shop_reviews'],
        where: { shop_reviews: { id_shop: idShop } },
      });
      return reviews;
    } catch (err) {
      throw new Error(err);
    }
  }

  async getAllReviewsByWritter(id_google: string): Promise<ReviewsEntity[]> {
    try {
      const reviews = await this.reviewsRepository.find({
        relations: ['writer', 'reviewed', 'shop_reviews'],
        where: { writer: { id_google: id_google } },
      });
      return reviews;
    } catch (err) {
      throw new Error(err);
    }
  }

  async getAllReviewsByUser(id_google: string): Promise<ReviewsEntity[]> {
    try {
      const reviews = await this.reviewsRepository.find({
        relations: ['writer', 'reviewed', 'shop_reviews'],
        where: { reviewed: { id_google: id_google } },
      });
      return reviews;
    } catch (err) {
      throw new Error(err);
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
      throw new Error(err);
    }
  }

  async updateReviews(
    updateReviewsDto: UpdateReviewDto,
    id: string,
  ): Promise<ReviewsEntity> {
    try {
      const review = await this.reviewsRepository.findOne({
        where: { id_review: parseInt(id) },
      });
      if (!review) {
        throw new Error('Review not found');
      }
      Object.assign(review, updateReviewsDto);
      await this.reviewsRepository.save(review);
      return review;
    } catch (err) {
      throw new Error(err);
    }
  }

  async deleteReview(id: number): Promise<void> {
    try {
      await this.reviewsRepository.delete(id);
    } catch (err) {
      throw new Error(err);
    }
  }
}
