import { Test, TestingModule } from '@nestjs/testing';
import { AditionalInfoService } from './aditional_info.service';

describe('AditionalInfoService', () => {
  let service: AditionalInfoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AditionalInfoService],
    }).compile();

    service = module.get<AditionalInfoService>(AditionalInfoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
