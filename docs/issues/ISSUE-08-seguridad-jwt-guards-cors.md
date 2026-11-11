# Issue 08: Modernización de Seguridad: JWT Guards de NestJS, Extracción de Usuario y Fix de CORS

- **Identificador**: `ISSUE-08`
- **GitHub Issue**: [#10](https://github.com/Jonathan-Llopis/Roll_and_Reserve_DataBase/issues/10)
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

- [ ] Autenticación estándar JWT activa con clave secreta configurable.
- [ ] Decoradores `@Public()` y `@CurrentUser()` operativos.
- [ ] Configuración CORS corregida y compatible con estándares web.
- [ ] Cero asignación insegura de roles en el registro público de usuarios.
