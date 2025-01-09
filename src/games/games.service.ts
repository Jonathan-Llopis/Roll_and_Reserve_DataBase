import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGameDto, UpdateGameDto } from './game.dto';
import { GamesEntity } from './game.entitiy';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(GamesEntity)
    private readonly gameRepository: Repository<GamesEntity>,
  ) {}

  async getAllGames(): Promise<GamesEntity[]> {
    try {
      const games = await this.gameRepository.find({
        relations: ['difficulty_of_game', 'category_of_game'],
      });
      return games;
    } catch (err) {
      throw new Error(err);
    }
  }

  async getGame(id: number): Promise<GamesEntity> {
    try {
      const game = await this.gameRepository.findOne({
        where: { id_game: id },
        relations: ['difficulty_of_game', 'category_of_game'],
      });
      if (!game) {
        throw new Error('Game not found');
      }
      return game;
    } catch (err) {
      throw new Error(err);
    }
  }

  async createGame(createGameDto: CreateGameDto): Promise<GamesEntity> {
    try {
      const game = this.gameRepository.create(createGameDto);
      await this.gameRepository.save(game);
      return game;
    } catch (err) {
      throw new Error(err);
    }
  }

  async updateGame(
    updateGameDto: UpdateGameDto,
    id: number,
  ): Promise<GamesEntity> {
    try {
      const game = await this.gameRepository.findOne({
        where: { id_game: id },
      });
      if (!game) {
        throw new Error('Game not found');
      }
      Object.assign(game, updateGameDto);
      await this.gameRepository.save(game);
      return game;
    } catch (err) {
      throw new Error(err);
    }
  }

  async deleteGame(id: number): Promise<void> {
    try {
      await this.gameRepository.delete(id);
    } catch (err) {
      throw new Error(err);
    }
  }
}
