import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { GamesEntity } from '../games/games.entity';
import { RulesAssistantCacheService } from './rules_assistant_cache.service';
import {
  GenUiComponent,
  QuickActionsComponent,
  RuleCardComponent,
  RulesAssistRequestDto,
  RulesAssistResponseDto,
  TurnCarouselComponent,
} from './rules_assistant.dto';

@Injectable()
export class RulesAssistantService {
  private readonly logger = new Logger(RulesAssistantService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(GamesEntity)
    private readonly gameRepository: Repository<GamesEntity>,
    private readonly cacheService: RulesAssistantCacheService,
  ) {}

  /**
   * Resuelve el contexto del juego a partir del parámetro de ruta y el cuerpo de la petición.
   */
  async resolveGameContext(
    id: string,
    dto: RulesAssistRequestDto,
  ): Promise<{ id?: number; bgg_id?: number; name: string }> {
    const numericId = parseInt(id, 10);

    if (!isNaN(numericId) && numericId > 0) {
      // 1. Buscar por id_game local
      const gameById = await this.gameRepository.findOne({
        where: { id_game: numericId },
      });
      if (gameById) {
        return {
          id: gameById.id_game,
          bgg_id: gameById.bgg_id,
          name: gameById.name,
        };
      }

      // 2. Buscar por bgg_id en la base de datos
      const gameByBgg = await this.gameRepository.findOne({
        where: { bgg_id: numericId },
      });
      if (gameByBgg) {
        return {
          id: gameByBgg.id_game,
          bgg_id: gameByBgg.bgg_id,
          name: gameByBgg.name,
        };
      }
    }

    // 3. Inferir desde el DTO si se proporciona
    if (dto.gameId) {
      const game = await this.gameRepository.findOne({
        where: { id_game: dto.gameId },
      });
      if (game) {
        return {
          id: game.id_game,
          bgg_id: game.bgg_id,
          name: game.name,
        };
      }
    }

    const fallbackName =
      dto.gameName?.trim() || (isNaN(numericId) ? id : `Juego #${id}`);
    return {
      id: dto.gameId,
      bgg_id: dto.bggId || (!isNaN(numericId) ? numericId : undefined),
      name: fallbackName,
    };
  }

  /**
   * Procesa la consulta de reglas, consulta la caché o el LLM y devuelve el payload GenUI.
   */
  async getRulesAdvice(
    id: string,
    dto: RulesAssistRequestDto,
  ): Promise<RulesAssistResponseDto> {
    const gameContext = await this.resolveGameContext(id, dto);

    // 1. Comprobar caché en servidor
    const cachedResponse = this.cacheService.get(
      gameContext.name,
      dto.question,
    );
    if (cachedResponse) {
      this.logger.log(
        `Caché HIT para juego "${gameContext.name}": "${dto.question}"`,
      );
      return {
        ...cachedResponse,
        game: gameContext,
        cached: true,
      };
    }

    // 2. Generar respuesta con IA o fallback defensivo
    const apiKey =
      this.configService.get<string>('GEMINI_API_KEY') ||
      process.env.GEMINI_API_KEY;

    let responseData: RulesAssistResponseDto;

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      this.logger.warn(
        'GEMINI_API_KEY no configurada. Generando respuesta estructurada de fallback.',
      );
      responseData = this.buildFallbackResponse(gameContext, dto.question);
    } else {
      try {
        responseData = await this.callGemini(gameContext, dto, apiKey);
      } catch (error) {
        this.logger.error(
          `Error al llamar a la API de IA para "${gameContext.name}": ${error.message}`,
          error.stack,
        );
        responseData = this.buildFallbackResponse(gameContext, dto.question);
      }
    }

    // 3. Guardar en caché para futuras consultas
    this.cacheService.set(gameContext.name, dto.question, responseData);

