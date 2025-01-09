import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { runSeeders, SeederOptions } from 'typeorm-extension';
import { UserEntity } from './users/users.entity';
import { config } from 'dotenv';
import { DifficultyEntity } from './difficulty/difficulty.entity';
import { DifficultySeeder } from './db/seeding/seeds/difficulty.seeder';
import { GamesEntity } from './games/game.entitiy';
import { GameCategoryEntity } from './game_category/game_category.entity';
import { ReservesEntity } from './reserves/reserves.entity';
import { ReviewsEntity } from './reviews/reviews.entity';
import { ShopsEntity } from './shops/shops.entity';
import { StatsTablesEntity } from './stats_tables/stats_tables.entity';
import { TablesEntity } from './tables/tables.entity';
import { GamesSeeder } from './db/seeding/seeds/games_seeder';
import { GameCategorySeeder } from './db/seeding/seeds/game_category.seeder';
import { ReservesSeeder } from './db/seeding/seeds/reserves.seeder';
import { ReviewsSeeder } from './db/seeding/seeds/reviews.seeder';
import { ShopsSeeder } from './db/seeding/seeds/shops.seeder';
import { StatsTablesSeeder } from './db/seeding/seeds/stats_tables.seeder';
import { TablesSeeder } from './db/seeding/seeds/tables.seeder';
config();

const options: DataSourceOptions & SeederOptions = {
  type: 'mariadb',
  host: 'database',
  port: 3306,
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,

  entities: [
    GamesEntity,
    GameCategoryEntity,
    ReservesEntity,
    ReviewsEntity,
    ShopsEntity,
    StatsTablesEntity,
    TablesEntity,
    DifficultyEntity,
    UserEntity,
  ],
  seeds: [
    DifficultySeeder,
    StatsTablesSeeder,
    ReviewsSeeder,
    GameCategorySeeder,
    GamesSeeder,
    TablesSeeder,
    ReservesSeeder,
    ShopsSeeder,
  ],
};

const dataSource = new DataSource(options);

dataSource
  .initialize()
  .then(async () => {
    await dataSource.synchronize(true);
    await runSeeders(dataSource);
    process.exit();
  })
  .catch((error) => console.log('Error initializing data source', error));
