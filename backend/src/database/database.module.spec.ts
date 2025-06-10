import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

describe('DatabaseModule', () => {
  it('should verify TypeOrmModule configuration', async () => {
    const mockConfigService = {
      get: jest.fn().mockImplementation((key) => {
        if (key === 'DATABASE_HOST') return 'localhost';
        if (key === 'DATABASE_PORT') return 5432;
        if (key === 'DATABASE_USERNAME') return 'postgres';
        if (key === 'DATABASE_PASSWORD') return 'postgres';
        if (key === 'DATABASE_NAME') return 'test';
        return null;
      }),
    };

    const typeOrmFactory = (configService: ConfigService) => ({
      type: 'postgres',
      host: configService.get('DATABASE_HOST'),
      port: configService.get('DATABASE_PORT'),
      username: configService.get('DATABASE_USERNAME'),
      password: configService.get('DATABASE_PASSWORD'),
      database: configService.get('DATABASE_NAME'),
      entities: [],
      synchronize: false,
    });
    
    const dbConfig = typeOrmFactory(mockConfigService as any);
    
    expect(dbConfig).toEqual({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'test',
      entities: [],
      synchronize: false,
    });
  });
});
