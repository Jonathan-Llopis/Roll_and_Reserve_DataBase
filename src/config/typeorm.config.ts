import { registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { UserEntity } from '../users/users.entity';
import * as dotenv from 'dotenv';
import { ReviewsEntity } from '../reviews/reviews.entity';
import { DifficultyEntity } from '../difficulty/difficulty.entity';
import { GameCategoryEntity } from '../game_category/game_category.entity';
import { GamesEntity } from '../games/games.entity';
import { ReservesEntity } from '../reserves/reserves.entity';
import { ShopsEntity } from '../shops/shops.entity';
import { TablesEntity } from '../tables/tables.entity';
import { UserReserveEntity } from '../users_reserves/users_reserves.entity';

dotenv.config();

export const typeOrmConfig: DataSourceOptions = {
  type: 'mysql',
  host: process.env.MYSQL_HOST || 'database',
  port: +(process.env.MYSQL_PORT || 3306),
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
    UserReserveEntity,
  ],
  migrations: ['./src/migrations/*.ts'],
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
};

export default registerAs('typeorm', () => typeOrmConfig);
export const connectionSource = new DataSource(typeOrmConfig);
