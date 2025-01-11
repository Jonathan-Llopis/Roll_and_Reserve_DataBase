import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { isEmpty } from 'class-validator';
import { ShopGamesService } from './shop_games.service';
import { CreateGameDto } from '../games/game.dto';
import { GamesEntity } from '../games/game.entitiy';

@Controller('shops')
export class ShopGamesController {
  constructor(private readonly shopGamesService: ShopGamesService) {}

  @Post(':shopsId/games/:gamesId')
  async addGameToShop(
    @Param('shopsId') shopId: string,
    @Param('gamesId') gameId: string,
  ) {
    return this.shopGamesService.addGameToShop(shopId, gameId);
  }

  @Put(':shopsId/games')
  async associateGameToShop(
    @Body() gameDto: CreateGameDto[],
    @Param('shopsId') shopId: string,
  ) {
    const gamesEntity = gameDto.map((game) => {
      const gameEntity = new GamesEntity();
      gameEntity.name = game.name;
      gameEntity.difficulty_of_game = game.difficulty_of_game;
      return gameEntity;
    });
    return this.shopGamesService.updateGamesFromShop(shopId, gamesEntity);
  }

  @Delete(':shopsId/games/:gamesId')
  @HttpCode(204)
  async deleteGameFromShop(
    @Param('shopsId') shopId: string,
    @Param('gamesId') gameId: string,
  ) {
    if (isEmpty(shopId) || isEmpty(gameId)) {
      throw new HttpException(
        'Invalid shop or game ID',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.shopGamesService.deleteGameFromShop(shopId, gameId);
  }

  @Get(':shopsId/games/:gamesId')
  async findGameByShopIdGameId(
    @Param('shopsId') shopId: string,
    @Param('gamesId') gameId: string,
  ) {
    if (isEmpty(shopId) || isEmpty(gameId)) {
      throw new HttpException(
        'Invalid shop or game ID',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.shopGamesService.findGameFromShop(shopId, gameId);
  }

  @Get(':shopsId/games')
  async findGamesByShopId(@Param('shopsId') shopId: string) {
    if (isEmpty(shopId)) {
      throw new HttpException('Invalid shop ID', HttpStatus.BAD_REQUEST);
    }
    return this.shopGamesService.findGamesFromShop(shopId);
  }
}
