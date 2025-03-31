import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GameCategoryService } from './game_category.service';
import {
  CreateGameCategoryDto,
  UpdateGameCategoryDto,
} from './game_category.dto';

@ApiTags('Game_Category')
@Controller('game-category')
export class GameCategoryController {
  constructor(private readonly gameCategoryService: GameCategoryService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new game category' })
  @ApiResponse({
    status: 201,
    description: 'Game category successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiBody({
    type: CreateGameCategoryDto,
    description: 'Data to create a new game category',
  })
  /**
   * Create a new game category.
   * Method: POST /game-category
   * Description: Create a new game category.
   * Input Parameters:
   * - `description` (string, required): The description of the game category.
   * Example Request (JSON format):
   * {
   *   "description": "Puzzle"
   * }
   * HTTP Responses:
   * - `201 Created`: The newly created game category. Example:
   * {
   *   "id_game_category": 1,
   *   "description": "Puzzle"
   * }
   * - `400 Bad Request`: Invalid input data.
   * - `401 Unauthorized`: Unauthorized.
   */
  async createGameCategory(
    @Body() createGameCategoryDto: CreateGameCategoryDto,
  ) {
    try {
      return await this.gameCategoryService.createGameCategory(
        createGameCategoryDto,
      );
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

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a game category by ID' })
  @ApiResponse({
    status: 200,
    description: 'Game category successfully updated.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid game category ID or input data.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Game category not found.' })
  @ApiParam({ name: 'id', description: 'ID of the game category', example: 1 })
  @ApiBody({
    type: UpdateGameCategoryDto,
    description: 'Data to update the game category',
  })
  /**
   * Updates an existing game category by ID.
   * Method: PUT /game-category/:id
   * Description: Updates the details of a game category.
   * Input Parameters:
   * - `id` (string, required): The ID of the game category to update.
   * - `updateGameCategoryDto` (UpdateGameCategoryDto, required): The data to update the game category.
   * Example Request (JSON format):
   * {
   *   "description": "Updated Description"
   * }
   * HTTP Responses:
   * - `200 OK`: The updated game category.
   * - `400 Bad Request`: Invalid game category ID or input data.
   * - `401 Unauthorized`: Unauthorized.
   * - `404 Not Found`: Game category not found.
   */

  async updateGameCategory(
    @Param('id') id: string,
    @Body() updateGameCategoryDto: UpdateGameCategoryDto,
  ) {
    const gameCategoryId = parseInt(id);
    if (isNaN(gameCategoryId)) {
      throw new HttpException(
        'Invalid game category ID',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      return await this.gameCategoryService.updateGameCategory(
        updateGameCategoryDto,
        gameCategoryId,
      );
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'Game category not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Failed to update game category',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all game categories' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all game categories.',
  })
  @ApiResponse({ status: 204, description: 'No content.' })
  @ApiResponse({
    status: 400,
    description: 'Failed to retrieve game categories.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
/**
 * DOC: Retrieve All Game Categories
 * Method: GET /game-category
 * Description: Fetches all game categories from the database and returns them. If no categories exist, a 'No Content' status is returned.
 * Input Parameters: None
 * Example Request (JSON format): None
 * HTTP Responses:
 * - `200 OK`: Successfully retrieved all game categories. Example:
 *   [
 *     {
 *       "id_game_category": 1,
 *       "description": "Action"
 *     },
 *     {
 *       "id_game_category": 2,
 *       "description": "Adventure"
 *     }
 *   ]
 * - `204 No Content`: No game categories available.
 * - `400 Bad Request`: Failed to retrieve game categories due to a server error.
 */

  async getAllGameCategories() {
    try {
      return await this.gameCategoryService.getAllGameCategories();
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

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a game category by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the game category.',
  })
  @ApiResponse({ status: 400, description: 'Invalid game category ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Game category not found.' })
  @ApiParam({ name: 'id', description: 'ID of the game category', example: 1 })
/**
 * DOC: Retrieve a Game Category by ID
 * Method: GET /game-category/:id
 * Description: Retrieves a game category by its ID.
 * Input Parameters:
 * - `id` (number, required): The ID of the game category.
 * Example Request (JSON format): None
 * HTTP Responses:
 * - `200 OK`: Successfully retrieved the game category. Example:
 *   {
 *     "id_game_category": 1,
 *     "description": "Action"
 *   }
 * - `400 Bad Request`: Invalid game category ID.
 * - `401 Unauthorized`: Unauthorized.
 * - `404 Not Found`: Game category not found.
 */
  async getGameCategory(@Param('id') id: string) {
    const gameCategoryId = parseInt(id);
    if (isNaN(gameCategoryId)) {
      throw new HttpException(
        'Invalid game category ID',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      return await this.gameCategoryService.getGameCategory(gameCategoryId);
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'Game category not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Failed to retrieve game category',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a game category by ID' })
  @ApiResponse({
    status: 200,
    description: 'Game category successfully deleted.',
  })
  @ApiResponse({ status: 400, description: 'Invalid game category ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Game category not found.' })
  @ApiParam({ name: 'id', description: 'ID of the game category', example: 1 })
/**
 * Deletes a game category by its ID.
 * 
 * Method: DELETE /game-category/:id
 * 
 * Input Parameters:
 * - `id` (string, required): The ID of the game category to delete.
 * 
 * HTTP Responses:
 * - `200 OK`: Game category successfully deleted.
 * - `400 Bad Request`: Invalid game category ID or failed to delete.
 * - `404 Not Found`: Game category not found.
 * - `401 Unauthorized`: Unauthorized.
 */

  async deleteGameCategory(@Param('id') id: string) {
    const gameCategoryId = parseInt(id);
    if (isNaN(gameCategoryId)) {
      throw new HttpException(
        'Invalid game category ID',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      return await this.gameCategoryService.deleteGameCategory(gameCategoryId);
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'Game category not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Failed to delete game category',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
