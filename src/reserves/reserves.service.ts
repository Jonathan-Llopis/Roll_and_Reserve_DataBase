import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { ReservesEntity } from './reserves.entity';
import { CreateReserveDto, UpdateReserveDto } from './reserves.dto';
import * as admin from 'firebase-admin';
import { FcmNotificationService } from 'src/fcm-notification/fcm-notification.service';

@Injectable()
export class ReservesService {
  constructor(
    @InjectRepository(ReservesEntity)
    private readonly reserveRepository: Repository<ReservesEntity>,
    private readonly fcmNotificationService: FcmNotificationService,
  ) { }

  async getAllReserves(): Promise<ReservesEntity[]> {
    try {
      const reserves = await this.reserveRepository.find({
        relations: [
          'reserve_of_game',
          'reserve_game_category',
          'difficulty',
          'reserve_table',
          'users_in_reserve',
          'userReserves',
          'userReserves.user',
        ],
        order: {
          hour_start: 'ASC',
        },
      });
      return reserves;
    } catch (err) {
      throw new Error(err);
    }
  }

  async getReserve(id: number): Promise<ReservesEntity> {
    try {
      const reserve = await this.reserveRepository.findOne({
        where: { id_reserve: id },
        relations: [
          'reserve_of_game',
          'reserve_game_category',
          'difficulty',
          'reserve_table',
          'users_in_reserve',
          'userReserves',
          'userReserves.user',
        ],
      });
      if (!reserve) {
        throw new Error('Reserve not found');
      }
      return reserve;
    } catch (err) {
      throw new Error(err);
    }
  }

  async getAllReservesByDate(
    date: string,
    idTable: number,
  ): Promise<ReservesEntity[]> {
    try {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      const reserves = await this.reserveRepository.find({
        relations: [
          'reserve_of_game',
          'reserve_game_category',
          'difficulty',
          'reserve_table',
          'users_in_reserve',
          'userReserves',
          'userReserves.user',
        ],
        where: {
          hour_start: Between(startDate, endDate),
          reserve_table: { id_table: idTable },
        },
        order: {
          hour_start: 'ASC',
        },
      });
      return reserves;
    } catch (err) {
      throw new Error(err);
    }
  }

  async createReserve(
    createReserveDto: CreateReserveDto,
    idShop: string,
  ): Promise<ReservesEntity> {
    try {
      const reserve = this.reserveRepository.create(createReserveDto);
      await this.reserveRepository.save(reserve);

      if (createReserveDto.shop_event == true) {
        this.fcmNotificationService.sendTopicMessage(idShop, createReserveDto);
      }

      return reserve;
    } catch (err) {
      throw new Error(err);
    }
  }
  async updateReserve(
    updateReserveDto: UpdateReserveDto,
    id: number,
  ): Promise<ReservesEntity> {
    try {
      const reserve = await this.reserveRepository.findOne({
        where: { id_reserve: id },
      });
      if (!reserve) {
        throw new Error('Reserve not found');
      }
      Object.assign(reserve, updateReserveDto);
      await this.reserveRepository.save(reserve);
      return reserve;
    } catch (err) {
      throw new Error(err);
    }
  }

  async deleteReserve(id: number): Promise<void> {
    try {
      await this.reserveRepository.delete(id);
    } catch (err) {
      throw new Error(err);
    }
  }
  async findAllUniqueShopEvents(shopId: string): Promise<ReservesEntity[]> {
    const currentDate = new Date();
    return this.reserveRepository
      .createQueryBuilder('reserve')
      .innerJoinAndSelect('reserve.reserve_table', 'table')
      .innerJoinAndSelect('table.tables_of_shop', 'shop')
      .innerJoinAndSelect('reserve.reserve_of_game', 'game')
      .where('reserve.shop_event = :shopEvent', { shopEvent: true })
      .andWhere('shop.id_shop = :shopId', { shopId: parseInt(shopId) })
      .andWhere('reserve.hour_start > :currentDate', { currentDate })
      .groupBy('reserve.event_id, game.id_game')
      .addSelect('game.id_game')
      .orderBy('reserve.hour_start', 'ASC')
      .getMany();
  }
}
