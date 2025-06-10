import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Goal } from '../modules/goals/entities/goal.entity';
import { User } from '../modules/users/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      entities: [Goal, User],
      synchronize: true,
      dropSchema: true,
    }),
  ],
})
export class TestDatabaseModule {}
