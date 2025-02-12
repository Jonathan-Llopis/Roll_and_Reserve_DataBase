import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsEntity } from './reviews.entity';
import { UserEntity } from '../users/users.entity';
import { ShopsEntity } from 'src/shops/shops.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReviewsEntity, UserEntity, ShopsEntity])],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
