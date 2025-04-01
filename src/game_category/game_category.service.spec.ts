import { Test, TestingModule } from '@nestjs/testing';
import { GameCategoryService } from './game_category.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GameCategoryEntity } from './game_category.entity';
import { NotFoundException, HttpException } from '@nestjs/common';

describe('GameCategoryService', () => {
  let originalConsoleError: typeof console.error;

  beforeAll(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });
  let service: GameCategoryService;
  let repository: Repository<GameCategoryEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameCategoryService,
        {
          provide: getRepositoryToken(GameCategoryEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<GameCategoryService>(GameCategoryService);
    repository = module.get<Repository<GameCategoryEntity>>(
      getRepositoryToken(GameCategoryEntity),
    );
  });

  it('should return all game categories', async () => {
    const mockCategories = [
      { id_game_category: 1, description: 'Action', game_category: [] },
      { id_game_category: 2, description: 'Adventure', game_category: [] },
    ];
    jest.spyOn(repository, 'find').mockResolvedValue(mockCategories);

    const result = await service.getAllGameCategories();
    expect(result).toEqual(mockCategories);
  });

  it('should throw HttpException when no game categories are found', async () => {
    jest.spyOn(repository, 'find').mockResolvedValue([]);

    await expect(service.getAllGameCategories()).rejects.toThrow(
      new HttpException('No Content', 204),
    );
  });

  it('should return a game category by id', async () => {
    const mockCategory = {
      id_game_category: 1,
      description: 'Action',
      game_category: [],
    };
    jest.spyOn(repository, 'findOne').mockResolvedValue(mockCategory);

    const result = await service.getGameCategory(1);
    expect(result).toEqual(mockCategory);
  });

  it('should throw NotFoundException when game category is not found', async () => {
    jest.spyOn(repository, 'findOne').mockResolvedValue(null);

    await expect(service.getGameCategory(999)).rejects.toThrow(
      new NotFoundException('Game category not found'),
    );
  });

  it('should create a new game category', async () => {
    const createDto = { description: 'Puzzle' };
    const mockCategory = {
      id_game_category: 1,
      ...createDto,
      game_category: [],
    };
    jest.spyOn(repository, 'create').mockReturnValue(mockCategory as any);
    jest.spyOn(repository, 'save').mockResolvedValue(mockCategory);

    const result = await service.createGameCategory(createDto);
    expect(result).toEqual(mockCategory);
  });

  it('should throw HttpException when creating a game category fails', async () => {
    const createDto = { description: 'Puzzle' };
    jest.spyOn(repository, 'create').mockReturnValue(createDto as any);
    jest.spyOn(repository, 'save').mockRejectedValue(new Error('Save failed'));

    await expect(service.createGameCategory(createDto)).rejects.toThrow(
      new HttpException('Internal Server Error', 500),
    );
  });

  it('should update an existing game category', async () => {
    const updateDto = { description: 'Updated' };
    const mockCategory = {
      id_game_category: 1,
      description: 'Old',
      game_category: [],
    };
    jest.spyOn(repository, 'findOne').mockResolvedValue(mockCategory);
    jest.spyOn(repository, 'merge').mockImplementation((entity, dto) => {
      Object.assign(entity, dto);
      return entity as GameCategoryEntity;
    });
    jest.spyOn(repository, 'save').mockResolvedValue({
      ...mockCategory,
      ...updateDto,
    });

    const result = await service.updateGameCategory(updateDto, 1);
    expect(result).toEqual({ ...mockCategory, ...updateDto });
  });

  it('should throw NotFoundException when updating a non-existent game category', async () => {
    jest.spyOn(repository, 'findOne').mockResolvedValue(null);

    await expect(
      service.updateGameCategory({ description: 'Test' }, 999),
    ).rejects.toThrow(new NotFoundException('Game category not found'));
  });

  it('should delete a game category', async () => {
    jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1 } as any);

    await expect(service.deleteGameCategory(1)).resolves.toBeUndefined();
  });

  it('should throw NotFoundException when deleting a non-existent game category', async () => {
    jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 0 } as any);

    await expect(service.deleteGameCategory(999)).rejects.toThrow(
      new NotFoundException('Game category not found'),
    );
  });

  it('should handle unexpected errors in getAllGameCategories', async () => {
    jest
      .spyOn(repository, 'find')
      .mockRejectedValue(new Error('Unexpected error'));

    await expect(service.getAllGameCategories()).rejects.toThrow(
      new HttpException('Internal Server Error', 500),
    );
  });

  it('should handle unexpected errors in getGameCategory', async () => {
    jest
      .spyOn(repository, 'findOne')
      .mockRejectedValue(new Error('Unexpected error'));

    await expect(service.getGameCategory(1)).rejects.toThrow(
      new HttpException('Internal Server Error', 500),
    );
  });

  it('should handle unexpected errors in updateGameCategory', async () => {
    jest
      .spyOn(repository, 'findOne')
      .mockRejectedValue(new Error('Unexpected error'));

    await expect(
      service.updateGameCategory({ description: 'Test' }, 1),
    ).rejects.toThrow(new HttpException('Internal Server Error', 500));
  });

  it('should handle unexpected errors in deleteGameCategory', async () => {
    jest
      .spyOn(repository, 'delete')
      .mockRejectedValue(new Error('Unexpected error'));

    await expect(service.deleteGameCategory(1)).rejects.toThrow(
      new HttpException('Internal Server Error', 500),
    );
  });
});
