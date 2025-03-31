import {
  Injectable,
  NotFoundException,
  PreconditionFailedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservesEntity } from '../reserves/reserves.entity';
import { UserEntity } from '../users/users.entity';
import { UserReserveEntity } from './users_reserves.entity';
import { FcmNotificationService } from '../fcm-notification/fcm-notification.service';

@Injectable()
export class UsersReservesService {
  /**
   * Constructor of the UsersReservesService.
   * @param usersRepository The repository for the UserEntity.
   * @param userReserveRepository The repository for the UserReserveEntity.
   * @param reservesRepository The repository for the ReservesEntity.
   * @param fcmNotificationService The service for sending notifications.
   */
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(UserReserveEntity)
    private readonly userReserveRepository: Repository<UserReserveEntity>,
    @InjectRepository(ReservesEntity)
    private readonly reservesRepository: Repository<ReservesEntity>,
    private readonly fcmNotificationService: FcmNotificationService,
  ) {}

  /**
   * Method: POST /users/:userId/reserves/:reserveId
   * Description: Adds a user to a reserve.
   * Input Parameters:
   * - `userId` (string, required): The id of the user to add.
   * - `reserveId` (string, required): The id of the reserve to add to.
   * - `reservaConfirmada` (boolean, required): Whether the user confirmed or not.
   * Example Request (JSON format):
   * {
   *   "userId": "123456789",
   *   "reserveId": "1",
   *   "reservaConfirmada": true
   * }
   * HTTP Responses:
   * - `201 Created`: The user was added to the reserve.
   * - `404 Not Found`: The user or reserve was not found.
   * - `400 Bad Request`: The user is already in the reserve.
   */
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
      relations: [
        'userReserves',
        'userReserves.user',
        'reserve_table',
        'reserve_table.tables_of_shop',
      ],
    });
    if (!reserve) {
      throw new NotFoundException(
        'The reserve with the given id was not found',
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

  /**
   * Find a reserve by its ID.
   * Method: GET /reserves/:id
   * Description: Find a reserve with the given ID.
   * Input Parameters:
   * - `id` (string, required): Reserve ID.
   * HTTP Responses:
   * - `200 OK`: Successfully retrieved the reserve.
   * - `404 Not Found`: Reserve not found.
   */
  async findReserveById(reserveId: string): Promise<ReservesEntity> {
    const reserve = await this.reservesRepository.findOne({
      where: { id_reserve: parseInt(reserveId) },
      relations: ['userReserves', 'userReserves.user'],
    });
    if (!reserve) {
      throw new NotFoundException(
        'The reserve with the given id was not found',
      );
    }
    return reserve;
  }

  /**
   * Find a reserve by its ID and its association with the user.
   * Method: GET /users/:userId/reserves/:id
   * Description: Find a reserve with the given ID and the given user ID.
   * Input Parameters:
   * - `userId` (string, required): User ID.
   * - `id` (string, required): Reserve ID.
   * HTTP Responses:
   * - `200 OK`: Successfully retrieved the reserve.
   * - `404 Not Found`: Reserve not found.
   * - `412 Precondition Failed`: The reserve with the given id is not associated to the user.
   */
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
      throw new PreconditionFailedException(
        'The reserve with the given id is not associated to the user',
      );
    }

    return userReserve;
  }

  /**
   * Find all reserves associated with the specified user ID.
   * Method: GET /users/:userId/reserves
   * Description: Find all reserves associated with the user with the given ID.
   * Input Parameters:
   * - `userId` (string, required): The ID of the user.
   * HTTP Responses:
   * - `200 OK`: Reserves found.
   * - `204 No Content`: No reserves found.
   * - `400 Bad Request`: Invalid user ID.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: The user with the given id was not found.
   */
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

  /**
   * Delete a reserve from the user with the given ID and reserve ID.
   * Method: DELETE /users/:userId/reserves/:reserveId
   * Description: Delete a reserve with the given reserve ID and the given user ID.
   * Input Parameters:
   * - `userId` (string, required): The ID of the user.
   * - `reserveId` (string, required): The ID of the reserve.
   * HTTP Responses:
   * - `204 No Content`: Successfully deleted the reserve.
   * - `404 Not Found`: The user with the given id was not found.
   * - `412 Precondition Failed`: The reserve with the given id is not associated to the user.
   */
  async deleteReserveFromUser(userId: string, reserveId: string) {
    const userReserve = await this.userReserveRepository.findOne({
      where: {
        user: { id_google: userId },
        reserve: { id_reserve: parseInt(reserveId) },
      },
      relations: ['user', 'reserve'],
    });

    if (!userReserve) {
      throw new PreconditionFailedException(
        'The reserve with the given id is not associated to the user',
      );
    }

    const reserve = await this.reservesRepository.findOne({
      where: { id_reserve: parseInt(reserveId) },
      relations: [
        'userReserves',
        'userReserves.user',
        'reserve_table',
        'reserve_table.tables_of_shop',
      ],
    });
    if (!reserve) {
      throw new NotFoundException(
        'The reserve with the given id was not found',
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

/**
 * Confirm a reservation for a user.
 * Method: PATCH /users/:userId/reserves/:reserveId/confirm
 * Description: Confirms the reservation for the user with the given ID and reserve ID.
 * Input Parameters:
 * - `userId` (string, required): The ID of the user.
 * - `reserveId` (string, required): The ID of the reserve.
 * HTTP Responses:
 * - `200 OK`: The reservation was successfully confirmed.
 * - `412 Precondition Failed`: The reserve with the given id is not associated with the user.
 */

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
      throw new PreconditionFailedException(
        'The reserve with the given id is not associated to the user',
      );
    }

    userReserve.reserva_confirmada = true;
    return this.userReserveRepository.save(userReserve);
  }
}
