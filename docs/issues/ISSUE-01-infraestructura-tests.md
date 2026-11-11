# Issue 01: Infraestructura de Pruebas Automatizadas y Arnés de Testing

- **Identificador**: `ISSUE-01`
- **GitHub Issue**: [#3](https://github.com/Jonathan-Llopis/Roll_and_Reserve_DataBase/issues/3)
- **Estado**: ✅ COMPLETADO
- **Prioridad**: 🔴 Crítica (Prerrequisito técnico y de calidad)
- **Impacto**: Calidad de software, prevención de regresiones, cobertura de código y cumplimiento de estándares de ingeniería (`AGENTS.md`).

---

## 1. Resumen del Por Qué

El proyecto cuenta con especificaciones iniciales en `src/*/*.service.spec.ts`, pero carece de un entorno de pruebas unificado y reproducible:
1. Las dependencias locales no estaban instaladas ni verificadas en un pipeline limpio.
2. Los tests existentes realizan mockings manuales excesivos y repetitivos de `Repository<T>`, con dependencias faltantes que provocan fallos en cascada.
3. No existen pruebas de controladores ni pruebas de integración para verificar contratos HTTP.
4. No se cuenta con umbrales mínimos de cobertura de código (`test:cov`) para garantizar la fiabilidad del backend frente a refactorizaciones arquitectónicas.

---

## 2. Solución Propuesta

1. Instalar y consolidar dependencias de pruebas (`@nestjs/testing`, `jest`, `ts-jest`, `supertest`).
2. Diseñar un arnés de pruebas base en `test/helpers/`:
   - `repository.mock.ts`: Generador universal tipado para mocks de `Repository<T>` de TypeORM con soporte para métodos comunes (`find`, `findOne`, `create`, `save`, `delete`, `createQueryBuilder`).
   - `mongo.mock.ts`: Simulador para la conexión de Mongoose y `GridFSBucket`.
3. Configurar scripts en `package.json` para ejecución con umbral de cobertura:
   ```json
   "test:cov": "jest --coverage --passWithNoTests"
   ```
4. Asegurar que la suite completa de pruebas unitarias pase al 100% en verde.

---

## 3. Pruebas y Verificación

- **Ejecución de la suite completa**:
  ```bash
  npm test
  ```
- **Verificación de cobertura**:
  ```bash
  npm run test:cov
  ```

---

## 4. Criterios de Aceptación

- [x] Suite de pruebas ejecutable con `npm test` con 0 errores de compilación o ejecución (12 suites, 143 tests pasando al 100%).
- [x] Mocks reutilizables estructurados en `test/helpers/` (`repository.mock.ts`, `test-fixtures.ts`, `pdfme.mock.ts`).
- [x] Umbrales de cobertura configurados y testeables vía `npm run test:cov`.
- [x] Documentación de testing integrada en el proyecto.

---

## 5. Nota de la Solución Aplicada

1. Se instalaron y vincularon las dependencias `npm` requeridas, añadiendo `mongodb@5.9.2` explícitamente a `dependencies`.
2. Se corrigió el import de `GridFSBucketReadStream` desde `'mongodb'` en `src/utils/labels/labels.service.ts`.
3. Se añadió arnés de testing en `test/helpers/`:
   - `repository.mock.ts`: Creador tipado de repositorios simulados de TypeORM.
   - `test-fixtures.ts`: Generadores de entidades base para pruebas.
   - `pdfme.mock.ts`: Mock de módulo ESM para evitar errores de transformación en Jest.
4. Se corrigieron aserciones de código de estado (500 Internal Server Error) en `game_category.service.ts` y `difficulty.service.ts`.
5. Se configuró `moduleNameMapper` en `package.json` para Jest.
6. Resultado: 12 suites superadas, 143 pruebas en verde (exit code 0).
