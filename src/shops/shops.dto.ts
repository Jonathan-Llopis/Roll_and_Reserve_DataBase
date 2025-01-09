import { IsString, IsOptional, IsNumber, Length } from 'class-validator';

export class CreateShopDto {
  @IsOptional()
  @IsNumber()
  id_shop?: number;

  @IsString()
  @Length(1, 500)
  address: string;

  @IsString()
  @Length(1, 500)
  logo: string;

  @IsString()
  owner_id: number;
}

export class UpdateShopDto {
  @IsOptional()
  @IsNumber()
  id_shop?: number;

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
  owner_id?: number;
}
