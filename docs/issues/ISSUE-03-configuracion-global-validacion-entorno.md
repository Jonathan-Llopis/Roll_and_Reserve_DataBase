# Issue 03: Gestión Centralizada de Configuración y Validación de Entorno

- **Identificador**: `ISSUE-03`
- **GitHub Issue**: [#5](https://github.com/Jonathan-Llopis/Roll_and_Reserve_DataBase/issues/5)
- **Estado**: ✅ COMPLETADO
- **Prioridad**: 🔴 Crítica (Seguridad de Credenciales y Estabilidad en Despliegue)
- **Impacto**: Prevención de fugas de credenciales en Git, arranque seguro con validación estricta de variables de entorno y soporte multiplataforma (local y Docker).

---

## 1. Resumen del Por Qué

1. El archivo de variables se encuentra en el repositorio nombrado como `env` (sin punto) y contiene credenciales de base de datos rastreadas por Git.
2. `AppModule` importa `ConfigModule.forRoot()` por duplicado (líneas 42 y 64), lo cual genera sobrecarga innecesaria en la inicialización del contexto de NestJS.
3. No existe validación de esquema para variables críticas de entorno (`MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`, `MONGODB_URI`, `PORT`, `JWT_SECRET`). Si una variable falta, el servidor arranca en falso o falla silenciosamente.
4. Se encuentra hardcodeado `host: 'database'` en la configuración de TypeORM de `app.module.ts`, impidiendo la ejecución local fuera de la red de contenedores Docker.

---

## 2. Solución Propuesta

1. Crear plantilla segura `.env.example` con variables documentadas y valores de ejemplo.
2. Añadir `.env` y `env` a `.gitignore` para prevenir fugas de secretos en el control de versiones.
3. Consolidar un único `ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', 'env'] })`.
4. Implementar validación de variables de entorno mediante un esquema tipado con valores predeterminados (por ejemplo, `MYSQL_HOST` por defecto `localhost` si no se especifica).
5. Inyectar `ConfigService` de forma estandarizada en los módulos de TypeORM y Mongoose.

---

## 3. Pruebas y Verificación

- **Pruebas de inicialización de configuración**:
  - Verificar que el servidor falle al arrancar si faltan variables obligatorias.
  - Verificar que cargue las variables correctamente desde `.env` tanto en local como con variables inyectadas en CI/Docker.

---

## 4. Criterios de Aceptación

- [x] `.env.example` creado con todas las variables documentadas.
- [x] Variables sensibles y archivo `env` excluidos del rastreo de Git.
- [x] `ConfigModule` único e inyectable globalmente (`isGlobal: true, envFilePath: ['.env', 'env']`).
- [x] Parámetros de conexión a bases de datos configurables dinámicamente (`MYSQL_HOST`, `MYSQL_PORT`, `DB_SYNCHRONIZE`).

---

## 5. Nota de la Solución Aplicada

1. Se creó `.env.example` completo con variables documentadas para MySQL, MongoDB GridFS, JWT, Firebase y puertos.
2. Se añadió `env` a `.gitignore` y se eliminó del rastreo de git (`git rm --cached env`).
3. Se eliminó la importación duplicada de `ConfigModule.forRoot()` en `src/app.module.ts`, consolidando una única instancia global con soporte para `.env` y fallback `env`.
4. Se parametrizó `MYSQL_HOST`, `MYSQL_PORT` y `DB_SYNCHRONIZE` dinámicamente mediante `ConfigService`.
5. Se actualizó `src/main.ts` para escuchar en `PORT` o `WEB_SERVER_PORT`.
6. Se verificó con `npm run build` y `npm test` (143/143 tests en verde).
