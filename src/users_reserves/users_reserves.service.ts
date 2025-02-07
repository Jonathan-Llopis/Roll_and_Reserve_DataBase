import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { ReservesEntity } from '../reserves/reserves.entity';
import { UserEntity } from '../users/users.entity';
import { Repository } from 'typeorm';
import { UserReserveEntity } from './user_reserves.entity';
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
    const user: UserEntity = await this.usersRepository.findOne({
      where: { id_google: userId },
      relations: ['userReserves', 'userReserves.user'],
    });
    if (!user) {
      throw new BusinessLogicException(
        'The user with the given id was not found',
        BusinessError.NOT_FOUND,
      );
    }

    const reserve: ReservesEntity = await this.reservesRepository.findOne({
      where: { id_reserve: parseInt(reserveId) },
      relations: ['userReserves', 'userReserves.user'],
    });
    if (!reserve) {
      throw new BusinessLogicException(
        'The reserve with the given id was not found',
        BusinessError.NOT_FOUND,
      );
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
    const reserve: ReservesEntity = await this.reservesRepository.findOne({
      where: { id_reserve: parseInt(reserveId) },
      relations: ['userReserves', 'userReserves.user'],
    });
    if (!reserve)
      throw new BusinessLogicException(
        'The reserve with the given id was not found',
        BusinessError.NOT_FOUND,
      );
    return reserve;
  }

  async findReserveFromUser(
    userId: string,
    reserveId: string,
  ): Promise<UserReserveEntity> {
    const userReserve: UserReserveEntity =
      await this.userReserveRepository.findOne({
        where: {
          user: { id_google: userId },
          reserve: { id_reserve: parseInt(reserveId) },
        },
        relations: ['user', 'reserve'],
      });
    if (!userReserve)
      throw new BusinessLogicException(
        'The reserve with the given id is not associated to the user',
        BusinessError.PRECONDITION_FAILED,
      );

    return userReserve;
  }

  async findReservesFromUser(userId: string): Promise<UserReserveEntity[]> {
    const user: UserEntity = await this.usersRepository.findOne({
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
    if (!user)
      throw new BusinessLogicException(
        'The user with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const currentDate = new Date();
    const madridDate = new Date(
      currentDate.setHours(currentDate.getHours() + 1),
    );

    return user.userReserves
      .filter((userReserve) => userReserve.reserve.hour_end > madridDate)
      .sort(
        (a, b) =>
          a.reserve.hour_start.getTime() - b.reserve.hour_start.getTime(),
      );
  }

  async deleteReserveFromUser(userId: string, reserveId: string) {
    const userReserve: UserReserveEntity =
      await this.userReserveRepository.findOne({
        where: {
          user: { id_google: userId },
          reserve: { id_reserve: parseInt(reserveId) },
        },
        relations: ['user', 'reserve'],
      });

    if (!userReserve) {
      throw new BusinessLogicException(
        'The reserve with the given id is not associated to the user',
        BusinessError.PRECONDITION_FAILED,
      );
    }

    const reserve = await this.reservesRepository.findOne({
      where: { id_reserve: parseInt(reserveId) },
      relations: ['userReserves', 'userReserves.user'],
    });
    if (!reserve) {
      throw new BusinessLogicException(
        'The reserve with the given id was not found',
        BusinessError.NOT_FOUND,
      );
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
    const userReserve: UserReserveEntity =
      await this.userReserveRepository.findOne({
        where: {
          user: { id_google: userId },
          reserve: { id_reserve: parseInt(reserveId) },
        },
        relations: ['user', 'reserve'],
      });

    if (!userReserve) {
      throw new BusinessLogicException(
        'The reserve with the given id is not associated to the user',
        BusinessError.PRECONDITION_FAILED,
      );
    }

    userReserve.reserva_confirmada = true;
    return this.userReserveRepository.save(userReserve);
  }
}
