// user.dto.ts
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

export class CreateUserDto {
  @IsOptional()
  @IsString()
  id_google?: string;

  @IsString()
  @Length(1, 500)
  name: string;

  @IsString()
  @Length(1, 500)
  username: string;

  @IsString()
  @Length(8, 100)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'password too weak',
  })
  password: string;

  @IsEmail()
  email: string;

  @IsInt()
  @Min(0)
  @Max(2)
  role: number;

  @IsOptional()
  @IsDateString()
  tokenExpiration?: Date;

  @IsOptional()
  @IsString()
  token?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsInt()
  average_raiting?: number;

  @IsOptional()
  @IsString()
  token_notification?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  id_google?: string;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  username?: string;

  @IsOptional()
  @IsString()
  @Length(8, 100)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'password too weak',
  })
  password?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2)
  role?: number;

  @IsOptional()
  @IsDateString()
  tokenExpiration?: Date;

  @IsOptional()
  @IsString()
  token?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsInt()
  average_raiting?: number;

  @IsOptional()
  @IsString()
  token_notification?: string;
}