    return responseData;
  }

  /**
   * Llama a Google Gemini 2.0 Flash solicitando formato estructurado GenUI.
   */
  private async callGemini(
    game: { id?: number; bgg_id?: number; name: string },
    dto: RulesAssistRequestDto,
    apiKey: string,
  ): Promise<RulesAssistResponseDto> {
    const model =
      this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const systemPrompt = `Eres un árbitro oficial y experto en reglamentos de juegos de mesa para la app Roll & Reserve.
Estás resolviendo una duda en vivo para jugadores en mesa del juego "${game.name}" (BGG ID: ${game.bgg_id || 'N/A'}).

Directrices estrictas:
1. Responde de forma clara, directa y concisa sin introducciones ni despedidas de cortesía.
2. Si la regla varía según una variante, edición o expansión, márcala con severidad "warning" y aclara la condición.
3. Devuelve OBLIGATORIAMENTE un JSON estricto con la siguiente estructura:
{
  "summary": "Resumen directo y en una sola frase de la resolución de la duda.",
  "components": [
    {
      "type": "rule_card",
      "title": "Título descriptivo de la regla",
      "badge": "Regla Oficial",
      "severity": "info" | "warning" | "critical",
      "steps": [
        "Paso 1 o condición...",
        "Paso 2 o resolución..."
      ]
    },
    {
      "type": "turn_carousel", // Usar solo si la duda involucra secuencia de fases o turnos
      "phases": [
        { "phaseNumber": 1, "phaseName": "Nombre Fase", "description": "Qué se hace..." }
      ]
    },
    {
      "type": "quick_actions", // Siempre incluir al final 2 o 3 dudas típicas relacionadas
      "chips": [
        "¿Cómo desempatar?",
        "¿Qué cartas otorgan puntos?"
      ]
    }
  ]
}`;

    // Construcción de mensajes conversacionales
    const contents: any[] = [];

    if (dto.history && dto.history.length > 0) {
      for (const msg of dto.history) {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.text }],
        });
      }
    }

    contents.push({
      role: 'user',
      parts: [
        {
          text: `Juego: ${game.name}\nPregunta del jugador: ${dto.question}`,
        },
      ],
    });

    const response = await axios.post(
      url,
      {
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents,
        generationConfig: {
          temperature: 0.2,
          response_mime_type: 'application/json',
        },
      },
      {
        timeout: 15000,
      },
    );

    const candidates = response.data?.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error('Gemini no devolvió candidatos válidos.');
    }

    const rawText = candidates[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error('Texto de respuesta vacío de Gemini.');
    }

    return this.parseAndSanitizeGenUi(rawText, game, dto.question);
  }

  /**
   * Parsea y sanea defensivamente el JSON devuelto por la IA para proteger al cliente Flutter.
   */
  parseAndSanitizeGenUi(
    rawText: string,
    game: { id?: number; bgg_id?: number; name: string },
    question: string,
  ): RulesAssistResponseDto {
    try {
      // Limpiar posibles bloques de markdown
      const cleaned = rawText
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

      const parsed = JSON.parse(cleaned);

      const summary =
        typeof parsed.summary === 'string' && parsed.summary.trim().length > 0
          ? parsed.summary.trim()
          : `Resolución de reglas para ${game.name}`;

      const rawComponents = Array.isArray(parsed.components)
        ? parsed.components
        : [];
      const sanitizedComponents: GenUiComponent[] = [];

      for (const comp of rawComponents) {
        if (!comp || typeof comp !== 'object') continue;

        if (comp.type === 'rule_card' && typeof comp.title === 'string') {
          const ruleCard: RuleCardComponent = {
            type: 'rule_card',
            title: comp.title,
            badge: typeof comp.badge === 'string' ? comp.badge : 'Regla',
            severity: ['info', 'warning', 'critical'].includes(comp.severity)
              ? comp.severity
              : 'info',
            steps: Array.isArray(comp.steps)
              ? comp.steps.map((s: any) => String(s))
              : [],
          };
          sanitizedComponents.push(ruleCard);
        } else if (
          comp.type === 'turn_carousel' &&
          Array.isArray(comp.phases)
        ) {
          const carousel: TurnCarouselComponent = {
            type: 'turn_carousel',
            phases: comp.phases.map((p: any, idx: number) => ({
              phaseNumber:
                typeof p.phaseNumber === 'number' ? p.phaseNumber : idx + 1,
              phaseName:
                typeof p.phaseName === 'string'
                  ? p.phaseName
                  : `Fase ${idx + 1}`,
              description:
                typeof p.description === 'string' ? p.description : '',
            })),
          };
          sanitizedComponents.push(carousel);
        } else if (comp.type === 'quick_actions' && Array.isArray(comp.chips)) {
          const quickActions: QuickActionsComponent = {
            type: 'quick_actions',
            chips: comp.chips.map((c: any) => String(c)),
          };
          sanitizedComponents.push(quickActions);
        } else if (
          comp.type === 'text_card' &&
          typeof comp.content === 'string'
        ) {
          sanitizedComponents.push({
            type: 'text_card',
            content: comp.content,
          });
        }
      }

      // Si no se pudo parsear ninguna tarjeta válida, añadir tarjeta de texto
      if (sanitizedComponents.length === 0) {
        sanitizedComponents.push({
          type: 'rule_card',
          title: `Regla de ${game.name}`,
          badge: 'Regla General',
          severity: 'info',
          steps: [summary],
        });
      }

      // Asegurar que siempre haya sugerencias de acciones rápidas
      const hasQuickActions = sanitizedComponents.some(
        (c) => c.type === 'quick_actions',
      );
      if (!hasQuickActions) {
        sanitizedComponents.push({
          type: 'quick_actions',
          chips: [
            `¿Cómo desempatar en ${game.name}?`,
            `¿Cuándo termina la partida?`,
          ],
        });
      }

      return {
        game,
        summary,
        genui_components: sanitizedComponents,
        cached: false,
      };
    } catch (parseError) {
      this.logger.warn(
        `Fallo al parsear JSON de GenUI, usando fallback defensivo: ${parseError.message}`,
      );
      return this.buildFallbackResponse(game, question);
    }
  }

  /**
   * Genera una respuesta estructurada de contingencia si la IA no está disponible o falla.
   */
  private buildFallbackResponse(
    game: { id?: number; bgg_id?: number; name: string },
    question: string,
  ): RulesAssistResponseDto {
    const isTieBreak =
      question.toLowerCase().includes('desempate') ||
      question.toLowerCase().includes('empate');
    const isSetup =
      question.toLowerCase().includes('preparar') ||
      question.toLowerCase().includes('inicio');

    const title = isTieBreak
      ? `Criterios de desempate en ${game.name}`
      : isSetup
        ? `Preparación de la partida en ${game.name}`
        : `Duda sobre reglas en ${game.name}`;

    const steps = isTieBreak
      ? [
          'En caso de empate en puntos de victoria, comprueba los recursos o materias primas restantes en mano.',
          'Si el empate persiste, los jugadores implicados comparten la victoria a menos que el manual especifique una ronda extra.',
        ]
      : [
          `Consulta el apartado correspondiente a "${question}" en el reglamento oficial de ${game.name}.`,
          'Si surge una disputa durante el turno, la interpretación mayoritaria de la mesa prevalece hasta el fin de la partida.',
        ];

    return {
      game,
      summary: `Resolución oficial orientativa para "${question}" en ${game.name}.`,
      genui_components: [
        {
          type: 'rule_card',
          title,
          badge: 'Regla Oficial',
          severity: 'info',
          steps,
        },
        {
          type: 'quick_actions',
          chips: [
            `¿Cómo desempatar en ${game.name}?`,
            `¿Qué pasa si se acaba el mazo?`,
            `Condiciones de fin de partida`,
          ],
        },
      ],
      cached: false,
    };
  }
}
