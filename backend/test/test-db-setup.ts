import { ConfigModule } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

export async function setupTestDatabase(): Promise<INestApplication> {
  try {
    process.env.NODE_ENV = 'test';
    
    process.env.DATABASE_HOST = 'localhost';
    process.env.DATABASE_PORT = '5432';
    process.env.DATABASE_USER = 'goaltracker_dev_user';
    process.env.DATABASE_PASSWORD = 'GoalTracker_Dev_P@55w0rd_2025';
    process.env.DATABASE_NAME = 'goal_tracker_test_db';
    
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test',
          isGlobal: true,
          ignoreEnvFile: false,
        }),
        AppModule,
      ],
    }).compile();

    const app = moduleRef.createNestApplication();
    await app.init();
    
    return app;
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  }
}

export async function cleanupTestDatabase(app: INestApplication) {
  try {
    const dataSource = app.get(DataSource);
    
    const entities = dataSource.entityMetadatas;
    
    for (const entity of entities) {
      const repository = dataSource.getRepository(entity.name);
      await repository.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE;`);
    }
    
    await app.close();
  } catch (error) {
    console.error('Error cleaning up test database:', error);
  }
}
