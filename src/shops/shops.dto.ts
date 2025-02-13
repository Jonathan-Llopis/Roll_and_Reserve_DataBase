import { IsString, IsOptional, IsNumber, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShopDto {
  @ApiProperty({
    description: 'The name of the shop',
    minLength: 1,
    maxLength: 500,
    example: 'My Shop'
  })
  @IsString()
  @Length(1, 500)
  name: string;

  @ApiProperty({
    description: 'The address of the shop',
    minLength: 1,
    maxLength: 500,
    example: '123 Main St'
  })
  @IsString()
  @Length(1, 500)
  address: string;

  @ApiProperty({
    description: 'The logo of the shop',
    minLength: 1,
    maxLength: 500,
    example: 'logo.png'
  })
  @IsString()
  @Length(1, 500)
  logo: string;

  @ApiProperty({
    description: 'The latitude of the shop location',
    example: 40.7128
  })
  @IsNumber()
  latitud: number;

  @ApiProperty({
    description: 'The longitude of the shop location',
    example: -74.0060
  })
  @IsNumber()
  longitud: number;

  @ApiProperty({
    description: 'The ID of the shop owner',
    example: '1234567890abcdef'
  })
  @IsString()
  owner_id: string;
}

export class UpdateShopDto {
  @ApiPropertyOptional({
    description: 'The name of the shop',
    minLength: 1,
    maxLength: 500,
    example: 'My Shop'
  })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  name?: string;

  @ApiPropertyOptional({
    description: 'The address of the shop',
    minLength: 1,
    maxLength: 500,
    example: '123 Main St'
  })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  address?: string;

  @ApiPropertyOptional({
    description: 'The logo of the shop',
    minLength: 1,
    maxLength: 500,
    example: 'logo.png'
  })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  logo?: string;

  @ApiPropertyOptional({
    description: 'The latitude of the shop location',
    example: 40.7128
  })
  @IsOptional()
  @IsNumber()
  latitud?: number;

  @ApiPropertyOptional({
    description: 'The longitude of the shop location',
    example: -74.0060
  })
  @IsOptional()
  @IsNumber()
  longitud?: number;

  @ApiPropertyOptional({
    description: 'The ID of the shop owner',
    example: 'owner123'
  })
  @IsOptional()
  @IsString()
  owner_id?: string;
}