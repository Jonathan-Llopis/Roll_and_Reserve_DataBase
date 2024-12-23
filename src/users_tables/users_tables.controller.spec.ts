import { Test, TestingModule } from '@nestjs/testing';
import { UsersTablesController } from './users_tables.controller';

describe('UsersTablesController', () => {
  let controller: UsersTablesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersTablesController],
    }).compile();

    controller = module.get<UsersTablesController>(UsersTablesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
