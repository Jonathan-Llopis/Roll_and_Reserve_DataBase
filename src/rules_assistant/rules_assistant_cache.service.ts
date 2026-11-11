import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RulesAssistResponseDto } from './rules_assistant.dto';

interface CacheEntry {
  data: RulesAssistResponseDto;
  expiresAt: number;
}

@Injectable()
export class RulesAssistantCacheService {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly defaultTtlMs: number;
  private readonly maxEntries: number;

  constructor(private readonly configService: ConfigService) {
    const configuredTtl = this.configService.get<string>('RULES_CACHE_TTL_MS');
    this.defaultTtlMs = configuredTtl
      ? parseInt(configuredTtl, 10)
      : 24 * 60 * 60 * 1000; // 24 hours
    this.maxEntries = 1000;
  }

  /**
   * Normaliza la clave para asegurar coincidencias ignorando mayúsculas, signos de interrogación y acentos.
   */
  private normalizeKey(gameName: string, question: string): string {
    const cleanGame = gameName
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const cleanQuestion = question
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[¿?¡!.,:;]/g, '')
      .replace(/\s+/g, ' ');

    return `${cleanGame}:${cleanQuestion}`;
  }

  get(gameName: string, question: string): RulesAssistResponseDto | null {
    const key = this.normalizeKey(gameName, question);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return {
      ...entry.data,
      cached: true,
    };
  }

  set(
    gameName: string,
    question: string,
    response: RulesAssistResponseDto,
    ttlMs?: number,
  ): void {
    if (this.cache.size >= this.maxEntries) {
      // Elimina la primera clave (FIFO)
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    const key = this.normalizeKey(gameName, question);
    const effectiveTtl = ttlMs ?? this.defaultTtlMs;

    this.cache.set(key, {
      data: { ...response, cached: false },
      expiresAt: Date.now() + effectiveTtl,
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}
