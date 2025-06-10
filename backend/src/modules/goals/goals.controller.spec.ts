import { Test, TestingModule } from '@nestjs/testing';
import { GoalsController } from './goals.controller';
import { GoalsService } from './goals.service';
import { GoalStatus } from './enums/goal-status.enum';

describe('GoalsController', () => {
  let controller: GoalsController;
  let goalsService: any;

  beforeEach(async () => {
    goalsService = {
      findAllByUserId: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoalsController],
      providers: [{ provide: GoalsService, useValue: goalsService }],
    }).compile();

    controller = module.get<GoalsController>(GoalsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return goals for the user', async () => {
      const userId = 'user-id-1';
      const req = { user: { id: userId } };
      const goals = [
        { id: '1', title: 'Goal 1', status: GoalStatus.TODO },
        { id: '2', title: 'Goal 2', status: GoalStatus.IN_PROGRESS },
      ];
      
      goalsService.findAllByUserId.mockResolvedValue(goals);
      
      expect(await controller.findAll(req)).toBe(goals);
      expect(goalsService.findAllByUserId).toHaveBeenCalledWith(userId);
    });
  });

  describe('findOne', () => {
    it('should return a specific goal for the user', async () => {
      const goalId = 'goal-id-1';
      const userId = 'user-id-1';
      const req = { user: { id: userId } };
      const goal = { id: goalId, title: 'Goal 1', status: GoalStatus.TODO };
      
      goalsService.findOne.mockResolvedValue(goal);
      
      expect(await controller.findOne(goalId, req)).toBe(goal);
      expect(goalsService.findOne).toHaveBeenCalledWith(goalId, userId);
    });
  });

  describe('create', () => {
    it('should create a new goal for the user', async () => {
      const userId = 'user-id-1';
      const req = { user: { id: userId } };
      const createGoalDto = { title: 'New Goal', description: 'Goal description' };
      const createdGoal = { 
        id: 'new-goal-id', 
        title: 'New Goal', 
        description: 'Goal description', 
        status: GoalStatus.TODO,
        userId
      };
      
      goalsService.create.mockResolvedValue(createdGoal);
      
      expect(await controller.create(createGoalDto, req)).toBe(createdGoal);
      expect(goalsService.create).toHaveBeenCalledWith({
        ...createGoalDto,
        userId,
      });
    });
  });

  describe('update', () => {
    it('should update a goal for the user', async () => {
      const goalId = 'goal-id-1';
      const userId = 'user-id-1';
      const req = { user: { id: userId } };
      const updateGoalDto = { title: 'Updated Goal' };
      const updatedGoal = { 
        id: goalId, 
        title: 'Updated Goal', 
        status: GoalStatus.TODO,
        userId
      };
      
      goalsService.update.mockResolvedValue(updatedGoal);
      
      expect(await controller.update(goalId, updateGoalDto, req)).toBe(updatedGoal);
      expect(goalsService.update).toHaveBeenCalledWith(goalId, userId, updateGoalDto);
    });
  });

  describe('updateStatus', () => {
    it('should update the status of a goal', async () => {
      const goalId = 'goal-id-1';
      const userId = 'user-id-1';
      const req = { user: { id: userId } };
      const statusUpdate = { status: GoalStatus.COMPLETED };
      const updatedGoal = { 
        id: goalId, 
        title: 'Goal 1', 
        status: GoalStatus.COMPLETED,
        userId
      };
      
      goalsService.updateStatus.mockResolvedValue(updatedGoal);
      
      expect(await controller.updateStatus(goalId, statusUpdate, req)).toBe(updatedGoal);
      expect(goalsService.updateStatus).toHaveBeenCalledWith(goalId, userId, GoalStatus.COMPLETED);
    });
    
    it('should support the ON_HOLD status', async () => {
      const goalId = 'goal-id-1';
      const userId = 'user-id-1';
      const req = { user: { id: userId } };
      const statusUpdate = { status: GoalStatus.ON_HOLD };
      const updatedGoal = { 
        id: goalId, 
        title: 'Goal 1', 
        status: GoalStatus.ON_HOLD,
        userId
      };
      
      goalsService.updateStatus.mockResolvedValue(updatedGoal);
      
      expect(await controller.updateStatus(goalId, statusUpdate, req)).toBe(updatedGoal);
      expect(goalsService.updateStatus).toHaveBeenCalledWith(goalId, userId, GoalStatus.ON_HOLD);
    });
  });

  describe('remove', () => {
    it('should remove a goal', async () => {
      const goalId = 'goal-id-1';
      const userId = 'user-id-1';
      const req = { user: { id: userId } };
      
      goalsService.remove.mockResolvedValue(undefined);
      
      expect(await controller.remove(goalId, req)).toBeUndefined();
      expect(goalsService.remove).toHaveBeenCalledWith(goalId, userId);
    });
  });
});
