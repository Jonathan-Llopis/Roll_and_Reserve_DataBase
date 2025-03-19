import {
  IsString,
  IsOptional,
  IsNumber,
  IsDate,
  Length,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReserveDto {
  @ApiProperty({
    description: 'Total number of places',
    example: 10,
  })
  @IsNumber()
  total_places: number;

  @ApiProperty({
    description: 'ID of the user who made the reserve',
    example: 1,
  })
  @IsString()
  reserver_id: string;

  @ApiProperty({
    description: 'Start hour of the reserve',
    example: '2023-10-10T10:00:00Z',
  })
  @IsDate()
  hour_start: Date;

  @ApiProperty({
    description: 'End hour of the reserve',
    example: '2023-10-10T12:00:00Z',
  })
  @IsDate()
  hour_end: Date;

  @ApiProperty({
    description: 'Description of the reserve',
    minLength: 1,
    maxLength: 500,
    example: 'A fun board game event',
  })
  @IsString()
  @Length(1, 500)
  description: string;

  @ApiProperty({
    description: 'Indicates if it is a shop event',
    example: true,
  })
  @IsBoolean()
  shop_event: boolean;

  @ApiProperty({
    description: 'Required material for the reserve',
    minLength: 1,
    maxLength: 500,
    example: 'Board game, dice, cards',
  })
  @IsString()
  @Length(1, 500)
  required_material: string;

  @ApiPropertyOptional({
    description: 'ID of the difficulty level',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  difficulty_id?: number;

  @ApiPropertyOptional({
    description: 'ID of the game',
    example: 3,
  })
  @IsOptional()
  @IsNumber()
  reserve_of_game_id?: number;

  @ApiPropertyOptional({
    description: 'Name of the game',
    example: 'Chess',
  })
  @IsOptional()
  @IsString()
  game_name?: string;

  @ApiPropertyOptional({
    description: 'ID of the table',
    example: 4,
  })
  @IsOptional()
  @IsNumber()
  reserve_table_id?: number;
}

export class UpdateReserveDto {
  @ApiPropertyOptional({
    description: 'ID of the reserve',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  id_reserve?: number;

  @ApiPropertyOptional({
    description: 'Total number of places',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  total_places?: number;

  @ApiPropertyOptional({
    description: 'ID of the user who made the reserve',
    example: 1,
  })
  @IsOptional()
  @IsString()
  reserver_id?: string;

  @ApiPropertyOptional({
    description: 'Start hour of the reserve',
    example: '2023-10-10T10:00:00Z',
  })
  @IsOptional()
  @IsDate()
  hour_start?: Date;

  @ApiPropertyOptional({
    description: 'End hour of the reserve',
    example: '2023-10-10T12:00:00Z',
  })
  @IsOptional()
  @IsDate()
  hour_end?: Date;

  @ApiPropertyOptional({
    description: 'Description of the reserve',
    minLength: 1,
    maxLength: 500,
    example: 'A fun board game event',
  })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Required material for the reserve',
    minLength: 1,
    maxLength: 500,
    example: 'Board game, dice, cards',
  })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  required_material?: string;

  @ApiPropertyOptional({
    description: 'Indicates if it is a shop event',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  shop_event?: boolean;

  @ApiPropertyOptional({
    description: 'ID of the difficulty level',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  difficulty_id?: number;


  @ApiPropertyOptional({
    description: 'ID of the game',
    example: 3,
  })
  @IsOptional()
  @IsNumber()
  reserve_of_game_id?: number;
  
  @ApiPropertyOptional({
    description: 'Name of the game',
    example: 'Chess',
  })
  @IsOptional()
  @IsString()
  game_name?: string;

  @ApiPropertyOptional({
    description: 'ID of the table',
    example: 4,
  })
  @IsOptional()
  @IsNumber()
  reserve_table_id?: number;
}
