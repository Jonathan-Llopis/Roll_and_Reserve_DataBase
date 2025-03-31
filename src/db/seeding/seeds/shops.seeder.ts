import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import shopsData from '../../../data/shops';
import { ShopsEntity } from '../../../shops/shops.entity';
import { UserEntity } from '../../../users/users.entity';

export class ShopsSeeder implements Seeder {

  /**
   * Seeds the shops table with data defined in src/data/shops.ts.
   * It creates a new instance of ShopsEntity for each item in the data and saves them using the repository's save method.
   * Logs a success message upon completion.
   *
   * @param dataSource The DataSource object used to interact with the database.
   * @returns A promise that resolves when the operation is complete.
   */
  public async run(dataSource: DataSource): Promise<any> {
    const shopsRepository = dataSource.getRepository(ShopsEntity);
    const userRepository = dataSource.getRepository(UserEntity);

    const shopsEntries = await Promise.all(
      shopsData.map(async (item) => {
        const shopsEntry = new ShopsEntity();
        shopsEntry.address = item.address;
        shopsEntry.name = item.name;
        shopsEntry.logo = item.logo;
        shopsEntry.latitud = item.latitud;
        shopsEntry.longitud = item.longitud;
        shopsEntry.owner = await userRepository.findOne({
          where: { id_google: item.owner_id.toString() },
        });

        return shopsEntry;
      }),
    );

    await shopsRepository.save(shopsEntries);

    console.log('Shops seeding completed!');
  }
}
