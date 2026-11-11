import { ValidationPipe, BadRequestException, ArgumentMetadata } from '@nestjs/common';
import { CreateReserveDto } from '../../reserves/reserves.dto';
import { CreateUserDto } from '../../users/users.dto';

describe('Global ValidationPipe Configuration', () => {
  let targetPipe: ValidationPipe;

  beforeEach(() => {
    targetPipe = new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    });
  });

  it('should transform ISO date strings into Date objects for CreateReserveDto', async () => {
    const rawPayload = {
      total_places: 4,
      reserver_id: 'user_123',
      hour_start: '2026-11-12T10:00:00.000Z',
      hour_end: '2026-11-12T12:00:00.000Z',
      description: 'Game session',
      shop_event: false,
      required_material: 'Dice',
    };

    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: CreateReserveDto,
    };

    const transformed = (await targetPipe.transform(
      rawPayload,
      metadata,
    )) as CreateReserveDto;

    expect(transformed.hour_start).toBeInstanceOf(Date);
    expect(transformed.hour_end).toBeInstanceOf(Date);
    expect(transformed.hour_start.toISOString()).toBe('2026-11-12T10:00:00.000Z');
    expect(transformed.total_places).toBe(4);
  });

  it('should throw BadRequestException when non-whitelisted properties are present', async () => {
    const maliciousPayload = {
      total_places: 4,
      reserver_id: 'user_123',
      hour_start: '2026-11-12T10:00:00.000Z',
      hour_end: '2026-11-12T12:00:00.000Z',
      description: 'Game session',
      shop_event: false,
      required_material: 'Dice',
      isAdmin: true, // Non-whitelisted field
    };

    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: CreateReserveDto,
    };

    await expect(targetPipe.transform(maliciousPayload, metadata)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw BadRequestException when required fields fail validation in CreateUserDto', async () => {
    const invalidUserPayload = {
      name: 'John',
      username: 'john',
      email: 'not-an-email',
      password: 'weak',
    };

    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: CreateUserDto,
    };

    await expect(targetPipe.transform(invalidUserPayload, metadata)).rejects.toThrow(
      BadRequestException,
    );
  });
});
