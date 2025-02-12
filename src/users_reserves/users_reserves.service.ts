import { Injectable, NotFoundException, PreconditionFailedException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservesEntity } from '../reserves/reserves.entity';
import { UserEntity } from '../users/users.entity';
import { UserReserveEntity } from './users_reserves.entity';
import { FcmNotificationService } from '../fcm-notification/fcm-notification.service';

@Injectable()
export class UsersReservesService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(UserReserveEntity)
    private readonly userReserveRepository: Repository<UserReserveEntity>,
    @InjectRepository(ReservesEntity)
    private readonly reservesRepository: Repository<ReservesEntity>,
    private readonly fcmNotificationService: FcmNotificationService,
  ) {}

  async addUsertoReserve(
    userId: string,
    reserveId: string,
    reservaConfirmada: boolean,
  ): Promise<UserReserveEntity> {
    const user = await this.usersRepository.findOne({
      where: { id_google: userId },
      relations: ['userReserves', 'userReserves.user'],
    });
    if (!user) {
      throw new NotFoundException('The user with the given id was not found');
    }

    const reserve = await this.reservesRepository.findOne({
      where: { id_reserve: parseInt(reserveId) },
      relations: ['userReserves', 'userReserves.user', 'reserve_table', 'reserve_table.tables_of_shop'],
    });
    if (!reserve) {
      throw new NotFoundException('The reserve with the given id was not found');
    }

    const userReserve = new UserReserveEntity();
    userReserve.user = user;
    userReserve.reserve = reserve;
    userReserve.reserva_confirmada = reservaConfirmada;

    await this.userReserveRepository.save(userReserve);

    const registrationTokens = Array.from(
      new Set(
        (reserve.userReserves || [])
          .filter(
            (userReserve) =>
              userReserve.user && userReserve.user.token_notification,
          )
          .map((userReserve) => userReserve.user.token_notification),
      ),
    );

    if (registrationTokens.length > 0) {
      const shopName = reserve.reserve_table.tables_of_shop.name;
      this.fcmNotificationService.sendMulticastNotification(
        registrationTokens,
        'Nuevo usuario en la reserva',
        `El usuario ${user.name} se ha unido a la reserva el día ${reserve.hour_start.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })} en la tienda ${shopName}.`,
      );
    }

    return userReserve;
  }

  async findReserveById(reserveId: string): Promise<ReservesEntity> {
    const reserve = await this.reservesRepository.findOne({
      where: { id_reserve: parseInt(reserveId) },
      relations: ['userReserves', 'userReserves.user'],
    });
    if (!reserve) {
      throw new NotFoundException('The reserve with the given id was not found');
    }
    return reserve;
  }

  async findReserveFromUser(
    userId: string,
    reserveId: string,
  ): Promise<UserReserveEntity> {
    const userReserve = await this.userReserveRepository.findOne({
      where: {
        user: { id_google: userId },
        reserve: { id_reserve: parseInt(reserveId) },
      },
      relations: ['user', 'reserve'],
    });
    if (!userReserve) {
      throw new PreconditionFailedException('The reserve with the given id is not associated to the user');
    }

    return userReserve;
  }

  async findReservesFromUser(userId: string): Promise<UserReserveEntity[]> {
    const user = await this.usersRepository.findOne({
      where: { id_google: userId },
      relations: [
        'userReserves',
        'userReserves.reserve',
        'userReserves.reserve.reserve_table',
        'userReserves.reserve.reserve_table.tables_of_shop',
        'userReserves.reserve.reserve_of_game',
        'userReserves.reserve.userReserves',
      ],
    });
    if (!user) {
      throw new NotFoundException('The user with the given id was not found');
    }

    const currentDate = new Date();
    const madridDate = new Date(
      currentDate.setHours(currentDate.getHours() + 1),
    );

    const userReserves = user.userReserves
      .filter((userReserve) => userReserve.reserve.hour_end > madridDate)
      .sort(
        (a, b) =>
          a.reserve.hour_start.getTime() - b.reserve.hour_start.getTime(),
      );

    if (userReserves.length === 0) {
      throw new HttpException('No Content', HttpStatus.NO_CONTENT);
    }

    return userReserves;
  }

  async deleteReserveFromUser(userId: string, reserveId: string) {
    const userReserve = await this.userReserveRepository.findOne({
      where: {
        user: { id_google: userId },
        reserve: { id_reserve: parseInt(reserveId) },
      },
      relations: ['user', 'reserve'],
    });

    if (!userReserve) {
      throw new PreconditionFailedException('The reserve with the given id is not associated to the user');
    }

    const reserve = await this.reservesRepository.findOne({
      where: { id_reserve: parseInt(reserveId) },
      relations: ['userReserves', 'userReserves.user', 'reserve_table', 'reserve_table.tables_of_shop'],
    });
    if (!reserve) {
      throw new NotFoundException('The reserve with the given id was not found');
    }

    await this.userReserveRepository.remove(userReserve);

    const user = userReserve.user.name;

    const registrationTokens = Array.from(
      new Set(
        (reserve.userReserves || [])
          .filter(
            (userReserve) =>
              userReserve.user &&
              userReserve.user.token_notification &&
              userReserve.user.id_google !== userId,
          )
          .map((userReserve) => userReserve.user.token_notification),
      ),
    );

    if (registrationTokens.length > 0) {
      const shopName = reserve.reserve_table.tables_of_shop.name;
      this.fcmNotificationService.sendMulticastNotification(
        registrationTokens,
        '❗ Un usuario ha dejado la reserva',
        `El usuario ${user} ha dejado la reserva el día ${reserve.hour_start.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })} en la tienda ${shopName}.`,
      );
    }
  }

  async confirmReserveForUser(
    userId: string,
    reserveId: string,
  ): Promise<UserReserveEntity> {
    const userReserve = await this.userReserveRepository.findOne({
      where: {
        user: { id_google: userId },
        reserve: { id_reserve: parseInt(reserveId) },
      },
      relations: ['user', 'reserve'],
    });

    if (!userReserve) {
      throw new PreconditionFailedException('The reserve with the given id is not associated to the user');
    }

    userReserve.reserva_confirmada = true;
    return this.userReserveRepository.save(userReserve);
  }
}

