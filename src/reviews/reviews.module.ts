import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsEntity } from './reviews.entity';
import { UsersService } from 'src/users/users.service';
import { UserEntity } from 'src/users/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReviewsEntity, UserEntity])],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
