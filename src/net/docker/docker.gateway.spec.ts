import { Test, TestingModule } from '@nestjs/testing';
import { DockerGateway } from './docker.gateway';

describe('DockerGateway', () => {
  let gateway: DockerGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DockerGateway],
    }).compile();

    gateway = module.get<DockerGateway>(DockerGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
