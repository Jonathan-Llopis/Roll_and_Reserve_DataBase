import { Test, TestingModule } from '@nestjs/testing';
import { UsersReservesService } from './users_reserves.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../users/users.entity';
import { UserReserveEntity } from './users_reserves.entity';
import { ReservesEntity } from '../reserves/reserves.entity';
import { FcmNotificationService } from '../fcm-notification/fcm-notification.service';
import {
  NotFoundException,
  PreconditionFailedException,
  HttpException,
} from '@nestjs/common';

let service: UsersReservesService;

const mockUsersRepository = {
  findOne: jest.fn(),
};

const mockUserReserveRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const mockReservesRepository = {
  findOne: jest.fn(),
};

const mockFcmNotificationService = {
  sendMulticastNotification: jest.fn(),
};

beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      UsersReservesService,
      {
        provide: getRepositoryToken(UserEntity),
        useValue: mockUsersRepository,
      },
      {
        provide: getRepositoryToken(UserReserveEntity),
        useValue: mockUserReserveRepository,
      },
      {
        provide: getRepositoryToken(ReservesEntity),
        useValue: mockReservesRepository,
      },
      {
        provide: FcmNotificationService,
        useValue: mockFcmNotificationService,
      },
    ],
  }).compile();

  service = module.get<UsersReservesService>(UsersReservesService);
});

afterEach(() => {
  jest.clearAllMocks();
});

it('should be defined', () => {
  expect(service).toBeDefined();
});

it('should throw NotFoundException if user is not found', async () => {
  mockUsersRepository.findOne.mockResolvedValue(null);

  await expect(
    service.addUsertoReserve('userId', 'reserveId', true),
  ).rejects.toThrow(NotFoundException);
});

it('should throw NotFoundException if reserve is not found', async () => {
  mockUsersRepository.findOne.mockResolvedValue({ id_google: 'userId' });
  mockReservesRepository.findOne.mockResolvedValue(null);

  await expect(
    service.addUsertoReserve('userId', 'reserveId', true),
  ).rejects.toThrow(NotFoundException);
});

it('should save a new UserReserveEntity and send notifications', async () => {
  const mockUser = { id_google: 'userId', name: 'Test User', userReserves: [] };
  const mockReserve = {
    id_reserve: 1,
    userReserves: [],
    reserve_table: { tables_of_shop: { name: 'Test Shop' } },
    hour_start: new Date(),
  };

  mockUsersRepository.findOne.mockResolvedValue(mockUser);
  mockReservesRepository.findOne.mockResolvedValue(mockReserve);
  mockUserReserveRepository.save.mockResolvedValue({});
  mockUserReserveRepository.save.mockResolvedValue({});

  await service.addUsertoReserve('userId', '1', true);

  expect(mockUserReserveRepository.save).toHaveBeenCalled();
});

it('should throw NotFoundException if reserve is not found', async () => {
  mockReservesRepository.findOne.mockResolvedValue(null);

  await expect(service.findReserveById('1')).rejects.toThrow(NotFoundException);
});

it('should return the reserve if found', async () => {
  const mockReserve = { id_reserve: 1 };
  mockReservesRepository.findOne.mockResolvedValue(mockReserve);

  const result = await service.findReserveById('1');
  expect(result).toEqual(mockReserve);
});

it('should throw PreconditionFailedException if userReserve is not found', async () => {
  mockUserReserveRepository.findOne.mockResolvedValue(null);

  await expect(service.findReserveFromUser('userId', '1')).rejects.toThrow(
    PreconditionFailedException,
  );
});

it('should return the userReserve if found', async () => {
  const mockUserReserve = { id: 1 };
  mockUserReserveRepository.findOne.mockResolvedValue(mockUserReserve);

  const result = await service.findReserveFromUser('userId', '1');
  expect(result).toEqual(mockUserReserve);
});

it('should throw NotFoundException if user is not found', async () => {
  mockUsersRepository.findOne.mockResolvedValue(null);

  await expect(service.findReservesFromUser('userId')).rejects.toThrow(
    NotFoundException,
  );
});

it('should throw HttpException if no reserves are found', async () => {
  const mockUser = { id_google: 'userId', userReserves: [] };
  mockUsersRepository.findOne.mockResolvedValue(mockUser);

  await expect(service.findReservesFromUser('userId')).rejects.toThrow(
    HttpException,
  );
});

