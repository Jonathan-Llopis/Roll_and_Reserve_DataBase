import { Test, TestingModule } from '@nestjs/testing';
import { DifficultyService } from './difficulty.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DifficultyEntity } from './difficulty.entity';
import { NotFoundException, HttpException } from '@nestjs/common';

describe('DifficultyService', () => {
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });
  let service: DifficultyService;
  let repository: Repository<DifficultyEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DifficultyService,
        {
          provide: getRepositoryToken(DifficultyEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<DifficultyService>(DifficultyService);
    repository = module.get<Repository<DifficultyEntity>>(
      getRepositoryToken(DifficultyEntity),
    );
  });

  it('should return all difficulties', async () => {
    const mockDifficulties = [
      {
        id_difficulty: 1,
        description: 'Easy',
        difficulty_rate: 10,
        info_difficulty: null,
      },
      {
        id_difficulty: 2,
        description: 'Medium',
        difficulty_rate: 50,
        info_difficulty: null,
      },
    ];
    jest.spyOn(repository, 'find').mockResolvedValue(mockDifficulties);

    const result = await service.getAllDifficulties();
    expect(result).toEqual(mockDifficulties);
  });

  it('should throw HttpException when no difficulties are found', async () => {
    jest.spyOn(repository, 'find').mockResolvedValue([]);

    await expect(service.getAllDifficulties()).rejects.toThrow(
      new HttpException('No Content', 204),
    );
  });

  it('should return a difficulty by id', async () => {
    const mockDifficulty = {
      id_difficulty: 1,
      description: 'Easy',
      difficulty_rate: 10,
      info_difficulty: null,
    };
    jest.spyOn(repository, 'findOne').mockResolvedValue(mockDifficulty);

    const result = await service.getDifficulty(1);
    expect(result).toEqual(mockDifficulty);
  });

  it('should throw NotFoundException when difficulty is not found', async () => {
    jest.spyOn(repository, 'findOne').mockResolvedValue(null);

    await expect(service.getDifficulty(999)).rejects.toThrow(
      new NotFoundException('Difficulty not found'),
    );
  });

  it('should create a new difficulty', async () => {
    const createDto = { description: 'Hard', difficulty_rate: 90 };
    const mockDifficulty = {
      id_difficulty: 1,
      ...createDto,
      info_difficulty: null,
    };
    jest.spyOn(repository, 'create').mockReturnValue(mockDifficulty as any);
    jest.spyOn(repository, 'save').mockResolvedValue(mockDifficulty);

    const result = await service.createDifficulty(createDto);
    expect(result).toEqual(mockDifficulty);
  });

  it('should throw HttpException when creating a difficulty fails', async () => {
    const createDto = { description: 'Hard', difficulty_rate: 90 };
    jest.spyOn(repository, 'create').mockImplementation(() => {
      throw new Error('Database error');
    });

    await expect(service.createDifficulty(createDto)).rejects.toThrow(
      new HttpException('Internal Server Error', 500),
    );
  });

  it('should update an existing difficulty', async () => {
    const updateDto = { description: 'Updated', difficulty_rate: 70 };
    const mockDifficulty = {
      id_difficulty: 1,
      description: 'Old',
      difficulty_rate: 50,
      info_difficulty: null,
    };
    jest.spyOn(repository, 'findOne').mockResolvedValue(mockDifficulty);
    jest.spyOn(repository, 'merge').mockImplementation((entity, dto) => {
      Object.assign(entity, dto);
      return entity as DifficultyEntity;
    });
    jest.spyOn(repository, 'save').mockResolvedValue({
      ...mockDifficulty,
      ...updateDto,
    });

    const result = await service.updateDifficulty(updateDto, 1);
    expect(result).toEqual({ ...mockDifficulty, ...updateDto });
  });

  it('should throw NotFoundException when updating a non-existent difficulty', async () => {
    jest.spyOn(repository, 'findOne').mockResolvedValue(null);

    await expect(
      service.updateDifficulty({ description: 'Test' }, 999),
    ).rejects.toThrow(new NotFoundException('Difficulty not found'));
  });

  it('should delete a difficulty', async () => {
    jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1 } as any);

    await expect(service.deleteDifficulty(1)).resolves.toBeUndefined();
  });

  it('should throw NotFoundException when deleting a non-existent difficulty', async () => {
    jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 0 } as any);

    await expect(service.deleteDifficulty(999)).rejects.toThrow(
      new NotFoundException('Difficulty not found'),
    );
  });

  it('should throw HttpException when deleting a difficulty fails', async () => {
    jest.spyOn(repository, 'delete').mockImplementation(() => {
      throw new Error('Database error');
    });

    await expect(service.deleteDifficulty(1)).rejects.toThrow(
      new HttpException('Internal Server Error', 500),
    );
  });
});
