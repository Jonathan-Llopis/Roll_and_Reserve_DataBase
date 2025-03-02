import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameCategoryEntity } from './game_category.entity';
import {
  CreateGameCategoryDto,
  UpdateGameCategoryDto,
} from './game_category.dto';

@Injectable()
export class GameCategoryService {
  constructor(
    @InjectRepository(GameCategoryEntity)
    private readonly gameCategoryRepository: Repository<GameCategoryEntity>,
  ) {}

  private handleError(err: any) {
    if (err instanceof HttpException) {
      throw err;
    }
    throw new HttpException('Request failed', HttpStatus.BAD_REQUEST);
  }

  async getAllGameCategories(): Promise<GameCategoryEntity[]> {
    try {
      const gameCategories = await this.gameCategoryRepository.find();
      if (gameCategories.length === 0) {
        throw new HttpException('No Content', HttpStatus.NO_CONTENT);
      }
      return gameCategories;
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

  async getGameCategory(id: number): Promise<GameCategoryEntity> {
    try {
      const gameCategory = await this.gameCategoryRepository.findOne({
        where: { id_game_category: id },
      });
      if (!gameCategory) {
        throw new NotFoundException('Game category not found');
      }
      return gameCategory;
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

  async createGameCategory(
    createGameCategoryDto: CreateGameCategoryDto,
  ): Promise<GameCategoryEntity> {
    try {
      const gameCategory = this.gameCategoryRepository.create(
        createGameCategoryDto,
      );
      await this.gameCategoryRepository.save(gameCategory);
      return gameCategory;
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

  async updateGameCategory(
    updateGameCategoryDto: UpdateGameCategoryDto,
    id: number,
  ): Promise<GameCategoryEntity> {
    try {
      const gameCategory = await this.gameCategoryRepository.findOne({
        where: { id_game_category: id },
      });
      if (!gameCategory) {
        throw new NotFoundException('Game category not found');
      }
      this.gameCategoryRepository.merge(gameCategory, updateGameCategoryDto);
      await this.gameCategoryRepository.save(gameCategory);
      return gameCategory;
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

  async deleteGameCategory(id: number): Promise<void> {
    try {
      const result = await this.gameCategoryRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException('Game category not found');
      }
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
}
