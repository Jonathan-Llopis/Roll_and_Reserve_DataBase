import { Test, TestingModule } from '@nestjs/testing';
import { ShopGamesService } from './shop_games.service';

describe('ShopGamesService', () => {
  let service: ShopGamesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShopGamesService],
    }).compile();

    service = module.get<ShopGamesService>(ShopGamesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
