import { Test, TestingModule } from '@nestjs/testing';
import { AditionalInfoController } from './aditional_info.controller';

describe('AditionalInfoController', () => {
  let controller: AditionalInfoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AditionalInfoController],
    }).compile();

    controller = module.get<AditionalInfoController>(AditionalInfoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