it('should return sorted user reserves', async () => {
  const mockUser = {
    id_google: 'userId',
    userReserves: [
      {
        reserve: {
          hour_start: new Date('2023-12-01T10:00:00Z'),
          hour_end: new Date(Date.now() + 86400000),
        },
      },
      {
        reserve: {
          hour_start: new Date('2023-11-01T10:00:00Z'),
          hour_end: new Date(Date.now() + 86400000),
        },
      },
    ],
  };

  mockUsersRepository.findOne.mockResolvedValue(mockUser);

  const result = await service.findReservesFromUser('userId');

  expect(result).toHaveLength(2);
  expect(result[0].reserve.hour_start).toEqual(
    new Date('2023-11-01T10:00:00Z'),
  );
  expect(result[1].reserve.hour_start).toEqual(
    new Date('2023-12-01T10:00:00Z'),
  );
  expect(result[0].reserve.hour_end.getTime()).toBeGreaterThan(Date.now());
});

it('should throw PreconditionFailedException if userReserve is not found', async () => {
  mockUserReserveRepository.findOne.mockResolvedValue(null);

  await expect(service.deleteReserveFromUser('userId', '1')).rejects.toThrow(
    PreconditionFailedException,
  );
});

it('should not send notifications if no other users are in the reserve', async () => {
  const mockUserReserve = {
    reserve: {
      id_reserve: 1,
      userReserves: [],
      reserve_table: { tables_of_shop: { name: 'Test Shop' } },
      hour_start: new Date(),
    },
    user: { name: 'Test User', id_google: 'userId' },
  };
  mockReservesRepository.findOne.mockResolvedValue(mockUserReserve.reserve);
  mockUserReserveRepository.findOne.mockResolvedValue(mockUserReserve);

  await service.deleteReserveFromUser('userId', '1');

  expect(mockUserReserveRepository.remove).toHaveBeenCalled();
  expect(
    mockFcmNotificationService.sendMulticastNotification,
  ).not.toHaveBeenCalled();
});

it('should throw NotFoundException if reserve is not found during deletion', async () => {
  mockUserReserveRepository.findOne.mockResolvedValue({
    user: { id_google: 'userId' },
    reserve: { id_reserve: 1 },
  });
  mockReservesRepository.findOne.mockResolvedValue(null);

  await expect(service.deleteReserveFromUser('userId', '1')).rejects.toThrow(
    NotFoundException,
  );
  expect(mockUserReserveRepository.remove).not.toHaveBeenCalled();
  expect(
    mockFcmNotificationService.sendMulticastNotification,
  ).not.toHaveBeenCalled();
});

it('should handle errors when sending notifications during deletion', async () => {
  const mockUserReserve = {
    reserve: {
      id_reserve: 1,
      userReserves: [
        { user: { id_google: 'otherUserId', token_notification: 'token1' } },
      ],
      reserve_table: { tables_of_shop: { name: 'Test Shop' } },
      hour_start: new Date(),
    },
    user: { name: 'Test User', id_google: 'userId' },
  };
  mockReservesRepository.findOne.mockResolvedValue(mockUserReserve.reserve);
  mockFcmNotificationService.sendMulticastNotification.mockImplementation(
    () => {
      throw new Error('Notification Error');
    },
  );
  try {
    await service.deleteReserveFromUser('userId', '1');
  } catch (error) {
    expect(error.message).toBe('Notification Error');
  }

  expect(mockUserReserveRepository.remove).toHaveBeenCalled();
  expect(
    mockFcmNotificationService.sendMulticastNotification,
  ).toHaveBeenCalled();
  expect(mockUserReserveRepository.remove).toHaveBeenCalled();
  expect(
    mockFcmNotificationService.sendMulticastNotification,
  ).toHaveBeenCalled();
});

it('should not remove userReserve if it does not exist', async () => {
  mockUserReserveRepository.findOne.mockResolvedValue(null);

  await expect(service.deleteReserveFromUser('userId', '1')).rejects.toThrow(
    PreconditionFailedException,
  );
  expect(mockUserReserveRepository.remove).not.toHaveBeenCalled();
});
