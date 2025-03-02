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
  constructor(
    @InjectRepository(DifficultyEntity)
    private readonly difficultyRepository: Repository<DifficultyEntity>,
  ) {}

  private handleError(err: any) {
    if (err instanceof HttpException) {
      throw err;
    }
    throw new HttpException('Request failed', HttpStatus.BAD_REQUEST);
  }

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
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
