import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../users/users.entity';
import { Repository } from 'typeorm';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<UserEntity>;

  const mockUserRepository = {
    update: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateToken', () => {
    it('should update token by numeric id_user when id is numeric', async () => {
      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      const token = await service.generateToken('42');

      expect(token).toBeDefined();
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        42,
        expect.objectContaining({
          token,
          tokenExpiration: expect.any(Date),
        }),
      );
    });

    it('should update token by id_google when id is non-numeric string', async () => {
      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      const token = await service.generateToken('google-oauth-sub');

      expect(token).toBeDefined();
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        { id_google: 'google-oauth-sub' },
        expect.objectContaining({
          token,
          tokenExpiration: expect.any(Date),
        }),
      );
    });
  });

  describe('validateToken', () => {
    it('should return false if token is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const isValid = await service.validateToken('invalid-token');
      expect(isValid).toBe(false);
    });

    it('should return true if token is valid and unexpired', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      mockUserRepository.findOne.mockResolvedValue({
        id_user: 1,
        token: 'valid-token',
        tokenExpiration: futureDate,
      });

      const isValid = await service.validateToken('valid-token');
      expect(isValid).toBe(true);
    });

    it('should clear token and return false if token is expired', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 7);

      mockUserRepository.findOne.mockResolvedValue({
        id_user: 1,
        token: 'expired-token',
        tokenExpiration: pastDate,
      });
      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      const isValid = await service.validateToken('expired-token');
      expect(isValid).toBe(false);
      expect(mockUserRepository.update).toHaveBeenCalledWith(1, {
        token: null,
        tokenExpiration: null,
      });
    });
  });

  describe('clearToken', () => {
    it('should clear token using numeric id_user', async () => {
      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      await service.clearToken(42);

      expect(mockUserRepository.update).toHaveBeenCalledWith(42, {
        token: null,
        tokenExpiration: null,
      });
    });

    it('should clear token using id_google when string is non-numeric', async () => {
      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      await service.clearToken('google-sub');

      expect(mockUserRepository.update).toHaveBeenCalledWith(
        { id_google: 'google-sub' },
        {
          token: null,
          tokenExpiration: null,
        },
      );
    });
  });
});
