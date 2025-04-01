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
import { GameCategoryService } from '../game_category/game_category.service';

@Injectable()
export class GamesService {
  /**
   * Service constructor.
   * @param gameRepository The game repository.
   * @param gameCategoryRepository The game category repository.
   * @param gameCategoryService The game category service.
   * @param httpService The HTTP client for BGG API.
   */
  constructor(
    @InjectRepository(GamesEntity)
    private readonly gameRepository: Repository<GamesEntity>,
    @InjectRepository(GameCategoryEntity)
    private readonly gameCategoryRepository: Repository<GameCategoryEntity>,
    private readonly gameCategoryService: GameCategoryService,
    @Inject('Bgg-Api')
    private readonly httpService: HttpService,
  ) {}

  /**
   * Throws an HttpException for the given error, or a default BAD_REQUEST
   * error if the given error is not an HttpException.
   *
   * @param err - The error to throw.
   */
  private handleError(err: any) {
    if (err instanceof HttpException) {
      throw err;
    }
    console.error(err);
    throw new BadRequestException('An unexpected error occurred');
  }

  /**
   * DOC: Retrieve All Games
   * Method: GET /games
   * Description: Fetches all games from the database including their associated game categories.
   * Input Parameters: None
   * Example Request (JSON format): None
   * HTTP Responses:
   * - `200 OK`: The list of all games with their categories. Example:
   *   [
   *     {
   *       "id_game": 1,
   *       "name": "Chess",
   *       "description": "A strategic board game",
   *       "bgg_id": 123,
   *       "gameCategory": { "id_game_category": 1, "description": "Strategy" }
   *     }
   *   ]
   * - `204 No Content`: No games found in the database.
   * - `400 Bad Request`: An unexpected error occurred.
   */

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
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Retrieves a game by its ID.
   * Method: GET /games/:id
   * Description: Fetches a game from the database using the provided game ID,
   * including its associated game category information.
   * Input Parameters:
   * - `gameId` (number, required): The ID of the game to retrieve.
   * HTTP Responses:
   * - `200 OK`: The game details. Example:
   *   {
   *     "id_game": 1,
   *     "name": "Chess",
   *     "description": "A strategic board game",
   *     "bgg_id": 123,
   *     "gameCategory": { "id_game_category": 1, "description": "Strategy" }
   *   }
   * - `404 Not Found`: Game not found.
   * - `400 Bad Request`: An unexpected error occurred.
   */

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
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
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
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * DOC: Update a game by ID
   * Method: PUT /games/:id
   * Description: Updates a game with the provided details.
   * Input Parameters:
   * - `id` (number, required): The ID of the game.
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
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Deletes a game by ID.
   * Method: DELETE /games/:id
   * Description: Deletes a game with the given ID.
   * Input Parameters:
   * - `id` (number, required): The ID of the game.
   * HTTP Responses:
   * - `204 No Content`: Game deleted successfully.
   * - `400 Bad Request`: Invalid game ID or input data.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: Game not found.
   */
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
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }
  /**
   * DOC: Search games by name
   * Method: GET /games/search
   * Description: Searches for games by name. If no local games are found, it queries an external API.
   * Input Parameters:
   * - `name` (string, required): The name of the game to search for. Use 'all' to retrieve all games.
   * Example Request (JSON format):
   * {
   *   "name": "Chess"
   * }
   * HTTP Responses:
   * - `200 OK`: Games retrieved successfully. Example:
   *   [
   *     {
   *       "id_game": 1,
   *       "name": "Chess",
   *       "image": "image_url",
   *       "description": "",
   *       "bgg_id": 1,
   *       "gameCategory": null,
   *       "shop": null,
   *       "game_reserve": null
   *     }
   *   ]
   * - `404 Not Found`: No games found with the given name.
   * - `503 Service Unavailable`: External API is not reachable.
   * - `400 Bad Request`: Unexpected error occurred.
   */

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
            'http://bgg-api:80/bgg-api/api/v5/search/boardgame',
            {
              params: { q: name, showcount: 20 },
              headers: { accept: 'application/json' },
            },
          );
        } catch (error) {
          if (error.code === 'ECONNREFUSED') {
            console.error('Connection refused to external API');
            console.error('Error:', error);
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
            bgg_id: item.objectid,
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
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }
}
