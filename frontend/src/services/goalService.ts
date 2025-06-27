import apiClient from './apiClient';

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  targetDate: string;
  status: 'not_started' | 'in_progress' | 'completed';
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
  status?: 'not_started' | 'in_progress' | 'completed';
  progress?: number;
}

class GoalService {
  private basePath = '/goals';

  async getAllGoals(): Promise<Goal[]> {
    return apiClient.get<Goal[]>(this.basePath);
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
