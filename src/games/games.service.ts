import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpStatus,
  HttpException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateGameDto, UpdateGameDto } from './games.dto';
import { GamesEntity } from './games.entitiy';
import { HttpService } from '../http/http.service';
import { GameCategoryEntity } from '../game_category/game_category.entity';
import { GameCategoryService } from 'src/game_category/game_category.service';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(GamesEntity)
    private readonly gameRepository: Repository<GamesEntity>,
    @InjectRepository(GameCategoryEntity)
    private readonly gameCategoryRepository: Repository<GameCategoryEntity>,
    private readonly gameCategoryService: GameCategoryService,
    @Inject('Bgg-Api')
    private readonly httpService: HttpService,
  ) { }

  private handleError(err: any) {
    if (err instanceof HttpException) {
      throw err;
    }
    console.error(err);
    throw new BadRequestException('An unexpected error occurred');
  }

  async getAllGames(): Promise<GamesEntity[]> {
    try {
      const games = await this.gameRepository.find({
        relations: ['gameCategory'],
      });
      if (games.length === 0) {
        throw new HttpException('No Content', HttpStatus.NO_CONTENT);
      }
      return games;
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

  async getGame(gameId: number): Promise<GamesEntity> {
    try {
      const game = await this.gameRepository.findOne({
        where: { id_game: gameId },
        relations: ['gameCategory'],
      });
      if (!game) {
        throw new NotFoundException('Game not found');
      }
      return game;
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

  async createGame(createGameDto: CreateGameDto): Promise<GamesEntity> {
    try {
      const game = this.gameRepository.create(createGameDto);
      let gameCategory = await this.gameCategoryRepository.findOne({
        where: { description: createGameDto.category_name },
      });
      if (createGameDto.category_name && !gameCategory) {
        gameCategory = await this.gameCategoryService.createGameCategory({
          description: createGameDto.category_name,
        });
      }
      if (gameCategory) {
        game.gameCategory = gameCategory;
      } else {
        throw new BadRequestException('Invalid category name');
      }

      await this.gameRepository.save(game);

      return game;
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
      const gameCategory = await this.gameCategoryRepository.findOne({
        where: { description: updateGameDto.category_name },
      });
      if (updateGameDto.category_name && !gameCategory) {
        this.gameCategoryService.createGameCategory({
          description: updateGameDto.category_name,
        });
      }
      game.gameCategory = gameCategory;
      this.gameRepository.merge(game, updateGameDto);
      await this.gameRepository.save(game);
      return game;
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

  async deleteGame(id: number): Promise<void> {
    try {
      const result = await this.gameRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException('Game not found');
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
  async searchGameByName(name: string): Promise<GamesEntity[]> {
    try {
      let games: GamesEntity[] = [];
      if (name == 'all') {
        games = await this.gameRepository.find({
          relations: ['gameCategory'],
        });
      } else {
        games = await this.gameRepository.find({
          where: { name: Like(`%${name}%`) },
          relations: ['gameCategory'],
        });
      }

      if (games.length === 0) {
        let externalGames;
        try {
            externalGames = await this.httpService.get(
              'http://localhost:8070/bgg-api/api/v5/search/boardgame',
              {
              params: { q: name, showcount: 20 },
              headers: { accept: 'application/json' },
              },
            );
        } catch (error) {
          if (error.code === 'ECONNREFUSED') {
            console.error('Connection refused to external API');
            throw new HttpException(
              'External API is not reachable',
              HttpStatus.SERVICE_UNAVAILABLE,
            );
          }
          throw error;
        }
        const externalGamesData = externalGames.data as { items: any[] };
        if (
          externalGamesData &&
          externalGamesData.items &&
          externalGamesData.items.length > 0
        ) {
          return externalGamesData.items.map((item) => ({
            id_game: item.objectid,
            name: item.name,
            image: item.image,
            description: '',
            gameCategory: null,
            shop: null,
            game_reserve: null,
          }));
        }
        throw new NotFoundException('No games found with the given name');
      }
      return games;
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
