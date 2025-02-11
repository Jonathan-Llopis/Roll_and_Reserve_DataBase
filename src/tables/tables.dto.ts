import { IsNumber, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTableDto {
  @ApiPropertyOptional({
    description: 'The unique identifier of the table',
    example: 1
  })
  @IsOptional()
  @IsNumber()
  id_table: number;

  @ApiPropertyOptional({
    description: 'The number assigned to the table',
    example: 5
  })
  @IsNumber()
  number_table: number;

  @ApiPropertyOptional({
    description: 'The unique identifier of the shop',
    example: 10
  })
  @IsNumber()
  shop_id: number;
}

export class UpdateTableDto {
  @ApiPropertyOptional({
    description: 'The unique identifier of the table',
    example: 1
  })
  @IsOptional()
  @IsNumber()
  id_table: number;

  @ApiPropertyOptional({
    description: 'The number assigned to the table',
    example: 5
  })
  @IsOptional()
  @IsNumber()
  number_table: number;

  @ApiPropertyOptional({
    description: 'The unique identifier of the shop',
    example: 10
  })
  @IsOptional()
  @IsNumber()
  shop_id: number;
}
