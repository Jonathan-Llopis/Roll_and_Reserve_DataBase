import {
  Injectable,
  NotFoundException,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DifficultyEntity } from './difficulty.entity';
import { CreateDifficultyDto, UpdateDifficultyDto } from './difficulty.dto';

@Injectable()
export class DifficultyService {
  /**
   * DifficultyService constructor.
   * @param difficultyRepository The TypeORM repository for the DifficultyEntity.
   */
  constructor(
    @InjectRepository(DifficultyEntity)
    private readonly difficultyRepository: Repository<DifficultyEntity>,
  ) {}

  /**
   * DOC: Get All Difficulties
   * Method: GET /difficulties
   * Description: Retrieves all difficulty levels in the system.
   * Input Parameters: None
   * Example Request: None
   * HTTP Responses:
   * - `200 OK`: { "id_difficulty": 1, "description": "Easy", "difficulty_rate": 10 },
   * - `204 No Content`: No difficulties found.
   * - `400 Bad Request`: Invalid input data.
   * - `401 Unauthorized`: Unauthorized.
   */
  async getAllDifficulties(): Promise<DifficultyEntity[]> {
    try {
      const difficulties = await this.difficultyRepository.find();
      if (difficulties.length === 0) {
        throw new HttpException('No Content', HttpStatus.NO_CONTENT);
      }
      return difficulties;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * DOC: Get Difficulty by ID
   * Method: GET /difficulties/:id
   * Description: Retrieves a difficulty level by its ID.
   * Input Parameters:
   * - `id` (number, required, path): The ID of the difficulty.
   * Example Request: None
   * HTTP Responses:
   * - `200 OK`: { "id_difficulty": 1, "description": "Easy", "difficulty_rate": 10 }
   * - `400 Bad Request`: Invalid difficulty ID.
   * - `401 Unauthorized`: Unauthorized.
   * - `404 Not Found`: Difficulty not found.
   */
  async getDifficulty(id: number): Promise<DifficultyEntity> {
    try {
      const difficulty = await this.difficultyRepository.findOne({
        where: { id_difficulty: id },
      });
      if (!difficulty) {
        throw new NotFoundException('Difficulty not found');
      }
      return difficulty;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * DOC: Create Difficulty
   * Method: POST /difficulties
   * Description: Creates a new difficulty level in the system.
   * Input Parameters:
   * - `createDifficultyDto` (CreateDifficultyDto, required, body): Object containing difficulty details.
   *   - `description` (string, required): The description of the difficulty (1 to 500 characters).
   *   - `difficulty_rate` (number, required): The difficulty rate, ranging from 0 to 100.
   * Example Request (JSON format):
   * {
   *   "description": "Hard",
   *   "difficulty_rate": 90
   * }
   * HTTP Responses:
   * - `201 Created`: { "id_difficulty": 1, "description": "Hard", "difficulty_rate": 90 }
   * - `400 Bad Request`: Invalid input data.
   * - `401 Unauthorized`: Unauthorized.
   */
  async createDifficulty(
    createDifficultyDto: CreateDifficultyDto,
  ): Promise<DifficultyEntity> {
    try {
      const difficulty = this.difficultyRepository.create(createDifficultyDto);
      await this.difficultyRepository.save(difficulty);
      return difficulty;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * DOC: Update Difficulty
   * Method: PUT /difficulties/:id
   * Description: Updates an existing difficulty level in the system.
   * Input Parameters:
   * - `id` (string, required, path): The ID of the difficulty to be updated.
   * - `updateDifficultyDto` (UpdateDifficultyDto, required, body): Object containing the updated difficulty details.
   *   - `description` (string, optional): The new description of the difficulty (1 to 500 characters).
   *   - `difficulty_rate` (number, optional): The new difficulty rate, ranging from 0 to 100.
   * Example Request (JSON format):
   * {
   *   "description": "Hard",
   *   "difficulty_rate": 90
   * }
   * HTTP Responses:
   * - `200 OK`: { "id_difficulty": 1, "description": "Hard", "difficulty_rate": 90 }
   * - `400 Bad Request`: Invalid difficulty ID or input data.
   * - `401 Unauthorized`: Unauthorized.
   * - `404 Not Found`: Difficulty not found.
   */

  async updateDifficulty(
    updateDifficultyDto: UpdateDifficultyDto,
    id: number,
  ): Promise<DifficultyEntity> {
    try {
      const difficulty = await this.difficultyRepository.findOne({
        where: { id_difficulty: id },
      });
      if (!difficulty) {
        throw new NotFoundException('Difficulty not found');
      }
      this.difficultyRepository.merge(difficulty, updateDifficultyDto);
      await this.difficultyRepository.save(difficulty);
      return difficulty;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * DOC: Delete Difficulty
   * Method: DELETE /difficulties/:id
   * Description: Deletes an existing difficulty level in the system.
   * Input Parameters:
   * - `id` (string, required): The ID of the difficulty to be deleted.
   * Example Request: None
   * HTTP Responses:
   * - `200 OK`: Successfully deleted the difficulty.
   * - `400 Bad Request`: Invalid difficulty ID.
   * - `401 Unauthorized`: Unauthorized.
   * - `404 Not Found`: Difficulty not found.
   */
  async deleteDifficulty(id: number): Promise<void> {
    try {
      const result = await this.difficultyRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException('Difficulty not found');
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
