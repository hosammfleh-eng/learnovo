import { Test, TestingModule } from '@nestjs/testing';
import { GraduationController } from './graduation.controller';
import { GraduationService } from './graduation.service';

describe('GraduationController', () => {
  let controller: GraduationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GraduationController],
      providers: [GraduationService],
    }).compile();

    controller = module.get<GraduationController>(GraduationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
