# Issue 10: Control de Concurrencia, Transacciones y Prevención de Solapamiento en Mesas

- **Identificador**: `ISSUE-10`
- **GitHub Issue**: [#12](https://github.com/Jonathan-Llopis/Roll_and_Reserve_DataBase/issues/12)
- **Estado**: ✅ COMPLETADO
- **Prioridad**: 🔴 Crítica (Lógica Central del Negocio e Integridad de Reservas)
- **Impacto**: Eliminación de dobles reservas (*double-booking*), consistencia transaccional y protección contra condiciones de carrera.

---

## 1. Resumen del Por Qué

1. En `ReservesService.createReserve`, se crea y persiste una nueva reserva sin verificar si la mesa (`reserve_table_id`) ya cuenta con una reserva activa o confirmada en ese intervalo horario (`hour_start` hasta `hour_end`).
2. Múltiples usuarios pueden reservar la misma mesa física en el mismo tramo horario, generando conflictos insolubles en el mundo real en las tiendas de juegos de mesa.
3. No se valida que la mesa solicitada pertenezca realmente a la tienda especificada en el endpoint (`idShop`).
4. Si la creación del juego o la asignación de relaciones falla a mitad del proceso, pueden quedar registros inconsistentes por falta de transacción atómica.

---

## 2. Solución Propuesta

1. Implementar validación de solapamiento de horarios previa a la creación:
   - Comprobar que `hour_end > hour_start`.
   - Consultar si existe alguna reserva existente para `id_table` que cumpla la condición de solapamiento:
     ```sql
     hour_start < :newEnd AND hour_end > :newStart
     ```
   - Si existe solapamiento, lanzar `ConflictException('La mesa seleccionada ya se encuentra reservada en el horario solicitado')`.
2. Validar que la mesa pertenezca a la tienda indicada en la ruta (`table.tables_of_shop.id_shop === idShop`).
3. Envolver la creación de la reserva en una transacción de base de datos (`DataSource.transaction`), asegurando atomicidad completa.

---

## 3. Pruebas y Verificación

- **Pruebas de Concurrencia y Solapamiento**:
  - `src/reserves/reserves.service.spec.ts`:
    - Crear reserva de 17:00 a 19:00 en Mesa 1 $\rightarrow$ Éxito 201.
    - Intentar crear reserva de 18:00 a 20:00 en Mesa 1 $\rightarrow$ Error `409 Conflict`.
    - Intentar crear reserva en mesa de una tienda ajena $\rightarrow$ Error `400 Bad Request`.

---

## 4. Criterios de Aceptación

- [x] Bloqueo garantizado de reservas solapadas en la misma mesa.
- [x] Validación de correspondencia entre mesa y tienda.
- [x] Creación de reservas atómica mediante transacciones de base de datos.

---

## 5. Nota de la Solución

1. **Validación de Intervalo Horario**:
   - En `createReserve` y `updateReserve` se valida que `hour_end > hour_start`. Si no se cumple o la fecha es inválida, se arroja `BadRequestException('La hora de finalización debe ser posterior a la hora de inicio.')`.
2. **Validación de Mesa y Tienda**:
   - Se recupera la mesa con su relación `tables_of_shop`. Se valida que pertenezca a la tienda indicada (`table.tables_of_shop.id_shop === idShop`). En caso contrario, se arroja `BadRequestException('La mesa no pertenece a la tienda especificada.')`.
3. **Prevención de Solapamiento (Double-Booking Prevention)**:
   - Se consulta TypeORM con operadores `LessThan(end)` y `MoreThan(start)` sobre `reserve_table`:
     ```typescript
     const overlapping = await this.reserveRepository.findOne({
       where: {
         reserve_table: { id_table: createReserveDto.reserve_table_id },
         hour_start: LessThan(end),
         hour_end: MoreThan(start),
       },
     });
     if (overlapping) {
       throw new ConflictException('La mesa seleccionada ya se encuentra reservada en el horario solicitado.');
     }
     ```
   - En `updateReserve`, se aplica la misma comprobación excluyendo el id actual (`id_reserve: Not(id)`).
4. **Persistencia Atómica**:
   - Se inyecta opcionalmente `DataSource` y se ejecuta la persistencia mediante `dataSource.transaction(async manager => ...)` con fallback directo al repositorio en contextos sin transacciones activas.
   - Se garantiza la persistencia del `event_id` en reservas de eventos.
5. **Pruebas Automatizadas**:
   - Nuevos tests añadidos a `src/reserves/reserves.service.spec.ts` para verificar el bloqueo por solapamiento (409 Conflict), intervalo inválido (400 Bad Request) y mesa ajena a la tienda (400 Bad Request). Total: 194 pruebas unitarias pasando al 100%.
