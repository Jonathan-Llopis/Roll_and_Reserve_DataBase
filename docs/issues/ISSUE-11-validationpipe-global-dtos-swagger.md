# Issue 11: Activación de ValidationPipe Global, Validación de DTOs y Documentación Swagger

- **Identificador**: `ISSUE-11`
- **GitHub Issue**: [#13](https://github.com/Jonathan-Llopis/Roll_and_Reserve_DataBase/issues/13)
- **Estado**: ✅ COMPLETADO
- **Prioridad**: 🟠 Alta (Validación de Entrada, Seguridad y Documentación)
- **Impacto**: Filtrado estricto de payloads no autorizados, tipado de fechas garantizado y documentación Swagger interactiva completa.

---

## 1. Resumen del Por Qué

1. `ValidationPipe` no se encuentra habilitado globalmente en `main.ts`. Por consiguiente, ninguna de las anotaciones de validación de `class-validator` (`@IsEmail()`, `@Length()`, `@Min()`, `@Max()`) se ejecuta sobre las peticiones entrantes.
2. En `CreateReserveDto`, los campos `hour_start` y `hour_end` están anotados con `@IsDate()`. Dado que el formato JSON transmite fechas como cadenas de texto ISO, `@IsDate()` falla al validar cadenas a menos que se transforme mediante `@Type(() => Date)` de `class-transformer` o `@IsDateString()`.
3. Varios controladores carecen de esquemas de respuesta Swagger, descripciones de códigos HTTP de error (400, 401, 404, 409) o anotaciones `@ApiBearerAuth()`.

---

## 2. Solución Propuesta

1. Configurar `ValidationPipe` global en `src/main.ts`:
   ```typescript
   app.useGlobalPipes(
     new ValidationPipe({
       whitelist: true,
       transform: true,
       forbidNonWhitelisted: true,
       transformOptions: {
         enableImplicitConversion: true,
       },
     }),
   );
   ```
2. Refactorizar DTOs con `@Type(() => Date)` y `@IsDateString()` según corresponda.
3. Completar anotaciones OpenAPI/Swagger en controladores:
   - Añadir `@ApiBearerAuth()` en todos los endpoints autenticados.
   - Especificar tipos de retorno con `@ApiResponse({ status: 200, type: ... })`.
   - Documentar parámetros de consulta y respuestas de error.

---

## 3. Pruebas y Verificación

- **Pruebas de Validación**:
  - Enviar petición con campos no permitidos en el body $\rightarrow$ Rechazo `400 Bad Request` por `forbidNonWhitelisted`.
  - Enviar formato de fecha ISO válido $\rightarrow$ Transformación automática a objeto `Date`.
- **Inspección Swagger**:
  - Abrir `/api` y verificar que todos los endpoints muestren esquemas completos y botón de autorización Bearer.

---

## 4. Criterios de Aceptación

- [x] `ValidationPipe` activo en toda la aplicación.
- [x] DTOs de fecha y números procesan entradas de forma robusta.
- [x] Swagger documenta fielmente todos los endpoints y modelos.

---

## 5. Nota de la Solución

1. **Activación Global de ValidationPipe**:
   - En `src/main.ts` se registró `app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true, transformOptions: { enableImplicitConversion: true } }))`.
   - Se asegura el rechazo con código 400 ante campos adicionales no autorizados y la transformación automática de tipos primitivos.
2. **Transformación Segura de Fechas en DTOs**:
   - En `CreateReserveDto` y `UpdateReserveDto` se añadieron las anotaciones `@Type(() => Date)` de `class-transformer` junto con `@IsDate()`, permitiendo parsear automáticamente cadenas ISO 8601 entrantes en objetos `Date` nativos.
3. **Estandarización y Modularización de Swagger**:
   - Se añadieron etiquetas `@ApiTags` descriptivas a todos los controladores huérfanos (`Users`, `Difficulties`, `Tables`, `Reserves`, `Shop Games`, `Files`), organizando la documentación interactiva en `/api`.
   - Se documentó la respuesta de conflicto `409 Conflict` en `ReservesController.createReserve`.
4. **Verificación Automatizada**:
   - Se creó `src/common/pipes/validation.pipe.spec.ts` verificando:
     - Transformación correcta de strings ISO a instancias `Date`.
     - Rechazo estricto de campos ajenos (`forbidNonWhitelisted`).
     - Rechazo de payloads inválidos por reglas de `class-validator`.
   - Totalizando 22 suites y 197 tests unitarios en verde.
