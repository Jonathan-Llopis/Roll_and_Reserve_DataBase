import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from './users.entity';
import { UtilsService } from '../utils/utils.service';
import { HttpException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
    let service: UsersService;
    let userRepository: Repository<UserEntity>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                UtilsService,
                {
                    provide: getRepositoryToken(UserEntity),
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                        find: jest.fn(),
                        findOne: jest.fn(),
                        delete: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        userRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    });

    it('should return all users', async () => {
        const mockUsers: UserEntity[] = [
            {
                id_user: 1,
                id_google: null,
                username: 'johndoe',
                name: 'John Doe',
                password: 'hashedPassword',
                email: 'john@example.com',
                role: 0,
                tokenExpiration: null,
                token: null,
                avatar: null,
                average_raiting: null,
                token_notification: null,
                writtenReviews: [],
                receivedReviews: [],
                shop_owned: [],
                users_reserve: [],
                userReserves: [],
            },
        ];
        jest.spyOn(userRepository, 'find').mockResolvedValue(mockUsers);

        const result = await service.getAllUser();
        expect(result).toEqual(mockUsers);
    });

    it('should throw HttpException when no users are found', async () => {
        jest.spyOn(userRepository, 'find').mockResolvedValue([]);

        await expect(service.getAllUser()).rejects.toThrow(
            new HttpException('No Content', 204),
        );
    });

    it('should return a user by id', async () => {
        const mockUser: UserEntity = {
            id_user: 1,
            id_google: null,
            username: 'johndoe',
            name: 'John Doe',
            password: 'hashedPassword',
            email: 'john@example.com',
            role: 0,
            tokenExpiration: null,
            token: null,
            avatar: null,
            average_raiting: null,
            token_notification: null,
            writtenReviews: [],
            receivedReviews: [],
            shop_owned: [],
            users_reserve: [],
            userReserves: [],
        };
        jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

        const result = await service.getUser('1');
        expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user is not found', async () => {
        jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

        await expect(service.getUser('999')).rejects.toThrow(
            new NotFoundException('User not found'),
        );
    });

    it('should create a new user', async () => {
        const createDto = { name: 'John Doe', email: 'john@example.com', password: 'StrongP@ssw0rd', username: 'johndoe', role: 0 };
        const mockUser: UserEntity = {
            id_user: 1,
            id_google: null,
            username: null,
            name: createDto.name,
            password: createDto.password,
            email: createDto.email,
            role: 0,
            tokenExpiration: null,
            token: null,
            avatar: null,
            average_raiting: null,
            token_notification: null,
            writtenReviews: [],
            receivedReviews: [],
            shop_owned: [],
            users_reserve: [],
            userReserves: [],
        };
        jest.spyOn(userRepository, 'create').mockReturnValue(mockUser as any);
        jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser);

        const result = await service.createUser(createDto);
        expect(result).toEqual(mockUser);
    });

    it('should update an existing user', async () => {
        const updateDto = { name: 'Updated John', email: 'updated@example.com', username: 'updatedUsername', role: 1 };
        const mockUser = {
            id_user: 1,
            id_google: "1",
            username: 'johndoe',
            name: 'John Doe',
            password: 'hashedPassword',
            email: 'john@example.com',
            role: 0,
            tokenExpiration: null,
            token: null,
            avatar: null,
            average_raiting: null,
            token_notification: null,
            writtenReviews: [],
            receivedReviews: [],
            shop_owned: [],
            users_reserve: [],
            userReserves: [],
        };
        jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
        jest.spyOn(userRepository, 'save').mockResolvedValue({ 
            ...mockUser, 
            ...updateDto, 
        });

        const result = await service.updateUser(updateDto, '1');
        expect(result).toEqual({ 
            ...mockUser, 
            ...updateDto, 
            username: mockUser.username, 
            role: mockUser.role, 
        });
    });

    it('should throw NotFoundException when updating a non-existent user', async () => {
        jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

        await expect(service.updateUser({ name: 'Test' }, '999')).rejects.toThrow(
            new NotFoundException('User not found'),
        );
    });

    it('should delete a user', async () => {
        jest.spyOn(userRepository, 'delete').mockResolvedValue({ affected: 1 } as any);

        await expect(service.deleteUser('1')).resolves.toBeUndefined();
    });

    it('should throw NotFoundException when deleting a non-existent user', async () => {
        jest.spyOn(userRepository, 'delete').mockResolvedValue({ affected: 0 } as any);

        await expect(service.deleteUser('999')).rejects.toThrow(
            new NotFoundException('User not found'),
        );
    });

    it('should validate a user with correct credentials', async () => {
        const mockUser = {
            id_user: 1,
            id_google: null,
            username: 'johndoe',
            name: 'John Doe',
            password: 'hashedPassword',
            email: 'john@example.com',
            role: 0,
            tokenExpiration: null,
            token: null,
            avatar: null,
            average_raiting: null,
            token_notification: null,
            writtenReviews: [],
            receivedReviews: [],
            shop_owned: [],
            users_reserve: [],
            userReserves: [],
        };
        jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
        jest.spyOn(require('bcryptjs'), 'compare').mockResolvedValue(true);

        const result = await service.validateUser('john@example.com', 'StrongP@ssw0rd');
        expect(result).toEqual(mockUser);
    });

    it('should throw HttpException when validating a user with incorrect credentials', async () => {
        const mockUser = {
            id_user: 1,
            id_google: null,
            username: 'johndoe',
            name: 'John Doe',
            password: 'hashedPassword',
            email: 'john@example.com',
            role: 0,
            tokenExpiration: null,
            token: null,
            avatar: null,
            average_raiting: null,
            token_notification: null,
            writtenReviews: [],
            receivedReviews: [],
            shop_owned: [],
            users_reserve: [],
            userReserves: [],
        };
        jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
        jest.spyOn(require('bcryptjs'), 'compare').mockResolvedValue(false);

        await expect(service.validateUser('john@example.com', 'WrongPassword')).rejects.toThrow(
            new HttpException('Invalid credentials', 401),
        );
    });
});