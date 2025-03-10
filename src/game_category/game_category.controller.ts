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
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
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
  async getAllGameCategories() {
    try {
      return await this.gameCategoryService.getAllGameCategories();
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
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
