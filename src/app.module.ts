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
import { AuthService } from './Autentication/auth.service';
import { MailModule } from './mail/mail.module';
import { LabelsModule } from './utils/labels/labels.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ShopsModule } from './shops/shops.module';
import { TablesModule } from './tables/tables.module';
import { GamesModule } from './games/games.module';
import { DifficultyModule } from './difficulty/difficulty.module';
import { GameCategoryModule } from './game_category/game_category.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ShopGamesModule } from './shop_games/shop_games.module';
import { ReservesService } from './reserves/reserves.service';
import { ReservesModule } from './reserves/reserves.module';
import { UsersReservesModule } from './users_reserves/users_reserves.module';
import { ReviewsEntity } from './reviews/reviews.entity';
import { ShopsEntity } from './shops/shops.entity';
import { TablesEntity } from './tables/tables.entity';
import { ReservesEntity } from './reserves/reserves.entity';
import { GamesEntity } from './games/game.entitiy';
import { DifficultyEntity } from './difficulty/difficulty.entity';
import { GameCategoryEntity } from './game_category/game_category.entity';
import { FilesModule } from './files/files.module';
import { UserReserveEntity } from './users_reserves/user_reserves.entity';
import { FcmNotificationModule } from './fcm-notification/fcm-notification.module';
@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    UtilsModule,
    MailModule,
    LabelsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: 'database',
        port: +configService.get('MYSQL_PORT') || 3306,
        username: configService.get('MYSQL_USER'),
        password: configService.get('MYSQL_PASSWORD'),
        database: configService.get('MYSQL_DATABASE'),
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
        synchronize: true,
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
    DifficultyModule,
    GameCategoryModule,
    ReviewsModule,
    ShopGamesModule,
    ReservesModule,
    UsersReservesModule,
    FilesModule,
    FcmNotificationModule,
  ],
  controllers: [],
  providers: [AuthorizationMiddleware, AuthService, ReservesService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthorizationMiddleware)
      .exclude(
        { path: 'users/login', method: RequestMethod.POST },
        { path: 'users', method: RequestMethod.POST },
      )
      .forRoutes('*');
  }
}
