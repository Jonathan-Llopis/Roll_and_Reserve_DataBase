import { Test, TestingModule } from '@nestjs/testing';
import { GamesService } from './games.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GamesEntity } from './games.entitiy';
import { GameCategoryEntity } from '../game_category/game_category.entity';
import { HttpService } from '../http/http.service';
import { GameCategoryService } from '../game_category/game_category.service';
import {
  NotFoundException,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { AxiosHeaders } from 'axios';

describe('GamesService', () => {
  let service: GamesService;
  let gameRepository: Repository<GamesEntity>;
  let gameCategoryRepository: Repository<GameCategoryEntity>;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamesService,
        GameCategoryService,
        {
          provide: getRepositoryToken(GamesEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
            merge: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(GameCategoryEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
            merge: jest.fn(),
          },
        },
        {
          provide: 'Bgg-Api',
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GamesService>(GamesService);
    gameRepository = module.get<Repository<GamesEntity>>(
      getRepositoryToken(GamesEntity),
    );
    gameCategoryRepository = module.get<Repository<GameCategoryEntity>>(
      getRepositoryToken(GameCategoryEntity),
    );
    httpService = module.get<HttpService>('Bgg-Api');
  });

  it('should return all games', async () => {
    const mockGames = [
      {
        id_game: 1,
        name: 'Chess',
        description: 'A game',
        bgg_id: 123,
        gameCategory: null,
        shop: null,
        game_reserve: null,
      },
    ];
    jest.spyOn(gameRepository, 'find').mockResolvedValue(mockGames);

    const result = await service.getAllGames();
    expect(result).toEqual(mockGames);
  });

  it('should throw HttpException when no games are found', async () => {
    jest.spyOn(gameRepository, 'find').mockResolvedValue([]);

    await expect(service.getAllGames()).rejects.toThrow(
      new HttpException('No Content', 204),
    );
  });

  it('should return a game by id', async () => {
    const mockGame = {
      id_game: 1,
      name: 'Chess',
      description: 'A game',
      bgg_id: 123,
      gameCategory: null,
      shop: null,
      game_reserve: null,
    };
    jest.spyOn(gameRepository, 'findOne').mockResolvedValue(mockGame);

    const result = await service.getGame(1);
    expect(result).toEqual(mockGame);
  });

  it('should throw NotFoundException when game is not found', async () => {
    jest.spyOn(gameRepository, 'findOne').mockResolvedValue(null);

    await expect(service.getGame(999)).rejects.toThrow(
      new NotFoundException('Game not found'),
    );
  });

  it('should create a new game', async () => {
    const createDto = {
      name: 'Chess',
      description: 'A game',
      bgg_id: 123,
      category_name: 'Strategy',
      shop_id: 1,
      reserve_id: 1,
    };
    const mockGame = {
      id_game: 1,
      ...createDto,
      gameCategory: null,
      shop: null,
      game_reserve: null,
    };
    jest.spyOn(gameRepository, 'create').mockReturnValue(mockGame as any);
    jest.spyOn(gameRepository, 'save').mockResolvedValue(mockGame);
    jest
      .spyOn(gameCategoryRepository, 'findOne')
      .mockResolvedValue({ id: 1, name: 'Strategy' } as any);

    const result = await service.createGame(createDto);
    expect(result).toEqual(mockGame);
  });

  it('should throw BadRequestException when creating a game with invalid category', async () => {
    const createDto = {
      name: 'Chess',
      description: 'A game',
      bgg_id: 123,
      category_name: 'Invalid',
    };
    jest.spyOn(gameCategoryRepository, 'findOne').mockResolvedValue(null);

    await expect(service.createGame(createDto)).rejects.toThrow(
      new BadRequestException('Invalid category name'),
    );
  });

  it('should update an existing game', async () => {
    const updateDto = {
      name: 'Updated Chess',
      description: 'Updated game',
      category_name: 'Strategy',
    };
    const mockGame = {
      id_game: 1,
      name: 'Chess',
      description: 'A game',
      bgg_id: 123,
      gameCategory: null,
      shop: null,
      game_reserve: null,
    };
    jest.spyOn(gameRepository, 'findOne').mockResolvedValue(mockGame);
    jest.spyOn(gameRepository, 'merge').mockImplementation((entity, dto) => {
      Object.assign(entity, dto);
      return entity as GamesEntity;
    });
    jest
      .spyOn(gameRepository, 'save')
      .mockResolvedValue({ ...mockGame, ...updateDto });

    const result = await service.updateGame(updateDto, 1);
    expect(result).toEqual({ ...mockGame, ...updateDto });
  });

  it('should throw NotFoundException when updating a non-existent game', async () => {
    jest.spyOn(gameRepository, 'findOne').mockResolvedValue(null);

    await expect(service.updateGame({ name: 'Test' }, 999)).rejects.toThrow(
      new NotFoundException('Game not found'),
    );
  });

  it('should delete a game', async () => {
    jest
      .spyOn(gameRepository, 'delete')
      .mockResolvedValue({ affected: 1 } as any);

    await expect(service.deleteGame(1)).resolves.toBeUndefined();
  });

  it('should throw NotFoundException when deleting a non-existent game', async () => {
    jest
      .spyOn(gameRepository, 'delete')
      .mockResolvedValue({ affected: 0 } as any);

    await expect(service.deleteGame(999)).rejects.toThrow(
      new NotFoundException('Game not found'),
    );
  });

  it('should search games by name', async () => {
    const mockGames = [
      {
        id_game: 1,
        name: 'Chess',
        description: 'A game',
        bgg_id: 123,
        gameCategory: null,
        shop: null,
        game_reserve: null,
      },
    ];
    jest.spyOn(gameRepository, 'find').mockResolvedValue(mockGames);

    const result = await service.searchGameByName('Chess');
    expect(result).toEqual(mockGames);
  });

  it('should fetch games from external API when not found locally', async () => {
    jest.spyOn(gameRepository, 'find').mockResolvedValue([]);
    const mockExternalGames = {
      data: {
        items: [{ objectid: 1, name: 'External Chess', image: 'image_url' }],
      },
    };
    jest.spyOn(httpService, 'get').mockResolvedValue(mockExternalGames as any);

    const result = await service.searchGameByName('External Chess');
    expect(result).toEqual([
      {
        id_game: 1,
        name: 'External Chess',
        image: 'image_url',
        description: '',
        bgg_id: 1,
        gameCategory: null,
        shop: null,
        game_reserve: null,
      },
    ]);
  });
  it('should throw NotFoundException when no games are found', async () => {
    jest.spyOn(gameRepository, 'find').mockResolvedValue([]);
    jest.spyOn(httpService, 'get').mockResolvedValue({
      data: { items: [] },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        url: 'http://bgg-api:80/bgg-api/api/v5/search/boardgame',
        method: 'get',
        headers: new AxiosHeaders({
          Accept: 'application/json',
        }),
        transformRequest: [null],
        transformResponse: [null],
        timeout: 0,
        xsrfCookieName: 'XSRF-TOKEN',
        xsrfHeaderName: 'X-XSRF-TOKEN',
        maxContentLength: -1,
      },
    });

    await expect(service.searchGameByName('NonExistentGame')).rejects.toThrow(
      new NotFoundException('No games found with the given name'),
    );
  });
});
