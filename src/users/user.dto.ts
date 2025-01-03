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
  @IsInt()
  id_user?: string;

  @IsString()
  @Length(1, 500)
  name: string;

  @IsString()
  password: string;

  @IsEmail()
  email: string;

  @IsInt()
  @Min(0)
  @Max(2)
  role: number;
}

export class UpdateUserDto {
  @IsOptional()
  @IsInt()
  id_user?: string;

  @IsString()
  @IsOptional()
  @Length(1, 50)
  name?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(1)
  role?: number;
}
