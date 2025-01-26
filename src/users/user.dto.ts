// user.dto.ts
import {
  IsEmail,
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  Length,
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

  @IsEmail()
  email: string;

  @IsInt()
  @Min(0)
  @Max(2)
  role: number;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  id_google?: string;

  @IsString()
  @IsOptional()
  @Length(1, 500)
  name?: string;

  @IsString()
  @IsOptional()
  @Length(1, 500)
  username: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(2)
  role?: number;
}
