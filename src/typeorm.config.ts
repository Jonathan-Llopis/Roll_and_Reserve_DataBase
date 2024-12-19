import { registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from './users/users.entity';
import * as dotenv from 'dotenv';
import { UploadEntity } from './upload/upload.entity';

dotenv.config();

const config = {
  type: 'mysql',
  host: 'database',
  port: 3306,
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  entities: [User, UploadEntity],
  migrations: ['./src/migrations/*.ts'],
  synchronize: false,
};

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
