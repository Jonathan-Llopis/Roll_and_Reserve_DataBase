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
import { DifficultyEntity } from '../difficulty/difficulty.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ShopsEntity } from '../shops/shops.entity';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

@Controller('shops')
export class ShopGamesController {
  constructor(
    private readonly shopGamesService: ShopGamesService,
    @InjectRepository(ShopsEntity)
    private readonly difficultyRepository: Repository<DifficultyEntity>,
  ) {}

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
  async associateGameToShop(
    @Body() gameDto: CreateGameDto[],
    @Param('shopsId') shopId: string,
  ) {
    this.validateId(shopId, 'shop');
    const gamesEntity = await Promise.all(
      gameDto.map(async (game) => {
        const gameEntity = new GamesEntity();
        gameEntity.name = game.name;
        gameEntity.difficulty_of_game =
          await this.difficultyRepository.findOneBy({
            id_difficulty: game.difficulty_id,
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
  async deleteGameFromShop(
    @Param('shopsId') shopId: string,
    @Param('gamesId') gameId: string,
  ) {
    this.validateId(shopId, 'shop');
    this.validateId(gameId, 'game');
    return await this.shopGamesService.deleteGameFromShop(shopId, gameId);
  }
}
