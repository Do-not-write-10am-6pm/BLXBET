import { Test, TestingModule } from '@nestjs/testing';
import { LimitedsController } from './limiteds.controller';
import { LimitedsService } from './limiteds.service';

describe('LimitedsController', () => {
  let controller: LimitedsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LimitedsController],
      providers: [LimitedsService],
    }).compile();

    controller = module.get<LimitedsController>(LimitedsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
