# 1. Responsabilidades y contratos transversales del backend

Este capítulo reúne contratos que atraviesan varios módulos: arranque, acceso,
validación, auditoría, consultas operativas, inventario y referencias. Los contratos
particulares viven con el mapa de cada recurso; el [índice de módulos](index.md#módulos)
es su única entrada de navegación.

### Arranque, transporte web y middleware

| Capacidad | Entrada, adaptación y salida | Colaboradores, efectos y persistencia | Mapa de código propietario |
| --- | --- | --- | --- |
| Arranque Express | `src/app.js` crea `app` y `server`, configura EJS, cuerpo, estáticos, rutas, 404 y error final. `registerWebRoutes` y `registerApiRoutes` montan sus registros. | Logging, auditoría y Socket.IO rodean el transporte; el manejador final traduce `AppError` y registra fallos desconocidos. | [Código compartido](03-shared-code-and-coverage.md) |
| Validación y errores | Validadores de formularios escriben errores de `express-validator`; `validate` corta la cadena antes del controlador. | `serviceErrorHandler.js` y clases de `src/errors` conservan errores de dominio; no abren transacciones. | [Código compartido](03-shared-code-and-coverage.md) |
| Auditoría | `auditService.js` identifica escrituras y persiste la evidencia producida por middleware. | Usa los datos de solicitud/respuesta definidos por el middleware y Prisma fuera del servicio funcional. | [Código compartido](03-shared-code-and-coverage.md) |
| Páginas web | Los controladores bajo `controllers/web` resuelven inicio/login y las páginas de personas, usuarios, clientes, proveedores, materiales, consumibles, mermas, entradas, salidas y movimientos. | Preparan `res.render`, metadatos y permisos para EJS; no ejecutan CRUD de dominio. | [Código compartido](03-shared-code-and-coverage.md) |

### Contratos de colaboradores compartidos

| Capacidad y módulos propietarios | Entrada y retorno | Reglas, errores y persistencia | Mapa de código propietario |
| --- | --- | --- | --- |
| Catálogos: `departmentController/Service`, `roleController/Service`, `presentationController/Service`, `reasonController/Service`, `unitMeasureController/Service`, `fulfillmentStatusController/Service` | `GET` sin cuerpo; la fábrica `createDataTableListController` adapta paginación cuando corresponde y devuelve colecciones JSON. | Lecturas Prisma; búsquedas por id/nombre son colaboradores de otros servicios y propagan ausencia según su contrato. | [Código compartido](03-shared-code-and-coverage.md) |
| Inventario compartido: `inventory/movementService.js`, `movementHelpers.js`, `stockHelpers.js`, `materialIdentity.js` | Recibe referencia, tipo, detalles y `tx`; devuelve movimiento/resumen o valida cantidades. | `applyInventoryMovement` actualiza existencias y crea movimiento; helpers convierten cantidades y rechazan insuficiencia. Participa en la transacción llamadora. | [Código compartido](03-shared-code-and-coverage.md) |
| Numeración documental: `document/referenceNumberService.js` | Año/ámbito y cliente opcional producen o validan una referencia. | Comprueba duplicados e incrementa contadores usando el `tx` recibido cuando forma parte de creación documental. | [Código compartido](03-shared-code-and-coverage.md) |

El [mapa generado de servicios](../code-map.md#símbolos-exportados-por-servicios)
completa, símbolo por símbolo, las constantes y helpers de cada módulo de la tabla. Una
nueva exportación debe pertenecer a una de estas fichas o crear una capacidad nueva; no
puede quedar documentada sólo como “otro ejemplo”.

Los mapas propietarios muestran imports y grupos de archivos. La ejecución de operaciones
se consulta en [procesos](../../processes/index.md); esta referencia conserva sólo
contratos de código y nombres de propiedades necesarios para revisar implementación.
