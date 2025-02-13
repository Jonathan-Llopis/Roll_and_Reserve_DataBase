import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { ReservesEntity } from './reserves.entity';
import { CreateReserveDto, UpdateReserveDto } from './reserves.dto';
import { FcmNotificationService } from '../fcm-notification/fcm-notification.service';
import { ShopsEntity } from 'src/shops/shops.entity';
import { GamesEntity } from 'src/games/games.entitiy';
import { DifficultyEntity } from 'src/difficulty/difficulty.entity';
import { GameCategoryEntity } from 'src/game_category/game_category.entity';
import { TablesEntity } from 'src/tables/tables.entity';

@Injectable()
export class ReservesService {
  constructor(
    @InjectRepository(ReservesEntity)
    private readonly reserveRepository: Repository<ReservesEntity>,
    @InjectRepository(ShopsEntity)
    private readonly shopRepository: Repository<ShopsEntity>,
    @InjectRepository(GamesEntity)
    private readonly gameRepository: Repository<GamesEntity>,
    @InjectRepository(DifficultyEntity)
    private readonly difficultyRepository: Repository<DifficultyEntity>,
    @InjectRepository(GameCategoryEntity)
    private readonly reserveGameCategoryRepository: Repository<GameCategoryEntity>,
    @InjectRepository(TablesEntity)
    private readonly tableRepository: Repository<TablesEntity>,
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
     
      const difficulty = await this.difficultyRepository.findOne({
        where: { id_difficulty: createReserveDto.difficulty_id },
      });
      if (createReserveDto.difficulty_id && !difficulty) {
        throw new HttpException('Difficulty not found', HttpStatus.NOT_FOUND);
      }
      reserve.difficulty = difficulty;

      const reserveGameCategory = await this.reserveGameCategoryRepository.findOne({
        where: { id_game_category: createReserveDto.reserve_game_category_id },
      });
      if (createReserveDto.reserve_game_category_id && !reserveGameCategory) {
        throw new HttpException('Game category not found', HttpStatus.NOT_FOUND);
      }
      reserve.reserve_game_category = reserveGameCategory;

      const reserveOfGame = await this.gameRepository.findOne({
        where: { id_game: createReserveDto.reserve_of_game_id },
      });
      if (createReserveDto.reserve_of_game_id && !reserveOfGame) {
        throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
      }
      reserve.reserve_of_game = reserveOfGame;

      const reserveTable = await this.tableRepository.findOne({
        where: { id_table: createReserveDto.reserve_table_id },
      });
      if (createReserveDto.reserve_table_id && !reserveTable) {
        throw new HttpException('Table not found', HttpStatus.NOT_FOUND);
      }
      reserve.reserve_table = reserveTable;
      await this.reserveRepository.save(reserve);
      if (createReserveDto.shop_event == true) {

        const date = new Date(createReserveDto.hour_start);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString().padStart(4, '0');

        const shop = await this.shopRepository.findOne({
          where: { id_shop: idShop },
        });
  
        if (!shop) {
          throw new HttpException('Shop not found', HttpStatus.NOT_FOUND);
        }
        reserve.event_id = `${reserveOfGame.id_game}-${reserveTable.id_table}-${day}/${month}/${year}`;
        if (shop.logo) {
          this.fcmNotificationService.sendTopicNotification(
            idShop.toString(),
            `Nuevo evento en ${shop.name}`,
            `Juego: ${reserveOfGame.name}. Fecha:${new Date(reserve.hour_start).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`,
            `${process.env.BASE_URL}/files/${shop.logo}`,
          );
        } else {
          this.fcmNotificationService.sendTopicNotification(
            idShop.toString(),
            `Nuevo evento en ${shop.name}`,
            `Juego: ${reserveOfGame.name}. Fecha:${new Date(reserve.hour_start).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`,
          );
        }
      }

      return reserve;
    } catch (err) {
      console.log(err);
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
        relations: [
          'reserve_of_game',
          'reserve_game_category',
          'difficulty',
          'reserve_table',
        ],
      });
      if (!reserve) {
        throw new HttpException('Reserve not found', HttpStatus.NOT_FOUND);
      }

      if (updateReserveDto.difficulty_id) {
        const difficulty = await this.difficultyRepository.findOne({
          where: { id_difficulty: updateReserveDto.difficulty_id },
        });
        if (!difficulty) {
          throw new HttpException('Difficulty not found', HttpStatus.NOT_FOUND);
        }
        reserve.difficulty = difficulty;
      }

      if (updateReserveDto.reserve_game_category_id) {
        const reserveGameCategory = await this.reserveGameCategoryRepository.findOne({
          where: { id_game_category: updateReserveDto.reserve_game_category_id },
        });
        if (!reserveGameCategory) {
          throw new HttpException('Game category not found', HttpStatus.NOT_FOUND);
        }
        reserve.reserve_game_category = reserveGameCategory;
      }

      if (updateReserveDto.reserve_of_game_id) {
        const reserveOfGame = await this.gameRepository.findOne({
          where: { id_game: updateReserveDto.reserve_of_game_id },
        });
        if (!reserveOfGame) {
          throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
        }
        reserve.reserve_of_game = reserveOfGame;
      }

      if (updateReserveDto.reserve_table_id) {
        const reserveTable = await this.tableRepository.findOne({
          where: { id_table: updateReserveDto.reserve_table_id },
        });
        if (!reserveTable) {
          throw new HttpException('Table not found', HttpStatus.NOT_FOUND);
        }
        reserve.reserve_table = reserveTable;
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
