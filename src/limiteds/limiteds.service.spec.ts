import { Test, TestingModule } from '@nestjs/testing';
import { LimitedsService } from './limiteds.service';

describe('LimitedsService', () => {
  let service: LimitedsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LimitedsService],
    }).compile();

    service = module.get<LimitedsService>(LimitedsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
