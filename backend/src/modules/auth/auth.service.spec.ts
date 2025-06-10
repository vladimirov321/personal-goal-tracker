import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: any;
  let jwtService: any;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };
    
    jwtService = {
      sign: jest.fn().mockReturnValue('test-token'),
    };
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      const user = { id: '1', email: 'test@example.com', username: 'testuser', password: 'hashedpassword' };
      usersService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password123');
      
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
      expect(result).toEqual({ id: '1', email: 'test@example.com', username: 'testuser' });
    });

    it('should return null if user is not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@example.com', 'password123');
      
      expect(usersService.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      const user = { id: '1', email: 'test@example.com', username: 'testuser', password: 'hashedpassword' };
      usersService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrongpassword');
      
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedpassword');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token and user data', async () => {
      const user = { id: '1', email: 'test@example.com', username: 'testuser' };

      const result = await service.login(user);
      
      expect(jwtService.sign).toHaveBeenCalledWith({ email: 'test@example.com', sub: '1' });
      expect(result).toEqual({
        accessToken: 'test-token',
        user: {
          id: '1',
          email: 'test@example.com',
          username: 'testuser',
        },
      });
    });
  });

  describe('register', () => {
    it('should create user and return access token with user data', async () => {
      const registerData = { email: 'new@example.com', username: 'newuser', password: 'password123' };
      const createdUser = { 
        id: '2', 
        email: 'new@example.com', 
        username: 'newuser', 
        password: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      usersService.create.mockResolvedValue(createdUser);

      const result = await service.register(registerData);
      
      expect(usersService.create).toHaveBeenCalledWith(registerData);
      expect(jwtService.sign).toHaveBeenCalledWith({ email: 'new@example.com', sub: '2' });
      expect(result).toEqual({
        accessToken: 'test-token',
        user: {
          id: '2',
          email: 'new@example.com',
          username: 'newuser',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        },
      });
    });
  });
});
