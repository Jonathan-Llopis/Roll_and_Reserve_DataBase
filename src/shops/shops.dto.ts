import { IsString, IsOptional, IsNumber, Length } from 'class-validator';

export class CreateShopDto {
  @IsString()
  @Length(1, 500)
  name: string;

  @IsString()
  @Length(1, 500)
  address: string;

  @IsString()
  @Length(1, 500)
  logo: string;

  @IsNumber()
  latitud: number;

  @IsNumber()
  longitud: number;

  @IsNumber()
  owner_id: number;
}

export class UpdateShopDto {
  @IsOptional()
  @IsString()
  @Length(1, 500)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  address?: string;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  logo?: string;

  @IsOptional()
  @IsNumber()
  latitud?: number;

  @IsOptional()
  @IsNumber()
  longitud?: number;

  @IsOptional()
  @IsNumber()
  owner_id?: number;
}
