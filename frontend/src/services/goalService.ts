import apiClient from './apiClient';

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  targetDate: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD';
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalPayload {
  title: string;
  description?: string;
  category: string;
  targetDate?: string;
}

export interface UpdateGoalPayload {
  title?: string;
  description?: string;
  category?: string;
  targetDate?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD';
  progress?: number;
}

class GoalService {
  private basePath = '/goals';

  async getAllGoals(): Promise<Goal[]> {
    return apiClient.get<Goal[]>(this.basePath);
  }

  async getCategories(): Promise<string[]> {
    return apiClient.get<string[]>(`${this.basePath}/metadata/categories`);
  }

  async getStatuses(): Promise<string[]> {
    return apiClient.get<string[]>(`${this.basePath}/metadata/statuses`);
  }

  async getGoalsByCategory(category: string): Promise<Goal[]> {
    return apiClient.get<Goal[]>(`${this.basePath}/category/${category}`);
  }

  async getGoalById(id: string): Promise<Goal> {
    return apiClient.get<Goal>(`${this.basePath}/${id}`);
  }

  async createGoal(goalData: CreateGoalPayload): Promise<Goal> {
    return apiClient.post<Goal>(this.basePath, goalData);
  }

  async updateGoal(id: string, goalData: UpdateGoalPayload): Promise<Goal> {
    return apiClient.put<Goal>(`${this.basePath}/${id}`, goalData);
  }

  async updateGoalProgress(id: string, progress: number): Promise<Goal> {
    return apiClient.patch<Goal>(`${this.basePath}/${id}/progress`, { progress });
  }

  async deleteGoal(id: string): Promise<void> {
    return apiClient.delete(`${this.basePath}/${id}`);
  }
}

const goalService = new GoalService();
export default goalService;
