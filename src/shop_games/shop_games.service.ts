import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ShopsEntity } from '../shops/shops.entity';
import { GamesEntity } from '../games/games.entitiy';

@Injectable()
export class ShopGamesService {
  constructor(
    @InjectRepository(ShopsEntity)
    private readonly shopRepository: Repository<ShopsEntity>,

    @InjectRepository(GamesEntity)
    private readonly gameRepository: Repository<GamesEntity>,
  ) {}

  private handleError(err: any) {
    if (err instanceof HttpException) {
      throw err;
    }
    throw new HttpException(
      err.message || 'Bad request',
      err.status || HttpStatus.BAD_REQUEST,
    );
  }

  async addGameToShop(shopId: string, gameId: string): Promise<ShopsEntity> {
    try {
      const shop = await this.shopRepository.findOne({
        where: { id_shop: parseInt(shopId) },
        relations: ['games'],
      });
      if (!shop) {
        throw new HttpException(
          'The shop with the given id was not found',
          HttpStatus.NOT_FOUND,
        );
      }
      const game = await this.gameRepository.findOne({
        where: { id_game: parseInt(gameId) },
      });
      if (!game) {
        throw new HttpException(
          'The game with the given id was not found',
          HttpStatus.NOT_FOUND,
        );
      }
      shop.games.push(game);
      return this.shopRepository.save(shop);
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

  async findGameFromShop(shopId: string, gameId: string): Promise<GamesEntity> {
    try {
      const game = await this.gameRepository.findOne({
        where: { id_game: parseInt(gameId) },
        relations: ['shop'],
      });
      if (!game) {
        throw new HttpException(
          'The game with the given id was not found',
          HttpStatus.NOT_FOUND,
        );
      }

      const shop = await this.shopRepository.findOne({
        where: { id_shop: parseInt(shopId) },
        relations: ['games'],
      });
      if (!shop) {
        throw new HttpException(
          'The shop with the given id was not found',
          HttpStatus.NOT_FOUND,
        );
      }

      const shopGame = shop.games.find(
        (game) => game.id_game === parseInt(gameId),
      );

      if (!shopGame) {
        throw new HttpException(
          'The game with the given id is not associated to the shop',
          HttpStatus.PRECONDITION_FAILED,
        );
      }

      return shopGame;
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

  async findGamesFromShop(shopId: string): Promise<GamesEntity[]> {
    try {
      const shop = await this.shopRepository.findOne({
        where: { id_shop: parseInt(shopId) },
        relations: ['games'],
      });
      if (!shop) {
        throw new HttpException(
          'The shop with the given id was not found',
          HttpStatus.NOT_FOUND,
        );
      }

      if (shop.games.length === 0) {
        throw new HttpException('No Content', HttpStatus.NO_CONTENT);
      }

      return shop.games;
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

  async updateGamesFromShop(
    shopId: string,
    games: GamesEntity[],
  ): Promise<ShopsEntity> {
    try {
      const shop = await this.shopRepository.findOne({
        where: { id_shop: parseInt(shopId) },
        relations: ['games'],
      });

      if (!shop) {
        throw new HttpException(
          'The shop with the given id was not found',
          HttpStatus.NOT_FOUND,
        );
      }

      for (let i = 0; i < games.length; i++) {
        const game = await this.gameRepository.findOne({
          where: { id_game: games[i].id_game },
          relations: ['shop'],
        });
        if (!game) {
          throw new HttpException(
            'The game with the given id was not found',
            HttpStatus.NOT_FOUND,
          );
        }
      }
      shop.games = games;
      return this.shopRepository.save(shop);
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

  async deleteGameFromShop(shopId: string, gameId: string) {
    try {
      const game = await this.gameRepository.findOne({
        where: { id_game: parseInt(gameId) },
        relations: ['shop'],
      });
      if (!game) {
        throw new HttpException(
          'The game with the given id was not found',
          HttpStatus.NOT_FOUND,
        );
      }

      const shop = await this.shopRepository.findOne({
        where: { id_shop: parseInt(shopId) },
        relations: ['games'],
      });
      if (!shop) {
        throw new HttpException(
          'The shop with the given id was not found',
          HttpStatus.NOT_FOUND,
        );
      }

      const shopGame = shop.games.find(
        (game) => game.id_game === parseInt(gameId),
      );

      if (!shopGame) {
        throw new HttpException(
          'The shop with the given id is not associated to the shop',
          HttpStatus.NOT_FOUND,
        );
      }

      shop.games = shop.games.filter(
        (game) => game.id_game !== parseInt(gameId),
      );
      return this.shopRepository.save(shop);
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
