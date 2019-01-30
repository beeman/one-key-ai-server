import { Test, TestingModule } from '@nestjs/testing';
import { PerformanceGateway } from './performance.gateway';

describe('PerformanceGateway', () => {
  let gateway: PerformanceGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PerformanceGateway],
    }).compile();

    gateway = module.get<PerformanceGateway>(PerformanceGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
