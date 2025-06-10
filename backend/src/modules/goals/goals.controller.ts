import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { Goal } from './entities/goal.entity';
import { GoalStatus } from './enums/goal-status.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('goals')
@UseGuards(JwtAuthGuard)
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get()
  async findAll(@Request() req): Promise<Goal[]> {
    return await this.goalsService.findAllByUserId(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req): Promise<Goal> {
    return await this.goalsService.findOne(id, req.user.id);
  }

  @Post()
  async create(
    @Body() createGoalDto: { title: string; description?: string },
    @Request() req,
  ): Promise<Goal> {
    return await this.goalsService.create({
      ...createGoalDto,
      userId: req.user.id,
    });
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateGoalDto: Partial<Goal>,
    @Request() req,
  ): Promise<Goal> {
    return await this.goalsService.update(id, req.user.id, updateGoalDto);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() statusUpdate: { status: GoalStatus },
    @Request() req,
  ): Promise<Goal> {
    return await this.goalsService.updateStatus(id, req.user.id, statusUpdate.status);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req): Promise<void> {
    return await this.goalsService.remove(id, req.user.id);
  }
}
