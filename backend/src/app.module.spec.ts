import { Test } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('AppModule', () => {
  it('should compile a minimal app module', async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
      ],
    }).compile();

    expect(module).toBeDefined();
    const configService = module.get(ConfigService);
    expect(configService).toBeDefined();
    
    expect(typeof configService.get('NODE_ENV')).toBe('string');
  });
});
