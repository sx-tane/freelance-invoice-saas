import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';
import { Subscription, SubscriptionPlan, SubscriptionStatus } from '../subscriptions/entities/subscription.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: Repository<User>;
  let subscriptionsRepository: Repository<Subscription>;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'hashedPassword',
    role: UserRole.FREELANCER,
    company: 'Test Company',
    phone: '123456789',
    address: '123 Test St',
    city: 'Test City',
    state: 'Test State',
    postalCode: '12345',
    country: 'Test Country',
    taxId: 'TAX123',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
    clients: [],
    invoices: [],
    subscription: null,
  };

  const mockSubscription: Subscription = {
    id: '1',
    userId: '1',
    plan: SubscriptionPlan.FREE,
    status: SubscriptionStatus.ACTIVE,
    monthlyPrice: 0,
    invoiceLimit: 5,
    clientLimit: 5,
    invoicesSent: 0,
    clientsCreated: 0,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(),
    trialEnd: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: mockUser,
  };

  const mockUsersRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockSubscriptionsRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
        {
          provide: getRepositoryToken(Subscription),
          useValue: mockSubscriptionsRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    subscriptionsRepository = module.get<Repository<Subscription>>(getRepositoryToken(Subscription));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user and default subscription', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockUsersRepository.create.mockReturnValue(mockUser);
      mockUsersRepository.save.mockResolvedValue(mockUser);
      mockSubscriptionsRepository.create.mockReturnValue(mockSubscription);
      mockSubscriptionsRepository.save.mockResolvedValue(mockSubscription);

      const result = await service.create(createUserDto);

      expect(mockUsersRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(mockUsersRepository.save).toHaveBeenCalledWith(mockUser);
      expect(mockSubscriptionsRepository.create).toHaveBeenCalledWith({
        userId: mockUser.id,
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.ACTIVE,
        monthlyPrice: 0,
        invoiceLimit: 5,
        clientLimit: 5,
      });
      expect(mockSubscriptionsRepository.save).toHaveBeenCalledWith(mockSubscription);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return an array of users with relations', async () => {
      const users = [mockUser];
      mockUsersRepository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(mockUsersRepository.find).toHaveBeenCalledWith({
        relations: ['subscription'],
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          company: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
        },
      });
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockUsersRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne('1');

      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['subscription'],
        select: expect.any(Object),
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { id: '999' },
        relations: ['subscription'],
        select: expect.any(Object),
      });
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      mockUsersRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        relations: ['subscription'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
        lastName: 'Smith',
      };

      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      mockUsersRepository.save.mockResolvedValue({ ...mockUser, ...updateUserDto });

      const result = await service.update('1', updateUserDto);

      expect(mockUsersRepository.save).toHaveBeenCalled();
      expect(result.firstName).toBe('Jane');
      expect(result.lastName).toBe('Smith');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(service.update('999', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      mockUsersRepository.remove.mockResolvedValue(mockUser);

      await service.remove('1');

      expect(mockUsersRepository.remove).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateLastLogin', () => {
    it('should update user last login timestamp', async () => {
      const updateSpy = jest.spyOn(usersRepository, 'update');

      await service.updateLastLogin('1');

      expect(updateSpy).toHaveBeenCalledWith('1', {
        lastLoginAt: expect.any(Date),
      });
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate a user', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      mockUsersRepository.save.mockResolvedValue(inactiveUser);

      const result = await service.deactivateUser('1');

      expect(result.isActive).toBe(false);
      expect(mockUsersRepository.save).toHaveBeenCalled();
    });
  });

  describe('activateUser', () => {
    it('should activate a user', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      const activeUser = { ...mockUser, isActive: true };
      mockUsersRepository.findOne.mockResolvedValue(inactiveUser);
      mockUsersRepository.save.mockResolvedValue(activeUser);

      const result = await service.activateUser('1');

      expect(result.isActive).toBe(true);
      expect(mockUsersRepository.save).toHaveBeenCalled();
    });
  });

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          user_id: '1',
          user_firstName: 'John',
          user_lastName: 'Doe',
          user_email: 'test@example.com',
          subscription_plan: 'FREE',
          subscription_invoicesSent: '3',
          subscription_invoiceLimit: '5',
          subscription_clientsCreated: '2',
          subscription_clientLimit: '5',
          totalClients: '2',
          totalInvoices: '3',
          paidInvoices: '1',
          totalRevenue: '1000.00',
          outstandingAmount: '500.00',
        }),
      };

      mockUsersRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getUserStats('1');

      expect(result).toEqual({
        user: {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'test@example.com',
        },
        subscription: {
          plan: 'FREE',
          invoicesSent: 3,
          invoiceLimit: 5,
          clientsCreated: 2,
          clientLimit: 5,
        },
        stats: {
          totalClients: 2,
          totalInvoices: 3,
          paidInvoices: 1,
          totalRevenue: 1000,
          outstandingAmount: 500,
        },
      });
    });
  });
});