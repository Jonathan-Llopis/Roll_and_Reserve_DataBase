import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import shopsData from '../../../data/shops';
import { ShopsEntity } from '../../../shops/shops.entity';
import { UserEntity } from '../../../users/users.entity';

export class ShopsSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const shopsRepository = dataSource.getRepository(ShopsEntity);
    const userRepository = dataSource.getRepository(UserEntity);

    const shopsEntries = await Promise.all(
      shopsData.map(async (item) => {
        const shopsEntry = new ShopsEntity();
        shopsEntry.address = item.address;
        shopsEntry.logo = item.logo;
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
