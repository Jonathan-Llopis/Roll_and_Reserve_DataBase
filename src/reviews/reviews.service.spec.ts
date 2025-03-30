import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReviewsEntity } from './reviews.entity';
import { ShopsEntity } from '../shops/shops.entity';
import { UserEntity } from '../users/users.entity';
import { UsersService } from '../users/users.service';
import { NotFoundException, HttpException, BadRequestException } from '@nestjs/common';

describe('ReviewsService', () => {
    let service: ReviewsService;
    let reviewsRepository: Repository<ReviewsEntity>;
    let shopRepository: Repository<ShopsEntity>;
    let userRepository: Repository<UserEntity>;
    let usersService: UsersService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReviewsService,
                {
                    provide: getRepositoryToken(ReviewsEntity),
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
                    provide: getRepositoryToken(UserEntity),
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
                {
                    provide: UsersService,
                    useValue: {
                        updateAverageRating: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<ReviewsService>(ReviewsService);
        reviewsRepository = module.get<Repository<ReviewsEntity>>(getRepositoryToken(ReviewsEntity));
        shopRepository = module.get<Repository<ShopsEntity>>(getRepositoryToken(ShopsEntity));
        userRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
        usersService = module.get<UsersService>(UsersService);
    });

    it('should return all reviews', async () => {
        const mockReviews = [
            { id_review: 1, raiting: 5, review: 'Great!', writer: null, reviewed: null, shop_reviews: null },
        ];
        jest.spyOn(reviewsRepository, 'find').mockResolvedValue(mockReviews);

        const result = await service.getAllReviews();
        expect(result).toEqual(mockReviews);
    });

    it('should throw HttpException when no reviews are found', async () => {
        jest.spyOn(reviewsRepository, 'find').mockResolvedValue([]);

        await expect(service.getAllReviews()).rejects.toThrow(
            new HttpException('No Content', 204),
        );
    });

    it('should return a review by id', async () => {
        const mockReview = { id_review: 1, raiting: 5, review: 'Great!', writer: null, reviewed: null, shop_reviews: null };
        jest.spyOn(reviewsRepository, 'findOne').mockResolvedValue(mockReview);

        const result = await service.getReviews(1);
        expect(result).toEqual(mockReview);
    });

    it('should throw NotFoundException when review is not found', async () => {
        jest.spyOn(reviewsRepository, 'findOne').mockResolvedValue(null);

        await expect(service.getReviews(999)).rejects.toThrow(
            new NotFoundException('Review not found'),
        );
    });

    it('should create a new review', async () => {
        const createDto = { raiting: 5, review: 'Great!', writter_id: '1', shop_reviews_id: 1 };
        const mockReview = { id_review: 1, ...createDto, writer: null, reviewed: null, shop_reviews: null };
        const mockWriter = {
            id_user: 1,
            id_google: '1',
            name: 'John Doe',
            username: 'johndoe',
            password: 'hashedpassword',
            email: 'johndoe@example.com',
            created_at: new Date(),
            updated_at: new Date(),
            reviews: []
        } as unknown as UserEntity;
        const mockShop = {
            id_shop: 1,
            name: 'Shop 1',
            address: '123 Main St',
            logo: 'logo.png',
            latitud: 40.7128,
            longitud: -74.0060,
            created_at: new Date(),
            updated_at: new Date(),
            reviews: [],
        } as unknown as ShopsEntity;

        jest.spyOn(reviewsRepository, 'create').mockReturnValue(mockReview as any);
        jest.spyOn(reviewsRepository, 'save').mockResolvedValue(mockReview);
        jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockWriter);
        jest.spyOn(shopRepository, 'findOne').mockResolvedValue(mockShop);

        const result = await service.createReview(createDto);
        expect(result).toEqual(mockReview);
    });

    it('should throw NotFoundException when creating a review with invalid writer', async () => {
        const createDto = { raiting: 5, review: 'Great!', writter_id: '999' };
        jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

        await expect(service.createReview(createDto)).rejects.toThrow(
            new NotFoundException('Writer not found'),
        );
    });

    it('should update an existing review', async () => {
        const updateDto = { raiting: 4, review: 'Updated review' };
        const mockReview = { id_review: 1, raiting: 5, review: 'Great!', writer: null, reviewed: null, shop_reviews: null };

        jest.spyOn(reviewsRepository, 'findOne').mockResolvedValue(mockReview);
        jest.spyOn(reviewsRepository, 'merge').mockImplementation((entity, dto) => {
            Object.assign(entity, dto);
            return entity as ReviewsEntity;
        });
        jest.spyOn(reviewsRepository, 'save').mockResolvedValue({ ...mockReview, ...updateDto });

        const result = await service.updateReviews(updateDto, 1);
        expect(result).toEqual({ ...mockReview, ...updateDto });
    });

    it('should throw NotFoundException when updating a non-existent review', async () => {
        jest.spyOn(reviewsRepository, 'findOne').mockResolvedValue(null);

        await expect(service.updateReviews({ raiting: 4 }, 999)).rejects.toThrow(
            new NotFoundException('Review not found'),
        );
    });

    it('should delete a review', async () => {
        jest.spyOn(reviewsRepository, 'delete').mockResolvedValue({ affected: 1 } as any);

        await expect(service.deleteReview(1)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException when deleting a non-existent review', async () => {
        jest.spyOn(reviewsRepository, 'delete').mockResolvedValue({ affected: 0 } as any);

        await expect(service.deleteReview(999)).rejects.toThrow(
            new NotFoundException('Review not found'),
        );
    });
});