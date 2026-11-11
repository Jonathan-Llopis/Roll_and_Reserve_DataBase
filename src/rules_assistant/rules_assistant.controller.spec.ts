import { Test, TestingModule } from '@nestjs/testing';
import { RulesAssistantController } from './rules_assistant.controller';
import { RulesAssistantService } from './rules_assistant.service';
import {
  RulesAssistRequestDto,
  RulesAssistResponseDto,
} from './rules_assistant.dto';

describe('RulesAssistantController', () => {
  let controller: RulesAssistantController;
  let mockService: Partial<RulesAssistantService>;

  const mockResponse: RulesAssistResponseDto = {
    game: { id: 3, bgg_id: 13, name: 'Catan' },
    summary: 'Resumen de regla de Catan',
    genui_components: [
      {
        type: 'rule_card',
        title: 'Regla',
        steps: ['Paso 1'],
      },
    ],
    cached: false,
  };

  beforeEach(async () => {
    mockService = {
      getRulesAdvice: jest.fn().mockResolvedValue(mockResponse),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RulesAssistantController],
      providers: [
        {
          provide: RulesAssistantService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<RulesAssistantController>(RulesAssistantController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getGameRulesAssist', () => {
    it('should forward parameters to service.getRulesAdvice', async () => {
      const dto: RulesAssistRequestDto = {
        question: '¿Qué pasa al sacar un 7?',
      };

      const result = await controller.getGameRulesAssist('3', dto);

      expect(result).toEqual(mockResponse);
      expect(mockService.getRulesAdvice).toHaveBeenCalledWith('3', dto);
    });
  });

  describe('queryRulesAssist', () => {
    it('should forward direct query to service.getRulesAdvice with gameId', async () => {
      const dto: RulesAssistRequestDto = {
        question: '¿Cómo se juega?',
        gameId: 5,
        gameName: 'Ticket to Ride',
      };

      const result = await controller.queryRulesAssist(dto);

      expect(result).toEqual(mockResponse);
      expect(mockService.getRulesAdvice).toHaveBeenCalledWith('5', dto);
    });

    it('should fallback to general id when neither gameId nor bggId is provided', async () => {
      const dto: RulesAssistRequestDto = {
        question: '¿Reglas generales?',
        gameName: 'Juego Desconocido',
      };

      const result = await controller.queryRulesAssist(dto);

      expect(result).toEqual(mockResponse);
      expect(mockService.getRulesAdvice).toHaveBeenCalledWith('general', dto);
    });
  });
});
