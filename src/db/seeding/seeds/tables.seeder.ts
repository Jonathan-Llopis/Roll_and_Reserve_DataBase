import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import tablesData from '../../../data/tables';
import { TablesEntity } from '../../../tables/tables.entity';
import { ShopsEntity } from '../../../shops/shops.entity';

export class TablesSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const tablesRepository = dataSource.getRepository(TablesEntity);
    const shopsRepository = dataSource.getRepository(ShopsEntity);

    const tablesEntries = await Promise.all(
      tablesData.map(async (item) => {
        const tablesEntry = new TablesEntity();
        tablesEntry.number_table = item.number_table;
        tablesEntry.tables_of_shop = await shopsRepository.findOne({
          where: { id_shop: item.tables_of_shop },
        });


        return tablesEntry;
      }),
    );

    await tablesRepository.save(tablesEntries);

    console.log('Tables seeding completed!');
  }
}
