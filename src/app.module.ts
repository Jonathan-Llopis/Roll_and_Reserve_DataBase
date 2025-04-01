import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { UtilsModule } from './utils/utils.module';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Between, Repository } from 'typeorm';
import { UserEntity } from './users/users.entity';
import { AuthorizationMiddleware } from './authorization.middleware';
import { AuthService } from './Autentication/auth.service';
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
import { GamesEntity } from './games/games.entitiy';
import { DifficultyEntity } from './difficulty/difficulty.entity';
import { GameCategoryEntity } from './game_category/game_category.entity';
import { FilesModule } from './files/files.module';
import { UserReserveEntity } from './users_reserves/users_reserves.entity';
import { FcmNotificationModule } from './fcm-notification/fcm-notification.module';
import { HttpModule } from './http/http.module';
import { Cron, ScheduleModule } from '@nestjs/schedule';
import { FcmNotificationService } from './fcm-notification/fcm-notification.service';
@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      /**
       * This function is used by TypeORM to get the connection options for the
       * MongoDB database. It is called automatically by Nest when the application
       * starts.
       *
       * @param {ConfigService} configService - The configuration service that
       * provides the MongoDB connection string.
       *
       * @return {Promise<MongoDbModuleOptions>} - A promise that resolves to the
       * MongoDB connection options.
       */
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    UtilsModule,
    LabelsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      /**
       * A factory function that returns the configuration options for the
       * TypeORM connection to the MySQL database.
       *
       * @param {ConfigService} configService - The configuration service that
       * provides the database connection details.
       *
       * @return {Promise<TypeOrmModuleOptions>} - A promise that resolves to the
       * database connection options.
       */
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
  providers: [
    AuthorizationMiddleware,
    AuthService,
    ReservesService,
    FcmNotificationModule,
  ],
})
export class AppModule implements NestModule {
  /**
   * The constructor for the App Module.
   *
   * @param {FcmNotificationService} fcmNotificationService - The service for sending notifications.
   * @param {Repository<ReservesEntity>} reserveRepository - The repository for the ReservesEntity.
   */
  constructor(
    private readonly fcmNotificationService: FcmNotificationService,
    @InjectRepository(ReservesEntity)
    private readonly reserveRepository: Repository<ReservesEntity>,
  ) {}

  /**
   * This method is used by Nest to configure the middleware that will be used by
   * the application. In this case, it is used to configure the AuthorizationMiddleware
   * to be used for all routes except the ones that are excluded below.
   * @param consumer - The middleware consumer that is used to add the middleware
   * to the application.
   */
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
  /**
   * Executes a cron job every 30 seconds to find upcoming reserves and send notifications.
   *
   * This function retrieves reserves that are scheduled to start in the next 90 to 105 minutes.
   * It logs the current date and time, and the upcoming reserves. For each reserve found, it
   * checks for users with valid notification tokens and sends a notification about the upcoming
   * reserve. It marks the reserve as having sent a confirmation notification and saves the updated
   * reserve entity.
   *
   * If an error occurs during the process, it is logged to the console.
   */
  @Cron('0 */15 8-23 * * *', {
    timeZone: 'Europe/Madrid',
  })
  async handleCron() {
    try {
      const currentDate = new Date();
      console.log('Cron running every 30 seconds:', currentDate);
      const upcomingReserves = await this.reserveRepository.find({
        relations: [
          'userReserves',
          'userReserves.user',
          'reserve_table',
          'reserve_table.tables_of_shop',
          'reserve_of_game',
        ],
        where: {
          hour_start: Between(
            new Date(currentDate.getTime() + 90 * 60000),
            new Date(currentDate.getTime() + 105 * 60000),
          ),
        },
      });
      console.log('Upcoming reserves:', upcomingReserves);
      for (const reserve of upcomingReserves) {
        console.log(
          `Cron sending notifications for reserve ID: ${reserve.id_reserve}`,
        );
        reserve.confirmation_notification = true;
        const registrationTokens = Array.from(
          new Set(
            (reserve.userReserves || [])
              .filter(
                (userReserve) =>
                  userReserve.user &&
                  userReserve.user.token_notification &&
                  userReserve.user.token_notification.trim() !== '',
              )
              .map((userReserve) => userReserve.user.token_notification),
          ),
        );
        console.log('Registration tokens:', registrationTokens);
        if (registrationTokens.length > 0) {
          const shopName = reserve.reserve_table?.tables_of_shop.name;
          const hour = new Date(reserve.hour_start).toLocaleTimeString(
            'es-ES',
            {
              hour: '2-digit',
              minute: '2-digit',
            },
          );
          this.fcmNotificationService.sendMulticastNotification(
            registrationTokens,
            `Reserva próxima en ${shopName}`,
            `Tienes una reserva hoy a las ${hour} para jugar a ${reserve.reserve_of_game.name} en la tienda ${shopName}.`,
            `http://rollandreserve.blog:8000/files/${reserve.reserve_table?.tables_of_shop.logo}`,
          );

          await this.reserveRepository.save(reserve);
        }
      }
    } catch (err) {
      console.error('Error in handleCron:', err);
    }
  }
}
