import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { Subscription, SubscriptionPlan, SubscriptionStatus } from '../subscriptions/entities/subscription.entity';
import { ClientsService } from '../clients/clients.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceFilterDto } from './dto/invoice-filter.dto';

describe('InvoicesService', () => {
  let service: InvoicesService;
  let invoicesRepository: Repository<Invoice>;
  let invoiceItemsRepository: Repository<InvoiceItem>;
  let subscriptionsRepository: Repository<Subscription>;
  let clientsService: ClientsService;

  const mockInvoice: Invoice = {
    id: '1',
    userId: 'user1',
    clientId: 'client1',
    invoiceNumber: 'INV-001',
    issueDate: new Date(),
    dueDate: new Date(),
    status: InvoiceStatus.DRAFT,
    subtotal: 1000,
    taxRate: 0.1,
    taxAmount: 100,
    discountAmount: 0,
    total: 1100,
    amountDue: 1100,
    amountPaid: 0,
    currency: 'USD',
    notes: 'Test invoice',
    terms: null,
    sentAt: null,
    viewedAt: null,
    paidAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    client: null,
    items: [],
    payments: [],
    user: null,
    generateInvoiceNumber: jest.fn(),
  };

  const mockSubscription: Subscription = {
    id: '1',
    userId: 'user1',
    plan: SubscriptionPlan.PRO,
    status: SubscriptionStatus.ACTIVE,
    monthlyPrice: 29,
    invoiceLimit: 100,
    clientLimit: 50,
    invoicesSent: 5,
    clientsCreated: 3,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(),
    trialEnd: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: null,
  };

  const mockInvoicesRepository = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
  };

  const mockInvoiceItemsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockSubscriptionsRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockClientsService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        {
          provide: getRepositoryToken(Invoice),
          useValue: mockInvoicesRepository,
        },
        {
          provide: getRepositoryToken(InvoiceItem),
          useValue: mockInvoiceItemsRepository,
        },
        {
          provide: getRepositoryToken(Subscription),
          useValue: mockSubscriptionsRepository,
        },
        {
          provide: ClientsService,
          useValue: mockClientsService,
        },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
    invoicesRepository = module.get<Repository<Invoice>>(getRepositoryToken(Invoice));
    invoiceItemsRepository = module.get<Repository<InvoiceItem>>(getRepositoryToken(InvoiceItem));
    subscriptionsRepository = module.get<Repository<Subscription>>(getRepositoryToken(Subscription));
    clientsService = module.get<ClientsService>(ClientsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all invoices for a user', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockInvoice]),
      };

      mockInvoicesRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll('user1');

      expect(mockInvoicesRepository.createQueryBuilder).toHaveBeenCalledWith('invoice');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('invoice.userId = :userId', { userId: 'user1' });
      expect(result).toEqual([mockInvoice]);
    });

    it('should apply filters when provided', async () => {
      const filters: InvoiceFilterDto = {
        status: InvoiceStatus.PAID,
        clientId: 'client1',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
      };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockInvoice]),
      };

      mockInvoicesRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.findAll('user1', filters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('invoice.status = :status', { status: filters.status });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('invoice.clientId = :clientId', { clientId: filters.clientId });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('invoice.issueDate BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    });
  });

  describe('findOne', () => {
    it('should return an invoice by id and userId', async () => {
      mockInvoicesRepository.findOne.mockResolvedValue(mockInvoice);

      const result = await service.findOne('1', 'user1');

      expect(mockInvoicesRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1', userId: 'user1' },
        relations: ['client', 'items', 'payments'],
      });
      expect(result).toEqual(mockInvoice);
    });

    it('should throw NotFoundException when invoice not found', async () => {
      mockInvoicesRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999', 'user1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createInvoiceDto: CreateInvoiceDto = {
      clientId: 'client1',
      issueDate: new Date(),
      dueDate: new Date(),
      currency: 'USD',
      taxRate: 0.1,
      discountAmount: 0,
      notes: 'Test invoice',
      items: [
        {
          description: 'Test item',
          quantity: 1,
          rate: 1000,
        },
      ],
    };

    it('should create an invoice successfully', async () => {
      mockSubscriptionsRepository.findOne.mockResolvedValue(mockSubscription);
      mockInvoicesRepository.count.mockResolvedValue(5); // Under limit
      mockClientsService.findOne.mockResolvedValue({ id: 'client1' });
      mockInvoicesRepository.create.mockReturnValue(mockInvoice);
      mockInvoicesRepository.save.mockResolvedValue(mockInvoice);
      mockInvoiceItemsRepository.create.mockReturnValue({});
      mockInvoiceItemsRepository.save.mockResolvedValue([]);
      mockSubscriptionsRepository.update.mockResolvedValue({});
      
      // Mock the findOne call that happens at the end
      jest.spyOn(service, 'findOne').mockResolvedValue(mockInvoice);

      const result = await service.create(createInvoiceDto, 'user1');

      expect(mockSubscriptionsRepository.findOne).toHaveBeenCalledWith({ where: { userId: 'user1' } });
      expect(mockInvoicesRepository.count).toHaveBeenCalledWith({ where: { userId: 'user1' } });
      expect(mockClientsService.findOne).toHaveBeenCalledWith('client1', 'user1');
      expect(mockInvoicesRepository.save).toHaveBeenCalled();
      expect(mockInvoiceItemsRepository.save).toHaveBeenCalled();
      expect(mockSubscriptionsRepository.update).toHaveBeenCalledWith(
        { userId: 'user1' },
        { invoicesSent: 6 },
      );
      expect(result).toEqual(mockInvoice);
    });

    it('should throw ForbiddenException when no subscription found', async () => {
      mockSubscriptionsRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createInvoiceDto, 'user1')).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when invoice limit reached', async () => {
      const limitedSubscription = { ...mockSubscription, invoiceLimit: 5 };
      mockSubscriptionsRepository.findOne.mockResolvedValue(limitedSubscription);
      mockInvoicesRepository.count.mockResolvedValue(5); // At limit

      await expect(service.create(createInvoiceDto, 'user1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    const updateInvoiceDto: UpdateInvoiceDto = {
      notes: 'Updated notes',
    };

    it('should update an invoice successfully', async () => {
      const updatedInvoice = { ...mockInvoice, notes: 'Updated notes' };
      
      jest.spyOn(service, 'findOne').mockResolvedValue(mockInvoice);
      mockInvoicesRepository.save.mockResolvedValue(updatedInvoice);

      const result = await service.update('1', updateInvoiceDto, 'user1');

      expect(mockInvoicesRepository.save).toHaveBeenCalled();
      expect(result.notes).toBe('Updated notes');
    });

    it('should throw ForbiddenException when trying to update paid invoice', async () => {
      const paidInvoice = { ...mockInvoice, status: InvoiceStatus.PAID, generateInvoiceNumber: jest.fn() };
      jest.spyOn(service, 'findOne').mockResolvedValue(paidInvoice);

      await expect(service.update('1', updateInvoiceDto, 'user1')).rejects.toThrow(ForbiddenException);
    });

    it('should verify client ownership when clientId is updated', async () => {
      const updateWithClient: UpdateInvoiceDto = {
        clientId: 'client2',
        notes: 'Updated notes',
      };

      jest.spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockInvoice)
        .mockResolvedValueOnce(mockInvoice);
      
      mockClientsService.findOne.mockResolvedValue({ id: 'client2' });
      mockInvoicesRepository.update.mockResolvedValue({});

      await service.update('1', updateWithClient, 'user1');

      expect(mockClientsService.findOne).toHaveBeenCalledWith('client2', 'user1');
    });
  });

  describe('remove', () => {
    it('should remove an invoice', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockInvoice);
      mockInvoicesRepository.delete.mockResolvedValue({});

      await service.remove('1', 'user1');

      expect(mockInvoicesRepository.remove).toHaveBeenCalledWith(mockInvoice);
    });

    it('should throw ForbiddenException when trying to delete paid invoice', async () => {
      const paidInvoice = { ...mockInvoice, status: InvoiceStatus.PAID, generateInvoiceNumber: jest.fn() };
      jest.spyOn(service, 'findOne').mockResolvedValue(paidInvoice);

      await expect(service.remove('1', 'user1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateStatus', () => {
    it('should update invoice status', async () => {
      const updatedInvoice = { ...mockInvoice, status: InvoiceStatus.SENT };
      
      jest.spyOn(service, 'findOne').mockResolvedValue(mockInvoice);
      mockInvoicesRepository.save.mockResolvedValue(updatedInvoice);

      const result = await service.updateStatus('1', InvoiceStatus.SENT, 'user1');

      expect(mockInvoicesRepository.save).toHaveBeenCalled();
      expect(result.status).toBe(InvoiceStatus.SENT);
    });
  });

});