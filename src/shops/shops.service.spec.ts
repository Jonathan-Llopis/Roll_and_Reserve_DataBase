import { Test, TestingModule } from '@nestjs/testing';
import { ShopsService } from './shops.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ShopsEntity } from './shops.entity';
import { UserEntity } from '../users/users.entity';
import { CreateShopDto, UpdateShopDto } from './shops.dto';
import { NotFoundException, HttpException, HttpStatus } from '@nestjs/common';

describe('ShopsService', () => {
  let service: ShopsService;
  let shopRepository: Repository<ShopsEntity>;
  let userRepository: Repository<UserEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopsService,
        {
          provide: getRepositoryToken(ShopsEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
            merge: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ShopsService>(ShopsService);
    shopRepository = module.get<Repository<ShopsEntity>>(
      getRepositoryToken(ShopsEntity),
    );
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
  });

  it('should return all shops', async () => {
    const mockShops = [
      {
        id_shop: 1,
        name: 'Shop 1',
        address: 'Address 1',
        logo: 'logo.png',
        owner: null,
        latitud: 40.7128,
        longitud: -74.006,
        reviews_shop: [],
        games: [],
        tables_in_shopts: [],
        tables_in_shop: [],
      },
    ];
    jest.spyOn(shopRepository, 'find').mockResolvedValue(mockShops);

    const result = await service.getAllShops();
    expect(result).toEqual(mockShops);
  });

  it('should throw HttpException when no shops are found', async () => {
    jest.spyOn(shopRepository, 'find').mockResolvedValue([]);

    await expect(service.getAllShops()).rejects.toThrow(
      new HttpException('No Content', HttpStatus.NO_CONTENT),
    );
  });

  it('should return a shop by id', async () => {
    const mockShop = {
      id_shop: 1,
      name: 'Shop 1',
      address: 'Address 1',
      logo: 'logo.png',
      owner: null,
      latitud: 40.7128,
      longitud: -74.006,
      reviews_shop: [],
      games: [],
      tables_in_shopts: [],
      tables_in_shop: [],
    };
    jest.spyOn(shopRepository, 'findOne').mockResolvedValue(mockShop);

    const result = await service.getShop(1);
    expect(result).toEqual(mockShop);
  });

  it('should throw NotFoundException when shop is not found', async () => {
    jest.spyOn(shopRepository, 'findOne').mockResolvedValue(null);

    await expect(service.getShop(999)).rejects.toThrow(
      new NotFoundException('Shop not found'),
    );
  });

  it('should create a new shop', async () => {
    const createDto: CreateShopDto = {
      name: 'Shop 1',
      address: 'Address 1',
      logo: 'logo.png',
      latitud: 40.7128,
      longitud: -74.006,
      owner_id: '123',
    };
    const mockOwner: UserEntity = {
      id_user: 1,
      id_google: '123',
      username: 'Owner',
      name: 'Owner Name',
      password: 'hashed_password',
      email: 'owner@example.com',
      shop_owned: [],
      role: 1,
      tokenExpiration: new Date(),
      token: 'mockToken',
      avatar: 'mockAvatar.png',
      average_raiting: null,
      token_notification: null,
      writtenReviews: [],
      receivedReviews: [],
      users_reserve: [],
      userReserves: [],
    };
    const mockShop = {
      id_shop: 1,
      ...createDto,
      owner: mockOwner,
      reviews_shop: [],
      games: [],
      tables_in_shop: [],
      tables_in_shopts: [],
    };

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockOwner as any);
    jest.spyOn(shopRepository, 'create').mockReturnValue(mockShop as any);
    jest.spyOn(shopRepository, 'save').mockResolvedValue(mockShop);

    const result = await service.createShop(createDto);
    expect(result).toEqual(mockShop);
  });

  it('should throw NotFoundException when creating a shop with invalid owner', async () => {
    const createDto: CreateShopDto = {
      name: 'Shop 1',
      address: 'Address 1',
      logo: 'logo.png',
      latitud: 40.7128,
      longitud: -74.006,
      owner_id: '123',
    };
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

    await expect(service.createShop(createDto)).rejects.toThrow(
      new NotFoundException('Owner not found'),
    );
  });

  it('should update an existing shop', async () => {
    const updateDto: UpdateShopDto = { name: 'Updated Shop' };
    const mockShop = {
      id_shop: 1,
      name: 'Shop 1',
      address: 'Address 1',
      logo: 'logo.png',
      owner: null,
      latitud: 0,
      longitud: 0,
      reviews_shop: [],
      games: [],
      tables_in_shopts: [],
      tables_in_shop: [],
    };

    jest.spyOn(shopRepository, 'findOne').mockResolvedValue(mockShop);
    jest.spyOn(shopRepository, 'merge').mockImplementation((entity, dto) => {
      Object.assign(entity, dto);
      return entity as ShopsEntity;
    });
    jest
      .spyOn(shopRepository, 'save')
      .mockResolvedValue({ ...mockShop, ...updateDto });

    const result = await service.updateShop(updateDto, 1);
    expect(result).toEqual({ ...mockShop, ...updateDto });
  });

  it('should throw NotFoundException when updating a non-existent shop', async () => {
    jest.spyOn(shopRepository, 'findOne').mockResolvedValue(null);

    await expect(service.updateShop({ name: 'Test' }, 999)).rejects.toThrow(
      new NotFoundException('Shop not found'),
    );
  });

  it('should delete a shop', async () => {
    jest
      .spyOn(shopRepository, 'delete')
      .mockResolvedValue({ affected: 1 } as any);

    await expect(service.deleteShop(1)).resolves.toBeUndefined();
  });

  it('should throw NotFoundException when deleting a non-existent shop', async () => {
    jest
      .spyOn(shopRepository, 'delete')
      .mockResolvedValue({ affected: 0 } as any);

    await expect(service.deleteShop(999)).rejects.toThrow(
      new NotFoundException('Shop not found'),
    );
  });
});
