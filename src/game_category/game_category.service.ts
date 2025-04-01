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
  /**
   * Service constructor.
   * @param gameCategoryRepository The game category repository.
   */
  constructor(
    @InjectRepository(GameCategoryEntity)
    private readonly gameCategoryRepository: Repository<GameCategoryEntity>,
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
    throw new HttpException('Request failed', HttpStatus.BAD_REQUEST);
  }

  /**
   * Returns all game categories in the database.
   * Method: GET /game-category
   * Description: Retrieve all game categories from the database.
   * Input Parameters: None
   * Example Request (JSON format): None
   * HTTP Responses:
   * - `200 OK`: The list of all game categories. Example:
   * [
   *   {
   *     "id_game_category": 1,
   *     "description": "Action",
   *     "game_category": []
   *   },
   *   {
   *     "id_game_category": 2,
   *     "description": "Adventure",
   *     "game_category": []
   *   }
   * ]
   * - `204 No Content`: No game categories found.
   * - `400 Bad Request`: Bad request.
   * - `500 Internal Server Error`: Server error.
   */
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
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Retrieve a game category by its ID.
   * Method: GET /game-category/:id
   * Description: Retrieves a game category by its ID.
   * Input Parameters:
   * - `id` (number, required): The ID of the game category.
   * Example Request (JSON format): None
   * HTTP Responses:
   * - `200 OK`: The game category. Example:
   * {
   *   "id_game_category": 1,
   *   "description": "Action",
   *   "game_category": []
   * }
   * - `404 Not Found`: Game category not found.
   * - `400 Bad Request`: Invalid game category ID.
   * - `500 Internal Server Error`: Server error.
   */
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
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Create a new game category.
   * Method: POST /game-category
   * Description: Creates a new game category.
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
   * - `500 Internal Server Error`: Server error.
   */
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
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Updates a game category with the given ID.
   * Method: PUT /game-category/:id
   * Description: Updates a game category with the given ID.
   * Input Parameters:
   * - `id` (number, required): The ID of the game category.
   * - `description` (string, optional): The new description of the game category.
   * Example Request (JSON format):
   * {
   *   "description": "Updated description"
   * }
   * HTTP Responses:
   * - `200 OK`: The updated game category. Example:
   * {
   *   "id_game_category": 1,
   *   "description": "Updated description",
   *   "game_category": []
   * }
   * - `404 Not Found`: Game category not found.
   * - `400 Bad Request`: Invalid input data.
   * - `500 Internal Server Error`: Server error.
   */
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
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Deletes a game category.
   * Method: DELETE /game-category/:id
   * Description: Deletes a game category by its ID.
   * Input Parameters:
   * - `id` (number, required): The ID of the game category.
   * HTTP Responses:
   * - `204 No Content`: Successfully deleted the game category.
   * - `404 Not Found`: Game category not found.
   * - `400 Bad Request`: Invalid game category ID.
   * - `500 Internal Server Error`: Server error.
   */
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
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }
}
