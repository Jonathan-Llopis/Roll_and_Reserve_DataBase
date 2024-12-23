import { Test, TestingModule } from '@nestjs/testing';
import { GameCategoryService } from './game_category.service';

describe('GameCategoryService', () => {
  let service: GameCategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameCategoryService],
    }).compile();

    service = module.get<GameCategoryService>(GameCategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
