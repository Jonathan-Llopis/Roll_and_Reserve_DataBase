import { Injectable } from '@nestjs/common';
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

  async getAllDifficulties(): Promise<DifficultyEntity[]> {
    try {
      const difficulties = await this.difficultyRepository.find();
      return difficulties;
    } catch (err) {
      throw new Error(err);
    }
  }

  async getDifficulty(id: number): Promise<DifficultyEntity> {
    try {
      const difficulty = await this.difficultyRepository.findOne({
        where: { id_difficulty: id },
      });
      if (!difficulty) {
        throw new Error('Difficulty not found');
      }
      return difficulty;
    } catch (err) {
      throw new Error(err);
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
      throw new Error(err);
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
        throw new Error('Difficulty not found');
      }
      Object.assign(difficulty, updateDifficultyDto);
      await this.difficultyRepository.save(difficulty);
      return difficulty;
    } catch (err) {
      throw new Error(err);
    }
  }

  async deleteDifficulty(id: number): Promise<void> {
    try {
      await this.difficultyRepository.delete(id);
    } catch (err) {
      throw new Error(err);
    }
  }
}
