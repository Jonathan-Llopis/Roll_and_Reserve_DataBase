import { Test, TestingModule } from '@nestjs/testing';
import { FcmNotificationService } from './fcm-notification.service';
import * as admin from 'firebase-admin';

jest.mock('firebase-admin', () => {
  const mockMessaging = {
    sendEachForMulticast: jest.fn().mockResolvedValue({ successCount: 1, failureCount: 0 }),
    send: jest.fn().mockResolvedValue('projects/test/messages/123'),
  };

  return {
    apps: [],
    initializeApp: jest.fn().mockImplementation(() => {
      (admin.apps as any).push({});
    }),
    credential: {
      cert: jest.fn().mockReturnValue({}),
    },
    messaging: jest.fn().mockReturnValue(mockMessaging),
  };
});

describe('FcmNotificationService', () => {
  let service: FcmNotificationService;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    (admin.apps as any).length = 0;
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should initialize in noop mode when environment variables are missing without throwing errors', async () => {
    delete process.env.PROJECT_ID_FIREBASE;
    delete process.env.CLIENT_EMAIL_FIREBASE;
    delete process.env.PRIVATE_KEY_FIREBASE;

    const module: TestingModule = await Test.createTestingModule({
      providers: [FcmNotificationService],
    }).compile();

    service = module.get<FcmNotificationService>(FcmNotificationService);

    expect(service).toBeDefined();
    expect(service.initialized).toBe(false);
    expect(admin.initializeApp).not.toHaveBeenCalled();
  });

  it('should not throw when sendMulticastNotification is called without Firebase initialized', async () => {
    delete process.env.PROJECT_ID_FIREBASE;

    const module: TestingModule = await Test.createTestingModule({
      providers: [FcmNotificationService],
    }).compile();

    service = module.get<FcmNotificationService>(FcmNotificationService);

    await expect(
      service.sendMulticastNotification(['token1'], 'Test', 'Body'),
    ).resolves.toBeUndefined();
    expect(admin.messaging().sendEachForMulticast).not.toHaveBeenCalled();
  });

  it('should not throw when sendTopicNotification is called without Firebase initialized', async () => {
    delete process.env.PROJECT_ID_FIREBASE;

    const module: TestingModule = await Test.createTestingModule({
      providers: [FcmNotificationService],
    }).compile();

    service = module.get<FcmNotificationService>(FcmNotificationService);

    await expect(
      service.sendTopicNotification('shop1', 'Test', 'Body'),
    ).resolves.toBeUndefined();
    expect(admin.messaging().send).not.toHaveBeenCalled();
  });

  it('should initialize Firebase Admin when credentials are provided and apps is empty', async () => {
    process.env.PROJECT_ID_FIREBASE = 'test-project';
    process.env.CLIENT_EMAIL_FIREBASE = 'test@example.com';
    process.env.PRIVATE_KEY_FIREBASE = '-----BEGIN PRIVATE KEY-----\\nMIIE\\n-----END PRIVATE KEY-----';

    const module: TestingModule = await Test.createTestingModule({
      providers: [FcmNotificationService],
    }).compile();

    service = module.get<FcmNotificationService>(FcmNotificationService);

    expect(service.initialized).toBe(true);
    expect(admin.initializeApp).toHaveBeenCalledTimes(1);
    expect(admin.credential.cert).toHaveBeenCalledWith({
      projectId: 'test-project',
      clientEmail: 'test@example.com',
      privateKey: '-----BEGIN PRIVATE KEY-----\nMIIE\n-----END PRIVATE KEY-----',
    });
  });

  it('should send multicast notification when Firebase is initialized', async () => {
    process.env.PROJECT_ID_FIREBASE = 'test-project';
    process.env.CLIENT_EMAIL_FIREBASE = 'test@example.com';
    process.env.PRIVATE_KEY_FIREBASE = '-----BEGIN PRIVATE KEY-----\\nMIIE\\n-----END PRIVATE KEY-----';

    const module: TestingModule = await Test.createTestingModule({
      providers: [FcmNotificationService],
    }).compile();

    service = module.get<FcmNotificationService>(FcmNotificationService);

    await service.sendMulticastNotification(['token-abc'], 'Title', 'Message');
    expect(admin.messaging().sendEachForMulticast).toHaveBeenCalledWith(
      expect.objectContaining({
        tokens: ['token-abc'],
        notification: {
          title: 'Title',
          body: 'Message',
          imageUrl: undefined,
        },
      }),
    );
  });
});
