import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { GamesService } from './games.service';
import { CreateGameDto, UpdateGameDto } from './game.dto';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  getAllGames() {
    try {
      return this.gamesService.getAllGames();
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: err,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          cause: err,
        },
      );
    }
  }

  @Get(':id')
  getGame(@Param('id') id: string) {
    const gameId = parseInt(id);
    if (isNaN(gameId)) {
      throw new HttpException('Invalid game ID', HttpStatus.BAD_REQUEST);
    }
    return this.gamesService.getGame(gameId);
  }

  @Post()
  createGame(@Body() createGameDto: CreateGameDto) {
    return this.gamesService.createGame(createGameDto);
  }

  @Put(':id')
  updateGame(@Param('id') id: string, @Body() updateGameDto: UpdateGameDto) {
    const gameId = parseInt(id);
    if (isNaN(gameId)) {
      throw new HttpException('Invalid game ID', HttpStatus.BAD_REQUEST);
    }
    return this.gamesService.updateGame(updateGameDto, gameId);
  }

  @Delete(':id')
  deleteGame(@Param('id') id: string) {
    const gameId = parseInt(id);
    if (isNaN(gameId)) {
      throw new HttpException('Invalid game ID', HttpStatus.BAD_REQUEST);
    }
    return this.gamesService.deleteGame(gameId);
  }
}
