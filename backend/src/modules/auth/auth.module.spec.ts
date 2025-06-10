import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';

describe('AuthModule', () => {
  it('should compile a minimal module with AuthService', async () => {
    const mockUsersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };
    
    const mockConfigService = {
      get: jest.fn().mockImplementation((key) => {
        if (key === 'JWT_SECRET') return 'test-secret';
        if (key === 'JWT_EXPIRATION_TIME') return '1h';
        return null;
      }),
    };

    const module = await Test.createTestingModule({
      imports: [
        PassportModule,
        JwtModule.registerAsync({
          useFactory: () => ({
            secret: 'test-secret',
            signOptions: { expiresIn: '1h' },
          }),
        }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        JwtStrategy,
        { provide: UsersService, useValue: mockUsersService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    expect(module).toBeDefined();
    const authService = module.get(AuthService);
    expect(authService).toBeInstanceOf(AuthService);
  });
  
  it('should test JwtStrategy', async () => {
    const user = { id: '1', username: 'testuser', email: 'test@example.com' };
    const mockUsersService = {
      findOne: jest.fn().mockResolvedValue(user),
    };
    
    const mockConfigService = {
      get: jest.fn().mockImplementation((key) => {
        if (key === 'JWT_SECRET') return 'test-secret';
        return null;
      }),
    };
    
    const module = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UsersService, useValue: mockUsersService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();
    
    const jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    expect(jwtStrategy).toBeDefined();
    
    const payload = { sub: '1', username: 'testuser' };
    const result = await jwtStrategy.validate(payload);
    
    expect(mockUsersService.findOne).toHaveBeenCalledWith('1');
    expect(result).toEqual(user);
  });
});
