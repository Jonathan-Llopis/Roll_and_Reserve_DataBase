import { Test, TestingModule } from '@nestjs/testing';
import { StatsTablesService } from './stats_tables.service';

describe('StatsTablesService', () => {
  let service: StatsTablesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatsTablesService],
    }).compile();

    service = module.get<StatsTablesService>(StatsTablesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
