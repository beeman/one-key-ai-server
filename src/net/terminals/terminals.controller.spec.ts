import { Test, TestingModule } from '@nestjs/testing';
import { TerminalsController } from './terminals.controller';

describe('Terminals Controller', () => {
  let controller: TerminalsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TerminalsController],
    }).compile();

    controller = module.get<TerminalsController>(TerminalsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
