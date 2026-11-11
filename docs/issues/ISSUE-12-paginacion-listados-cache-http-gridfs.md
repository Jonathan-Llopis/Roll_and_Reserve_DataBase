# Issue 12: Paginación Eficiente en Listados y Cabeceras HTTP Cache para Recursos GridFS

- **Identificador**: `ISSUE-12`
- **GitHub Issue**: [#14](https://github.com/Jonathan-Llopis/Roll_and_Reserve_DataBase/issues/14)
- **Prioridad**: 🟡 Media (Rendimiento, Optimización de Red y Escalabilidad)
- **Impacto**: Eliminación de cuellos de botella de memoria, reducción de consultas N+1 en clientes y soporte de caché HTTP eficiente para archivos multimedia.

---

## 1. Resumen del Por Qué

1. Los métodos `getAllShops()`, `getAllReserves()`, `getAllTables()` y `getAllFiles()` descargan colecciones íntegras de la base de datos sin paginación (`limit`, `offset` / `page`). Conforme crezca el catálogo de tiendas y reservas, esto provocará degradación severa en tiempos de respuesta y consumo excesivo de memoria en Node.js.
2. En `FilesController` (`/files/:id`, `/files/download/:id`), los archivos se sirven mediante streaming desde MongoDB GridFS sin configurar cabeceras de caché (`Cache-Control`, `ETag`).
3. Como se evidenció en la aplicación móvil `Roll_and_Reserve_App`, los logos y avatares se descargan continuamente en cada renderizado. Sin cabeceras de caché del lado del servidor, las aplicaciones móviles y navegadores no pueden almacenar en caché los recursos multimedia de forma eficiente.

---

## 2. Solución Propuesta

1. Implementar DTO universal de paginación `PaginationDto`:
   - `page`: Número de página (por defecto 1).
   - `limit`: Elementos por página (por defecto 10 o 20, máximo 100).
   - Devolver metadatos de paginación estructurados: `{ data: T[], total: number, page: number, lastPage: number }`.
2. Habilitar soporte de paginación en `ShopsService.getAllShops`, `ReservesService.getAllReserves` y `TablesService.getAllTables`.
3. En `FilesController`:
   - Configurar cabeceras de respuesta HTTP para contenido estático:
     ```typescript
     res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
     res.setHeader('ETag', file.md5 || id);
     ```
   - Si la petición incluye `If-None-Match` coincidente, devolver `304 Not Modified` de forma inmediata sin consultar el stream de GridFS.
4. Definir índices TypeORM en campos de consulta recurrente (`hour_start`, `id_table`, `id_shop`).

---

## 3. Pruebas y Verificación

- **Pruebas de Paginación**:
  - Solicitar `GET /shops?page=1&limit=2` $\rightarrow$ Verificar que se devuelvan exactamente 2 registros y los metadatos correspondientes (`total`, `page: 1`).
- **Pruebas de Caché HTTP**:
  - Solicitar `GET /files/:id` $\rightarrow$ Verificar presencia de cabeceras `Cache-Control` y `ETag`.
  - Enviar cabecera `If-None-Match` con el ETag devuelto $\rightarrow$ Verificar respuesta `304 Not Modified`.

---

## 4. Criterios de Aceptación

- [ ] Endpoints de listados principales soportan paginación estándar.
- [ ] Cabeceras de caché HTTP activas en la entrega de archivos de GridFS.
- [ ] Reducción drástica del ancho de banda y lecturas en MongoDB para imágenes ya cacheadas.
