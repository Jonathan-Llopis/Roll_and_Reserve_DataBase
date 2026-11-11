# Issue 07: Corrección de Relaciones de Entidades TypeORM y Erratas en Base de Datos

- **Identificador**: `ISSUE-07`
- **GitHub Issue**: [#9](https://github.com/Jonathan-Llopis/Roll_and_Reserve_DataBase/issues/9)
- **Estado**: ✅ COMPLETADO
- **Prioridad**: 🔴 Crítica (Consistencia de Base de Datos y Compilación)
- **Impacto**: Corrección de consultas relacionales corruptas, esquemas inconsistentes y fallos de compilación en librerías externas.

---

## 1. Resumen del Por Qué

1. Inconsistencia relacional entre `ReservesEntity` y `GamesEntity`:
   - En `ReservesEntity`:
     ```typescript
     @ManyToOne(() => GamesEntity, (game) => game.game_reserve, { onDelete: 'CASCADE' })
     @JoinColumn({ name: 'game_reserve' })
     reserve_of_game: GamesEntity;
     ```
   - En `GamesEntity`:
     ```typescript
     @ManyToMany(() => ReservesEntity, (reserve) => reserve.reserve_of_game)
     @JoinTable()
     game_reserve: GamesEntity[];
     ```
     Una relación `@ManyToOne` no puede tener como contraparte un `@ManyToMany` con tabla intermedia `@JoinTable()` y tipado incorrecto como `GamesEntity[]`. Esto genera esquemas inválidos y consultas rotas al cargar relaciones `reserve_of_game`.
2. Error de importación en `src/utils/labels/labels.service.ts`:
   - `import { GridFSBucketReadStream } from 'typeorm';` $\rightarrow$ TypeORM no provee este tipo; pertenece a MongoDB (`'mongodb'`). Causa error de compilación TypeScript.
3. Erratas de columnas en entidades:
   - `raiting` en `ReviewsEntity` y `average_raiting` en `UserEntity`.
   - `writter_id` y `reviwed_id` en las claves foráneas de `ReviewsEntity`.

---

## 2. Solución Propuesta

1. Corregir la relación en `GamesEntity`:
   - Sustituir `@ManyToMany` por `@OneToMany(() => ReservesEntity, (reserve) => reserve.reserve_of_game)`.
   - Tipar la propiedad como `reserves: ReservesEntity[]` (o conservar `game_reserve` como alias retrocompatible).
2. Corregir el import de `GridFSBucketReadStream` importándolo desde `'mongodb'`.
3. Mapear las columnas con erratas mediante `@Column({ name: 'raiting' }) rating: number` para mantener compatibilidad física con bases de datos existentes sin romper el código TypeScript idiomático.

---

## 3. Pruebas y Verificación

- **Compilación**:
  ```bash
  npm run build
  ```
- **Pruebas de Repositorio**:
  - Verificar que consultar una reserva con `relations: ['reserve_of_game']` devuelva la entidad del juego sin errores SQL de tabla de unión fantasma.

---

## 4. Criterios de Aceptación

- [x] Relación entre `GamesEntity` y `ReservesEntity` simétrica (`@ManyToOne` $\leftrightarrow$ `@OneToMany`).
- [x] Import de `GridFSBucketReadStream` corregido.
- [x] `npm run build` sin errores de compilación de TypeORM.

---

## 5. Nota de la Solución

1. **Simetría Relacional Corregida**:
   - `GamesEntity`: Cambiada la relación de `@ManyToMany` a `@OneToMany(() => ReservesEntity, (reserve) => reserve.reserve_of_game)` con tipado correcto `game_reserve: ReservesEntity[]`, eliminando `@JoinTable()` espuria que generaba esquemas corruptos e impedía la carga correcta de `reserve_of_game`.
2. **Import de GridFSBucketReadStream**:
   - Resuelto mediante `import { GridFSBucketReadStream } from 'mongodb'` en `src/utils/labels/labels.service.ts` y dependencia explícita en `package.json`.
3. **Mapeo Explícito de Columnas**:
   - `ReviewsEntity`: Configurado `@Column({ name: 'raiting' }) raiting: number` junto a propiedad opcional retrocompatible `rating?: number`. Claves foráneas mapeadas con `@JoinColumn({ name: 'writter_id' }) writer: UserEntity` y `@JoinColumn({ name: 'reviwed_id' }) reviewed: UserEntity`.
   - `UserEntity`: Configurado `@Column({ name: 'average_raiting', nullable: true }) average_raiting: number` junto a `average_rating?: number`.
4. **Verificación**:
   - Compilación exitosa (`nest build`).
   - 158/158 pruebas pasando en verde (`npm test`).

