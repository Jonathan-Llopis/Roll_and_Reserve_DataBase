import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChatHistoryItemDto {
  @ApiProperty({ enum: ['user', 'assistant'], example: 'user' })
  @IsString()
  role: 'user' | 'assistant';

  @ApiProperty({ example: '¿Cuántos puntos necesito para ganar?' })
  @IsString()
  text: string;
}

export class RulesAssistRequestDto {
  @ApiProperty({
    description: 'Pregunta o duda concreta sobre las reglas del juego',
    example: '¿Qué pasa si saco un 7 en los dados?',
  })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiPropertyOptional({
    description: 'Nombre del juego de mesa (opcional si se infiere del ID)',
    example: 'Catan',
  })
  @IsString()
  @IsOptional()
  gameName?: string;

  @ApiPropertyOptional({
    description: 'ID de BoardGameGeek (BGG) del juego',
    example: 13,
  })
  @IsNumber()
  @IsOptional()
  bggId?: number;

  @ApiPropertyOptional({
    description: 'ID del juego en la base de datos local',
    example: 3,
  })
  @IsNumber()
  @IsOptional()
  gameId?: number;

  @ApiPropertyOptional({
    description: 'Historial conversacional previo para mantener el contexto',
    type: [ChatHistoryItemDto],
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ChatHistoryItemDto)
  history?: ChatHistoryItemDto[];
}

export type GenUiComponentType =
  'rule_card' | 'turn_carousel' | 'quick_actions' | 'text_card';

export interface RuleCardComponent {
  type: 'rule_card';
  title: string;
  badge?: string;
  severity?: 'critical' | 'info' | 'warning';
  steps: string[];
}

export interface TurnPhase {
  phaseNumber: number;
  phaseName: string;
  description: string;
}

export interface TurnCarouselComponent {
  type: 'turn_carousel';
  phases: TurnPhase[];
}

export interface QuickActionsComponent {
  type: 'quick_actions';
  chips: string[];
}

export interface TextCardComponent {
  type: 'text_card';
  content: string;
}

export type GenUiComponent =
  | RuleCardComponent
  | TurnCarouselComponent
  | QuickActionsComponent
  | TextCardComponent;

export class RulesAssistResponseDto {
  @ApiProperty({
    description: 'Información del juego consultado',
    example: { id: 3, bgg_id: 13, name: 'Catan' },
  })
  game: {
    id?: number;
    bgg_id?: number;
    name: string;
  };

  @ApiProperty({
    description: 'Resumen conciso y directo de la regla o respuesta',
    example:
      'Al sacar un 7 se activa el ladrón inmediatamente y nadie produce materias primas.',
  })
  summary: string;

  @ApiProperty({
    description: 'Lista de componentes visuales interactivos GenUI',
  })
  genui_components: GenUiComponent[];

  @ApiProperty({
    description:
      'Indica si la respuesta fue recuperada de la caché del servidor',
    example: false,
  })
  cached: boolean;
}
