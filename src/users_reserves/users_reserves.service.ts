import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { ReservesEntity } from '../reserves/reserves.entity';
import { UserEntity } from '../users/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersReservesService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,

    @InjectRepository(ReservesEntity)
    private readonly reservesRepository: Repository<ReservesEntity>,
  ) {}

  async addReserveToUser(
    userId: string,
    reserveId: string,
  ): Promise<UserEntity> {
    const user: UserEntity = await this.usersRepository.findOne({
      where: { id_google: userId },
      relations: ['users_reserve'],
    });
    if (!user)
      throw new BusinessLogicException(
        'The user with the given id was not found',
        BusinessError.NOT_FOUND,
      );
    const reserve: ReservesEntity = await this.reservesRepository.findOne({
      where: { id_reserve: parseInt(reserveId) },
      relations: ['users_in_reserve'],
    });
    if (!reserve)
      throw new BusinessLogicException(
        'The reserve with the given id was not found',
        BusinessError.NOT_FOUND,
      );
    user.users_reserve.push(reserve);
    return this.usersRepository.save(user);
  }

  async findReserveFromUser(
    userId: string,
    reserveId: string,
  ): Promise<ReservesEntity> {
    const reserve: ReservesEntity = await this.reservesRepository.findOne({
      where: { id_reserve: parseInt(reserveId) },
      relations: ['users_in_reserve'],
    });
    if (!reserve)
      throw new BusinessLogicException(
        'The reserve with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const user: UserEntity = await this.usersRepository.findOne({
      where: { id_google: userId },
      relations: ['users_reserve'],
    });
    if (!user)
      throw new BusinessLogicException(
        'The user with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const userReserve: ReservesEntity = user.users_reserve.find(
      (reserve) => reserve.id_reserve === parseInt(reserveId),
    );

    if (!userReserve)
      throw new BusinessLogicException(
        'The reserve with the given id is not associated to the user',
        BusinessError.PRECONDITION_FAILED,
      );

    return userReserve;
  }

  async findReservesFromUser(userId: string): Promise<ReservesEntity[]> {
    const user: UserEntity = await this.usersRepository.findOne({
      where: { id_google: userId },
      relations: ['users_reserve'],
    });
    if (!user)
      throw new BusinessLogicException(
        'The user with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    return user.users_reserve;
  }

  async updateReservesFromUser(
    userId: string,
    reserves: ReservesEntity[],
  ): Promise<UserEntity> {
    const user: UserEntity = await this.usersRepository.findOne({
      where: { id_google: userId },
      relations: ['users_reserve'],
    });

    if (!user)
      throw new BusinessLogicException(
        'The user with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    for (let i = 0; i < reserves.length; i++) {
      const reserve: ReservesEntity = await this.reservesRepository.findOne({
        where: { id_reserve: reserves[i].id_reserve },
        relations: ['users_in_reserve'],
      });
      if (!reserve)
        throw new BusinessLogicException(
          'The reserve with the given id was not found',
          BusinessError.NOT_FOUND,
        );
    }
    user.users_reserve = reserves;
    return await this.usersRepository.save(user);
  }

  async deleteReserveFromUser(userId: string, reserveId: string) {
    const reserve: ReservesEntity = await this.reservesRepository.findOne({
      where: { id_reserve: parseInt(reserveId) },
      relations: ['users_in_reserve'],
    });
    if (!reserve)
      throw new BusinessLogicException(
        'The reserve with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const user: UserEntity = await this.usersRepository.findOne({
      where: { id_google: userId },
      relations: ['users_reserve'],
    });
    if (!user)
      throw new BusinessLogicException(
        'The user with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const reserveUsers: UserEntity = reserve.users_in_reserve.find(
      (user) => user.id_google === userId,
    );

    if (!reserveUsers) {
      throw new BusinessLogicException(
        'The reserve with the given id is not associated to the user',
        BusinessError.PRECONDITION_FAILED,
      );
    } else {
      reserve.users_in_reserve = reserve.users_in_reserve.filter(
        (user) => user.id_google !== userId,
      );
      await this.reservesRepository.save(reserve);

      user.users_reserve = user.users_reserve.filter(
        (reserve) => reserve.id_reserve !== parseInt(reserveId),
      );
      await this.usersRepository.save(user); 
    }
  }
}
