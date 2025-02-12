import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { ReservesEntity } from './reserves.entity';
import { CreateReserveDto, UpdateReserveDto } from './reserves.dto';
import { FcmNotificationService } from '../fcm-notification/fcm-notification.service';
import { ShopsEntity } from 'src/shops/shops.entity';
import { GamesEntity } from 'src/games/games.entitiy';

@Injectable()
export class ReservesService {
  constructor(
    @InjectRepository(ReservesEntity)
    private readonly reserveRepository: Repository<ReservesEntity>,
    @InjectRepository(ShopsEntity)
    private readonly shopRepository: Repository<ShopsEntity>,
    @InjectRepository(GamesEntity)
    private readonly gameRepository: Repository<GamesEntity>,
    private readonly fcmNotificationService: FcmNotificationService,
  ) {}

  private handleError(err: any) {
    if (err instanceof HttpException) {
      throw err;
    }
    throw new HttpException('Request failed', HttpStatus.BAD_REQUEST);
  }

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
      if (reserves.length === 0) {
        throw new HttpException('No Content', HttpStatus.NO_CONTENT);
      }
      return reserves;
    } catch (err) {
      this.handleError(err);
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
        throw new HttpException('Reserve not found', HttpStatus.NOT_FOUND);
      }
      return reserve;
    } catch (err) {
      this.handleError(err);
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
      if (reserves.length === 0) {
        throw new HttpException('No Content', HttpStatus.NO_CONTENT);
      }
      return reserves;
    } catch (err) {
      this.handleError(err);
    }
  }

  async createReserve(
    createReserveDto: CreateReserveDto,
    idShop: number,
  ): Promise<ReservesEntity> {
    try {
      const reserve = this.reserveRepository.create(createReserveDto);
      await this.reserveRepository.save(reserve);
      if (createReserveDto.shop_event == true) {
        const shop = await this.shopRepository.findOne({
          where: { id_shop: idShop },
        });
        const game = await this.gameRepository.findOne({
          where: { id_game: createReserveDto.reserve_of_game_id },
        });
        if (!shop) {
          throw new HttpException('Shop not found', HttpStatus.NOT_FOUND);
        }

        if (!game) {
          throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
        }

        if (shop.logo) {
          this.fcmNotificationService.sendTopicNotification(
            idShop.toString(),
            `Nuevo evento en ${shop.name}`,
            `Juego: ${game.name}. Fecha:${new Date(reserve.hour_start).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`,
            `${process.env.BASE_URL}/files/${shop.logo}`,
          );
        } else {
          this.fcmNotificationService.sendTopicNotification(
            idShop.toString(),
            `Nuevo evento en ${shop.name}`,
            `Juego: ${game.name}. Fecha:${new Date(reserve.hour_start).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`,
          );
        }
      }

      return reserve;
    } catch (err) {
      this.handleError(err);
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
        throw new HttpException('Reserve not found', HttpStatus.NOT_FOUND);
      }
      Object.assign(reserve, updateReserveDto);
      await this.reserveRepository.save(reserve);
      return reserve;
    } catch (err) {
      this.handleError(err);
    }
  }

  async deleteReserve(id: number): Promise<void> {
    try {
      const result = await this.reserveRepository.delete(id);
      if (result.affected === 0) {
        throw new HttpException('Reserve not found', HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      this.handleError(err);
    }
  }

  async findAllUniqueShopEvents(shopId: number): Promise<ReservesEntity[]> {
    try {
      const currentDate = new Date();
      const shop = await this.shopRepository.findOne({ where: { id_shop: shopId } });
      if (!shop) {
        throw new HttpException('Shop not found', HttpStatus.NOT_FOUND);
      }

      const reserves = await this.reserveRepository
        .createQueryBuilder('reserve')
        .innerJoinAndSelect('reserve.reserve_table', 'table')
        .innerJoinAndSelect('table.tables_of_shop', 'shop')
        .innerJoinAndSelect('reserve.reserve_of_game', 'game')
        .where('reserve.shop_event = :shopEvent', { shopEvent: true })
        .andWhere('shop.id_shop = :shopId', { shopId: shopId })
        .andWhere('reserve.hour_start > :currentDate', { currentDate })
        .groupBy('reserve.event_id, game.id_game')
        .addSelect('game.id_game')
        .orderBy('reserve.hour_start', 'ASC')
        .getMany();
      if (reserves.length === 0) {
        throw new HttpException('No Content', HttpStatus.NO_CONTENT);
      }
      return reserves;
    } catch (err) {
      this.handleError(err);
    }
  }
}
