import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GamesEntity } from '../games/games.entity';
import { RulesAssistantService } from './rules_assistant.service';
import { RulesAssistantCacheService } from './rules_assistant_cache.service';
import { RulesAssistRequestDto } from './rules_assistant.dto';

describe('RulesAssistantService', () => {
  let service: RulesAssistantService;
  let cacheService: RulesAssistantCacheService;
  let gameRepository: Partial<Repository<GamesEntity>>;
  let configService: Partial<ConfigService>;

  const mockGameEntity: GamesEntity = {
    id_game: 3,
    name: 'Catan',
    description: 'Juego de mesa de comercio',
    bgg_id: 13,
    gameCategory: null as any,
    shop: [],
    game_reserve: [],
  };

  beforeEach(async () => {
    gameRepository = {
      findOne: jest.fn().mockImplementation((options: any) => {
        const where = options?.where;
        if (where?.id_game === 3) return Promise.resolve(mockGameEntity);
        if (where?.bgg_id === 13) return Promise.resolve(mockGameEntity);
        return Promise.resolve(null);
      }),
    };

    configService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'GEMINI_API_KEY') return null; // Fallback mode
        if (key === 'GEMINI_MODEL') return 'gemini-2.0-flash';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RulesAssistantService,
        RulesAssistantCacheService,
        {
          provide: getRepositoryToken(GamesEntity),
          useValue: gameRepository,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    service = module.get<RulesAssistantService>(RulesAssistantService);
    cacheService = module.get<RulesAssistantCacheService>(
      RulesAssistantCacheService,
    );
  });

  afterEach(() => {
    cacheService.clear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('resolveGameContext', () => {
    it('should resolve game by local id_game', async () => {
      const result = await service.resolveGameContext('3', {
        question: '¿Cómo funciona?',
      });
      expect(result.id).toBe(3);
      expect(result.bgg_id).toBe(13);
      expect(result.name).toBe('Catan');
    });

    it('should resolve game by bgg_id if id_game is not matched', async () => {
      const result = await service.resolveGameContext('13', {
        question: '¿Cómo funciona?',
      });
      expect(result.bgg_id).toBe(13);
      expect(result.name).toBe('Catan');
    });

    it('should fallback to dto.gameName when game is not found in database', async () => {
      const result = await service.resolveGameContext('999', {
        question: '¿Cómo funciona?',
        gameName: 'Wingspan',
        bggId: 266192,
      });
      expect(result.name).toBe('Wingspan');
      expect(result.bgg_id).toBe(266192);
    });
  });

  describe('getRulesAdvice', () => {
    it('should return fallback structured response when GEMINI_API_KEY is not set', async () => {
      const dto: RulesAssistRequestDto = {
        question: '¿Cómo desempatar si tenemos los mismos puntos?',
        gameName: 'Catan',
      };

      const result = await service.getRulesAdvice('3', dto);

      expect(result).toBeDefined();
      expect(result.game.name).toBe('Catan');
      expect(result.summary).toContain('Catan');
      expect(result.cached).toBe(false);
      expect(result.genui_components.length).toBeGreaterThanOrEqual(2);

      const ruleCard = result.genui_components.find(
        (c) => c.type === 'rule_card',
      );
      expect(ruleCard).toBeDefined();

      const quickActions = result.genui_components.find(
        (c) => c.type === 'quick_actions',
      );
      expect(quickActions).toBeDefined();
    });

    it('should return cached response on second call with same query', async () => {
      const dto: RulesAssistRequestDto = {
        question: '¿Qué pasa al sacar un 7?',
        gameName: 'Catan',
      };

      const firstCall = await service.getRulesAdvice('3', dto);
      expect(firstCall.cached).toBe(false);

      const secondCall = await service.getRulesAdvice('3', dto);
      expect(secondCall.cached).toBe(true);
      expect(secondCall.summary).toEqual(firstCall.summary);
    });
  });

  describe('parseAndSanitizeGenUi', () => {
    it('should cleanly parse valid JSON even wrapped in markdown codeblocks', () => {
      const rawText = `\`\`\`json
{
  "summary": "El ladrón bloquea la producción del hexágono.",
  "components": [
    {
      "type": "rule_card",
      "title": "Bloqueo por ladrón",
      "badge": "Oficial",
      "severity": "critical",
      "steps": ["No produce materias", "Roba una carta"]
    },
    {
      "type": "quick_actions",
      "chips": ["¿Cómo mover al ladrón?"]
    }
  ]
}
\`\`\``;

      const result = service.parseAndSanitizeGenUi(
        rawText,
        { id: 3, bgg_id: 13, name: 'Catan' },
        'duda ladron',
      );

      expect(result.summary).toBe(
        'El ladrón bloquea la producción del hexágono.',
      );
      expect(result.genui_components.length).toBe(2);
      expect(result.genui_components[0].type).toBe('rule_card');
      expect(result.genui_components[1].type).toBe('quick_actions');
    });

    it('should recover gracefully and build fallback if rawText is corrupted JSON', () => {
      const corruptedText = `{"summary": "Incomplete json`;

      const result = service.parseAndSanitizeGenUi(
        corruptedText,
        { id: 3, bgg_id: 13, name: 'Catan' },
        'duda ladron',
      );

      expect(result).toBeDefined();
      expect(result.genui_components.length).toBeGreaterThanOrEqual(1);
      expect(result.genui_components[0].type).toBe('rule_card');
    });
  });
});
