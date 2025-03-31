import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { isEmpty } from 'class-validator';
import { ShopGamesService } from './shop_games.service';
import { CreateGameDto } from '../games/games.dto';
import { GamesEntity } from '../games/games.entitiy';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ShopsEntity } from '../shops/shops.entity';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GameCategoryEntity } from '../game_category/game_category.entity';

@Controller('shops')
export class ShopGamesController {
  /**
   * Service constructor.
   * @param shopGamesService The service for managing shop and game relations.
   * @param gameCategoryRepository The repository for the GameCategoryEntity.
   */
  constructor(
    private readonly shopGamesService: ShopGamesService,
    @InjectRepository(ShopsEntity)
    private readonly gameCategoryRepository: Repository<GameCategoryEntity>,
  ) {}

  /**
   * Throws an HttpException with a BAD_REQUEST status if the given ID is invalid.
   * Checks if the ID is empty or if it is not a number.
   * @param id The ID to validate.
   * @param name The name of the ID to use in the error message.
   */
  private validateId(id: string, name: string) {
    if (isEmpty(id) || isNaN(Number(id))) {
      throw new HttpException(`Invalid ${name} ID`, HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':shopsId/games/:gamesId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a game to a shop' })
  @ApiResponse({ status: 201, description: 'Game successfully added to shop.' })
  @ApiResponse({ status: 400, description: 'Invalid shop or game ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 404,
    description: 'The shop or game with the given ID was not found.',
  })
  @ApiParam({ name: 'shopsId', description: 'ID of the shop', example: '1' })
  @ApiParam({ name: 'gamesId', description: 'ID of the game', example: '1' })
  /**
   * Add a game to a shop.
   * Method: POST /shops/:shopsId/games/:gamesId
   * Description: Adds a game to a shop.
   * Input Parameters:
   * - `shopsId` (string, required): The ID of the shop.
   * - `gamesId` (string, required): The ID of the game.
   * Example Request (JSON format):
   * N/A
   * HTTP Responses:
   * - `201 Created`: Game successfully added to shop. Example:
   *   {
   *     "id_shop": 1,
   *     "id_game": 1
   *   }
   * - `400 Bad Request`: Invalid shop or game ID.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: The shop or game with the given ID was not found.
   */
  async addGameToShop(
    @Param('shopsId') shopId: string,
    @Param('gamesId') gameId: string,
  ) {
    this.validateId(shopId, 'shop');
    this.validateId(gameId, 'game');
    return await this.shopGamesService.addGameToShop(shopId, gameId);
  }

  @Put(':shopsId/games')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Associate games to a shop' })
  @ApiResponse({
    status: 200,
    description: 'Games successfully associated to shop.',
  })
  @ApiResponse({ status: 400, description: 'Invalid shop or game ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 404,
    description: 'The shop or game with the given ID was not found.',
  })
  @ApiParam({ name: 'shopsId', description: 'ID of the shop', example: '1' })
  /**
   * Method: PUT /shops/:shopsId/games
   * Description: Updates a list of games associated to a shop.
   * Input Parameters:
   * - `shopsId` (string, required): The ID of the shop.
   * - `gameDto` (array, required): An array of game objects with the following properties:
   *   - `name` (string, required): The name of the game.
   *   - `category_name` (string, required): The name of the category of the game.
   * Example Request (JSON format):
   * [
   *   {
   *     "name": "Chess",
   *     "category_name": "Strategy"
   *   },
   *   {
   *     "name": "Poker",
   *     "category_name": "Card"
   *   }
   * ]
   * HTTP Responses:
   * - `200 OK`: Games successfully associated to shop. Example:
   *   [
   *     {
   *       "id_game": 1,
   *       "name": "Chess",
   *       "description": "A strategic board game",
   *       "category": "Strategy",
   *       "bgg_id": 123
   *     },
   *     {
   *       "id_game": 2,
   *       "name": "Poker",
   *       "description": "A card game",
   *       "category": "Card",
   *       "bgg_id": 456
   *     }
   *   ]
   * - `400 Bad Request`: Invalid shop or game ID.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: The shop or game with the given ID was not found.
   */
  async associateGameToShop(
    @Body() gameDto: CreateGameDto[],
    @Param('shopsId') shopId: string,
  ) {
    this.validateId(shopId, 'shop');
    const gamesEntity = await Promise.all(
      gameDto.map(async (game) => {
        const gameEntity = new GamesEntity();
        gameEntity.name = game.name;
        gameEntity.gameCategory = await this.gameCategoryRepository.findOneBy({
          description: game.category_name,
        });
        return gameEntity;
      }),
    );
    return await this.shopGamesService.updateGamesFromShop(shopId, gamesEntity);
  }

  @Get(':shopsId/games/:gamesId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find a game by shop ID and game ID' })
  @ApiResponse({ status: 200, description: 'Game successfully found.' })
  @ApiResponse({ status: 204, description: 'No content.' })
  @ApiResponse({ status: 400, description: 'Invalid shop or game ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 404,
    description: 'The shop or game with the given ID was not found.',
  })
  @ApiParam({ name: 'shopsId', description: 'ID of the shop', example: '1' })
  @ApiParam({ name: 'gamesId', description: 'ID of the game', example: '1' })
  /**
   * Find a specific game by its shop ID and game ID.
   * Method: GET /shops/:shopsId/games/:gamesId
   * Input Parameters:
   * - `shopsId` (string, required): The ID of the shop.
   * - `gamesId` (string, required): The ID of the game.
   * HTTP Responses:
   * - `200 OK`: Game successfully found.
   * - `204 No Content`: No game found for the given IDs.
   * - `400 Bad Request`: Invalid shop or game ID.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: The shop or game with the given ID was not found.
   */

