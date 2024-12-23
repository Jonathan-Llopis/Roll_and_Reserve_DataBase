import { Test, TestingModule } from '@nestjs/testing';
import { ShopGamesController } from './shop_games.controller';

describe('ShopGamesController', () => {
  let controller: ShopGamesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShopGamesController],
    }).compile();

    controller = module.get<ShopGamesController>(ShopGamesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
