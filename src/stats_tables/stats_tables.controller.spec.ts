import { Test, TestingModule } from '@nestjs/testing';
import { StatsTablesController } from './stats_tables.controller';

describe('StatsTablesController', () => {
  let controller: StatsTablesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatsTablesController],
    }).compile();

    controller = module.get<StatsTablesController>(StatsTablesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
