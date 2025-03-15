import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, Repository } from 'typeorm';
import { ReservesEntity } from './reserves.entity';
import { CreateReserveDto, UpdateReserveDto } from './reserves.dto';
import { FcmNotificationService } from '../fcm-notification/fcm-notification.service';
import { ShopsEntity } from '../shops/shops.entity';
import { GamesEntity } from '../games/games.entitiy';
import { DifficultyEntity } from '../difficulty/difficulty.entity';
import { GameCategoryEntity } from '../game_category/game_category.entity';
import { TablesEntity } from '../tables/tables.entity';
import { GamesService } from 'src/games/games.service';
import { HttpService } from '../http/http.service';
import { Cron, CronExpression } from '@nestjs/schedule';

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
    private readonly gameService: GamesService,
    @Inject('Bgg-Api')
    private readonly httpService: HttpService,
  ) { }

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

  async getReserve(id: number): Promise<ReservesEntity> {
    try {
      const reserve = await this.reserveRepository.findOne({
        where: { id_reserve: id },
        relations: [
          'reserve_of_game',
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

      let reserveOfGame = await this.gameRepository.findOne({
        where: { name: Like(`%${createReserveDto.game_name}%`) },
      });
      if (createReserveDto.reserve_of_game_id && !reserveOfGame) {
        const externalGames = await this.httpService.get(
          'http://bgg-api:80/bgg-api/api/v4/geekitems',
          {
            params: {
              objectid: createReserveDto.reserve_of_game_id,
              objecttype: 'thing',
            },
            headers: { accept: 'application/json' },
          },
        );
        const externalGamesData = externalGames.data as { item: any };
        if (externalGamesData && externalGamesData.item) {
          const game = externalGamesData.item;
          reserveOfGame = await this.gameService.createGame({
            name: createReserveDto.game_name,
            description: game.description,
            category_name: game.links.boardgamecategory[0].name,
            bgg_id: createReserveDto.reserve_of_game_id,
          });
        }
        if (!reserveOfGame) {
          throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
        }
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
            `${process.env.BASE_URL}/files/${shop.logo}`,
          );
        }
      }

      return reserve;
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

  async updateReserve(
    updateReserveDto: UpdateReserveDto,
    id: number,
  ): Promise<ReservesEntity> {
    try {
      const reserve = await this.reserveRepository.findOne({
        where: { id_reserve: id },
        relations: ['reserve_of_game', 'difficulty', 'reserve_table'],
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
      if (updateReserveDto.reserve_of_game_id) {
        let reserveOfGame = await this.gameRepository.findOne({
          where: { id_game: updateReserveDto.reserve_of_game_id },
        });
        if (!reserveOfGame) {
          const externalGames = await this.httpService.get(
            'http://bgg-api:80/bgg-api/api/v4/geekitems',
            {
              params: {
                objectid: updateReserveDto.reserve_of_game_id,
                objecttype: 'thing',
              },
              headers: { accept: 'application/json' },
            },
          );
          const externalGamesData = externalGames.data as { items: any[] };
          if (
            externalGamesData &&
            externalGamesData.items &&
            externalGamesData.items.length > 0
          ) {
            const game = externalGamesData.items[0];
            reserveOfGame = await this.gameService.createGame({
              name: game.name,
              description: updateReserveDto.game_name,
              category_name: game.links.boardgamesubdomain[0].name,
              bgg_id: updateReserveDto.reserve_of_game_id,
            });
          } else {
            throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
          }
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

      this.reserveRepository.merge(reserve, updateReserveDto);
      await this.reserveRepository.save(reserve);
      return reserve;
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

  async deleteReserve(id: number): Promise<void> {
    try {
      const result = await this.reserveRepository.delete(id);
      if (result.affected === 0) {
        throw new HttpException('Reserve not found', HttpStatus.NOT_FOUND);
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

  async findAllUniqueShopEvents(shopId: number): Promise<ReservesEntity[]> {
    try {
      const currentDate = new Date();
      const shop = await this.shopRepository.findOne({
        where: { id_shop: shopId },
      });
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
        .groupBy('reserve.event_id')
        .addSelect('game.id_game')
        .orderBy('reserve.hour_start', 'ASC')
        .getMany();
      if (reserves.length === 0) {
        throw new HttpException('No Content', HttpStatus.NO_CONTENT);
      }
      return reserves;
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
  @Cron('0,15,30,45 8-23 * * *')
  async handleCron() {
    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + 1);
    console.log('Cron running every 15 minutes:', currentDate);
    const upcomingReserves = await this.reserveRepository.find({
      relations: ['userReserves', 'userReserves.user', 'reserve_table', 'reserve_table.tables_of_shop', 'reserve_of_game'],
      where: {
        hour_start: Between(
          new Date(currentDate.getTime() + 0 * 60000),
          new Date(currentDate.getTime() + 44 * 60000),
        ),
      },
    });
    
    for (const reserve of upcomingReserves) {
      if(!reserve.confirmation_notification){
        console.log(`Cron sending notifications for reserves IDs: ${reserve.id_reserve}`);
        reserve.confirmation_notification = true;
          const registrationTokens = Array.from(
            new Set(
              (reserve.userReserves || [])
                .filter(
                  (userReserve) =>
                    userReserve.user &&
                    userReserve.user.token_notification,
                )
                .map((userReserve) => userReserve.user.token_notification),
            ),
          );
          if (registrationTokens.length > 0) {
            const shopName = reserve.reserve_table?.tables_of_shop.name;
            const hour = reserve.hour_start.toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
            });
            this.fcmNotificationService.sendMulticastNotification(
              registrationTokens,
              `Reserva próxima en  ${shopName}`,
              `Tienes una reserva hoy a las ${hour} para jugar a ${reserve.reserve_of_game.name} en la tienda ${shopName}.`,
            );
          }
      }
    
    }
  }

  async getLastTenPlayers(userId: string): Promise<any[]> {
    try {
      const reserves = await this.reserveRepository
        .createQueryBuilder('reserve')
        .innerJoinAndSelect('reserve.userReserves', 'userReserve')
        .innerJoinAndSelect('userReserve.user', 'user')
        .where('user.id_google = :userId', { userId: userId.toString() })
        .orderBy('reserve.hour_start', 'DESC')
        .limit(10)
        .getMany();
        const players = reserves.reduce((acc, reserve) => {
          const filteredUsers = reserve.userReserves
            .filter(userReserve => userReserve.user.id_google !== userId.toString())
            .map(userReserve => userReserve.user);
          return acc.concat(filteredUsers);
        }, []);

      return players;
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

}
