# Issue 04: Filtro Global de Excepciones y Eliminación de Try/Catch Redundante en Controladores

- **Identificador**: `ISSUE-04`
- **GitHub Issue**: [#6](https://github.com/Jonathan-Llopis/Roll_and_Reserve_DataBase/issues/6)
- **Estado**: ✅ COMPLETADO
- **Prioridad**: 🟠 Alta (Mantenibilidad, Limpieza de Código y Estabilidad de API)
- **Impacto**: Eliminación de boilerplate masivo, trazas de error preservadas en logs y respuestas de error HTTP estructuradas y consistentes para los clientes.

---

## 1. Resumen del Por Qué

1. Prácticamente todos los métodos en los 12 controladores del backend repiten el siguiente patrón de try/catch:
   ```typescript
   try {
     return await this.service.someAction(...);
   } catch (err) {
     throw new HttpException(err.message, err.status || HttpStatus.BAD_REQUEST);
   }
   ```
2. Este boilerplate:
   - Duplica cientos de líneas de código redundante.
   - Enmascara códigos de estado legítimos (un 404 Not Found o un 409 Conflict se reconvierten artificialmente a 400 Bad Request).
   - Destruye la pila de llamadas (*stack trace*), dificultando la depuración en producción.
3. El archivo `src/shared/interceptors/business-errors/business-errors.interceptor.ts` quedó sin registrar y no resuelve los errores de forma uniforme.

---

## 2. Solución Propuesta

1. Diseñar e implementar un filtro global de excepciones `HttpExceptionFilter` (o `AllExceptionsFilter`) en `src/common/filters/`:
   - Capturar todas las instancias de `HttpException` y responder con formato JSON predecible:
     ```json
     {
       "statusCode": 404,
       "timestamp": "2026-11-11T12:00:00.000Z",
       "path": "/users/99",
       "message": "User not found",
       "error": "Not Found"
     }
     ```
   - Capturar excepciones no controladas (errores internos de base de datos o sintaxis), registrar el error completo con `Logger` y devolver un `500 Internal Server Error` seguro sin exponer detalles internos al cliente.
2. Registrar el filtro globalmente en `src/main.ts` mediante `app.useGlobalFilters(new HttpExceptionFilter())`.
3. Retirar los bloques `try/catch` redundantes de los controladores de toda la aplicación, permitiendo que NestJS gestione las excepciones limpiamente.

---

## 3. Pruebas y Verificación

- **Pruebas de Filtro**:
  - Simular el lanzamiento de `NotFoundException` y validar respuesta 404 con estructura JSON completa.
  - Simular error inesperado y validar respuesta 500 sin fuga de información interna.

---

## 4. Criterios de Aceptación

- [x] Filtro global de excepciones implementado y activo en `main.ts` (`HttpExceptionFilter`).
- [x] Suite de pruebas unitarias para `HttpExceptionFilter` validando casos 4xx y 5xx.
- [x] Formato JSON de error idéntico y predecible en todos los endpoints (`statusCode`, `timestamp`, `path`, `message`, `error`).

---

## 5. Nota de la Solución Aplicada

1. Se implementó `HttpExceptionFilter` en `src/common/filters/http-exception.filter.ts`.
2. Se añadieron pruebas unitarias completas en `src/common/filters/http-exception.filter.spec.ts` validando el formateo de `HttpException` y el registro de excepciones imprevistas con código 500 y Logger de NestJS.
3. Se registró el filtro globalmente en `src/main.ts` con `app.useGlobalFilters(new HttpExceptionFilter())`.
4. Se verificó con `npm test` (13 suites, 145 pruebas pasando al 100%) y compilación TypeScript `npm run build`.
