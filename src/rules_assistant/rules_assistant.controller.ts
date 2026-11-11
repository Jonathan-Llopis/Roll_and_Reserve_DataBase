import {
  Body,
  Controller,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RulesAssistantService } from './rules_assistant.service';
import {
  RulesAssistRequestDto,
  RulesAssistResponseDto,
} from './rules_assistant.dto';

@ApiTags('Rules Assistant')
@Controller()
export class RulesAssistantController {
  constructor(private readonly rulesAssistantService: RulesAssistantService) {}

  @Post('games/:id/rules-assist')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Consultar dudas de reglas de un juego con formato GenUI',
    description:
      'Resuelve dudas de reglas para el juego indicado por ID (local o BGG) generando una respuesta estructurada con componentes visuales para Flutter.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de base de datos o ID de BoardGameGeek (BGG) del juego',
    example: '13',
  })
  @ApiResponse({
    status: 200,
    description: 'Regla resuelta con componentes GenUI',
    type: RulesAssistResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Cuerpo de petición inválido' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getGameRulesAssist(
    @Param('id') id: string,
    @Body() dto: RulesAssistRequestDto,
  ): Promise<RulesAssistResponseDto> {
    return this.rulesAssistantService.getRulesAdvice(id, dto);
  }

  @Post('rules-assistant')
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Consultar dudas de reglas pasando el nombre del juego en el cuerpo',
    description:
      'Endpoint alternativo directo para consultar reglas especificando el juego en el cuerpo del mensaje.',
  })
  @ApiResponse({
    status: 200,
    description: 'Regla resuelta con componentes GenUI',
    type: RulesAssistResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Cuerpo de petición inválido' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async queryRulesAssist(
    @Body() dto: RulesAssistRequestDto,
  ): Promise<RulesAssistResponseDto> {
    const id = dto.gameId
      ? String(dto.gameId)
      : dto.bggId
        ? String(dto.bggId)
        : 'general';
    return this.rulesAssistantService.getRulesAdvice(id, dto);
  }
}
