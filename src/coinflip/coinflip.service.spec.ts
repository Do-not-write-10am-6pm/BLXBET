import { Test, TestingModule } from '@nestjs/testing';
import { CoinflipService } from './coinflip.service';

describe('CoinflipService', () => {
  let service: CoinflipService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoinflipService],
    }).compile();

    service = module.get<CoinflipService>(CoinflipService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
