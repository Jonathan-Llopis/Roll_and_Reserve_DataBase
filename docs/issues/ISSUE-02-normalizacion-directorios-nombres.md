# Issue 02: Normalización de Directorios, Erratas de Nombres y Modularización Limpia

- **Identificador**: `ISSUE-02`
- **GitHub Issue**: [#4](https://github.com/Jonathan-Llopis/Roll_and_Reserve_DataBase/issues/4)
- **Prioridad**: 🟠 Alta (Mantenibilidad y Convenciones de Código)
- **Impacto**: Claridad arquitectónica, consistencia tipográfica, eliminación de rutas frágiles e imports rotos.

---

## 1. Resumen del Por Qué

El repositorio presenta inconsistencias organizativas y erratas tipográficas en nombres de archivos y carpetas clave:
1. `src/Autentication` mezcla español e inglés con una errata fonética (`Autentication` en vez de `auth` o `authentication`), lo cual confunde herramientas de scaffolding de NestJS y convenciones idiomáticas.
2. `src/games/games.entitiy.ts` tiene una errata en el nombre (`entitiy` con doble 'i').
3. Archivos de infraestructura y configuración están dispersos directamente en la raíz de `src/`:
   - `src/authorization.middleware.ts`
   - `src/multer.config.ts`
   - `src/typeorm.config.ts`
   - `src/seeds.ts`
4. Coexisten módulos nombrados con snake_case (`game_category`, `shop_games`, `users_reserves`) y otros con kebab-case o camelCase, dificultando la navegación estructurada.

---

## 2. Solución Propuesta

1. Renombrar `src/Autentication` a `src/auth/` y actualizar servicios y controladores vinculados (`auth.service.ts`, `auth.guard.ts`).
2. Corregir `src/games/games.entitiy.ts` a `src/games/games.entity.ts`.
3. Reorganizar archivos de configuración creando `src/config/`:
   - `src/config/typeorm.config.ts`
   - `src/config/multer.config.ts`
4. Actualizar de forma exhaustiva todos los imports relativos en `src/`, `test/` y scripts para asegurar cero fallos de compilación.

---

## 3. Pruebas y Verificación

- **Compilación TypeScript**:
  ```bash
  npm run build
  ```
- **Linter**:
  ```bash
  npm run lint
  ```

---

## 4. Criterios de Aceptación

- [ ] Carpeta de autenticación renombrada limpiamente a `src/auth/`.
- [ ] Errata `games.entitiy.ts` corregida a `games.entity.ts`.
- [ ] Archivos de configuración agrupados bajo `src/config/`.
- [ ] `npm run build` compila con 0 errores de resolución de módulos.
