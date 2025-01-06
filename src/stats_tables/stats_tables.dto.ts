import { IsString, IsNumber, Length } from 'class-validator';

export class CreateStatsTableDto {
  @IsString()
  description: string;
}

export class UpdateStatsTableDto {
  @IsNumber()
  id_state_table: number;

  @IsString()
  @Length(1, 500)
  description: string;
}
