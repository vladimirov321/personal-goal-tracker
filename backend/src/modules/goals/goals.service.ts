import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goal, GoalStatus } from './entities/goal.entity';

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal)
    private readonly goalsRepository: Repository<Goal>,
  ) {}

  async findAll(): Promise<Goal[]> {
    return await this.goalsRepository.find();
  }

  async findAllByUserId(userId: string): Promise<Goal[]> {
    return await this.goalsRepository.find({
      where: { userId },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string, userId?: string): Promise<Goal> {
    const query = { id };
    if (userId) {
      Object.assign(query, { userId });
    }
    
    const goal = await this.goalsRepository.findOne({ where: query });
    
    if (!goal) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }
    
    return goal;
  }

  async create(createGoalData: { title: string; description?: string; userId: string }): Promise<Goal> {
    const goal = this.goalsRepository.create({
      ...createGoalData,
      status: GoalStatus.TODO,
    });
    
    return await this.goalsRepository.save(goal);
  }

  async update(id: string, userId: string, updateGoalData: Partial<Goal>): Promise<Goal> {
    const goal = await this.findOne(id, userId);

    Object.assign(goal, updateGoalData);
    
    return await this.goalsRepository.save(goal);
  }
  
  async updateStatus(id: string, userId: string, status: GoalStatus): Promise<Goal> {
    const goal = await this.findOne(id, userId);
    goal.status = status;
    
    return await this.goalsRepository.save(goal);
  }
  
  async remove(id: string, userId: string): Promise<void> {
    const goal = await this.findOne(id, userId);
    await this.goalsRepository.remove(goal);
  }
}
