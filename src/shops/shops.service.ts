import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShopsEntity } from './shops.entity';
import { CreateShopDto, UpdateShopDto } from './shops.dto';
import { UserEntity } from '../users/users.entity';

@Injectable()
export class ShopsService {
  constructor(
    @InjectRepository(ShopsEntity)
    private readonly shopRepository: Repository<ShopsEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  private handleError(err: any) {
    if (err instanceof HttpException) {
      throw err;
    }
    console.error(err);
    throw new HttpException(
      'An unexpected error occurred',
      HttpStatus.BAD_REQUEST,
    );
  }

  async getAllShops(): Promise<ShopsEntity[]> {
    try {
      const shops = await this.shopRepository.find({
        relations: ['games', 'tables_in_shop', 'reviews_shop', 'owner'],
      });
      if (shops.length === 0) {
        throw new HttpException('No Content', HttpStatus.NO_CONTENT);
      }
      return shops;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getShop(id: number): Promise<ShopsEntity> {
    try {
      const shop = await this.shopRepository.findOne({
        where: { id_shop: id },
        relations: ['games', 'tables_in_shop', 'reviews_shop', 'owner'],
      });
      if (!shop) {
        throw new HttpException('Shop not found', HttpStatus.NOT_FOUND);
      }
      return shop;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllShopsByOwner(idOwner: string): Promise<ShopsEntity[]> {
    try {
      const shops = await this.shopRepository.find({
        relations: ['games', 'tables_in_shop', 'reviews_shop', 'owner'],
        where: { owner: { id_google: idOwner } },
      });
      if (shops.length === 0) {
        throw new HttpException('No Content', HttpStatus.NO_CONTENT);
      }
      return shops;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createShop(createShopDto: CreateShopDto): Promise<ShopsEntity> {
    try {
      const shop = this.shopRepository.create(createShopDto);
      const owner = await this.userRepository.findOne({
        where: { id_google: createShopDto.owner_id },
      });
      if (!owner) {
        throw new HttpException('Owner not found', HttpStatus.NOT_FOUND);
      }
      shop.owner = owner;
      await this.shopRepository.save(shop);
      return shop;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateShop(
    updateShopDto: UpdateShopDto,
    id: number,
  ): Promise<ShopsEntity> {
    try {
      const shop = await this.shopRepository.findOne({
        where: { id_shop: id },
        relations: ['owner'],
      });
      if (!shop) {
        throw new HttpException('Shop not found', HttpStatus.NOT_FOUND);
      }
      if (updateShopDto.owner_id) {
        const owner = await this.userRepository.findOne({
          where: { id_google: updateShopDto.owner_id },
        });
        if (!owner) {
          throw new HttpException('Owner not found', HttpStatus.NOT_FOUND);
        }
        shop.owner = owner;
      }
      this.shopRepository.merge(shop, updateShopDto);
      await this.shopRepository.save(shop);
      return shop;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteShop(id: number): Promise<void> {
    try {
      const result = await this.shopRepository.delete(id);
      if (result.affected === 0) {
        throw new HttpException('Shop not found', HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async vincularArchivo(id_shop: string, id_archivo: string) {
    try {
      const shop = await this.shopRepository.findOne({
        where: { id_shop: parseInt(id_shop) },
      });

      if (!shop) {
        throw new HttpException('Shop not found', HttpStatus.NOT_FOUND);
      }
      shop.logo = id_archivo.toString();
      return this.shopRepository.save(shop);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async getMostPlayedGames(idShop: string, startTime: string, endTime: string): Promise<any> {
    try {
      const shop = await this.shopRepository.findOne({ where: { id_shop: parseInt(idShop) } });
      if (!shop) {
        throw new HttpException('Shop not found', HttpStatus.NOT_FOUND);
      }
      // Actual query to get most played games
      const mostPlayedGames = await this.shopRepository.query(
        `SELECT g.id_game, g.name, COUNT(r.id_reserve) as play_count 
         FROM reserves_entity r
         JOIN games_entity g ON r.game_reserve = g.id_game
         JOIN tables_entity t ON r.reserves_of_table = t.id_table
         WHERE t.tables_of_shop = ? AND r.hour_start BETWEEN ? AND ?
         GROUP BY g.id_game, g.name
         ORDER BY play_count DESC`,
        [idShop, startTime, endTime]
      );
      return mostPlayedGames;
    } catch (err) {
      this.handleError(err);
    }
  }

  async getTotalReservations(idShop: string, startTime: string, endTime: string): Promise<any> {
    try {
      const shop = await this.shopRepository.findOne({ where: { id_shop: parseInt(idShop) } });
      if (!shop) {
        throw new HttpException('Shop not found', HttpStatus.NOT_FOUND);
      }
      // Actual query to get total reservations
      const totalReservations = await this.shopRepository.query(
        `SELECT COUNT(*) as total_reservations 
         FROM reserves_entity 
         WHERE reserves_of_table IN (
           SELECT id_table 
           FROM tables_entity 
           WHERE tables_of_shop = ?
         ) AND hour_start BETWEEN ? AND ?`,
        [idShop, startTime, endTime]
      );
      return totalReservations;
    } catch (err) {
      this.handleError(err);
    }
  }

  async getPlayerCount(idShop: string, startTime: string, endTime: string): Promise<any> {
    try {
      const shop = await this.shopRepository.findOne({ where: { id_shop: parseInt(idShop) } });
      if (!shop) {
        throw new HttpException('Shop not found', HttpStatus.NOT_FOUND);
      }
      // Actual query to get player count
      const playerCount = await this.shopRepository.query(
        `SELECT COUNT(DISTINCT ur.userIdUser) as player_count 
         FROM user_reserve_entity ur
         JOIN reserves_entity r ON ur.reserveIdReserve = r.id_reserve
         JOIN tables_entity t ON r.reserves_of_table = t.id_table
         WHERE t.tables_of_shop = ? AND r.hour_start BETWEEN ? AND ?`,
        [idShop, startTime, endTime]
      );
      return playerCount;
    } catch (err) {
      this.handleError(err);
    }
  }
  async getPeakReservationHours(idShop: string, startTime: string, endTime: string): Promise<any> {
    try {
      const shop = await this.shopRepository.findOne({ where: { id_shop: parseInt(idShop) } });
      if (!shop) {
        throw new HttpException('Shop not found', HttpStatus.NOT_FOUND);
      }
      // Actual query to get peak reservation hours
      const peakReservationHours = await this.shopRepository.query(
        `SELECT HOUR(r.hour_start) as hour, COUNT(*) as reservation_count 
         FROM reserves_entity r
         JOIN tables_entity t ON r.reserves_of_table = t.id_table
         WHERE t.tables_of_shop = ? AND r.hour_start BETWEEN ? AND ?
         GROUP BY hour 
         ORDER BY reservation_count DESC`,
        [idShop, startTime, endTime]
      );
      return peakReservationHours;
    } catch (err) {
      this.handleError(err);
    }
  }
}
