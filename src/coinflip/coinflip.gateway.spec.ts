import { Test, TestingModule } from '@nestjs/testing';
import { CoinflipGateway } from './coinflip.gateway';
import { CoinflipService } from './coinflip.service';

describe('CoinflipGateway', () => {
  let gateway: CoinflipGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoinflipGateway, CoinflipService],
    }).compile();

    gateway = module.get<CoinflipGateway>(CoinflipGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
