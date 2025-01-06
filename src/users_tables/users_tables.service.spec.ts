import { Test, TestingModule } from '@nestjs/testing';
import { UsersTablesService } from './users_tables.service';

describe('UsersTablesService', () => {
  let service: UsersTablesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersTablesService],
    }).compile();

    service = module.get<UsersTablesService>(UsersTablesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
