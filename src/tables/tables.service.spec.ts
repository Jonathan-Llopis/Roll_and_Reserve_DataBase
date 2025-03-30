import { Test, TestingModule } from '@nestjs/testing';
import { TablesService } from './tables.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TablesEntity } from './tables.entity';
import { ShopsEntity } from '../shops/shops.entity';
import { LabelsService } from '../utils/labels/labels.service';
import { HttpException, NotFoundException } from '@nestjs/common';
import { ReservesEntity } from '../reserves/reserves.entity';

describe('TablesService', () => {
    let service: TablesService;
    let tableRepository: Repository<TablesEntity>;
    let shopRepository: Repository<ShopsEntity>;
    let labelsService: LabelsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TablesService,
                {
                    provide: getRepositoryToken(TablesEntity),
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
                    provide: getRepositoryToken(ShopsEntity),
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
                {
                    provide: LabelsService,
                    useValue: {
                        generateLabels: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<TablesService>(TablesService);
        tableRepository = module.get<Repository<TablesEntity>>(getRepositoryToken(TablesEntity));
        shopRepository = module.get<Repository<ShopsEntity>>(getRepositoryToken(ShopsEntity));
        labelsService = module.get<LabelsService>(LabelsService);
    });

    it('should return all tables', async () => {
        const mockTables = [{ id_table: 1, number_table: 5, tables_of_shop: null, reserves_of_table: [] }];
        jest.spyOn(tableRepository, 'find').mockResolvedValue(mockTables);

        const result = await service.getAllTables();
        expect(result).toEqual(mockTables);
    });

    it('should throw HttpException when no tables are found', async () => {
        jest.spyOn(tableRepository, 'find').mockResolvedValue([]);

        await expect(service.getAllTables()).rejects.toThrow(
            new HttpException('No Content', 204),
        );
    });

    it('should return a table by id', async () => {
        const mockTable = { id_table: 1, number_table: 5, tables_of_shop: null, reserves_of_table: [] };
        jest.spyOn(tableRepository, 'findOne').mockResolvedValue(mockTable);

        const result = await service.getTable(1);
        expect(result).toEqual(mockTable);
    });

    it('should throw NotFoundException when table is not found', async () => {
        jest.spyOn(tableRepository, 'findOne').mockResolvedValue(null);

        await expect(service.getTable(999)).rejects.toThrow(
            new NotFoundException('Table not found'),
        );
    });

    it('should create a new table', async () => {
        const createDto = { number_table: 5, shop_id: 1 };
        const mockShop = { 
            id_shop: 1,
            name: 'Shop Name',
            address: 'Shop Address',
            logo: 'Shop Logo',
            latitud: 0,
            longitud: 0,
            phone: '123456789',
            email: 'shop@example.com',
            opening_hours: '9:00-18:00',
            owner: null,
            reviews_shop: [],
            games: [],
            tables_in_shop: []
        };
        const mockTable = { 
            id_table: 1, 
            number_table: 5, 
            tables_of_shop: { 
                id_shop: 1, 
                name: 'Shop Name', 
                address: 'Shop Address', 
                logo: 'Shop Logo', 
                latitud: 0, 
                longitud: 0, 
                phone: '123456789', 
                email: 'shop@example.com', 
                opening_hours: '9:00-18:00',
                owner: null,
                reviews_shop: [],
                games: [],
                tables_in_shop: []
            } as ShopsEntity, 
            reserves_of_table: [] as any[] 
        };

        jest.spyOn(shopRepository, 'findOne').mockResolvedValue(mockShop as any);
        jest.spyOn(tableRepository, 'create').mockReturnValue(mockTable as any);
        jest.spyOn(tableRepository, 'save').mockResolvedValue(mockTable);

        const result = await service.createTable(createDto);
        expect(result).toEqual(mockTable);
    });

    it('should throw NotFoundException when creating a table with invalid shop', async () => {
        const createDto = { number_table: 5, shop_id: 999 };
        jest.spyOn(shopRepository, 'findOne').mockResolvedValue(null);

        await expect(service.createTable(createDto)).rejects.toThrow(
            new NotFoundException('Shop not found'),
        );
    });

    it('should update an existing table', async () => {
        const updateDto = { id_table: 1, number_table: 10, shop_id: 1 };
        const mockShop = { 
            id_shop: 1,
            name: 'Shop Name',
            address: 'Shop Address',
            logo: 'Shop Logo',
            latitud: 0,
            longitud: 0,
            phone: '123456789',
            email: 'shop@example.com',
            opening_hours: '9:00-18:00',
            owner: null,
            reviews_shop: [],
            games: [],
            tables_in_shop: []
        };
        const mockTable: TablesEntity = { 
            id_table: 1, 
            number_table: 5, 
            tables_of_shop: {
                id_shop: 1,
                name: 'Shop Name',
                address: 'Shop Address',
                logo: 'Shop Logo',
                latitud: 0,
                longitud: 0,
                phone: '123456789',
                email: 'shop@example.com',
                opening_hours: '9:00-18:00',
                owner: null,
                reviews_shop: [],
                games: [],
                tables_in_shop: []
            } as ShopsEntity,
            reserves_of_table: [] as ReservesEntity[]
        };

        jest.spyOn(tableRepository, 'findOne').mockResolvedValue(mockTable);
        jest.spyOn(shopRepository, 'findOne').mockResolvedValue(mockShop as any);
        jest.spyOn(tableRepository, 'merge').mockImplementation((entity, dto) => {
            Object.assign(entity, dto);
            return entity as TablesEntity;
        });
        jest.spyOn(tableRepository, 'save').mockResolvedValue({
            ...mockTable,
            ...updateDto,
            tables_of_shop: mockShop,
        });

        const result = await service.updateTable(updateDto, 1);
        expect(result).toEqual({
            ...mockTable,
            ...updateDto,
            tables_of_shop: mockShop,
        });
    });

    it('should throw NotFoundException when updating a non-existent table', async () => {
        jest.spyOn(tableRepository, 'findOne').mockResolvedValue(null);

        await expect(service.updateTable({
            number_table: 10,
            id_table: 0,
            shop_id: 0
        }, 999)).rejects.toThrow(
            new NotFoundException('Table not found'),
        );
    });

    it('should delete a table', async () => {
        jest.spyOn(tableRepository, 'delete').mockResolvedValue({ affected: 1 } as any);

        await expect(service.deleteTable(1)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException when deleting a non-existent table', async () => {
        jest.spyOn(tableRepository, 'delete').mockResolvedValue({ affected: 0 } as any);

        await expect(service.deleteTable(999)).rejects.toThrow(
            new NotFoundException('Table not found'),
        );
    });

    it('should generate QR codes for tables', async () => {
        const mockTables = [{ id_table: 1, number_table: 5, tables_of_shop: null, reserves_of_table: [] }];
        jest.spyOn(tableRepository, 'find').mockResolvedValue(mockTables);

        const res = { send: jest.fn() };
        await service.generate_qr([1], res);

        expect(labelsService.generateLabels).toHaveBeenCalledWith(mockTables, res);
    });

    it('should throw HttpException when no tables are found for QR generation', async () => {
        jest.spyOn(tableRepository, 'find').mockResolvedValue([]);

        const res = { send: jest.fn() };
        await expect(service.generate_qr([999], res)).rejects.toThrow(
            new HttpException('No Content', 204),
        );
    });
});