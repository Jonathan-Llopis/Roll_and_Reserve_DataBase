import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShopsEntity } from './shops.entity';
import { CreateShopDto, UpdateShopDto } from './shops.dto';
import { UserEntity } from '../users/users.entity';

@Injectable()
export class ShopsService {
  /**
   * Constructor of the ShopsService.
   * @param shopRepository The repository for the ShopsEntity.
   * @param userRepository The repository for the UserEntity.
   */
  constructor(
    @InjectRepository(ShopsEntity)
    private readonly shopRepository: Repository<ShopsEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  /**
   * Throws an HttpException for the given error, or a default BAD_REQUEST
   * error if the given error is not an HttpException.
   *
   * @param err - The error to throw.
   */
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

  /**
   * Retrieve all shops.
   * Method: GET /shops
   * Description: Retrieve all shops, including their games, tables, reviews and owner.
   * HTTP Responses:
   * - `200 OK`: Successfully retrieved shops. Example response:
   *   [
   *     {
   *       id_shop: 1,
   *       name: 'My shop',
   *       address: 'My address',
   *       logo: 'logo.png',
   *       owner: { id_google: '1234567890' },
   *       games: [],
   *       tables_in_shop: [],
   *       reviews_shop: [],
   *     },
   *     ...
   *   ]
   * - `204 No Content`: No shops found.
   * - `400 Bad Request`: General request error.
   */
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
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Retrieve a shop by its ID.
   * Method: GET /shops/:id
   * Description: Retrieve a shop by its ID, including its games, tables, reviews and owner.
   * Input Parameters:
   * - `id` (number, required): The ID of the shop.
   * HTTP Responses:
   * - `200 OK`: Successfully retrieved shop. Example response:
   *   {
   *     id_shop: 1,
   *     name: 'My shop',
   *     address: 'My address',
   *     logo: 'logo.png',
   *     owner: { id_google: '1234567890' },
   *     games: [],
   *     tables_in_shop: [],
   *     reviews_shop: [],
   *   }
   * - `400 Bad Request`: Invalid shop ID.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: Shop not found.
   */
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
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Retrieve all shops by their owner ID.
   * Method: GET /shops/owner/:idOwner
   * Description: Retrieve all shops by the owner ID, including their games, tables, reviews and owner.
   * Input Parameters:
   * - `idOwner` (string, required): The ID of the owner.
   * HTTP Responses:
   * - `200 OK`: Successfully retrieved shops. Example response:
   *   [
   *     {
   *       id_shop: 1,
   *       name: 'My shop',
   *       address: 'My address',
   *       logo: 'logo.png',
   *       owner: { id_google: '1234567890' },
   *       games: [],
   *       tables_in_shop: [],
   *       reviews_shop: [],
   *     },
   *     ...
   *   ]
   * - `204 No Content`: No shops found for the given owner ID.
   * - `400 Bad Request`: General request error.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: Owner not found.
   */
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
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Creates a new shop with the given data.
   * Method: POST /shops
   * Description: Creates a new shop with the given data.
   * Input Parameters:
   * - `createShopDto` (object, required): The data of the shop to be created.
   *   - `name` (string, required): The name of the shop.
   *   - `address` (string, required): The address of the shop.
   *   - `logo` (string, required): The logo of the shop.
   *   - `latitud` (number, required): The latitude of the shop location.
   *   - `longitud` (number, required): The longitude of the shop location.
   *   - `owner_id` (string, required): The ID of the shop owner.
   * HTTP Responses:
   * - `201 Created`: Shop successfully created. Example response:
   *   {
   *     id_shop: 1,
   *     name: 'My shop',
   *     address: 'My address',
   *     logo: 'logo.png',
   *     owner: { id_google: '1234567890' },
   *   }
   * - `400 Bad Request`: General request error.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: Owner not found.
   */
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
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * DOC: Update Shop
   * Method: PUT /shops/:id
   * Description: Updates the details of an existing shop by its ID.
   * Input Parameters:
   * - `updateShopDto` (UpdateShopDto, required): The data to update the shop with.
   * - `id` (number, required): The ID of the shop to update.
   * Example Request (JSON format):
   * {
   *   "name": "Updated Shop",
   *   "address": "Updated Address",
   *   "logo": "updatedLogo.png",
   *   "latitud": 40.7128,
   *   "longitud": -74.006,
   *   "owner_id": "newOwner123"
   * }
   * HTTP Responses:
   * - `200 OK`: Shop updated successfully. Example response:
   *   {
   *     "id_shop": 1,
   *     "name": "Updated Shop",
   *     "address": "Updated Address",
   *     "logo": "updatedLogo.png",
   *     "latitud": 40.7128,
   *     "longitud": -74.006,
   *     "owner": { "id_google": "newOwner123" }
   *   }
   * - `404 Not Found`: Shop or owner not found.
   * - `400 Bad Request`: Invalid input or request error.
   */

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
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Deletes a shop by its ID.
   * Method: DELETE /shops/:id
   * Input Parameters:
   * - `id` (number, required): The ID of the shop to delete.
   * HTTP Responses:
   * - `204 No Content`: Shop deleted successfully.
   * - `404 Not Found`: Shop not found.
   * - `400 Bad Request`: General request error.
   */
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
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Associates a file with a shop by updating the shop's logo.
   * Method: PATCH /shops/:id/logo/:fileId
   * Description: Updates the logo of a shop with a given file ID.
   * Input Parameters:
   * - `id_shop` (string, required): The ID of the shop.
   * - `id_archivo` (string, required): The ID of the file to be associated as the shop's logo.
   * HTTP Responses:
   * - `200 OK`: Logo updated successfully.
   * - `404 Not Found`: Shop not found.
   * - `400 Bad Request`: General request error.
   */

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
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }
  /**
   * Retrieves the most played games for a shop within a time range.
   * Method: POST /shops/:idShop/stats/most-played-games
   * Description: Retrieves the most played games for a shop within a time range.
   * Input Parameters:
   * - `idShop` (string, required): The ID of the shop.
   * - `startTime` (string, required): The start time of the range in ISO 8601.
   * - `endTime` (string, required): The end time of the range in ISO 8601.
   * HTTP Responses:
   * - `200 OK`: Most played games retrieved successfully. Example:
   *   [
   *     {
   *       "id_game": 1,
   *       "name": "Chess",
   *       "play_count": 5
   *     },
   *     {
   *       "id_game": 2,
   *       "name": "Poker",
   *       "play_count": 3
   *     }
   *   ]
   * - `400 Bad Request`: Invalid shop ID, or invalid time range.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: The shop with the given ID was not found.
   */
  async getMostPlayedGames(
    idShop: string,
    startTime: string,
    endTime: string,
  ): Promise<any> {
    try {
      const shop = await this.shopRepository.findOne({
        where: { id_shop: parseInt(idShop) },
      });
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
        [idShop, startTime, endTime],
      );
      return mostPlayedGames;
    } catch (err) {
      this.handleError(err);
    }
  }

  /**
   * Retrieves the total number of reservations for a specific shop within a given time range.
   * Method: POST /shops/:idShop/stats/total-reservations
   * Input Parameters:
   * - `idShop` (string, required): The ID of the shop.
   * - `startTime` (string, required): The start time of the range in ISO 8601.
   * - `endTime` (string, required): The end time of the range in ISO 8601.
   * HTTP Responses:
   * - `200 OK`: Total reservations retrieved successfully.
   * - `400 Bad Request`: Invalid shop ID, or invalid time range.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: The shop with the given ID was not found.
   */

  async getTotalReservations(
    idShop: string,
    startTime: string,
    endTime: string,
  ): Promise<any> {
    try {
      const shop = await this.shopRepository.findOne({
        where: { id_shop: parseInt(idShop) },
      });
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
        [idShop, startTime, endTime],
      );
      return totalReservations;
    } catch (err) {
      this.handleError(err);
    }
  }

  /**
   * Get the total number of distinct players who have made a reservation
   * for a specific shop within the provided start and end time.
   * Method: POST /shop/:idShop/stats/player-count
   * Description: Retrieves the total number of distinct players who have made a
   * reservation for a specific shop within the provided start and end time.
   * Input Parameters:
   * - `idShop` (string, required): The ID of the shop.
   * - `startTime` (string, required): The start time of the period.
   * - `endTime` (string, required): The end time of the period.
   * HTTP Responses:
   * - `200 OK`: Player count retrieved successfully.
   * - `400 Bad Request`: Invalid request data.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: Shop not found.
   */
  async getPlayerCount(
    idShop: string,
    startTime: string,
    endTime: string,
  ): Promise<any> {
    try {
      const shop = await this.shopRepository.findOne({
        where: { id_shop: parseInt(idShop) },
      });
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
        [idShop, startTime, endTime],
      );
      return playerCount;
    } catch (err) {
      this.handleError(err);
    }
  }
  /**
   * Retrieves the peak reservation hours for a specific shop within the provided
   * start and end time.
   * Method: POST /shop/:idShop/stats/peak-reservation-hours
   * Description: Retrieves the peak reservation hours for a specific shop
   * within the provided start and end time.
   * Input Parameters:
   * - `idShop` (string, required): The ID of the shop.
   * - `startTime` (string, required): The start time of the period.
   * - `endTime` (string, required): The end time of the period.
   * HTTP Responses:
   * - `200 OK`: Peak reservation hours retrieved successfully.
   * - `400 Bad Request`: Invalid request data.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: Shop not found.
   */
  async getPeakReservationHours(
    idShop: string,
    startTime: string,
    endTime: string,
  ): Promise<any> {
    try {
      const shop = await this.shopRepository.findOne({
        where: { id_shop: parseInt(idShop) },
      });
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
        [idShop, startTime, endTime],
      );
      return peakReservationHours;
    } catch (err) {
      this.handleError(err);
    }
  }
}
