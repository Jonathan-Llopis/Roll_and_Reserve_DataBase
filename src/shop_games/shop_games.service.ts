import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ShopsEntity } from '../shops/shops.entity';
import { GamesEntity } from '../games/games.entitiy';

@Injectable()
export class ShopGamesService {
  /**
   * Constructor of the ShopGamesService.
   * @param shopRepository The repository for the ShopsEntity.
   * @param gameRepository The repository for the GamesEntity.
   */
  constructor(
    @InjectRepository(ShopsEntity)
    private readonly shopRepository: Repository<ShopsEntity>,

    @InjectRepository(GamesEntity)
    private readonly gameRepository: Repository<GamesEntity>,
  ) {}

  /**
   * Handles any error by throwing an HttpException.
   * If the error is an HttpException, it is thrown as is.
   * Otherwise, a new HttpException is thrown with status code 400 and the message 'Bad request'.
   * @param err The error to handle.
   * @throws HttpException
   */
  private handleError(err: any) {
    if (err instanceof HttpException) {
      throw err;
    }
    throw new HttpException(
      err.message || 'Bad request',
      err.status || HttpStatus.BAD_REQUEST,
    );
  }

/**
 * DOC: Add a Game to a Shop
 * Method: POST /shops/:shopsId/games/:gamesId
 * Description: Adds a specified game to the shop's list of games.
 * Input Parameters:
 * - `shopId` (string, required): The ID of the shop.
 * - `gameId` (string, required): The ID of the game.
 * Example Request (JSON format):
 * N/A
 * HTTP Responses:
 * - `200 OK`: Game successfully added to the shop. Example:
 *   {
 *     "id_shop": 1,
 *     "games": [
 *       { "id_game": 1, "name": "Chess" },
 *       { "id_game": 2, "name": "Poker" }
 *     ]
 *   }
 * - `404 Not Found`: The shop or game with the given ID was not found.
 * - `400 Bad Request`: General request error.
 */

