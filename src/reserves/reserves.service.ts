import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservesEntity } from './reserves.entity';
import { CreateReserveDto, UpdateReserveDto } from './reserves.dto';

@Injectable()
export class ReservesService {
  constructor(
    @InjectRepository(ReservesEntity)
    private readonly reserveRepository: Repository<ReservesEntity>,
  ) {}

  async getAllReserves(): Promise<ReservesEntity[]> {
    try {
      const reserves = await this.reserveRepository.find({
        relations: [
          'reserve_of_game',
          'reserve_game_category',
          'difficulty',
          'reserve_table',
          'users_in_reserve',
        ],
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

  async createReserve(
    createReserveDto: CreateReserveDto,
  ): Promise<ReservesEntity> {
    try {
      const reserve = this.reserveRepository.create(createReserveDto);
      await this.reserveRepository.save(reserve);
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
}
