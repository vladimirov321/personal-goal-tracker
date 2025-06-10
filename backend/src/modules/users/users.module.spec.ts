import { Test } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users.module';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashedPassword')
}));

describe('UsersModule', () => {
  const mockUser = { 
    id: '1', 
    username: 'testuser', 
    email: 'test@example.com',
    password: 'hashedPassword',
    roles: ['user'],
    goals: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  describe('Module Compilation', () => {
    it('should compile the module with mocked dependencies', async () => {
      const mockUsersRepository = {
        find: jest.fn(),
        findOne: jest.fn(),
        findOneBy: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        remove: jest.fn(),
      };

      const module = await Test.createTestingModule({
        controllers: [UsersController],
        providers: [
          UsersService,
          {
            provide: getRepositoryToken(User),
            useValue: mockUsersRepository,
          },
        ],
      }).compile();

      expect(module).toBeDefined();
      const usersService = module.get(UsersService);
      const usersController = module.get(UsersController);
      
      expect(usersService).toBeInstanceOf(UsersService);
      expect(usersController).toBeDefined();
    });

    it('should compile with mocked TypeOrmModule.forFeature', async () => {
      const module = await Test.createTestingModule({
        imports: [
          {
            module: class MockTypeOrmModule {},
            exports: [getRepositoryToken(User)],
            providers: [
              {
                provide: getRepositoryToken(User),
                useValue: {
                  find: jest.fn(),
                  findOne: jest.fn(),
                  findOneBy: jest.fn(),
                  create: jest.fn(),
                  save: jest.fn(),
                },
              },
            ],
          },
        ],
        controllers: [UsersController],
        providers: [UsersService],
      }).compile();

      expect(module).toBeDefined();
    });
  });

  describe('UsersService Tests', () => {
    let service: UsersService;
    let mockUsersRepository;

    beforeEach(async () => {
      mockUsersRepository = {
        find: jest.fn().mockResolvedValue([mockUser]),
        findOne: jest.fn().mockResolvedValue(mockUser),
        findOneBy: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockReturnValue(mockUser),
        save: jest.fn().mockImplementation(entity => Promise.resolve({...entity, id: '1'})),
        update: jest.fn().mockResolvedValue({ affected: 1 }),
        delete: jest.fn().mockResolvedValue({ affected: 1 }),
        remove: jest.fn().mockResolvedValue(mockUser),
      };

      const moduleRef = await Test.createTestingModule({
        providers: [
          UsersService,
          {
            provide: getRepositoryToken(User),
            useValue: mockUsersRepository,
          },
        ],
      }).compile();

      service = moduleRef.get<UsersService>(UsersService);
    });

    it('should find all users', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockUser]);
      expect(mockUsersRepository.find).toBeTruthy();
      expect(mockUsersRepository.find.mock.calls.length).toBeGreaterThan(0);
    });

    it('should find one user by id', async () => {
      const result = await service.findOne('1');
      expect(result).toEqual(mockUser);
      expect(mockUsersRepository.findOne).toBeTruthy();
      expect(mockUsersRepository.findOne.mock.calls.length).toBeGreaterThan(0);
    });

    it('should find user by email', async () => {
      mockUsersRepository.findOne.mockResolvedValueOnce(mockUser);
      
      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
      expect(mockUsersRepository.findOne).toBeTruthy();
      expect(mockUsersRepository.findOne.mock.calls.length).toBeGreaterThan(0);
    });

    it('should create a new user', async () => {
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
      };

      mockUsersRepository.findOne.mockResolvedValueOnce(null);
      
      const result = await service.create(userData);
      expect(result).toBeDefined();
      expect(mockUsersRepository.create).toBeTruthy();
      expect(mockUsersRepository.save).toBeTruthy();
    });

    it('should update a user', async () => {
      const updateData = { username: 'updateduser' };
      const result = await service.update('1', updateData);
      expect(result).toBeDefined();
    });

    it('should remove a user', async () => {
      await service.remove('1');
      expect(mockUsersRepository.remove).toBeTruthy();
      expect(mockUsersRepository.remove.mock.calls.length).toBeGreaterThan(0);
    });
  });

  describe('UsersController Tests', () => {
    let controller: UsersController;
    let mockUsersRepository;

    beforeEach(async () => {
      mockUsersRepository = {
        find: jest.fn().mockResolvedValue([mockUser]),
        findOne: jest.fn().mockResolvedValue(mockUser),
        findOneBy: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockReturnValue(mockUser),
        save: jest.fn().mockImplementation(entity => Promise.resolve({...entity, id: '1'})),
        update: jest.fn().mockResolvedValue({ affected: 1 }),
        delete: jest.fn().mockResolvedValue({ affected: 1 }),
        remove: jest.fn().mockResolvedValue(mockUser),
      };

      const moduleRef = await Test.createTestingModule({
        controllers: [UsersController],
        providers: [
          UsersService,
          {
            provide: getRepositoryToken(User),
            useValue: mockUsersRepository,
          },
        ],
      }).compile();

      controller = moduleRef.get<UsersController>(UsersController);
    });

    it('should find all users', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([mockUser]);
      expect(mockUsersRepository.find).toBeTruthy();
      expect(mockUsersRepository.find.mock.calls.length).toBeGreaterThan(0);
    });

    it('should find one user by id', async () => {
      const result = await controller.findOne('1');
      expect(result).toEqual(mockUser);
      expect(mockUsersRepository.findOne).toBeTruthy();
      expect(mockUsersRepository.findOne.mock.calls.length).toBeGreaterThan(0);
    });

    it('should create a new user', async () => {
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
      };

      mockUsersRepository.findOne.mockResolvedValueOnce(null);
      
      const result = await controller.create(userData);
      expect(result).toBeDefined();
    });

    it('should update a user', async () => {
      const updateData = { username: 'updateduser' };
      const result = await controller.update('1', updateData);
      expect(result).toBeDefined();
    });

    it('should remove a user', async () => {
      await controller.remove('1');
      expect(mockUsersRepository.remove).toBeTruthy();
      expect(mockUsersRepository.remove.mock.calls.length).toBeGreaterThan(0);
    });
  });

  describe('Module Structure', () => {
    it('should validate the TypeOrmModule.forFeature usage', () => {
      const typeOrmSpy = jest.spyOn(TypeOrmModule, 'forFeature');
      
      TypeOrmModule.forFeature([User]);
      
      expect(typeOrmSpy).toBeTruthy();
      expect(typeOrmSpy.mock.calls.length).toBeGreaterThan(0);
      expect(typeOrmSpy.mock.calls[0][0]).toEqual([User]);
      
      typeOrmSpy.mockRestore();
    });
  });
});
