import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { ReservesSchedulerService } from './reserves-scheduler.service';
import { ReservesEntity } from './reserves.entity';
import { FcmNotificationService } from '../fcm-notification/fcm-notification.service';
import { createMockRepository } from '../../test/helpers/repository.mock';

describe('ReservesSchedulerService', () => {
  let service: ReservesSchedulerService;
  let reserveRepo: any;
  let fcmService: any;

  beforeEach(async () => {
    reserveRepo = createMockRepository();
    fcmService = {
      sendMulticastNotification: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservesSchedulerService,
        {
          provide: getRepositoryToken(ReservesEntity),
          useValue: reserveRepo,
        },
        {
          provide: FcmNotificationService,
          useValue: fcmService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://localhost:8000'),
          },
        },
      ],
    }).compile();

    service = module.get<ReservesSchedulerService>(ReservesSchedulerService);
  });

  it('should find upcoming reserves and dispatch notifications to users', async () => {
    const mockReserve = {
      id_reserve: 1,
      hour_start: new Date(Date.now() + 100 * 60000),
      confirmation_notification: false,
      reserve_table: {
        tables_of_shop: {
          name: 'Shop Alpha',
          logo: 'logo-1.png',
        },
      },
      reserve_of_game: {
        name: 'Catan',
      },
      userReserves: [
        {
          user: {
            id_user: 1,
            token_notification: 'fcm-token-user-1',
          },
        },
      ],
    };

    reserveRepo.find.mockResolvedValue([mockReserve]);

    await service.handleUpcomingReserves();

    expect(reserveRepo.find).toHaveBeenCalled();
    expect(fcmService.sendMulticastNotification).toHaveBeenCalledWith(
      ['fcm-token-user-1'],
      expect.stringContaining('Shop Alpha'),
      expect.stringContaining('Catan'),
      'http://localhost:8000/files/logo-1.png',
    );
    expect(mockReserve.confirmation_notification).toBe(true);
    expect(reserveRepo.save).toHaveBeenCalledWith(mockReserve);
  });

  it('should handle errors gracefully without throwing', async () => {
    reserveRepo.find.mockRejectedValue(new Error('Database error'));

    await expect(service.handleUpcomingReserves()).resolves.not.toThrow();
  });
});
