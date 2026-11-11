# Issue 05: Desacoplamiento de Lógica de Negocio y Cron de AppModule

- **Identificador**: `ISSUE-05`
- **GitHub Issue**: [#7](https://github.com/Jonathan-Llopis/Roll_and_Reserve_DataBase/issues/7)
- **Prioridad**: 🟡 Media (Separación de Responsabilidades y Arquitectura NestJS)
- **Impacto**: Modularidad, testabilidad de tareas programadas y eliminación de malas prácticas de inyección.

---

## 1. Resumen del Por Qué

1. `AppModule` contiene una tarea programada `@Cron('0 */15 8-23 * * *')` con lógica de negocio directa:
   - Inyecta `Repository<ReservesEntity>` y `FcmNotificationService`.
   - Realiza consultas a la base de datos para buscar reservas entre 90 y 105 minutos en el futuro.
   - Filtra tokens FCM de usuarios.
   - Contiene URLs hardcodeadas con IP fija externa (`http://rollandreserve.blog:8000/files/...`).
2. En el array `providers` de `AppModule` se ha colocado `FcmNotificationModule` (un módulo en lugar de un proveedor), lo cual es un antipatrón en la arquitectura de NestJS.
3. Esta mezcla impide testear la lógica del cron de forma aislada y sobrecarga el módulo raíz de la aplicación.

---

## 2. Solución Propuesta

1. Crear un servicio dedicado `ReservesSchedulerService` (o `TasksService`) dentro de `src/reserves/` o un módulo `src/scheduler/`:
   - Encapsular la lógica de detección de reservas próximas y despacho de notificaciones.
   - Obtener la URL base dinámicamente mediante `ConfigService`.
   - Añadir manejo de errores robusto con `Logger`.
2. Limpiar `AppModule`:
   - Eliminar el cron y la inyección de repositorios de `AppModule`.
   - Retirar `FcmNotificationModule` del array de `providers`.
3. Registrar el scheduler en `ReservesModule` asegurando que `ScheduleModule.forRoot()` permanezca en la raíz.

---

## 3. Pruebas y Verificación

- **Pruebas Unitarias**:
  - `src/reserves/reserves-scheduler.service.spec.ts`: Simular `reserveRepository.find` retornando reservas próximas y verificar que `fcmNotificationService.sendMulticastNotification` se invoque con los tokens y parámetros correctos.

---

## 4. Criterios de Aceptación

- [ ] `AppModule` no contiene métodos `@Cron` ni inyecciones de repositorios.
- [ ] No existen módulos declarados en el array de `providers`.
- [ ] La tarea programada de recordatorio de reservas está completamente aislada y testeada.
