import { Test, TestingModule } from '@nestjs/testing';
import { ShopGamesService } from './shop_games.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ShopsEntity } from '../shops/shops.entity';
import { GamesEntity } from '../games/games.entitiy';
import { HttpException, NotFoundException } from '@nestjs/common';

describe('ShopGamesService', () => {
  let service: ShopGamesService;
  let shopRepository: Repository<ShopsEntity>;
  let gameRepository: Repository<GamesEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopGamesService,
        {
          provide: getRepositoryToken(ShopsEntity),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(GamesEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ShopGamesService>(ShopGamesService);
    shopRepository = module.get<Repository<ShopsEntity>>(
      getRepositoryToken(ShopsEntity),
    );
    gameRepository = module.get<Repository<GamesEntity>>(
      getRepositoryToken(GamesEntity),
    );
  });

  it('should find all games from a shop successfully', async () => {
    const mockGames = [{ id_game: 1 }, { id_game: 2 }] as GamesEntity[];
    const mockShop = { id_shop: 1, games: mockGames } as ShopsEntity;

    jest.spyOn(shopRepository, 'findOne').mockResolvedValue(mockShop);

    const result = await service.findGamesFromShop('1');
    expect(result).toEqual(mockGames);
  });

  it('should throw NotFoundException when shop is not found for games retrieval', async () => {
    jest.spyOn(shopRepository, 'findOne').mockImplementation(async () => null);

    await expect(service.findGamesFromShop('999')).rejects.toThrow(
      new NotFoundException('The shop with the given id was not found'),
    );
  });

  it('should throw HttpException when no games are found in the shop', async () => {
    const mockShop = { id_shop: 1, games: [] } as ShopsEntity;

    jest.spyOn(shopRepository, 'findOne').mockResolvedValue(mockShop);

    await expect(service.findGamesFromShop('1')).rejects.toThrow(
      new HttpException('No Content', 204),
    );
  });

  it('should update games in a shop successfully', async () => {
    const mockGames = [{ id_game: 1 }, { id_game: 2 }] as GamesEntity[];
    const mockShop = { id_shop: 1, games: [] } as ShopsEntity;

    jest.spyOn(shopRepository, 'findOne').mockResolvedValue(mockShop);
    jest.spyOn(gameRepository, 'findOne').mockResolvedValue(mockGames[0]);
    jest.spyOn(shopRepository, 'save').mockResolvedValue({
      ...mockShop,
      games: mockGames,
    });

    const result = await service.updateGamesFromShop('1', mockGames);
    expect(result.games).toEqual(mockGames);
  });

  it('should throw NotFoundException when updating games for a non-existent shop', async () => {
    jest.spyOn(shopRepository, 'findOne').mockImplementation(async () => null);

    await expect(service.updateGamesFromShop('999', [])).rejects.toThrow(
      new NotFoundException('The shop with the given id was not found'),
    );
  });

  it('should throw NotFoundException when updating with a non-existent game', async () => {
    const mockShop = { id_shop: 1, games: [] } as ShopsEntity;
    const mockGames = [{ id_game: 1 }] as GamesEntity[];

    jest.spyOn(shopRepository, 'findOne').mockResolvedValue(mockShop);
    jest.spyOn(gameRepository, 'findOne').mockImplementation(async () => null);

    await expect(service.updateGamesFromShop('1', mockGames)).rejects.toThrow(
      new NotFoundException('The game with the given id was not found'),
    );
  });

  it('should delete a game from a shop successfully', async () => {
    const mockGame = { id_game: 1 } as GamesEntity;
    const mockShop = { id_shop: 1, games: [mockGame] } as ShopsEntity;

    jest.spyOn(shopRepository, 'findOne').mockResolvedValue(mockShop);
    jest.spyOn(gameRepository, 'findOne').mockResolvedValue(mockGame);
    jest.spyOn(shopRepository, 'save').mockResolvedValue({
      ...mockShop,
      games: [],
    });

    const result = await service.deleteGameFromShop('1', '1');
    expect(result.games).not.toContain(mockGame);
  });

  it('should throw NotFoundException when deleting a game from a non-existent shop', async () => {
    jest.spyOn(shopRepository, 'findOne').mockImplementation(async () => null);

    await expect(service.deleteGameFromShop('999', '1')).rejects.toThrow(
      new NotFoundException('The game with the given id was not found'),
    );
  });

  it('should throw NotFoundException when deleting a non-existent game from a shop', async () => {
    const mockShop = { id_shop: 1, games: [] } as ShopsEntity;

    jest.spyOn(shopRepository, 'findOne').mockResolvedValue(mockShop);
    jest.spyOn(gameRepository, 'findOne').mockResolvedValue(null);

    await expect(service.deleteGameFromShop('1', '999')).rejects.toThrow(
      new NotFoundException('The game with the given id was not found'),
    );
  });

  it('should throw HttpException when deleting a game not associated with the shop', async () => {
    const mockGame = { id_game: 1 } as GamesEntity;
    const mockShop = { id_shop: 1, games: [] } as ShopsEntity;

    jest.spyOn(shopRepository, 'findOne').mockResolvedValue(mockShop);
    jest.spyOn(gameRepository, 'findOne').mockResolvedValue(mockGame);

    await expect(service.deleteGameFromShop('1', '1')).rejects.toThrow(
      new HttpException(
        'The shop with the given id is not associated to the shop',
        412,
      ),
    );
  });
});
