import { registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { UserEntity } from './users/users.entity';
import * as dotenv from 'dotenv';
import { ReviewsEntity } from './reviews/reviews.entity';
import { DifficultyEntity } from './difficulty/difficulty.entity';
import { GameCategoryEntity } from './game_category/game_category.entity';
import { GamesEntity } from './games/game.entitiy';
import { ReservesEntity } from './reserves/reserves.entity';
import { ShopsEntity } from './shops/shops.entity';
import { TablesEntity } from './tables/tables.entity';

dotenv.config();

const config = {
  type: 'mysql',
  host: 'database',
  port: 3306,
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  entities: [
    UserEntity,
    ReviewsEntity,
    ShopsEntity,
    TablesEntity,
    ReservesEntity,
    GamesEntity,
    GameCategoryEntity,
    DifficultyEntity,
  ],
  migrations: ['./../../../migrations/*.ts'],
  synchronize: false,
};

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
