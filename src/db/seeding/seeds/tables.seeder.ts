import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import tablesData from '../../../data/tables';
import { TablesEntity } from '../../../tables/tables.entity';
import { ShopsEntity } from '../../../shops/shops.entity';

export class TablesSeeder implements Seeder {
/**
 * Seeds the tables table with data defined in src/data/tables.ts.
 * It creates a new instance of TablesEntity for each item in the data and associates it with a shop using the shop ID.
 * The entries are then saved using the repository's save method.
 * Logs a success message upon completion.
 *
 * @param dataSource The DataSource object used to interact with the database.
 * @returns A promise that resolves when the operation is complete.
 */

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
