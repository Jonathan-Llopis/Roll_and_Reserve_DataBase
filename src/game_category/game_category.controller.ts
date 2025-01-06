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
import { GameCategoryService } from './game_category.service';
import {
  CreateGameCategoryDto,
  UpdateGameCategoryDto,
} from './game_category.dto';

@Controller('game-category')
export class GameCategoryController {
  constructor(private readonly gameCategoryService: GameCategoryService) {}

  @Get()
  getAllGameCategories() {
    try {
      return this.gameCategoryService.getAllGameCategories();
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
  getGameCategory(@Param('id') id: string) {
    const gameCategoryId = parseInt(id);
    if (isNaN(gameCategoryId)) {
      throw new HttpException(
        'Invalid game category ID',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.gameCategoryService.getGameCategory(gameCategoryId);
  }

  @Post()
  createGameCategory(@Body() createGameCategoryDto: CreateGameCategoryDto) {
    return this.gameCategoryService.createGameCategory(createGameCategoryDto);
  }

  @Put(':id')
  updateGameCategory(
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
    return this.gameCategoryService.updateGameCategory(
      updateGameCategoryDto,
      gameCategoryId,
    );
  }

  @Delete(':id')
  deleteGameCategory(@Param('id') id: string) {
    const gameCategoryId = parseInt(id);
    if (isNaN(gameCategoryId)) {
      throw new HttpException(
        'Invalid game category ID',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.gameCategoryService.deleteGameCategory(gameCategoryId);
  }
}
