# Catálogo de Mejoras e Issues: Roll_and_Reserve_DataBase

Este directorio contiene el registro y la especificación detallada de cada mejora identificada para el backend **Roll_and_Reserve_DataBase**, categorizadas según el plan de trabajo en tres fases jerárquicas: **Estructura y Arquitectura**, **Corrección de Errores (Bug Fix)** y **Funcionalidad y Eficiencia**.

---

## 🏗️ Fase 1: Estructura y Arquitectura

| ID | Issue en GitHub | PR (Pull Request) | Prioridad | Impacto | Estado |
| :--- | :--- | :---: | :---: | :--- | :---: |
| [`ISSUE-01`](./ISSUE-01-infraestructura-tests.md) | [#3 Testing: Establish automated unit and integration test infrastructure in test/](https://github.com/Jonathan-Llopis/Roll_and_Reserve_DataBase/issues/3) | [#15](https://github.com/Jonathan-Llopis/Roll_and_Reserve_DataBase/pull/15) | 🔴 Crítica | Calidad de código, arnés de pruebas y cobertura | ✅ COMPLETADO |
| [`ISSUE-02`](./ISSUE-02-normalizacion-directorios-nombres.md) | [#4 Refactor: Normalize directory structure, fix typos, and organize config files](https://github.com/Jonathan-Llopis/Roll_and_Reserve_DataBase/issues/4) | [#16](https://github.com/Jonathan-Llopis/Roll_and_Reserve_DataBase/pull/16) | 🟠 Alta | Convenciones de carpetas, nombres y modularidad | ✅ COMPLETADO |
| [`ISSUE-03`](./ISSUE-03-configuracion-global-validacion-entorno.md) | [#5 Config: Centralize configuration management and strict environment validation](https://github.com/Jonathan-Llopis/Roll_and_Reserve_DataBase/issues/5) | [#17](https://github.com/Jonathan-Llopis/Roll_and_Reserve_DataBase/pull/17) | 🔴 Crítica | Seguridad de secretos, .env y portabilidad local/Docker | ✅ COMPLETADO |
| [`ISSUE-04`](./ISSUE-04-filtro-global-excepciones-controladores.md) | [#6 Refactor: Implement global HttpExceptionFilter and eliminate controller try/catch boilerplate](https://github.com/Jonathan-Llopis/Roll_and_Reserve_DataBase/issues/6) | [#18](https://github.com/Jonathan-Llopis/Roll_and_Reserve_DataBase/pull/18) | 🟠 Alta | Manejo unificado de errores y eliminación de boilerplate | ✅ COMPLETADO |
| [`ISSUE-05`](./ISSUE-05-desacoplamiento-cron-appmodule.md) | [#7 Architecture: Decouple cron job and business logic from AppModule into dedicated scheduler](https://github.com/Jonathan-Llopis/Roll_and_Reserve_DataBase/issues/7) | [#19](https://github.com/Jonathan-Llopis/Roll_and_Reserve_DataBase/pull/19) | 🟡 Media | Separación de responsabilidades y testabilidad de cron | ✅ COMPLETADO |

---

## 🐛 Fase 2: Corrección de Errores (Bug Fix) y Seguridad

| ID | Issue en GitHub | PR (Pull Request) | Prioridad | Impacto | Estado |
| :--- | :--- | :---: | :---: | :--- | :---: |
| [`ISSUE-06`](./ISSUE-06-correccion-identidad-usuario-id-user.md) | [#8 Bugfix: Fix critical user identity resolution (id_user vs id_google) across Auth, Users, and Reserves](https://github.com/Jonathan-Llopis/Roll_and_Reserve_DataBase/issues/8) | [#20](https://github.com/Jonathan-Llopis/Roll_and_Reserve_DataBase/pull/20) | 🔴 Crítica | Desbloqueo funcional para usuarios nativos email/password | ✅ COMPLETADO |
| [`ISSUE-07`](./ISSUE-07-correccion-relaciones-typeorm-erratas.md) | [#9 Bugfix: Correct TypeORM entity relations (Games-Reserves) and column typos](https://github.com/Jonathan-Llopis/Roll_and_Reserve_DataBase/issues/9) | [#21](https://github.com/Jonathan-Llopis/Roll_and_Reserve_DataBase/pull/21) | 🔴 Crítica | Consistencia relacional TypeORM y éxito de compilación | ✅ COMPLETADO |
| [`ISSUE-08`](./ISSUE-08-seguridad-jwt-guards-cors.md) | [#10 Security: Implement standard Passport JWT strategy, AuthGuards, and fix CORS](https://github.com/Jonathan-Llopis/Roll_and_Reserve_DataBase/issues/10) | [#23](https://github.com/Jonathan-Llopis/Roll_and_Reserve_DataBase/pull/23) | 🔴 Crítica | Autenticación JWT stateless, @CurrentUser y CORS | ✅ COMPLETADO |
| [`ISSUE-09`](./ISSUE-09-resiliencia-firebase-admin-crashes.md) | [#11 Bugfix: Add resilience to Firebase Admin SDK to prevent startup crashes in dev/test](https://github.com/Jonathan-Llopis/Roll_and_Reserve_DataBase/issues/11) | [#24](https://github.com/Jonathan-Llopis/Roll_and_Reserve_DataBase/pull/24) | 🟠 Alta | Prevención de caídas del servidor sin credenciales Firebase | ✅ COMPLETADO |

---

## ⚡ Fase 3: Funcionalidad y Eficiencia

| ID | Issue en GitHub | PR (Pull Request) | Prioridad | Impacto | Estado |
| :--- | :--- | :---: | :---: | :--- | :---: |
| [`ISSUE-10`](./ISSUE-10-concurrencia-prevencion-doble-reserva.md) | [#12 Feature: Implement table reservation concurrency control and prevent overlapping bookings](https://github.com/Jonathan-Llopis/Roll_and_Reserve_DataBase/issues/12) | [#25](https://github.com/Jonathan-Llopis/Roll_and_Reserve_DataBase/pull/25) | 🔴 Crítica | Prevención de dobles reservas y transacciones atómicas | ✅ COMPLETADO |
| [`ISSUE-11`](./ISSUE-11-validationpipe-global-dtos-swagger.md) | [#13 Feature: Enable global ValidationPipe, date DTO transforms, and complete Swagger schemas](https://github.com/Jonathan-Llopis/Roll_and_Reserve_DataBase/issues/13) | [#26](https://github.com/Jonathan-Llopis/Roll_and_Reserve_DataBase/pull/26) | 🟠 Alta | Validación de DTOs activa y Swagger interactivo completo | ✅ COMPLETADO |
| [`ISSUE-12`](./ISSUE-12-paginacion-listados-cache-http-gridfs.md) | [#14 Performance: Add pagination to list endpoints and HTTP caching headers to GridFS file streams](https://github.com/Jonathan-Llopis/Roll_and_Reserve_DataBase/issues/14) | [#27](https://github.com/Jonathan-Llopis/Roll_and_Reserve_DataBase/pull/27) | 🟡 Media | Paginación en listas y soporte HTTP Cache-Control/ETag | ✅ COMPLETADO |
