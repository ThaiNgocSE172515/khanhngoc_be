import { Test, TestingModule } from '@nestjs/testing';
import { AppsController } from './apps.controller.js';
import { AppsService } from './apps.service.js';

describe('AppsController', () => {
  let controller: AppsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppsController],
      providers: [AppsService],
    }).compile();

    controller = module.get<AppsController>(AppsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
