import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let usersService: any;
  let configService: any;

  beforeEach(async () => {
    usersService = {
      findOne: jest.fn(),
    };

    configService = {
      get: jest.fn().mockReturnValue('test-secret'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: ConfigService, useValue: configService },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user data from payload', async () => {
      const userId = 'user-id-1';
      const user = {
        id: userId,
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword',
      };

      usersService.findOne.mockResolvedValue(user);

      const payload = { sub: userId, email: 'test@example.com' };
      const result = await strategy.validate(payload);

      expect(usersService.findOne).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        id: userId,
        email: 'test@example.com',
        username: 'testuser',
      });
    });
  });
});
