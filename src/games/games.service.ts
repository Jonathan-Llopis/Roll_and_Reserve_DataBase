import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateGameDto, UpdateGameDto } from './games.dto';
import { GamesEntity } from './games.entitiy';
import axios from 'axios';


const uri = 'https://api.rawg.io/api/games';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(GamesEntity)
    private readonly gameRepository: Repository<GamesEntity>,
  ) {}
  
  

  private handleError(err: any) {
    if (err instanceof HttpException) {
      throw err;
    }
    throw new BadRequestException('An unexpected error occurred');
  }

  async getAllGames(): Promise<GamesEntity[]> {
    try {
      const games = await this.gameRepository.find({
        relations: ['difficulty_of_game'],
      });
      if (games.length === 0) {
        throw new HttpException('No Content', HttpStatus.NO_CONTENT);
      }
      return games;
    } catch (err) {
      this.handleError(err);
    }
  }

  async getGame(gameName: string): Promise<GamesEntity> {
    try {
      const game = await this.gameRepository.findOne({
        where: { name: Like(`%${gameName}%`) },
        relations: ['difficulty_of_game'],
      });
      if (!game) {
        const response = await axios.post(uri, gameName);
      return response.data;
        throw new NotFoundException('Game not found');
      }
      return game;
    } catch (err) {
      this.handleError(err);
    }
  }

  async createGame(createGameDto: CreateGameDto): Promise<GamesEntity> {
    try {
      const game = this.gameRepository.create(createGameDto);
      await this.gameRepository.save(game);
      return game;
    } catch (err) {
      this.handleError(err);
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
        throw new NotFoundException('Game not found');
      }
      this.gameRepository.merge(game, updateGameDto);
      await this.gameRepository.save(game);
      return game;
    } catch (err) {
      this.handleError(err);
    }
  }

  async deleteGame(id: number): Promise<void> {
    try {
      const result = await this.gameRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException('Game not found');
      }
    } catch (err) {
      this.handleError(err);
    }
  }
}
