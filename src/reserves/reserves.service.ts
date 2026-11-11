import {
  Injectable,
  HttpException,
  HttpStatus,
  Inject,
  Optional,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  LessThan,
  MoreThan,
  Not,
  Like,
  Repository,
  DataSource,
} from 'typeorm';
import { ReservesEntity } from './reserves.entity';
import { CreateReserveDto, UpdateReserveDto } from './reserves.dto';
import { FcmNotificationService } from '../fcm-notification/fcm-notification.service';
import { ShopsEntity } from '../shops/shops.entity';
import { GamesEntity } from '../games/games.entity';
import { DifficultyEntity } from '../difficulty/difficulty.entity';
import { GameCategoryEntity } from '../game_category/game_category.entity';
import { TablesEntity } from '../tables/tables.entity';
import { GamesService } from '../games/games.service';
import { HttpService } from '../http/http.service';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class ReservesService {
  /**
   * Constructor of the Reserve Service.
   * @param reserveRepository The repository for the ReservesEntity.
   * @param shopRepository The repository for the ShopsEntity.
   * @param gameRepository The repository for the GamesEntity.
   * @param difficultyRepository The repository for the DifficultyEntity.
   * @param reserveGameCategoryRepository The repository for the GameCategoryEntity.
   * @param tableRepository The repository for the TablesEntity.
   * @param fcmNotificationService The service for sending notifications.
   * @param gameService The service for managing games.
   * @param httpService The HTTP client for BGG API.
   */
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
    @Optional()
    private readonly dataSource?: DataSource,
  ) {}

  /**
   * Handles any error by throwing an HttpException.
   * If the error is an HttpException, it is thrown as is.
   * Otherwise, a new HttpException is thrown with status code 400 and the message 'Request failed'.
   * @param err The error to handle.
   * @throws HttpException
   */
  private handleError(err: any) {
    if (err instanceof HttpException) {
      throw err;
    }
    throw new HttpException('Request failed', HttpStatus.BAD_REQUEST);
  }

  /**
   * DOC: Get All Reserves
   * Method: GET /reserves
   * Description: Retrieves all reserves from the database, including related entities and orders them by start time.
   * HTTP Responses:
   * - `200 OK`: Successfully retrieves all reserves, example structure:
   *   [
   *     {
   *       "id_reserve": 1,
   *       "total_places": 10,
   *       "hour_start": "2023-10-10T10:00:00Z",
   *       "hour_end": "2023-10-10T12:00:00Z",
   *       ...
   *     },
   *     ...
   *   ]
   * - `204 No Content`: No reserves found.
   * - `400 Bad Request`: Unexpected error occurred during the retrieval.
   * - `500 Internal Server Error`: Failed to retrieve reserves due to server error.
   */

  async getAllReserves(
    pagination?: PaginationDto,
  ): Promise<ReservesEntity[] | PaginatedResult<ReservesEntity>> {
    try {
      const relations = [
        'reserve_of_game',
        'difficulty',
        'reserve_table',
        'users_in_reserve',
        'userReserves',
        'userReserves.user',
      ];
      const order = {
        hour_start: 'ASC' as const,
      };

      if (
        pagination &&
        (pagination.page !== undefined || pagination.limit !== undefined)
      ) {
        const page =
          pagination.page && pagination.page > 0
            ? Number(pagination.page)
            : 1;
        const limit =
          pagination.limit && pagination.limit > 0
            ? Number(pagination.limit)
            : 20;
        const [data, total] = await this.reserveRepository.findAndCount({
          relations,
          order,
          skip: (page - 1) * limit,
          take: limit,
        });
        return {
          data,
          total,
          page,
          lastPage: Math.ceil(total / limit) || 1,
        };
      }

      const reserves = await this.reserveRepository.find({
        relations,
        order,
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
      throw new HttpException('Internal Server Error', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Retrieve a reserve by its ID.
   * Method: GET /reserves/:id
   * Description: Retrieve a reserve with the given ID.
   * Input Parameters:
   * - `id` (number, required): Reserve ID.
   * HTTP Responses:
   * - `200 OK`: Successfully retrieved the reserve.
   *   Example response:
   *   {
   *     id_reserve: 1,
   *     total_places: 10,
   *     reserver_id: '1',
   *     hour_start: '2023-10-10T09:00:00Z',
   *     hour_end: '2023-10-10T12:00:00Z',
   *     description: 'Test description',
   *     required_material: 'Test material',
   *     shop_event: false,
   *     event_id: null,
   *     confirmation_notification: false,
   *     difficulty: {...},
   *     reserve_of_game: {...},
   *     reserve_table: {...},
   *     users_in_reserve: [...],
   *     userReserves: [...],
   *   }
   * - `404 Not Found`: Reserve not found.
   * - `500 Internal Server Error`: Failed to retrieve reserve due to server error.
   */
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
      throw new HttpException('Internal Server Error', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * DOC: Retrieve Reserves by Date and Table
   * Method: GET /reserves/date/:date/:idTable
   * Description: Fetches all reserves for a specific date and table ID, including related entities.
   * Input Parameters:
   * - `date` (string, required): The date for which to fetch reserves, in YYYY-MM-DD format.
   * - `idTable` (number, required): The ID of the table for which to fetch reserves.
   * Example Request (JSON format):
   * {
   *   "date": "2023-01-01",
   *   "idTable": 1
   * }
   * HTTP Responses:
   * - `200 OK`: Successfully retrieved reserves. Example JSON structure:
   *   [
   *     {
   *       "id_reserve": 1,
   *       "total_places": 10,
   *       "hour_start": "2023-01-01T10:00:00Z",
   *       ...
   *     },
   *     ...
   *   ]
   * - `204 No Content`: No reserves found for the given date and table.
   * - `400 Bad Request`: Invalid date format or table ID.
   * - `500 Internal Server Error`: Unexpected error during retrieval.
   */

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
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * DOC: Create a new reserve.
   * Method: POST /reserves/:idShop
   * Description: Create a new reserve for a given shop.
   * Input Parameters:
   * - `idShop` (number, required): Shop ID.
   * - `createReserveDto` (CreateReserveDto, required): Reserve data.
   * Example Request (JSON format):
   * {
   *   "total_places": 10,
   *   "reserver_id": "1",
   *   "hour_start": "2023-10-10T10:00:00Z",
   *   "hour_end": "2023-10-10T12:00:00Z",
   *   "description": "A fun board game event",
   *   "shop_event": true,
   *   "required_material": "Board game, dice, cards"
   * }
   * HTTP Responses:
   * - `201 Created`: Reserve successfully created.
   * - `400 Bad Request`: Failed to create reserve.
   * - `401 Unauthorized`: Unauthorized.
   */
  async createReserve(
    createReserveDto: CreateReserveDto,
    idShop: number,
  ): Promise<ReservesEntity> {
    try {
      const start = new Date(createReserveDto.hour_start);
      const end = new Date(createReserveDto.hour_end);

      if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
        throw new BadRequestException(
          'La hora de finalización debe ser posterior a la hora de inicio.',
        );
      }

      const reserve = this.reserveRepository.create(createReserveDto);

      let difficulty: DifficultyEntity | null = null;
      if (createReserveDto.difficulty_id) {
        difficulty = await this.difficultyRepository.findOne({
          where: { id_difficulty: createReserveDto.difficulty_id },
        });
        if (!difficulty) {
          throw new HttpException('Difficulty not found', HttpStatus.NOT_FOUND);
        }
      }
      reserve.difficulty = difficulty;

      let reserveOfGame: GamesEntity | null = null;
      if (createReserveDto.game_name) {
        reserveOfGame = await this.gameRepository.findOne({
          where: { name: Like(`%${createReserveDto.game_name}%`) },
        });
      }

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

      let reserveTable: TablesEntity | null = null;
      if (createReserveDto.reserve_table_id) {
        reserveTable = await this.tableRepository.findOne({
          where: { id_table: createReserveDto.reserve_table_id },
          relations: ['tables_of_shop'],
        });
        if (!reserveTable) {
          throw new HttpException('Table not found', HttpStatus.NOT_FOUND);
        }

        if (
          reserveTable.tables_of_shop &&
          reserveTable.tables_of_shop.id_shop !== idShop
        ) {
          throw new BadRequestException(
            'La mesa no pertenece a la tienda especificada.',
          );
        }

        const overlapping = await this.reserveRepository.findOne({
          where: {
            reserve_table: { id_table: createReserveDto.reserve_table_id },
            hour_start: LessThan(end),
            hour_end: MoreThan(start),
          },
        });

        if (overlapping) {
          throw new ConflictException(
            'La mesa seleccionada ya se encuentra reservada en el horario solicitado.',
          );
        }
      }
      reserve.reserve_table = reserveTable;

      if (createReserveDto.shop_event == true) {
        const date = new Date(createReserveDto.hour_start);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString().padStart(4, '0');

        const gameId = reserveOfGame ? reserveOfGame.id_game : 'event';
        const tableId = reserveTable ? reserveTable.id_table : 'all';
        reserve.event_id = `${gameId}-${tableId}-${day}/${month}/${year}`;
      }

      if (this.dataSource && typeof this.dataSource.transaction === 'function') {
        await this.dataSource.transaction(async (manager) => {
          await manager.save(reserve);
        });
      } else {
        await this.reserveRepository.save(reserve);
      }

      if (createReserveDto.shop_event == true) {
        const shop = await this.shopRepository.findOne({
          where: { id_shop: idShop },
        });

        if (shop) {
          const gameName = reserveOfGame ? reserveOfGame.name : 'Evento especial';
          const formattedDate = new Date(reserve.hour_start).toLocaleDateString(
            'es-ES',
            { year: 'numeric', month: 'long', day: 'numeric' },
          );
          const logoUrl = shop.logo
            ? `${process.env.BASE_URL}/files/${shop.logo}`
            : '';

          this.fcmNotificationService.sendTopicNotification(
            idShop.toString(),
            `Nuevo evento en ${shop.name}`,
            `Juego: ${gameName}. Fecha:${formattedDate}`,
            logoUrl,
          );
        }
      }

      return reserve;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error in createReserve:', err);
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Update a reserve by ID.
   * Method: PUT /reserves/:id
   * Description: Update a reserve with the given ID.
   * Input Parameters:
   * - `id` (number, required): Reserve ID.
   * - `updateReserveDto` (UpdateReserveDto, required): Reserve data.
   * Example Request (JSON format):
   * {
   *   "number_players": 4,
   *   "description": "Reserva para 4 jugadores",
   *   "required_material": "Material de juego",
   *   "shop_event": true,
   *   "event_id": "event_1",
   *   "reserve_of_game_id": 1,
   *   "reserve_table_id": 1,
   *   "difficulty_id": 1,
   * }
   * HTTP Responses:
   * - `200 OK`: Reserve successfully updated.
   * - `400 Bad Request`: Failed to update reserve.
   * - `401 Unauthorized`: Unauthorized.
   * - `404 Not Found`: Reserve not found.
   */
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

      const newStart = updateReserveDto.hour_start
        ? new Date(updateReserveDto.hour_start)
        : reserve.hour_start;
      const newEnd = updateReserveDto.hour_end
        ? new Date(updateReserveDto.hour_end)
        : reserve.hour_end;

      if (
        (updateReserveDto.hour_start || updateReserveDto.hour_end) &&
        (isNaN(newStart.getTime()) ||
          isNaN(newEnd.getTime()) ||
          newEnd <= newStart)
      ) {
        throw new BadRequestException(
          'La hora de finalización debe ser posterior a la hora de inicio.',
        );
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
          relations: ['tables_of_shop'],
        });
        if (!reserveTable) {
          throw new HttpException('Table not found', HttpStatus.NOT_FOUND);
        }
        reserve.reserve_table = reserveTable;
      }

      const tableToCheck =
        updateReserveDto.reserve_table_id ||
        (reserve.reserve_table ? reserve.reserve_table.id_table : null);

      if (
        tableToCheck &&
        (updateReserveDto.hour_start ||
          updateReserveDto.hour_end ||
          updateReserveDto.reserve_table_id)
      ) {
        const overlapping = await this.reserveRepository.findOne({
          where: {
            id_reserve: Not(id),
            reserve_table: { id_table: tableToCheck },
            hour_start: LessThan(newEnd),
            hour_end: MoreThan(newStart),
          },
        });
        if (overlapping) {
          throw new ConflictException(
            'La mesa seleccionada ya se encuentra reservada en el horario solicitado.',
          );
        }
      }

      this.reserveRepository.merge(reserve, updateReserveDto);
      await this.reserveRepository.save(reserve);
      return reserve;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Delete a reserve by ID.
   * Method: DELETE /reserves/:id
   * Description: Delete a reserve with the given ID.
   * Input Parameters:
   * - `id` (number, required): Reserve ID.
   * HTTP Responses:
   * - `200 OK`: Reserve successfully deleted.
   * - `400 Bad Request`: Failed to delete reserve.
   * - `401 Unauthorized`: Unauthorized.
   * - `404 Not Found`: Reserve not found.
   */
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
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Retrieve all unique shop events by shop ID.
   * Method: GET /reserves/shop_events/:idShop
   * Description: Get all unique shop events by shop ID.
   * Input Parameters:
   * - `idShop` (number, required): Shop ID.
   * HTTP Responses:
   * - `200 OK`: Successfully retrieved all unique shop events.
   *   Example response:
   *   [
   *     {
   *       id_reserve: 1,
   *       total_places: 10,
   *       reserver_id: '1',
   *       hour_start: '2023-10-10T10:00:00Z',
   *       hour_end: '2023-10-10T12:00:00Z',
   *       description: 'Test description',
   *       required_material: 'Board game, dice, cards',
   *       shop_event: true,
   *       event_id: 'event-1',
   *       confirmation_notification: false,
   *       difficulty: null,
   *       reserve_of_game: null,
   *       reserve_table: { id_table: 1 },
   *       users_in_reserve: [],
   *       userReserves: [],
   *     },
   *     ...
   *   ]
   * - `400 Bad Request`: Failed to retrieve unique shop events.
   * - `401 Unauthorized`: Unauthorized.
   * - `404 Not Found`: Shop not found.
   * - `204 No Content`: No shop events found.
   */
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
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Retrieve the last ten players for a user by Google ID.
   * Method: GET /reserves/last_ten_players/:idGoogle
   * Description: Retrieve the last ten players for a user given by their Google ID.
   * Input Parameters:
   * - `idGoogle` (string, required): Google ID of the user.
   * HTTP Responses:
   * - `200 OK`: Successfully retrieved the last ten players.
   *   Example response:
   *   [
   *     {
   *       id_google: 'user1',
   *       email: 'user1@gmail.com',
   *       name: 'User 1',
   *       picture: 'https://example.com/user1.jpg',
   *     },
   *     ...
   *   ]
   * - `400 Bad Request`: Failed to retrieve players.
   * - `401 Unauthorized`: Unauthorized.
   * - `404 Not Found`: User not found.
   * - `500 Internal Server Error`: Unexpected error.
   */
  async getLastTenPlayers(userId: string): Promise<any[]> {
    try {
      const reserves = await this.reserveRepository.find({
        where: {
          hour_end: LessThan(new Date())
        },
        relations: ['userReserves', 'userReserves.user'],
        order: { hour_end: 'DESC' }
      });
  
      const playersMap = new Map<string, any>();
      
      reserves.forEach(reserve => {
        reserve.userReserves?.forEach(userReserve => {
          const player = userReserve?.user;
          const playerKey = player?.id_google || player?.id_user?.toString();
          if (
            player &&
            player.id_google !== userId &&
            player.id_user?.toString() !== userId &&
            playerKey &&
            !playersMap.has(playerKey)
          ) {
            playersMap.set(playerKey, player);
          }
        });
      });

      const players = Array.from(playersMap.values());
      console.log(`Total players found: ${players.length}`);
      return players.slice(0, 10);
    } catch (err) {
      if (err instanceof HttpException) throw err;
      
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }
}