  async addGameToShop(shopId: string, gameId: string): Promise<ShopsEntity> {
    try {
      const shop = await this.shopRepository.findOne({
        where: { id_shop: parseInt(shopId) },
        relations: ['games'],
      });
      if (!shop) {
        throw new HttpException(
          'The shop with the given id was not found',
          HttpStatus.NOT_FOUND,
        );
      }
      const game = await this.gameRepository.findOne({
        where: { id_game: parseInt(gameId) },
      });
      if (!game) {
        throw new HttpException(
          'The game with the given id was not found',
          HttpStatus.NOT_FOUND,
        );
      }
      shop.games.push(game);
      return this.shopRepository.save(shop);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException(
       'Bad Request',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * DOC: Get a Game from a Shop
   * Method: GET /shops/:shopsId/games/:gamesId
   * Description: Returns a specified game from a shop's list of games.
   * Input Parameters:
   * - `shopId` (string, required): The ID of the shop.
   * - `gameId` (string, required): The ID of the game.
   * Example Request (JSON format):
   * N/A
   * HTTP Responses:
   * - `200 OK`: Game successfully retrieved from the shop. Example:
   *   {
   *     "id_game": 1,
   *     "name": "Chess"
   *   }
   * - `404 Not Found`: The shop or game with the given ID was not found.
   * - `400 Bad Request`: General request error.
   * - `412 Precondition Failed`: The game with the given id is not associated to the shop.
   */
  async findGameFromShop(shopId: string, gameId: string): Promise<GamesEntity> {
    try {
      const game = await this.gameRepository.findOne({
        where: { id_game: parseInt(gameId) },
        relations: ['shop'],
      });
      if (!game) {
        throw new HttpException(
          'The game with the given id was not found',
          HttpStatus.NOT_FOUND,
        );
      }

      const shop = await this.shopRepository.findOne({
        where: { id_shop: parseInt(shopId) },
        relations: ['games'],
      });
      if (!shop) {
        throw new HttpException(
          'The shop with the given id was not found',
          HttpStatus.NOT_FOUND,
        );
      }

      const shopGame = shop.games.find(
        (game) => game.id_game === parseInt(gameId),
      );

      if (!shopGame) {
        throw new HttpException(
          'The game with the given id is not associated to the shop',
          HttpStatus.PRECONDITION_FAILED,
        );
      }

      return shopGame;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException(
       'Bad Request',
        HttpStatus.BAD_REQUEST,
      );
    }
  }


  /**
   * Finds all games associated with a shop.
   * Method: GET /shops/:shopsId/games
   * Description: Retrieves all games associated with a shop.
   * Input Parameters:
   * - `shopsId` (string, required): The ID of the shop.
   * HTTP Responses:
   * - `200 OK`: Games successfully found. Example:
   *   [
   *     {
   *       "id_game": 1,
   *       "name": "Chess"
   *     },
   *     {
   *       "id_game": 2,
   *       "name": "Poker"
   *     }
   *   ]
   * - `204 No Content`: No games found for the given shop ID.
   * - `400 Bad Request`: Invalid shop ID.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: The shop with the given ID was not found.
   */
  async findGamesFromShop(shopId: string): Promise<GamesEntity[]> {
    try {
      const shop = await this.shopRepository.findOne({
        where: { id_shop: parseInt(shopId) },
        relations: ['games'],
      });
      if (!shop) {
        throw new HttpException(
          'The shop with the given id was not found',
          HttpStatus.NOT_FOUND,
        );
      }

      if (shop.games.length === 0) {
        throw new HttpException('No Content', HttpStatus.NO_CONTENT);
      }

      return shop.games;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException(
       'Bad Request',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Updates the list of games associated with a shop.
   * Method: PUT /shops/:shopsId/games
   * Description: Updates the list of games associated with a shop.
   * Input Parameters:
   * - `shopId` (string, required): The ID of the shop.
   * - `games` (array, required): An array of Game objects with the following properties:
   *   - `id_game` (number, required): The ID of the game.
   *   - `name` (string, required): The name of the game.
   *   - `description` (string, optional): The description of the game.
   *   - `category` (string, optional): The category of the game.
   *   - `bgg_id` (number, optional): The Board Game Geek ID of the game.
   * Example Request (JSON format):
   * [
   *   {
   *     "id_game": 1,
   *     "name": "Chess",
   *     "description": "A strategic board game",
   *     "category": "Strategy",
   *     "bgg_id": 123
   *   },
   *   {
   *     "id_game": 2,
   *     "name": "Poker",
   *     "description": "A card game",
   *     "category": "Card",
   *     "bgg_id": 456
   *   }
   * ]
   * HTTP Responses:
   * - `200 OK`: Games successfully associated to shop. Example:
   *   {
   *     "id_shop": 1,
   *     "games": [
   *       {
   *         "id_game": 1,
   *         "name": "Chess",
   *         "description": "A strategic board game",
   *         "category": "Strategy",
   *         "bgg_id": 123
   *       },
   *       {
   *         "id_game": 2,
   *         "name": "Poker",
   *         "description": "A card game",
   *         "category": "Card",
   *         "bgg_id": 456
   *       }
   *     ]
   *   }
   * - `400 Bad Request`: Invalid shop or game ID.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: The shop or game with the given ID was not found.
   */
  async updateGamesFromShop(
    shopId: string,
    games: GamesEntity[],
  ): Promise<ShopsEntity> {
    try {
      const shop = await this.shopRepository.findOne({
        where: { id_shop: parseInt(shopId) },
        relations: ['games'],
      });

      if (!shop) {
        throw new HttpException(
          'The shop with the given id was not found',
          HttpStatus.NOT_FOUND,
        );
      }

      for (let i = 0; i < games.length; i++) {
        const game = await this.gameRepository.findOne({
          where: { id_game: games[i].id_game },
          relations: ['shop'],
        });
        if (!game) {
          throw new HttpException(
            'The game with the given id was not found',
            HttpStatus.NOT_FOUND,
          );
        }
      }
      shop.games = games;
      return this.shopRepository.save(shop);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException(
       'Bad Request',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Delete a game from a shop.
   * Method: DELETE /shops/:shopsId/games/:gamesId
   * Description: Deletes a game from a shop.
   * Input Parameters:
   * - `shopsId` (string, required): The ID of the shop.
   * - `gamesId` (string, required): The ID of the game.
   * HTTP Responses:
   * - `200 OK`: Game successfully deleted from shop.
   * - `404 Not Found`: The shop or game with the given ID was not found.
   * - `400 Bad Request`: General request error.
   * - `412 Precondition Failed`: The game with the given id is not associated to the shop.
   */
  async deleteGameFromShop(shopId: string, gameId: string) {
    try {
      const game = await this.gameRepository.findOne({
        where: { id_game: parseInt(gameId) },
        relations: ['shop'],
      });
      if (!game) {
        throw new HttpException(
          'The game with the given id was not found',
          HttpStatus.NOT_FOUND,
        );
      }

      const shop = await this.shopRepository.findOne({
        where: { id_shop: parseInt(shopId) },
        relations: ['games'],
      });
      if (!shop) {
        throw new HttpException(
          'The shop with the given id was not found',
          HttpStatus.NOT_FOUND,
        );
      }

      const shopGame = shop.games.find(
        (game) => game.id_game === parseInt(gameId),
      );

      if (!shopGame) {
        throw new HttpException(
          'The shop with the given id is not associated to the shop',
          HttpStatus.NOT_FOUND,
        );
      }

      shop.games = shop.games.filter(
        (game) => game.id_game !== parseInt(gameId),
      );
      return this.shopRepository.save(shop);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException(
       'Bad Request',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
