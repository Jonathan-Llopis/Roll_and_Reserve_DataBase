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
@Injectable()
export class UsersReservesService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(UserReserveEntity)
    private readonly userReserveRepository: Repository<UserReserveEntity>,
    @InjectRepository(ReservesEntity)
    private readonly reservesRepository: Repository<ReservesEntity>,
  ) {}

  async addUsertoReserve(
    userId: string,
    reserveId: string,
    reservaConfirmada: boolean,
  ): Promise<UserReserveEntity> {
    const user: UserEntity = await this.usersRepository.findOne({
      where: { id_google: userId },
      relations: ['userReserves'],
    });
    if (!user) {
      throw new BusinessLogicException(
        'The user with the given id was not found',
        BusinessError.NOT_FOUND,
      );
    }

    const reserve: ReservesEntity = await this.reservesRepository.findOne({
      where: { id_reserve: parseInt(reserveId) },
      relations: ['userReserves'],
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
        'userReserves.user',
      ],
    });
    if (!user)
      throw new BusinessLogicException(
        'The user with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const currentDate = new Date();
    return user.userReserves.filter(
      (userReserve) => userReserve.reserve.hour_end > currentDate,
    );
  }

  async updateReservesFromUser(
    userId: string,
    reserves: ReservesEntity[],
  ): Promise<UserEntity> {
    const user: UserEntity = await this.usersRepository.findOne({
      where: { id_google: userId },
      relations: ['userReserves'],
    });

    if (!user)
      throw new BusinessLogicException(
        'The user with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    await this.userReserveRepository.delete({ user: { id_google: userId } });

    for (const reserveData of reserves) {
      const reserve: ReservesEntity = await this.reservesRepository.findOne({
        where: { id_reserve: reserveData.id_reserve },
        relations: ['userReserves'],
      });
      if (!reserve)
        throw new BusinessLogicException(
          'The reserve with the given id was not found',
          BusinessError.NOT_FOUND,
        );

      const userReserve = new UserReserveEntity();
      userReserve.user = user;
      userReserve.reserve = reserve;
      userReserve.reserva_confirmada = false;

      await this.userReserveRepository.save(userReserve);
    }

    return this.usersRepository.save(user);
  }

  async deleteReserveFromUser(userId: string, reserveId: string) {
    const userReserve: UserReserveEntity =
      await this.userReserveRepository.findOne({
        where: {
          user: { id_google: userId },
          reserve: { id_reserve: parseInt(reserveId) },
        },
      });

    if (!userReserve) {
      throw new BusinessLogicException(
        'The reserve with the given id is not associated to the user',
        BusinessError.PRECONDITION_FAILED,
      );
    }

    await this.userReserveRepository.remove(userReserve);
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
