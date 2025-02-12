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
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { GamesService } from './games.service';
import { CreateGameDto, UpdateGameDto } from './games.dto';

@ApiTags('Games')
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all games' })
  @ApiResponse({ status: 200, description: 'Games retrieved successfully.' })
  @ApiResponse({ status: 204, description: 'No content.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  getAllGames() {
    return this.gamesService.getAllGames();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a game by ID' })
  @ApiParam({ name: 'id', description: 'ID of the game', type: 'string', example: '1' })
  @ApiResponse({ status: 200, description: 'Game retrieved successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid game ID.' })
  @ApiResponse({ status: 404, description: 'Game not found.' })
  getGame(@Param('id') id: string) {
    const gameId = parseInt(id);
    if (isNaN(gameId)) {
      throw new HttpException('Invalid game ID', HttpStatus.BAD_REQUEST);
    }
    return this.gamesService.getGame(gameId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new game' })
  @ApiResponse({ status: 201, description: 'Game created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  createGame(@Body() createGameDto: CreateGameDto) {
    return this.gamesService.createGame(createGameDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a game by ID' })
  @ApiParam({ name: 'id', description: 'ID of the game', type: 'string', example: '1' })
  @ApiResponse({ status: 200, description: 'Game updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid game ID or input.' })
  @ApiResponse({ status: 404, description: 'Game not found.' })
  updateGame(@Param('id') id: string, @Body() updateGameDto: UpdateGameDto) {
    const gameId = parseInt(id);
    if (isNaN(gameId)) {
      throw new HttpException('Invalid game ID', HttpStatus.BAD_REQUEST);
    }
    return this.gamesService.updateGame(updateGameDto, gameId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a game by ID' })
  @ApiParam({ name: 'id', description: 'ID of the game', type: 'string', example: '1' })
  @ApiResponse({ status: 200, description: 'Game deleted successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid game ID.' })
  @ApiResponse({ status: 404, description: 'Game not found.' })
  deleteGame(@Param('id') id: string) {
    const gameId = parseInt(id);
    if (isNaN(gameId)) {
      throw new HttpException('Invalid game ID', HttpStatus.BAD_REQUEST);
    }
    return this.gamesService.deleteGame(gameId);
  }
}
