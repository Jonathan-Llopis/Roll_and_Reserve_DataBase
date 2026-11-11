# Issue 06: Corrección Crítica de Identidad de Usuario: `id_user` vs `id_google` en Toda la Aplicación

- **Identificador**: `ISSUE-06`
- **GitHub Issue**: [#8](https://github.com/Jonathan-Llopis/Roll_and_Reserve_DataBase/issues/8)
- **Prioridad**: 🔴 Crítica (Bug de Integridad de Datos y Fallo Funcional General)
- **Impacto**: Corrección de fallos generalizados para todos los usuarios registrados mediante email/contraseña.

---

## 1. Resumen del Por Qué

Existe un fallo de diseño crítico en cómo se identifica al usuario a lo largo de todo el backend:
1. En `UserEntity`, la clave primaria es `id_user` (entero autoincremental), mientras que `id_google` es un campo opcional/nullable (`nullable: true`).
2. Sin embargo, múltiples servicios y controladores filtran a los usuarios exclusivamente por `id_google`:
   - `UsersService.updateUser`: `where: { id_google: id_user }`
   - `UsersService.vincularArchivo`: `where: { id_google: id_user }`
   - `UsersService.updateNotificationToken`: `where: { id_google: id_user }`
   - `UsersService.validateUserPassword`: `where: { id_google: id_user }`
   - `UsersService.updateUserPassword`: `where: { id_google: id_user }`
   - `UsersService.updateAverageRating`: `where: { id_google: id_user }`
   - `UsersReservesService.addUsertoReserve`: `where: { id_google: userId }`
   - `UsersReservesService.findReserveFromUser`: `where: { user: { id_google: userId } }`
   - `UsersReservesService.findReservesFromUser`: `where: { id_google: userId }`
   - `UsersReservesService.deleteReserveFromUser`: `where: { user: { id_google: userId } }`
   - `ShopsService.getAllShopsByOwner`: `where: { owner: { id_google: idOwner } }`
   - `ShopsService.createShop`: `where: { id_google: createShopDto.owner_id }`
   - `FilesController.uploadAvatar`: `where: { id_google: idUser }`
   - `UsersController.login`: `generateToken(user.id_google)` envía `null` si el usuario no tiene cuenta de Google vinculada.
3. **Consecuencia**: Todo usuario estándar registrado con email y contraseña sufre un error `404 Not Found` en casi cualquier acción de perfil, avatar, reserva o creación de tienda.

---

## 2. Solución Propuesta

1. Estandarizar la identificación primaria en base al identificador `id_user` (numérico).
2. Modificar los métodos para recibir y consultar por `id_user`. En caso de que se reciba un string, implementar una resolución inteligente: si es un número entero válido, buscar por `id_user`; si no, buscar por `id_google`.
3. En `UsersController.login`: generar el token pasando el identificador `user.id_user`.
4. En `UserEntity` y `AuthService`: asociar el token de sesión a `id_user`.
5. Asegurar compatibilidad hacia atrás para que tanto las peticiones con identificadores numéricos como con IDs de Google sigan funcionando.

---

## 3. Pruebas y Verificación

- **Pruebas Unitarias e Integración**:
  - Registrar un usuario nativo sin Google ID (`id_google = null`).
  - Iniciar sesión y verificar que el token se asocie y valide correctamente.
  - Actualizar su perfil, contraseña y avatar mediante su `id_user`.
  - Unir a dicho usuario a una reserva y verificar que `findReservesFromUser` devuelva sus reservas sin lanzar excepción 404.

---

## 4. Criterios de Aceptación

- [ ] Usuarios nativos pueden iniciar sesión, actualizar datos y subir avatares sin errores.
- [ ] Usuarios nativos pueden crear tiendas y unirse a reservas.
- [ ] Compatibilidad preservada para usuarios autenticados mediante Google Sign-In.
