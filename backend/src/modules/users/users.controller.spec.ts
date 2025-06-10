import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: any;

  beforeEach(async () => {
    usersService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [
        { id: '1', email: 'user1@example.com', username: 'user1' },
        { id: '2', email: 'user2@example.com', username: 'user2' },
      ];
      usersService.findAll.mockResolvedValue(users);

      expect(await controller.findAll()).toBe(users);
      expect(usersService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = { id: '1', email: 'user1@example.com', username: 'user1' };
      usersService.findOne.mockResolvedValue(user);

      expect(await controller.findOne('1')).toBe(user);
      expect(usersService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        email: 'new@example.com',
        username: 'newuser',
        password: 'password123',
      };
      const createdUser = {
        id: '3',
        email: 'new@example.com',
        username: 'newuser',
      };
      usersService.create.mockResolvedValue(createdUser);

      expect(await controller.create(createUserDto)).toBe(createdUser);
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const userId = '1';
      const updateUserDto = { username: 'updateduser' };
      const updatedUser = {
        id: '1',
        email: 'user1@example.com',
        username: 'updateduser',
      };
      usersService.update.mockResolvedValue(updatedUser);

      expect(await controller.update(userId, updateUserDto)).toBe(updatedUser);
      expect(usersService.update).toHaveBeenCalledWith(userId, updateUserDto);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const userId = '1';
      usersService.remove.mockResolvedValue(undefined);

      expect(await controller.remove(userId)).toBeUndefined();
      expect(usersService.remove).toHaveBeenCalledWith(userId);
    });
  });
});
