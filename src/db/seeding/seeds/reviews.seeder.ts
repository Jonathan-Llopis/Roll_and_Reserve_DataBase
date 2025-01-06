import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import reviewsData from '../../../data/reviews';
import { ReviewsEntity } from '../../../reviews/reviews.entity';
import { UserEntity } from '../../../users/users.entity';
import { ShopsEntity } from '../../../shops/shops.entity';

export class ReviewsSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const reviewsRepository = dataSource.getRepository(ReviewsEntity);
    const userRepository = dataSource.getRepository(UserEntity);
    const shopsRepository = dataSource.getRepository(ShopsEntity);

    const reviewsEntries = await Promise.all(
      reviewsData.map(async (item) => {
        const reviewsEntry = new ReviewsEntity();
        reviewsEntry.raiting = item.raiting;
        reviewsEntry.review = item.review;
        reviewsEntry.writer = await userRepository.findOne({
          where: { id_google: item.writer_id.toString() },
        });
        reviewsEntry.reviewed = await userRepository.findOne({
          where: { id_google: item.reviewed_id.toString() },
        });
        reviewsEntry.shop_reviews = await shopsRepository.findOne({
          where: { id_shop: item.shop_reviews },
        });

        return reviewsEntry;
      }),
    );

    await reviewsRepository.save(reviewsEntries);

    console.log('Reviews seeding completed!');
  }
}
