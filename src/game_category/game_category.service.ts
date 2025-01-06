import { Injectable } from '@nestjs/common';
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

  async getAllGameCategories(): Promise<GameCategoryEntity[]> {
    try {
      const gameCategories = await this.gameCategoryRepository.find();
      return gameCategories;
    } catch (err) {
      throw new Error(err);
    }
  }

  async getGameCategory(id: number): Promise<GameCategoryEntity> {
    try {
      const gameCategory = await this.gameCategoryRepository.findOne({
        where: { id_game_category: id },
      });
      if (!gameCategory) {
        throw new Error('Game category not found');
      }
      return gameCategory;
    } catch (err) {
      throw new Error(err);
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
      throw new Error(err);
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
        throw new Error('Game category not found');
      }
      Object.assign(gameCategory, updateGameCategoryDto);
      await this.gameCategoryRepository.save(gameCategory);
      return gameCategory;
    } catch (err) {
      throw new Error(err);
    }
  }

  async deleteGameCategory(id: number): Promise<void> {
    try {
      await this.gameCategoryRepository.delete(id);
    } catch (err) {
      throw new Error(err);
    }
  }
}
