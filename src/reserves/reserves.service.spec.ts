import { Test, TestingModule } from '@nestjs/testing';
import { ReservesService } from './reserves.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReservesEntity } from './reserves.entity';
import { ShopsEntity } from '../shops/shops.entity';
import { GamesEntity } from '../games/games.entitiy';
import { DifficultyEntity } from '../difficulty/difficulty.entity';
import { TablesEntity } from '../tables/tables.entity';
import { FcmNotificationService } from '../fcm-notification/fcm-notification.service';
import { HttpService } from '../http/http.service';
import { NotFoundException, HttpException } from '@nestjs/common';
import { GameCategoryEntity } from '../game_category/game_category.entity';
import { GamesService } from '../games/games.service';
import { UserEntity } from '../users/users.entity';

describe('ReservesService', () => {
    let service: ReservesService;
    let reserveRepository: Repository<ReservesEntity>;
    let shopRepository: Repository<ShopsEntity>;
    let gameRepository: Repository<GamesEntity>;
    let difficultyRepository: Repository<DifficultyEntity>;
    let tableRepository: Repository<TablesEntity>;
    let fcmNotificationService: FcmNotificationService;
    let httpService: HttpService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReservesService,
                {
                    provide: getRepositoryToken(ReservesEntity),
                    useValue: {
                        find: jest.fn(),
                        findOne: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
                        delete: jest.fn(),
                        merge: jest.fn(),
                        createQueryBuilder: jest.fn().mockImplementation(() => ({
                            innerJoinAndSelect: jest.fn().mockReturnThis(),
                            where: jest.fn().mockReturnThis(),
                            andWhere: jest.fn().mockReturnThis(),
                            groupBy: jest.fn().mockReturnThis(),
                            addSelect: jest.fn().mockReturnThis(),
                            orderBy: jest.fn().mockReturnThis(),
                            getMany: jest.fn(),
                        })),
                    },
                },
                {
                    provide: getRepositoryToken(ShopsEntity),
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(GamesEntity),
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(DifficultyEntity),
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(TablesEntity),
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
                {
                    provide: FcmNotificationService,
                    useValue: {
                        sendTopicNotification: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(GameCategoryEntity),
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
                {
                    provide: 'Bgg-Api',
                    useValue: {
                        get: jest.fn(),
                    },
                },
                {
                    provide: GamesService,
                    useValue: {
                        someMethod: jest.fn(), 
                    },
                },
            ],
        }).compile();

        service = module.get<ReservesService>(ReservesService);
        reserveRepository = module.get<Repository<ReservesEntity>>(getRepositoryToken(ReservesEntity));
        shopRepository = module.get<Repository<ShopsEntity>>(getRepositoryToken(ShopsEntity));
        gameRepository = module.get<Repository<GamesEntity>>(getRepositoryToken(GamesEntity));
        difficultyRepository = module.get<Repository<DifficultyEntity>>(getRepositoryToken(DifficultyEntity));
        tableRepository = module.get<Repository<TablesEntity>>(getRepositoryToken(TablesEntity));
        fcmNotificationService = module.get<FcmNotificationService>(FcmNotificationService);
        httpService = module.get<HttpService>('Bgg-Api');
    });

    it('should return all reserves', async () => {
        const mockReserves: ReservesEntity[] = [{
            id_reserve: 1,
            total_places: 10,
            reserver_id: '1',
            hour_start: new Date(),
            hour_end: new Date(),
            description: 'Test description',
            required_material: 'Test material',
            shop_event: false,
            event_id: null,
            confirmation_notification: false,
            difficulty: null,
            reserve_of_game: null,
            reserve_table: null,
            users_in_reserve: [],
            userReserves: [],
        }];
        jest.spyOn(reserveRepository, 'find').mockResolvedValue(mockReserves);

        const result = await service.getAllReserves();
        expect(result).toEqual(mockReserves);
    });

    it('should throw HttpException when no reserves are found', async () => {
        jest.spyOn(reserveRepository, 'find').mockResolvedValue([]);

        await expect(service.getAllReserves()).rejects.toThrow(
            new HttpException('No Content', 204),
        );
    });

    it('should return a reserve by id', async () => {
        const mockReserve: ReservesEntity = {
            id_reserve: 1,
            total_places: 10,
            reserver_id: '1',
            hour_start: new Date(),
            hour_end: new Date(),
            description: 'Test description',
            required_material: 'Test material',
            shop_event: false,
            event_id: null,
            confirmation_notification: false,
            difficulty: null,
            reserve_of_game: null,
            reserve_table: null,
            users_in_reserve: [],
            userReserves: [],
        };
        jest.spyOn(reserveRepository, 'findOne').mockResolvedValue(mockReserve);

        const result = await service.getReserve(1);
        expect(result).toEqual(mockReserve);
    });

    it('should throw NotFoundException when reserve is not found', async () => {
        jest.spyOn(reserveRepository, 'findOne').mockResolvedValue(null);

        await expect(service.getReserve(999)).rejects.toThrow(
            new NotFoundException('Reserve not found'),
        );
    });

    it('should create a new reserve', async () => {
        const createDto = { 
            total_places: 10, 
            reserver_id: '1', 
            hour_start: new Date(), 
            hour_end: new Date(), 
            shop_event: false, 
            description: 'Test description', 
            required_material: 'Test material' 
        };
        const mockReserve: ReservesEntity = {
            id_reserve: 1,
            total_places: createDto.total_places,
            reserver_id: createDto.reserver_id,
            hour_start: createDto.hour_start,
            hour_end: createDto.hour_end,
            description: '',
            required_material: '',
            shop_event: createDto.shop_event,
            event_id: null,
            confirmation_notification: false,
            difficulty: null,
            reserve_of_game: null,
            reserve_table: null,
            users_in_reserve: [],
            userReserves: [],
        };
        jest.spyOn(reserveRepository, 'create').mockReturnValue(mockReserve as any);
        jest.spyOn(reserveRepository, 'save').mockResolvedValue(mockReserve);

        const result = await service.createReserve(createDto, 1);
        expect(result).toEqual(mockReserve);
    });

    it('should throw NotFoundException when creating a reserve with invalid difficulty', async () => {
        const createDto = { 
            total_places: 10, 
            reserver_id: '1', 
            hour_start: new Date(), 
            hour_end: new Date(), 
            difficulty_id: 999, 
            shop_event: false, 
            description: 'Test description', 
            required_material: 'Test material' 
        };
        jest.spyOn(difficultyRepository, 'findOne').mockResolvedValue(null);

        await expect(service.createReserve(createDto, 1)).rejects.toThrow(
            new NotFoundException('Difficulty not found'),
        );
    });

    it('should update an existing reserve', async () => {
        const updateDto = { total_places: 20 };
        const mockReserve: ReservesEntity = { id_reserve: 1, total_places: 10 } as ReservesEntity;
        jest.spyOn(reserveRepository, 'findOne').mockResolvedValue(mockReserve);
        jest.spyOn(reserveRepository, 'merge').mockImplementation((entity: ReservesEntity, dto: Partial<ReservesEntity>) => {
            Object.assign(entity, dto);
            return entity as ReservesEntity;
        });
        jest.spyOn(reserveRepository, 'save').mockResolvedValue({ ...mockReserve, ...updateDto });

        const result = await service.updateReserve(updateDto, 1);
        expect(result).toEqual({ ...mockReserve, ...updateDto });
    });

    it('should throw NotFoundException when updating a non-existent reserve', async () => {
        jest.spyOn(reserveRepository, 'findOne').mockResolvedValue(null);

        await expect(service.updateReserve({ total_places: 20 }, 999)).rejects.toThrow(
            new NotFoundException('Reserve not found'),
        );
    });

    it('should delete a reserve', async () => {
        jest.spyOn(reserveRepository, 'delete').mockResolvedValue({ affected: 1 } as any);

        await expect(service.deleteReserve(1)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException when deleting a non-existent reserve', async () => {
        jest.spyOn(reserveRepository, 'delete').mockResolvedValue({ affected: 0 } as any);

        await expect(service.deleteReserve(999)).rejects.toThrow(
            new NotFoundException('Reserve not found'),
        );
    });
    it('should return all reserves by date and table ID', async () => {
        const mockReserves: ReservesEntity[] = [{
            id_reserve: 1,
            total_places: 10,
            reserver_id: '1',
            hour_start: new Date(),
            hour_end: new Date(),
            description: 'Test description',
            required_material: 'Test material',
            shop_event: false,
            event_id: null,
            confirmation_notification: false,
            difficulty: null,
            reserve_of_game: null,
            reserve_table: { id_table: 1 } as TablesEntity,
            users_in_reserve: [],
            userReserves: [],
        }];
        jest.spyOn(reserveRepository, 'find').mockResolvedValue(mockReserves);

        const result = await service.getAllReservesByDate('2023-01-01', 1);
        expect(result).toEqual(mockReserves);
    });

    it('should throw HttpException when no reserves are found by date and table ID', async () => {
        jest.spyOn(reserveRepository, 'find').mockResolvedValue([]);

        await expect(service.getAllReservesByDate('2023-01-01', 1)).rejects.toThrow(
            new HttpException('No Content', 204),
        );
    });

    it('should find all unique shop events', async () => {
        const mockShop = { id_shop: 1, name: 'Test Shop' } as ShopsEntity;
        const mockReserves: ReservesEntity[] = [{
            id_reserve: 1,
            total_places: 10,
            reserver_id: '1',
            hour_start: new Date(),
            hour_end: new Date(),
            description: 'Test description',
            required_material: 'Test material',
            shop_event: true,
            event_id: 'event-1',
            confirmation_notification: false,
            difficulty: null,
            reserve_of_game: { id_game: 1 } as GamesEntity,
            reserve_table: { id_table: 1 } as TablesEntity,
            users_in_reserve: [],
            userReserves: [],
        }];
        jest.spyOn(shopRepository, 'findOne').mockResolvedValue(mockShop);
        jest.spyOn(reserveRepository, 'createQueryBuilder').mockImplementation(() => ({
            innerJoinAndSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            groupBy: jest.fn().mockReturnThis(),
            addSelect: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            getMany: jest.fn().mockResolvedValue(mockReserves),
        }) as any);

        const result = await service.findAllUniqueShopEvents(1);
        expect(result).toEqual(mockReserves);
    });

    it('should throw NotFoundException when shop is not found for unique shop events', async () => {
        jest.spyOn(shopRepository, 'findOne').mockResolvedValue(null);

        await expect(service.findAllUniqueShopEvents(999)).rejects.toThrow(
            new NotFoundException('Shop not found'),
        );
    });

    it('should return an empty array when no players are found for a user', async () => {
        jest.spyOn(reserveRepository, 'find').mockResolvedValue([]);

        const result = await service.getLastTenPlayers('user1');
        expect(result).toEqual([]);
    });
});