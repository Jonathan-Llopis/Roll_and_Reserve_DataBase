import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { UtilsModule } from './utils/utils.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserEntity } from './users/users.entity';
import { AuthorizationMiddleware } from './authorization.middleware';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { LabelsModule } from './utils/labels/labels.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ShopsModule } from './shops/shops.module';
import { TablesModule } from './tables/tables.module';
import { GamesModule } from './games/games.module';
import { RulesAssistantModule } from './rules_assistant/rules_assistant.module';
import { DifficultyModule } from './difficulty/difficulty.module';
import { GameCategoryModule } from './game_category/game_category.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ShopGamesModule } from './shop_games/shop_games.module';
import { ReservesModule } from './reserves/reserves.module';
import { UsersReservesModule } from './users_reserves/users_reserves.module';
import { ReviewsEntity } from './reviews/reviews.entity';
import { ShopsEntity } from './shops/shops.entity';
import { TablesEntity } from './tables/tables.entity';
import { ReservesEntity } from './reserves/reserves.entity';
import { GamesEntity } from './games/games.entity';
import { DifficultyEntity } from './difficulty/difficulty.entity';
import { GameCategoryEntity } from './game_category/game_category.entity';
import { FilesModule } from './files/files.module';
import { UserReserveEntity } from './users_reserves/users_reserves.entity';
import { FcmNotificationModule } from './fcm-notification/fcm-notification.module';
import { HttpModule } from './http/http.module';
import { ScheduleModule } from '@nestjs/schedule';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'env'],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    UtilsModule,
    LabelsModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('MYSQL_HOST') || 'database',
        port: +(configService.get<string>('MYSQL_PORT') || 3306),
        username: configService.get<string>('MYSQL_USER'),
        password: configService.get<string>('MYSQL_PASSWORD'),
        database: configService.get<string>('MYSQL_DATABASE'),
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
        synchronize: configService.get<string>('DB_SYNCHRONIZE') === 'true',
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      ReviewsEntity,
      ShopsEntity,
      TablesEntity,
      ReservesEntity,
      GamesEntity,
      GameCategoryEntity,
      DifficultyEntity,
      UserEntity,
      UserReserveEntity,
    ]),
    ShopsModule,
    TablesModule,
    GamesModule,
    RulesAssistantModule,
    DifficultyModule,
    GameCategoryModule,
    ReviewsModule,
    ShopGamesModule,
    ReservesModule,
    UsersReservesModule,
    FilesModule,
    FcmNotificationModule,
    HttpModule,
    ScheduleModule.forRoot(),
    HttpModule.forFeature({
      serviceName: 'Bgg-Api',
      config: {
        baseURL: 'http://localhost:8070/api',
        enableLogging: true,
      },
    }),
  ],
  controllers: [],
  providers: [AuthorizationMiddleware, AuthService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthorizationMiddleware)
      .exclude(
        { path: 'users/login', method: RequestMethod.POST },
        { path: 'users', method: RequestMethod.POST },
        { path: 'files/(.*)', method: RequestMethod.GET },
      )
      .forRoutes('*');
  }
}
