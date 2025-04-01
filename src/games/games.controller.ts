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
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GamesService } from './games.service';
import { CreateGameDto, UpdateGameDto } from './games.dto';

@ApiTags('Games')
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new game' })
  @ApiResponse({ status: 201, description: 'Game created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  /**
   * DOC: Create a new game
   * Method: POST /games
   * Description: Creates a new game with the provided details.
   * Input Parameters:
   * - `name` (string, required): The name of the game.
   * - `description` (string, required): A description of the game.
   * - `category_name` (string, optional): The category name of the game.
   * - `bgg_id` (number, required): The Board Game Geek ID.
   * Example Request (JSON format):
   * {
   *   "name": "Chess",
   *   "description": "A strategic board game",
   *   "category_name": "Strategy",
   *   "bgg_id": 123
   * }
   * HTTP Responses:
   * - `201 Created`: Game created successfully. Example:
   *   {
   *     "id_game": 1,
   *     "name": "Chess",
   *     "description": "A strategic board game",
   *     "category": "Strategy",
   *     "bgg_id": 123
   *   }
   * - `400 Bad Request`: Invalid input data.
   * - `401 Unauthorized`: Unauthorized access.
   */
  createGame(@Body() createGameDto: CreateGameDto) {
    return this.gamesService.createGame(createGameDto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a game by ID' })
  @ApiParam({
    name: 'id',
    description: 'ID of the game',
    type: 'string',
    example: '1',
  })
  @ApiResponse({ status: 200, description: 'Game updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid game ID or input.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Game not found.' })
  /**
   * DOC: Update a game by ID
   * Method: PUT /games/:id
   * Description: Update a game with the provided details.
   * Input Parameters:
   * - `id` (string, required): The ID of the game.
   * - `name` (string, optional): The new name of the game.
   * - `description` (string, optional): The new description of the game.
   * - `category_name` (string, optional): The new category name of the game.
   * - `bgg_id` (number, optional): The new Board Game Geek ID.
   * Example Request (JSON format):
   * {
   *   "name": "Chess",
   *   "description": "A strategic board game",
   *   "category_name": "Strategy",
   *   "bgg_id": 123
   * }
   * HTTP Responses:
   * - `200 OK`: Game updated successfully. Example:
   *   {
   *     "id_game": 1,
   *     "name": "Chess",
   *     "description": "A strategic board game",
   *     "category": "Strategy",
   *     "bgg_id": 123
   *   }
   * - `400 Bad Request`: Invalid game ID or input data.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: Game not found.
   */
  updateGame(@Param('id') id: string, @Body() updateGameDto: UpdateGameDto) {
    const gameId = parseInt(id);
    if (isNaN(gameId)) {
      throw new HttpException('Invalid game ID', HttpStatus.BAD_REQUEST);
    }
    return this.gamesService.updateGame(updateGameDto, gameId);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all games' })
  @ApiResponse({ status: 200, description: 'Games retrieved successfully.' })
  @ApiResponse({ status: 204, description: 'No content.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  /**
   * Retrieves all games.
   * Method: GET /games
   * HTTP Responses:
   * - `200 OK`: Games retrieved successfully. Example:
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
   *       "name": "Checkers",
   *       "description": "A two-player board game",
   *       "category": "Strategy",
   *       "bgg_id": 456
   *     }
   *   ]
   * - `204 No Content`: No games found.
   * - `400 Bad Request`: Invalid input data.
   * - `401 Unauthorized`: Unauthorized access.
   */
  getAllGames() {
    return this.gamesService.getAllGames();
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a game by ID' })
  @ApiParam({
    name: 'id',
    description: 'ID of the game',
    type: 'string',
    example: '1',
  })
  @ApiResponse({ status: 200, description: 'Game retrieved successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid game ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Game not found.' })
  /**
   * Retrieves a game by ID.
   * Method: GET /games/:id
   * HTTP Responses:
   * - `200 OK`: Game retrieved successfully. Example:
   *   {
   *     "id_game": 1,
   *     "name": "Chess",
   *     "description": "A strategic board game",
   *     "category": "Strategy",
   *     "bgg_id": 123
   *   }
   * - `400 Bad Request`: Invalid game ID.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: Game not found.
   */
  getGame(@Param('id') gameId: number) {
    return this.gamesService.getGame(gameId);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a game by ID' })
  @ApiParam({
    name: 'id',
    description: 'ID of the game',
    type: 'string',
    example: '1',
  })
  @ApiResponse({ status: 200, description: 'Game deleted successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid game ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Game not found.' })
  /**
   * Deletes a game by ID.
   * Method: DELETE /games/:id
   * Description: Deletes a game with the given ID.
   * Input Parameters:
   * - `id` (number, required): The ID of the game.
   * HTTP Responses:
   * - `204 No Content`: Game deleted successfully.
   * - `400 Bad Request`: Invalid game ID.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: Game not found.
   */
  deleteGame(@Param('id') id: string) {
    const gameId = parseInt(id);
    if (isNaN(gameId)) {
      throw new HttpException('Invalid game ID', HttpStatus.BAD_REQUEST);
    }
    return this.gamesService.deleteGame(gameId);
  }
  @Get('search/:name')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search games by name' })
  @ApiParam({
    name: 'name',
    description: 'Name of the game',
    type: 'string',
    example: 'Chess',
  })
  @ApiResponse({ status: 200, description: 'Games retrieved successfully.' })
  @ApiResponse({ status: 204, description: 'No content.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  searchGameByName(@Param('name') name: string) {
    return this.gamesService.searchGameByName(name);
  }
}
