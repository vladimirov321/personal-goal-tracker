import apiClient from '../apiClient';
import goalService, { Goal, CreateGoalPayload, UpdateGoalPayload } from '../goalService';

jest.mock('../apiClient', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(), 
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn()
  }
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('GoalService', () => {
  const mockGoal: Goal = {
    id: '1',
    title: 'Test Goal',
    description: 'Test Description',
    category: 'Personal',
    targetDate: '2023-12-31',
    status: 'not_started',
    progress: 0,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  };

  const mockGoals: Goal[] = [mockGoal];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getAllGoals should call apiClient.get with correct path', async () => {
    mockedApiClient.get.mockResolvedValueOnce(mockGoals);
    
    const result = await goalService.getAllGoals();
    
    expect(apiClient.get).toHaveBeenCalledWith('/goals');
    expect(result).toEqual(mockGoals);
  });

  test('getGoalsByCategory should call apiClient.get with correct path', async () => {
    const category = 'Personal';
    mockedApiClient.get.mockResolvedValueOnce(mockGoals);
    
    const result = await goalService.getGoalsByCategory(category);
    
    expect(apiClient.get).toHaveBeenCalledWith(`/goals/category/${category}`);
    expect(result).toEqual(mockGoals);
  });

  test('getGoalById should call apiClient.get with correct path', async () => {
    const id = '1';
    mockedApiClient.get.mockResolvedValueOnce(mockGoal);
    
    const result = await goalService.getGoalById(id);
    
    expect(apiClient.get).toHaveBeenCalledWith(`/goals/${id}`);
    expect(result).toEqual(mockGoal);
  });

  test('createGoal should call apiClient.post with correct path and payload', async () => {
    const createPayload: CreateGoalPayload = {
      title: 'New Goal',
      description: 'New Description',
      category: 'Personal',
      targetDate: '2023-12-31'
    };
    mockedApiClient.post.mockResolvedValueOnce(mockGoal);
    
    const result = await goalService.createGoal(createPayload);
    
    expect(apiClient.post).toHaveBeenCalledWith('/goals', createPayload);
    expect(result).toEqual(mockGoal);
  });

  test('updateGoal should call apiClient.put with correct path and payload', async () => {
    const id = '1';
    const updatePayload: UpdateGoalPayload = {
      title: 'Updated Goal',
      status: 'in_progress',
      progress: 50
    };
    mockedApiClient.put.mockResolvedValueOnce(mockGoal);
    
    const result = await goalService.updateGoal(id, updatePayload);
    
    expect(apiClient.put).toHaveBeenCalledWith(`/goals/${id}`, updatePayload);
    expect(result).toEqual(mockGoal);
  });

  test('updateGoalProgress should call apiClient.patch with correct path and payload', async () => {
    const id = '1';
    const progress = 75;
    mockedApiClient.patch.mockResolvedValueOnce(mockGoal);
    
    const result = await goalService.updateGoalProgress(id, progress);
    
    expect(apiClient.patch).toHaveBeenCalledWith(`/goals/${id}/progress`, { progress });
    expect(result).toEqual(mockGoal);
  });

  test('deleteGoal should call apiClient.delete with correct path', async () => {
    const id = '1';
    mockedApiClient.delete.mockResolvedValueOnce(undefined);
    
    await goalService.deleteGoal(id);
    
    expect(apiClient.delete).toHaveBeenCalledWith(`/goals/${id}`);
  });

  test('should handle API errors properly', async () => {
    const error = new Error('API Error');
    mockedApiClient.get.mockRejectedValueOnce(error);
    
    await expect(goalService.getAllGoals()).rejects.toThrow();
  });
});
