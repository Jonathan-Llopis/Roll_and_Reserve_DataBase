import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { ReservesEntity } from './reserves.entity';
import { FcmNotificationService } from '../fcm-notification/fcm-notification.service';

@Injectable()
export class ReservesSchedulerService {
  private readonly logger = new Logger(ReservesSchedulerService.name);

  constructor(
    @InjectRepository(ReservesEntity)
    private readonly reserveRepository: Repository<ReservesEntity>,
    private readonly fcmNotificationService: FcmNotificationService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Executes periodically to find upcoming reserves and dispatch push notifications.
   */
  @Cron('0 */15 8-23 * * *', {
    timeZone: 'Europe/Madrid',
  })
  async handleUpcomingReserves(): Promise<void> {
    try {
      const currentDate = new Date();
      this.logger.log(`Cron checking upcoming reserves at: ${currentDate.toISOString()}`);

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
          confirmation_notification: false,
        },
      });

      this.logger.log(`Found ${upcomingReserves.length} upcoming reserves to notify`);

      const baseUrl =
        this.configService.get<string>('BASE_URL') || 'http://localhost:8000';

      for (const reserve of upcomingReserves) {
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

        if (registrationTokens.length > 0) {
          const shopName =
            reserve.reserve_table?.tables_of_shop?.name || 'Local de juegos';
          const gameName = reserve.reserve_of_game?.name || 'juego de mesa';
          const hour = new Date(reserve.hour_start).toLocaleTimeString(
            'es-ES',
            {
              hour: '2-digit',
              minute: '2-digit',
            },
          );

          const shopLogo = reserve.reserve_table?.tables_of_shop?.logo;
          const imageUrl = shopLogo ? `${baseUrl}/files/${shopLogo}` : undefined;

          await this.fcmNotificationService.sendMulticastNotification(
            registrationTokens,
            `Reserva próxima en ${shopName}`,
            `Tienes una reserva hoy a las ${hour} para jugar a ${gameName} en la tienda ${shopName}.`,
            imageUrl,
          );
        }

        await this.reserveRepository.save(reserve);
      }
    } catch (err) {
      this.logger.error('Error during handleUpcomingReserves cron execution', err);
    }
  }
}
