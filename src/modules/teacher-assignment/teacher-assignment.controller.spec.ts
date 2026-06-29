import { Test, TestingModule } from '@nestjs/testing';
import { TeacherAssignmentController } from './teacher-assignment.controller';
import { TeacherAssignmentService } from './teacher-assignment.service';

describe('TeacherAssignmentController', () => {
  let controller: TeacherAssignmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeacherAssignmentController],
      providers: [TeacherAssignmentService],
    }).compile();

    controller = module.get<TeacherAssignmentController>(TeacherAssignmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
