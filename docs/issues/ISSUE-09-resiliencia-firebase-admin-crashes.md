# Issue 09: Resiliencia de Firebase Admin SDK y Prevención de Fallos en Arranque

- **Identificador**: `ISSUE-09`
- **GitHub Issue**: [#11](https://github.com/Jonathan-Llopis/Roll_and_Reserve_DataBase/issues/11)
- **Estado**: ✅ COMPLETADO
- **Prioridad**: 🟠 Alta (Resiliencia Operativa y Entorno de Desarrollo)
- **Impacto**: Prevención de caídas fatales de la aplicación en ausencia de variables de Firebase y desacoplamiento de servicios externos en tests.

---

## 1. Resumen del Por Qué

1. En `FcmNotificationService`, el constructor ejecuta:
   ```typescript
   admin.initializeApp({
     credential: admin.credential.cert({
       projectId: process.env.PROJECT_ID_FIREBASE,
       clientEmail: process.env.CLIENT_EMAIL_FIREBASE,
       privateKey: process.env.PRIVATE_KEY_FIREBASE.replace(/\\n/g, '\n'),
     }),
   });
   ```
2. Si `PRIVATE_KEY_FIREBASE` no está definida en las variables de entorno (como ocurre en entornos locales de desarrollo o pipelines de CI), la llamada a `.replace(...)` lanza de forma inmediata una excepción fatal `TypeError: Cannot read properties of undefined (reading 'replace')` que aborta el arranque del servidor.
3. Además, si el servicio o módulo se instancia más de una vez (habitual durante la ejecución de tests con `Test.createTestingModule`), Firebase arroja el error `FirebaseApp "default" already exists`.

---

## 2. Solución Propuesta

1. Implementar comprobación de existencia y validez de las variables antes de inicializar Firebase:
   - Verificar si `admin.apps.length === 0`.
   - Comprobar que `projectId`, `clientEmail` y `privateKey` estén presentes.
2. Si no se encuentran credenciales válidas:
   - Emitir una advertencia mediante `Logger.warn('Firebase Admin SDK no configurado; las notificaciones push estarán deshabilitadas')`.
   - Activar un modo no operativo (noop / mock silencioso) que permita continuar la ejecución del backend y las pruebas sin caídas.
3. Permitir la inyección de una configuración mockeable para pruebas unitarias.

---

## 3. Pruebas y Verificación

- **Pruebas Unitarias**:
  - `src/fcm-notification/fcm-notification.service.spec.ts`:
    - Arrancar el servicio sin variables de Firebase $\rightarrow$ la aplicación no se detiene ni lanza excepciones.
    - Llamar a `sendMulticastNotification` sin Firebase configurado $\rightarrow$ se registra el log y no produce error.

---

## 4. Criterios de Aceptación

- [x] Cero fallos al arrancar el backend sin variables de Firebase.
- [x] Múltiples instancias en tests no lanzan el error de aplicación duplicada.
- [x] Mensaje informativo claro en el logger sobre el estado del servicio FCM.

---

## 5. Nota de la Solución

1. **Inicialización Condicional y Resiliente**:
   - `FcmNotificationService`: Valida la presencia de `PROJECT_ID_FIREBASE`, `CLIENT_EMAIL_FIREBASE` y `PRIVATE_KEY_FIREBASE`. Si falta cualquiera de ellos, activa el modo no-op (`isInitialized = false`) y emite una advertencia estructurada mediante NestJS `Logger`.
   - Verifica `admin.apps.length === 0` antes de invocar `admin.initializeApp`, previniendo errores de colisión por apps duplicadas durante la ejecución concurrente o repetida de tests.
2. **Envío Protector y No-Op**:
   - `sendMulticastNotification` y `sendTopicNotification` verifican el estado `initialized` antes de invocar el cliente de mensajería, omitiendo silenciosamente llamadas en entornos sin credenciales y capturando errores inesperados sin propagar caídas a los controladores de negocio.
3. **Pruebas Unitarias**:
   - Creada suite `src/fcm-notification/fcm-notification.service.spec.ts` verificando el comportamiento en modo no-op, inicialización con credenciales válidas y envío seguro de notificaciones multicast y por tópico.
   - 21/21 suites y 191/191 pruebas pasando en verde.

