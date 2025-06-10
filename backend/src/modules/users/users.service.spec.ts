import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  remove: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useFactory: createMockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<MockRepository>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of all users', async () => {
      const expectedUsers = [
        { id: '1', email: 'test1@example.com' },
        { id: '2', email: 'test2@example.com' },
      ];
      userRepository.find.mockResolvedValue(expectedUsers);

      const result = await service.findAll();
      
      expect(userRepository.find).toHaveBeenCalled();
      expect(result).toEqual(expectedUsers);
    });
  });

  describe('findOne', () => {
    it('should get a user by ID', async () => {
      const userId = '1';
      const expectedUser = { id: userId, email: 'test@example.com' };
      userRepository.findOne.mockResolvedValue(expectedUser);

      const result = await service.findOne(userId);
      
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(result).toEqual(expectedUser);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user when email exists', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword',
      };
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
    });
  });

  describe('create', () => {
    it('should hash password and create a new user', async () => {
      const createUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123!',
      };
      
      const hashedPassword = 'hashedpassword';
      // Mock bcrypt.hash to return a fixed value without parameter validation
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve(hashedPassword));
      
      const savedUser = {
        id: '2',
        email: createUserDto.email,
        username: createUserDto.username,
        password: hashedPassword,
      };

      userRepository.findOne.mockResolvedValue(null); // No existing user
      userRepository.create.mockReturnValue(savedUser);
      userRepository.save.mockResolvedValue(savedUser);

      const result = await service.create(createUserDto);
      
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(userRepository.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: hashedPassword,
      });
      expect(userRepository.save).toHaveBeenCalledWith(savedUser);
      expect(result).toEqual(savedUser);
    });
    
    it('should throw ConflictException if user with email already exists', async () => {
      const createUserDto = {
        email: 'existing@example.com',
        username: 'existinguser',
        password: 'Password123!',
      };

      userRepository.findOne.mockResolvedValue({ id: '1', email: 'existing@example.com' });

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: createUserDto.email } });
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const userId = '1';
      const updateUserDto = { username: 'updateduser' };
      const existingUser = { id: userId, username: 'oldusername', email: 'test@example.com' };
      const updatedUser = { ...existingUser, username: 'updateduser' };
      
      userRepository.findOne.mockResolvedValue(existingUser);
      userRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateUserDto);
      
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(userRepository.save).toHaveBeenCalledWith(updatedUser);
      expect(result).toEqual(updatedUser);
    });

    it('should hash password when updating password', async () => {
      const userId = '1';
      const updateUserDto = { password: 'NewPassword123!' };
      const existingUser = { id: userId, username: 'testuser', email: 'test@example.com', password: 'oldhash' };
      const hashedPassword = 'newhashpassword';
      const updatedUser = { ...existingUser, password: hashedPassword };
      
      userRepository.findOne.mockResolvedValue(existingUser);
      userRepository.save.mockResolvedValue(updatedUser);
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve(hashedPassword));

      const result = await service.update(userId, updateUserDto);
      
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalledWith(expect.objectContaining({ password: hashedPassword }));
      expect(result).toEqual(updatedUser);
    });
    
    it('should throw NotFoundException when user does not exist', async () => {
      const userId = 'nonexistent';
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.update(userId, { username: 'test' })).rejects.toThrow(NotFoundException);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
    });
  });

  describe('remove', () => {
    it('should remove a user by ID', async () => {
      const userId = '1';
      const user = { id: userId, email: 'test@example.com', username: 'testuser' };
      
      userRepository.findOne.mockResolvedValue(user);
      userRepository.remove.mockReturnValue(undefined);

      await service.remove(userId);
      
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(userRepository.remove).toHaveBeenCalledWith(user);
    });
    
    it('should throw NotFoundException when user to remove does not exist', async () => {
      const userId = 'nonexistent';
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(userId)).rejects.toThrow(NotFoundException);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
    });
  });
});
