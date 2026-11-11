import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../users/users.entity';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate and return user when user exists', async () => {
    const mockUser = {
      id_user: 1,
      email: 'test@example.com',
      role: 0,
    };
    mockUserRepository.findOne.mockResolvedValue(mockUser);

    const result = await strategy.validate({ sub: 1, email: 'test@example.com', role: 0 });

    expect(result).toEqual(mockUser);
    expect(mockUserRepository.findOne).toHaveBeenCalledWith({
      where: [{ id_user: 1 }, { id_google: '1' }],
    });
  });

  it('should throw UnauthorizedException when user does not exist', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);

    await expect(
      strategy.validate({ sub: 999, email: 'notfound@example.com' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
