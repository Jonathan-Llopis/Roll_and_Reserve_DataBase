# Issue 08: Modernización de Seguridad: JWT Guards de NestJS, Extracción de Usuario y Fix de CORS

- **Identificador**: `ISSUE-08`
- **GitHub Issue**: [#10](https://github.com/Jonathan-Llopis/Roll_and_Reserve_DataBase/issues/10)
- **Estado**: ✅ COMPLETADO
- **Prioridad**: 🔴 Crítica (Seguridad de Autenticación y Autorización)
- **Impacto**: Autenticación estándar stateless mediante JWT firmado, protección de endpoints mediante Guards y resolución de bloqueo de CORS.

---

## 1. Resumen del Por Qué

1. El sistema actual emplea UUIDs aleatorios persistidos en base de datos (`uuidv4()`). En lugar de utilizar los mecanismos idiomáticos de NestJS (`Passport`, `AuthGuard`), emplea un middleware Express `AuthorizationMiddleware`.
2. Si `ENABLE_TOKEN_VALIDATION=false` en el entorno, toda la autenticación queda desactivada por completo. Si se activa, bloquea rutas públicas como la documentación interactiva Swagger (`/api`).
3. El middleware no adjunta el usuario al objeto `request.user`. Por tanto, los controladores no pueden saber de forma segura y tipada qué usuario está ejecutando la llamada.
4. En `main.ts`, la configuración de CORS:
   ```typescript
   app.enableCors({
     origin: '*',
     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
     credentials: true,
   });
   ```
   viola la especificación W3C de CORS: los navegadores rechazan peticiones con credenciales cuando `Access-Control-Allow-Origin` es `*`.
5. En `CreateUserDto`, se exponen campos internos como `token`, `tokenExpiration` y `role`, permitiendo que un usuario malicioso envíe un rol privilegiado al registrarse.
6. En `FilesController.uploadAvatar`, `this.userService.vincularArchivo(...)` se invoca sin `await`, dejando promesas flotantes sin control de errores.

---

## 2. Solución Propuesta

1. Implementar autenticación JWT estándar con `@nestjs/jwt` y `@nestjs/passport`:
   - Generar JWTs firmados con claims: `{ sub: user.id_user, email: user.email, role: user.role }`.
   - Implementar `JwtStrategy` y `JwtAuthGuard`.
2. Crear decoradores personalizados:
   - `@Public()` para marcar endpoints exentos de autenticación (login, registro, swagger, archivos públicos).
   - `@CurrentUser()` para inyectar los datos del usuario autenticado directamente en los métodos de los controladores.
3. Ajustar la configuración de CORS para admitir orígenes válidos reflejados con `credentials: true`.
4. Sanitizar `CreateUserDto` eliminando `token` y forzando `role = 0` por defecto en registros públicos.
5. Añadir `await` en llamadas asíncronas de vinculación de archivos.

---

## 3. Pruebas y Verificación

- **Pruebas de Guardias y Estrategia**:
  - Petición a endpoint protegido sin token $\rightarrow$ `401 Unauthorized`.
  - Petición con token expirado o firma inválida $\rightarrow$ `401 Unauthorized`.
  - Petición con token válido $\rightarrow$ `200 OK` y `@CurrentUser()` populated.
  - Endpoint `@Public()` accesible sin token.

---

## 4. Criterios de Aceptación

- [x] Autenticación estándar JWT activa con clave secreta configurable.
- [x] Decoradores `@Public()` y `@CurrentUser()` operativos.
- [x] Configuración CORS corregida y compatible con estándares web.
- [x] Cero asignación insegura de roles en el registro público de usuarios.

---

## 5. Nota de la Solución

1. **Ecosistema JWT & Passport**:
   - Integradas dependencias `@nestjs/jwt@11.0.0`, `@nestjs/passport@11.0.5`, `passport-jwt` y `@types/passport-jwt`.
   - `AuthModule`: Configurado `JwtModule.registerAsync` con clave configurable `JWT_SECRET` y expiración `JWT_EXPIRES_IN` (por defecto 30 días).
   - `JwtStrategy`: Extrae token Bearer de cabeceras HTTP, valida firma y exp, y resuelve el `UserEntity` inyectándolo en `request.user`.
   - `JwtAuthGuard`: Guardia global basada en Reflector que respeta `@Public()`.
2. **Decoradores Idiomáticos**:
   - `@Public()`: Marca handlers y controllers exentos de validación de token.
   - `@CurrentUser()`: Extrae de forma tipada el usuario autenticado (o propiedad específica) de `request.user`.
3. **Servicios y Controladores**:
   - `AuthService`: `generateToken` firma tokens JWT con claims `{ sub: id_user, email, role }` mientras persiste compatibilidad retroactiva en `UserEntity.token`. `validateToken` verifica la firma criptográfica con fallback a base de datos.
   - `UsersController`: En `login`, envía claims completos `{ id_user, email, role }` al generar token.
   - `FilesController`: Añadido `await this.userService.vincularArchivo(...)` en bucle asíncrono para eliminar promesas flotantes.
4. **Seguridad y CORS**:
   - `main.ts`: Corregido CORS a `origin: true` con `credentials: true` para cumplir con los estándares W3C/Fetch y evitar bloqueos en navegadores y webviews.
   - `CreateUserDto`: Eliminados campos vulnerables `token`, `tokenExpiration` y `average_raiting`. El campo `role` es opcional y en `UsersService.createUser` se fuerza `role = 0`.
5. **Pruebas**:
   - Creados tests unitarios exhaustivos para `JwtStrategy` y `JwtAuthGuard`.
   - Añadida cobertura de firma y verificación JWT en `AuthService`.
   - 17 suites y 169 tests pasando en verde.

