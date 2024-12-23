import { IsString, IsNumber, Length } from 'class-validator';

export class CreateStateTableDto {
  @IsString()
  description: string;
}

export class UpdateStateTableDto {
  @IsNumber()
  id_state_table: number;

  @IsString()
  @Length(1, 500)
  description: string;
}