  async findGameByShopIdGameId(
    @Param('shopsId') shopId: string,
    @Param('gamesId') gameId: string,
  ) {
    this.validateId(shopId, 'shop');
    this.validateId(gameId, 'game');
    return await this.shopGamesService.findGameFromShop(shopId, gameId);
  }

  @Get(':shopsId/games')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find games by shop ID' })
  @ApiResponse({ status: 200, description: 'Games successfully found.' })
  @ApiResponse({ status: 204, description: 'No content.' })
  @ApiResponse({ status: 400, description: 'Invalid shop ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 404,
    description: 'The shop with the given ID was not found.',
  })
  @ApiParam({ name: 'shopsId', description: 'ID of the shop', example: '1' })
  /**
   * Finds all games associated with a shop.
   * Method: GET /shops/:shopsId/games
   * Input Parameters:
   * - `shopsId` (string, required): The ID of the shop.
   * HTTP Responses:
   * - `200 OK`: Games successfully found.
   * - `204 No Content`: No games found for the given shop ID.
   * - `400 Bad Request`: Invalid shop ID.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: The shop with the given ID was not found.
   */
  async findGamesByShopId(@Param('shopsId') shopId: string) {
    this.validateId(shopId, 'shop');
    return await this.shopGamesService.findGamesFromShop(shopId);
  }

  @Delete(':shopsId/games/:gamesId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a game from a shop' })
  @ApiResponse({
    status: 200,
    description: 'Game successfully deleted from shop.',
  })
  @ApiResponse({ status: 400, description: 'Invalid shop or game ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 404,
    description: 'The shop or game with the given ID was not found.',
  })
  @ApiParam({ name: 'shopsId', description: 'ID of the shop', example: '1' })
  @ApiParam({ name: 'gamesId', description: 'ID of the game', example: '1' })
  /**
   * Deletes a specific game from a shop.
   * Method: DELETE /shops/:shopsId/games/:gamesId
   * Input Parameters:
   * - `shopsId` (string, required): The ID of the shop.
   * - `gamesId` (string, required): The ID of the game.
   * HTTP Responses:
   * - `200 OK`: Game successfully deleted from the shop.
   * - `400 Bad Request`: Invalid shop or game ID.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: The shop or game with the given ID was not found.
   */

  async deleteGameFromShop(
    @Param('shopsId') shopId: string,
    @Param('gamesId') gameId: string,
  ) {
    this.validateId(shopId, 'shop');
    this.validateId(gameId, 'game');
    return await this.shopGamesService.deleteGameFromShop(shopId, gameId);
  }
}
