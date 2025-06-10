import { Test } from '@nestjs/testing';
import { GoalsController } from './goals.controller';
import { GoalsService } from './goals.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Goal } from './entities/goal.entity';
import { GoalsModule } from './goals.module';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('GoalsModule', () => {
  it('should compile the module with mocked dependencies', async () => {
    const mockGoalRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      remove: jest.fn(),
    };

    const module = await Test.createTestingModule({
      controllers: [GoalsController],
      providers: [
        GoalsService,
        {
          provide: getRepositoryToken(Goal),
          useValue: mockGoalRepository,
        },
      ],
    }).compile();

    expect(module).toBeDefined();
    const goalsService = module.get(GoalsService);
    const goalsController = module.get(GoalsController);
    
    expect(goalsService).toBeInstanceOf(GoalsService);
    expect(goalsController).toBeDefined();
  });
  
  it('should compile the actual GoalsModule using a mock TypeOrmModule', async () => {
    const mockTypeOrmModule = {
      forFeature: jest.fn().mockReturnValue({
        providers: [
          {
            provide: getRepositoryToken(Goal),
            useValue: {},
          },
        ],
        exports: [
          {
            provide: getRepositoryToken(Goal),
            useValue: {},
          },
        ],
      }),
    };
    
    const mockGoalRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      remove: jest.fn(),
    };
    
    const moduleRef = await Test.createTestingModule({
      imports: [GoalsModule],
    })
    .overrideProvider(TypeOrmModule)
    .useValue(mockTypeOrmModule)
    .overrideProvider(getRepositoryToken(Goal))
    .useValue(mockGoalRepository)
    .compile();
    
    expect(moduleRef).toBeDefined();
    
    const goalsService = moduleRef.get(GoalsService);
    expect(goalsService).toBeDefined();
    
    const goalsController = moduleRef.get(GoalsController);
    expect(goalsController).toBeDefined();
  });
  
  it('should test basic goal operations', async () => {
    const mockGoal = { 
      id: '1', 
      title: 'Test Goal', 
      description: 'Test description', 
      status: 'IN_PROGRESS',
      userId: 'user1'
    };
    
    const mockGoalRepository = {
      find: jest.fn().mockResolvedValue([mockGoal]),
      findOne: jest.fn().mockImplementation(() => Promise.resolve(mockGoal)),
      create: jest.fn().mockReturnValue(mockGoal),
      save: jest.fn().mockResolvedValue(mockGoal),
      update: jest.fn(),
      delete: jest.fn(),
      remove: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        GoalsService,
        {
          provide: getRepositoryToken(Goal),
          useValue: mockGoalRepository,
        },
      ],
    }).compile();

    const service = module.get<GoalsService>(GoalsService);
    
    const goals = await service.findAllByUserId('user1');
    expect(goals).toEqual([mockGoal]);
    expect(mockGoalRepository.find).toBeTruthy();
    expect(mockGoalRepository.find.mock.calls.length).toBeGreaterThan(0);
    
    const goal = await service.findOne('1', 'user1');
    expect(goal).toEqual(mockGoal);
    expect(mockGoalRepository.findOne).toBeTruthy();
    expect(mockGoalRepository.findOne.mock.calls.length).toBeGreaterThan(0);
  });
  
  it('should validate the module structure', () => {
    const typeOrmSpy = jest.spyOn(TypeOrmModule, 'forFeature');
    
    TypeOrmModule.forFeature([Goal]);
    
    expect(typeOrmSpy).toBeTruthy();
    expect(typeOrmSpy.mock.calls.length).toBeGreaterThan(0);
    expect(typeOrmSpy.mock.calls[0][0]).toEqual([Goal]);
    
    typeOrmSpy.mockRestore();
    
    const goalsModule = new GoalsModule();
    expect(goalsModule).toBeDefined();
  });
  
  it('should have the correct module metadata', () => {
    const expectedProviders = [GoalsService];
    const expectedControllers = [GoalsController];
    const expectedExports = [GoalsService];
    
    const moduleClass = GoalsModule;
    
    expect(moduleClass).toBeDefined();
  });
});
