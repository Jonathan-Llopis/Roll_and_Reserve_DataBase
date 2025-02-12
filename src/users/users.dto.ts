import {
  IsEmail,
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  Length,
  IsDateString,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Google ID of the user',
    example: '1234567890abcdef',
  })
  id_google?: string;

  @IsString()
  @Length(1, 500)
  @ApiProperty({
    description: 'Name of the user',
    minLength: 1,
    maxLength: 500,
    example: 'John Doe',
  })
  name: string;

  @IsString()
  @Length(1, 500)
  @ApiProperty({
    description: 'Username of the user',
    minLength: 1,
    maxLength: 500,
    example: 'johndoe',
  })
  username: string;

  @IsString()
  @Length(8, 100)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message: 'password too weak',
    },
  )
  @ApiProperty({
    description: 'Password of the user',
    minLength: 8,
    maxLength: 100,
    example: 'StrongP@ssw0rd',
  })
  password: string;

  @IsEmail()
  @ApiProperty({
    description: 'Email of the user',
    example: 'johndoe@example.com',
  })
  email: string;

  @IsInt()
  @Min(0)
  @Max(2)
  @ApiProperty({
    description: 'Role of the user',
    minimum: 0,
    maximum: 2,
    example: 1,
  })
  role: number;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({
    description: 'Token expiration date',
    example: '2023-12-31T23:59:59Z',
  })
  tokenExpiration?: Date;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Token of the user',
    example: 'abcdef123456',
  })
  token?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Avatar URL of the user',
    example: 'http://example.com/avatar.jpg',
  })
  avatar?: string;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({
    description: 'Average rating of the user',
    example: 4,
  })
  average_raiting?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Notification token of the user',
    example: 'notif123456',
  })
  token_notification?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Google ID of the user',
    example: '1234567890abcdef',
  })
  id_google?: string;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  @ApiPropertyOptional({
    description: 'Name of the user',
    minLength: 1,
    maxLength: 500,
    example: 'John Doe',
  })
  name?: string;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  @ApiPropertyOptional({
    description: 'Username of the user',
    minLength: 1,
    maxLength: 500,
    example: 'johndoe',
  })
  username?: string;

  @IsOptional()
  @IsString()
  @Length(8, 100)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message: 'password too weak',
    },
  )
  @ApiPropertyOptional({
    description: 'Password of the user',
    minLength: 8,
    maxLength: 100,
    example: 'StrongP@ssw0rd',
  })
  password?: string;

  @IsOptional()
  @IsEmail()
  @ApiPropertyOptional({
    description: 'Email of the user',
    example: 'johndoe@example.com',
  })
  email?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2)
  @ApiPropertyOptional({
    description: 'Role of the user',
    minimum: 0,
    maximum: 2,
    example: 1,
  })
  role?: number;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({
    description: 'Token expiration date',
    example: '2023-12-31T23:59:59Z',
  })
  tokenExpiration?: Date;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Token of the user',
    example: 'abcdef123456',
  })
  token?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Avatar URL of the user',
    example: 'http://example.com/avatar.jpg',
  })
  avatar?: string;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({
    description: 'Average rating of the user',
    example: 4,
  })
  average_raiting?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Notification token of the user',
    example: 'notif123456',
  })
  token_notification?: string;
}
