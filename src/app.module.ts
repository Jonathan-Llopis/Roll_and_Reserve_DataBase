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
import { GamesEntity } from './games/games.entitiy';
import { DifficultyEntity } from './difficulty/difficulty.entity';
import { GameCategoryEntity } from './game_category/game_category.entity';
import { FilesModule } from './files/files.module';
import { UserReserveEntity } from './users_reserves/users_reserves.entity';
import { FcmNotificationModule } from './fcm-notification/fcm-notification.module';
import { HttpModule } from './http/http.module';
import { Cron, CronExpression, ScheduleModule } from '@nestjs/schedule';
import { FcmNotificationService } from './fcm-notification/fcm-notification.service';
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
  providers: [AuthorizationMiddleware, AuthService, ReservesService, FcmNotificationModule],
})
export class AppModule implements NestModule {
  constructor(private readonly fcmNotificationService: FcmNotificationService,
    @InjectRepository(ReservesEntity)
    private readonly reserveRepository: Repository<ReservesEntity>,
  ) { }

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
  @Cron(CronExpression.EVERY_30_SECONDS, {
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
        console.log(`Cron sending notifications for reserve ID: ${reserve.id_reserve}`);
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
          const hour = new Date(reserve.hour_start).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
          });
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

