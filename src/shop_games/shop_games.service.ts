import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { ShopsEntity } from '../shops/shops.entity';
import { GamesEntity } from '../games/game.entitiy';

@Injectable()
export class ShopGamesService {
  constructor(
    @InjectRepository(ShopsEntity)
    private readonly shopRepository: Repository<ShopsEntity>,

    @InjectRepository(GamesEntity)
    private readonly gameRepository: Repository<GamesEntity>,
  ) {}

  async addGameToShop(shopId: string, gameId: string): Promise<ShopsEntity> {
    const shop: ShopsEntity = await this.shopRepository.findOne({
      where: { id_shop: parseInt(shopId) },
      relations: ['games'],
    });
    if (!shop) {
      throw new BusinessLogicException(
        'The shop with the given id was not found',
        BusinessError.NOT_FOUND,
      );
    }
    const game: GamesEntity = await this.gameRepository.findOne({
      where: { id_game: parseInt(gameId) },
      relations: ['shops'],
    });
    if (!game) {
      throw new BusinessLogicException(
        'The game with the given id was not found',
        BusinessError.NOT_FOUND,
      );
    }
    shop.games.push(game);
    return this.shopRepository.save(shop);
  }

  async findGameFromShop(shopId: string, gameId: string): Promise<GamesEntity> {
    const game: GamesEntity = await this.gameRepository.findOne({
      where: { id_game: parseInt(gameId) },
      relations: ['shops'],
    });
    if (!game) {
      throw new BusinessLogicException(
        'The game with the given id was not found',
        BusinessError.NOT_FOUND,
      );
    }

    const shop: ShopsEntity = await this.shopRepository.findOne({
      where: { id_shop: parseInt(shopId) },
      relations: ['games'],
    });
    if (!shop) {
      throw new BusinessLogicException(
        'The shop with the given id was not found',
        BusinessError.NOT_FOUND,
      );
    }

    const shopGame: GamesEntity = shop.games.find(
      (game) => game.id_game === parseInt(gameId),
    );

    if (!shopGame) {
      throw new BusinessLogicException(
        'The game with the given id is not associated to the shop',
        BusinessError.PRECONDITION_FAILED,
      );
    }

    return shopGame;
  }

  async findGamesFromShop(shopId: string): Promise<GamesEntity[]> {
    const shop: ShopsEntity = await this.shopRepository.findOne({
      where: { id_shop: parseInt(shopId) },
      relations: ['games'],
    });
    if (!shop) {
      throw new BusinessLogicException(
        'The shop with the given id was not found',
        BusinessError.NOT_FOUND,
      );
    }

    return shop.games;
  }

  async updateGamesFromShop(
    shopId: string,
    games: GamesEntity[],
  ): Promise<ShopsEntity> {
    const shop: ShopsEntity = await this.shopRepository.findOne({
      where: { id_shop: parseInt(shopId) },
      relations: ['games'],
    });

    if (!shop) {
      throw new BusinessLogicException(
        'The shop with the given id was not found',
        BusinessError.NOT_FOUND,
      );
    }

    for (let i = 0; i < games.length; i++) {
      const game: GamesEntity = await this.gameRepository.findOne({
        where: { id_game: games[i].id_game },
        relations: ['shops'],
      });
      if (!game) {
        throw new BusinessLogicException(
          'The game with the given id was not found',
          BusinessError.NOT_FOUND,
        );
      }
    }
    shop.games = games;
    return await this.shopRepository.save(shop);
  }

  async deleteGameFromShop(shopId: string, gameId: string) {
    const game: GamesEntity = await this.gameRepository.findOne({
      where: { id_game: parseInt(gameId) },
      relations: ['shops'],
    });
    if (!game) {
      throw new BusinessLogicException(
        'The game with the given id was not found',
        BusinessError.NOT_FOUND,
      );
    }

    const shop: ShopsEntity = await this.shopRepository.findOne({
      where: { id_shop: parseInt(shopId) },
      relations: ['games'],
    });
    if (!shop) {
      throw new BusinessLogicException(
        'The shop with the given id was not found',
        BusinessError.NOT_FOUND,
      );
    }

    const shopGame: GamesEntity = shop.games.find(
      (game) => game.id_game === parseInt(gameId),
    );

    if (!shopGame) {
      throw new BusinessLogicException(
        'The game with the given id is not associated to the shop',
        BusinessError.PRECONDITION_FAILED,
      );
    }

    shop.games = shop.games.filter((game) => game.id_game !== parseInt(gameId));
    return await this.shopRepository.save(shop);
  }
}
