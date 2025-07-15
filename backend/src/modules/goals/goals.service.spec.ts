import { Test, TestingModule } from '@nestjs/testing';
import { GoalsService } from './goals.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Goal } from './entities/goal.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { GoalStatus } from './enums/goal-status.enum';
import { GoalCategory } from './enums/goal-category.enum';

// Mock types for TypeORM repository
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

// Create mock repository factory for TypeORM
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('GoalsService', () => {
  let service: GoalsService;
  let goalRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoalsService,
        {
          provide: getRepositoryToken(Goal),
          useFactory: createMockRepository,
        },
      ],
    }).compile();

    service = module.get<GoalsService>(GoalsService);
    goalRepository = module.get<MockRepository>(getRepositoryToken(Goal));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of goals', async () => {
      const mockGoals = [
        { id: '1', title: 'Goal 1', description: '', status: GoalStatus.TODO, category: GoalCategory.PERSONAL, targetDate: new Date(), progress: 0, userId: 'user1', user: null, createdAt: new Date(), updatedAt: new Date() },
        { id: '2', title: 'Goal 2', description: '', status: GoalStatus.IN_PROGRESS, category: GoalCategory.WORK, targetDate: new Date(), progress: 50, userId: 'user1', user: null, createdAt: new Date(), updatedAt: new Date() },
      ];
      goalRepository.find.mockResolvedValue(mockGoals);

      const result = await service.findAll();
      expect(result).toEqual(mockGoals);
      expect(goalRepository.find).toHaveBeenCalled();
    });
  });

  describe('findAllByUserId', () => {
    it('should return goals for a specific user', async () => {
      const userId = 'user1';
      const mockGoals = [
        { id: '1', title: 'Goal 1', description: '', status: GoalStatus.TODO, category: GoalCategory.PERSONAL, targetDate: new Date(), progress: 0, userId, user: null, createdAt: new Date(), updatedAt: new Date() },
        { id: '2', title: 'Goal 2', description: '', status: GoalStatus.IN_PROGRESS, category: GoalCategory.WORK, targetDate: new Date(), progress: 50, userId, user: null, createdAt: new Date(), updatedAt: new Date() },
      ];
      goalRepository.find.mockResolvedValue(mockGoals);

      const result = await service.findAllByUserId(userId);
      expect(result).toEqual(mockGoals);
      expect(goalRepository.find).toHaveBeenCalledWith({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a goal when goal exists', async () => {
      const mockGoal = {
        id: '1',
        title: 'Test Goal',
        description: '',
        status: GoalStatus.TODO,
        userId: 'user1',
        user: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      goalRepository.findOne.mockResolvedValue(mockGoal);

      const result = await service.findOne('1');
      expect(result).toEqual(mockGoal);
      expect(goalRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should find a goal with user id constraint', async () => {
      const mockGoal = {
        id: '1',
        title: 'Test Goal',
        description: '',
        status: GoalStatus.TODO,
        userId: 'user1',
        user: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      goalRepository.findOne.mockResolvedValue(mockGoal);

      const result = await service.findOne('1', 'user1');
      expect(result).toEqual(mockGoal);
      expect(goalRepository.findOne).toHaveBeenCalledWith({ where: { id: '1', userId: 'user1' } });
    });

    it('should throw NotFoundException when goal does not exist', async () => {
      goalRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new goal', async () => {
      const createGoalData = {
        title: 'New Goal',
        description: 'Description of the goal',
        userId: 'user1',
      };
      
      const newGoal = {
        id: '3',
        ...createGoalData,
        status: GoalStatus.TODO,
        user: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      goalRepository.create.mockReturnValue(newGoal);
      goalRepository.save.mockResolvedValue(newGoal);

      const result = await service.create(createGoalData);
      
      expect(goalRepository.create).toHaveBeenCalledWith({
        ...createGoalData,
        status: GoalStatus.TODO,
      });
      expect(goalRepository.save).toHaveBeenCalled();
      expect(result).toEqual(newGoal);
    });
  });

  describe('update', () => {
    it('should update an existing goal', async () => {
      const goalId = '1';
      const userId = 'user1';
      const updateGoalData = {
        title: 'Updated Goal',
        description: 'Updated description',
      };
      
      const existingGoal = {
        id: goalId,
        title: 'Old Title',
        description: 'Old description',
        status: GoalStatus.TODO,
        category: GoalCategory.PERSONAL,
        targetDate: new Date(),
        progress: 0,
        userId,
        user: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const updatedGoal = {
        ...existingGoal,
        ...updateGoalData,
      };
      
      jest.spyOn(service, 'findOne').mockResolvedValue(existingGoal);
      goalRepository.save.mockResolvedValue(updatedGoal);

      const result = await service.update(goalId, userId, updateGoalData);
      
      expect(service.findOne).toHaveBeenCalledWith(goalId, userId);
      expect(goalRepository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedGoal);
    });
  });

  describe('updateStatus', () => {
    it('should update goal status to COMPLETED', async () => {
      const goalId = '1';
      const userId = 'user1';
      const newStatus = GoalStatus.COMPLETED;
      
      const existingGoal = {
        id: goalId,
        title: 'Goal to cancel',
        description: '',
        status: GoalStatus.IN_PROGRESS,
        category: GoalCategory.PERSONAL,
        targetDate: new Date(),
        progress: 50,
        userId,
        user: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const updatedGoal = {
        ...existingGoal,
        status: newStatus,
      };
      
      jest.spyOn(service, 'findOne').mockResolvedValue(existingGoal);
      goalRepository.save.mockResolvedValue(updatedGoal);

      const result = await service.updateStatus(goalId, userId, newStatus);
      
      expect(service.findOne).toHaveBeenCalledWith(goalId, userId);
      expect(goalRepository.save).toHaveBeenCalled();
      expect(result.status).toEqual(newStatus);
    });
    
    it('should update goal status to ON_HOLD', async () => {
      const goalId = '2';
      const userId = 'user1';
      const newStatus = GoalStatus.ON_HOLD;
      
      const existingGoal = {
        id: goalId,
        title: 'Goal to be put on hold',
        description: '',
        status: GoalStatus.IN_PROGRESS,
        category: GoalCategory.PERSONAL,
        targetDate: new Date(),
        progress: 50,
        userId,
        user: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const updatedGoal = {
        ...existingGoal,
        status: newStatus,
      };
      
      jest.spyOn(service, 'findOne').mockResolvedValue(existingGoal);
      goalRepository.save.mockResolvedValue(updatedGoal);

      const result = await service.updateStatus(goalId, userId, newStatus);
      
      expect(service.findOne).toHaveBeenCalledWith(goalId, userId);
      expect(goalRepository.save).toHaveBeenCalled();
      expect(result.status).toEqual(newStatus);
    });
  });

  describe('remove', () => {
    it('should remove a goal', async () => {
      const goalId = '1';
      const userId = 'user1';
      
      const existingGoal = {
        id: goalId,
        title: 'Test Goal',
        description: '',
        status: GoalStatus.TODO,
        category: GoalCategory.PERSONAL,
        targetDate: new Date(),
        progress: 0,
        userId,
        user: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      jest.spyOn(service, 'findOne').mockResolvedValue(existingGoal);
      goalRepository.remove.mockResolvedValue(undefined);

      await service.remove(goalId, userId);
      
      expect(service.findOne).toHaveBeenCalledWith(goalId, userId);
      expect(goalRepository.remove).toHaveBeenCalledWith(existingGoal);
    });
  });
});
