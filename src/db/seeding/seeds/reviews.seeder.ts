import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import reviewsData from '../../../data/reviews';
import { ReviewsEntity } from '../../../reviews/reviews.entity';
import { ShopsEntity } from '../../../shops/shops.entity';

export class ReviewsSeeder implements Seeder {
  /**
   * Seeds the reviews table with data defined in src/data/reviews.ts.
   * It creates a new instance of ReviewsEntity for each item in the data and associates it with a shop using the shop ID.
   * The entries are then saved using the repository's save method.
   * Logs a success message upon completion.
   *
   * @param dataSource The DataSource object used to interact with the database.
   * @returns A promise that resolves when the operation is complete.
   */
  public async run(dataSource: DataSource): Promise<any> {
    const reviewsRepository = dataSource.getRepository(ReviewsEntity);
    const shopsRepository = dataSource.getRepository(ShopsEntity);

    const reviewsEntries = await Promise.all(
      reviewsData.map(async (item) => {
        const reviewsEntry = new ReviewsEntity();
        reviewsEntry.raiting = item.rating;
        reviewsEntry.review = item.comment;
        reviewsEntry.shop_reviews = await shopsRepository.findOne({
          where: { id_shop: item.shop_id },
        });
        return reviewsEntry;
      }),
    );

    await reviewsRepository.save(reviewsEntries);

    console.log('Reviews seeding completed!');
  }
}
