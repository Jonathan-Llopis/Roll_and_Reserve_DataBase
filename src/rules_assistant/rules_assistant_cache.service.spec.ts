import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RulesAssistantCacheService } from './rules_assistant_cache.service';
import { RulesAssistResponseDto } from './rules_assistant.dto';

describe('RulesAssistantCacheService', () => {
  let service: RulesAssistantCacheService;
  let mockConfigService: Partial<ConfigService>;

  const mockResponse: RulesAssistResponseDto = {
    game: { id: 3, bgg_id: 13, name: 'Catan' },
    summary: 'Al sacar un 7 se activa el ladrón.',
    genui_components: [
      {
        type: 'rule_card',
        title: 'El Ladrón',
        badge: 'Regla',
        severity: 'critical',
        steps: ['Mueve el ladrón', 'Roba una carta'],
      },
    ],
    cached: false,
  };

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'RULES_CACHE_TTL_MS') return '5000';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RulesAssistantCacheService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<RulesAssistantCacheService>(
      RulesAssistantCacheService,
    );
  });

  afterEach(() => {
    service.clear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should store and retrieve cached response', () => {
    service.set('Catan', '¿Qué pasa al sacar un 7?', mockResponse);

    const cached = service.get('Catan', '¿Qué pasa al sacar un 7?');
    expect(cached).toBeDefined();
    expect(cached?.summary).toEqual(mockResponse.summary);
    expect(cached?.cached).toBe(true);
  });

  it('should match normalized query ignoring accents, punctuation and case', () => {
    service.set('Catán', '¿Qué pasa con el 7 en los dados?', mockResponse);

    // Variaciones en mayúsculas, sin interrogaciones y sin tildes
    const hit1 = service.get('catan', 'que pasa con el 7 en los dados');
    const hit2 = service.get('CATAN', '¿QUE PASA CON EL 7 EN LOS DADOS?');

    expect(hit1).toBeDefined();
    expect(hit2).toBeDefined();
    expect(hit1?.summary).toEqual(mockResponse.summary);
  });

  it('should return null when entry has expired according to TTL', async () => {
    // TTL de 50 milisegundos para probar expiración
    service.set('Catan', 'pregunta rapida', mockResponse, 50);

    const immediate = service.get('Catan', 'pregunta rapida');
    expect(immediate).toBeDefined();

    // Esperar a que expire
    await new Promise((resolve) => setTimeout(resolve, 60));

    const expired = service.get('Catan', 'pregunta rapida');
    expect(expired).toBeNull();
  });

  it('should clear all entries', () => {
    service.set('Catan', 'p1', mockResponse);
    service.set('Carcassonne', 'p2', mockResponse);
    expect(service.size()).toBe(2);

    service.clear();
    expect(service.size()).toBe(0);
    expect(service.get('Catan', 'p1')).toBeNull();
  });
});
