import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { GoalStatus } from '../enums/goal-status.enum';
import { GoalCategory } from '../enums/goal-category.enum';

@Entity('goals')
export class Goal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: GoalCategory,
    default: GoalCategory.PERSONAL,
    nullable: true
  })
  category: GoalCategory;

  @Column({ nullable: true, type: 'date' })
  targetDate: Date;

  @Column({ default: 0 })
  progress: number;

  @Column({
    type: 'enum',
    enum: GoalStatus,
    default: GoalStatus.TODO
  })
  status: GoalStatus;

  @ManyToOne('User', 'goals', { onDelete: 'CASCADE' })
  user: any;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
