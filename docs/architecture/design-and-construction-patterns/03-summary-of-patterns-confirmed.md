# 3. Resumen de patrones confirmados

| Nivel | Patrón o estrategia confirmada | Evidencia principal |
| --- | --- | --- |
| Arquitectura | Monolito modular organizado por dominio y capas | `src/routes`, `controllers`, `services`, `repository`, `views` y `public/js`, subdivididos en `admin`, `sales` y `warehouse` cuando aplica. |
| Transporte | Pipeline de middleware de Express | Rutas que componen autenticación, validadores, autorización y controller en un orden explícito. |
| Frontera | DTO funcional para normalizar entrada | Módulos bajo `src/dtos` que extraen y normalizan campos antes de llegar al servicio. |
| Autorización | Políticas declarativas como datos inmutables | `PERMISSIONS`, `AUTHORIZATION_POLICIES`, `createPolicy` y `getGrantedPermissions`. |
| Construcción | Factory functions configurables | `createCrudApplication`, `createIssueApplication` y `createDataTableListController`. |
| Composición | Extensión por composición de objetos | `createIssueApplication` incorpora el CRUD común y agrega encabezado, detalles y devolución sin herencia. |
| Persistencia | Propagación explícita del contexto transaccional | `getDb(tx)` selecciona la transacción recibida o el cliente Prisma compartido. |
| Consistencia | Límite transaccional para un caso de uso | Servicios que ejecutan documento, detalle, existencia y movimiento dentro de `$transaction`. |
| Integración | Publicación de eventos de actualización | `emitInventoryUpdated` traduce un contexto de inventario en eventos Socket.IO. |
| Auditoría | Audit Trail transversal posterior a la respuesta | `auditWrites`, `persistWriteAudit` y `CriticalWriteAudit` registran escrituras API exitosas y sanitizan campos sensibles. |
| Presentación | Composición de componentes y ownership por recurso | `src/views/shared`, `src/public/js/ui`, `plugins` y componentes que permanecen en la carpeta de su recurso. |
| Pruebas | Test harness configurable | `createControllerTestApp` registra sólo las rutas necesarias para probar controllers con Supertest. |

Las constantes compartidas forman parte de estas fronteras de construcción: modos de
formulario, estados, permisos y selectores se importan desde `src/constants` o
`src/public/js/constants`, según el entorno. Los consumidores no deben volver a
declarar sus valores literales; al ampliar un conjunto se actualiza su export y todos
los imports relacionados para conservar una única fuente de verdad.

Los selectores se agrupan por el tipo de elemento que identifican:
`FORM_SELECTORS`, `MODAL_SELECTORS`, `INPUT_SELECTORS`, `SELECT_SELECTORS`,
`BUTTON_SELECTORS` y `HEADING_SELECTORS`. Dentro de cada grupo, la clave nombra el
recurso o propósito (`GOODS_RECEIPT_CORRECTION`, `ADD_MATERIAL`, `MODAL_TITLE`) sin
repetir el tipo ya expresado por el nombre del grupo. Un selector usado en más de un
consumidor se incorpora al grupo correspondiente antes de agregar otro literal.

Los nombres de eventos reutilizados siguen la misma separación por integración:
`DOM_EVENT_NAMES` para eventos nativos, `SELECT2_EVENT_NAMES` para Select2 y
`MODAL_EVENT_NAMES` para los ciclos de vida de MDB o Bootstrap. Los listeners CRUD
importan estos nombres en lugar de repetir literales como `click`, `change` o `submit`;
un evento con namespace exclusivo de un módulo permanece local hasta que exista un
segundo consumidor real. Las utilidades compartidas que disparan eventos de plugins,
como `toggleDisabledElement` al sincronizar Select2, también importan la constante del
adaptador correspondiente para evitar dependencias implícitas del ámbito global.
