# Conciliación de inventario y entregas históricas

**Estado: propuesta técnica; los flujos masivos descritos aquí aún no están implementados.**
El escenario contempla salidas antiguas pendientes en el sistema que se entregaron
físicamente por la totalidad registrada, sin compras históricas disponibles para reconstruirlas.
La [propuesta Vue](../../../../../front/docs/development/06-inventory-reconciliation-proposal.md)
describe la captura; este documento fija efectos y controles del servidor.

## Decisión

| Necesidad | Operación |
| --- | --- |
| Crear una identidad o relación nueva | Mantener el alta actual, con su existencia inicial e historia. |
| Corregir nombre, mínimo, costo o disponibilidad | Mantener Actualizar datos, sin reemplazar existencias. |
| Actualizar un inventario desfasado | Ajustar al conteo físico comprobado. El Excel representa el saldo final. |
| Resolver documentos ya entregados que siguen pendientes | Reconocer la entrega histórica y cerrar sus pendientes sin descontar otra vez el inventario actual. |

El ajuste individual ya existe. `createStockAdjustment` genera AJU y
`registerWasteStockAdjustment` genera AME, con saldo anterior/final, diferencia,
motivo y actor. No exigen reconstruir una compra.
El surtido normal de materiales/consumibles llama a `applyInventoryMovement`
y el de merma a `applyWasteMovement`; ambos descuentan stock.

## Secuencia de conciliación

1. Fijar una fecha de corte y obtener un conteo físico de los artículos/proveedores.
2. Conciliar el saldo mediante ajustes con motivo y observaciones. Hasta disponer
   del flujo masivo, la interfaz permite Ajustar stock individualmente.
3. Revisar por folio las salidas entregadas antes del corte y preparar su cierre histórico.
4. Reconocer únicamente sus pendientes registrados. Conservar cantidades y movimientos
   ya documentados y dejar evidencia de la declaración de entrega total.
5. Continuar con surtidos normales para entregas nuevas posteriores al corte.

Ajustar un saldo no demuestra por sí solo que se entregó una solicitud.

## Excel de conteo propuesto

Agregar `mode=adjust` al flujo de importación existente, conservando sus límites,
vista previa, confirmación atómica y recuperación. Actualmente sólo admite `create`
y `update`; se requiere una migración nueva para ampliar la restricción de modo.

La plantilla incluye IDs/versiones, artículo/proveedor, presentación/unidad,
saldo de referencia y **stock contado**. Este último empieza vacío: un vacío produce
error y cero representa un conteo real de cero. Motivo y observaciones son obligatorios.
El servidor obtiene y bloquea el saldo vigente; el saldo exportado es informativo.

La vista previa muestra anterior, contado y diferencia. Repetidos o errores bloquean
todo el lote; una fila sin diferencia se omite. Confirmar valida las versiones
originales y guarda stock, conversiones, ajustes, movimientos, folios y recibo en
una transacción. Reutilizar cálculos y servicios de ajustes con escrituras agrupadas.

La capacidad requiere lectura y permiso de ajuste del recurso. No modifica costo
máximo, identidad ni dimensiones. El costo se configura desde Almacén por su flujo actual.
Los artículos inexistentes se registran antes del conteo por el flujo de altas;
ese flujo conserva su rechazo de duplicados y no se transforma en ajuste implícito.

## Cierre histórico propuesto

Agregar una operación explícita por documento para Materiales, Consumibles y Mermas.
La solicitud identifica el documento, conserva una revisión de su estado leído e
incluye `operationId`, fecha de corte, motivo y declaración de entrega total.
La fecha real de entrega sólo se registra si se conoce; la fecha de regularización
la fija el servidor.

La transacción bloquea encabezado y partidas y compara el estado leído. Por partida
reconoce `quantity - suppliedQuantity`; conserva cantidades ya surtidas y devueltas
y aplica las reglas de estado vigentes. El resultado reconoce la entrega completa
con una marca visible **Regularizada por entrega histórica** y un registro de
antes/después, actor, motivo, corte y fecha de registro.

La operación no escribe `SupplierMaterial`, `Waste` ni movimientos de inventario.
No crea compras ni ajustes compensatorios. Conserva costos, cantidades de proyecto
y diferencias de merma; los valores históricos no verificables se identifican como
tales en consulta y reportes, sin reemplazarlos por datos actuales.

El registro histórico y su recibo deben ser persistentes e idempotentes. Otra clave
sobre un documento ya conciliado no vuelve a reconocer cantidades. Cancelados y
documentos sin pendiente se rechazan. Una carrera con surtido, devolución o edición
produce conflicto sin efectos parciales; usar el mismo orden de bloqueos en esas operaciones.

Se propone una capacidad específica para Sistemas y Coordinación de Almacén,
separada del permiso de surtir. Mantener el alcance de área/documento. Las devoluciones
posteriores necesitan tratamiento explícito para registrar sólo el retorno físico actual.

## Contratos por desarrollar

Estas ampliaciones no están registradas ni forman parte del OpenAPI vigente:

| Operación propuesta | Contrato |
| --- | --- |
| Plantilla/vista previa de inventario con `mode=adjust` | Reutilizar las rutas de importación y un DTO de conteo; identificar filas por ID/versiones. |
| `POST /api/warehouse/goods-issues/:context/:id/historical-delivery` | `context` sólo `materials` o `consumables`; revisión de estado, clave estable y declaración/motivo/corte. |
| `POST /api/warehouse/waste-issues/:id/historical-delivery` | Mismo contrato de conciliación, con pertenencia y estados de merma. |

## Verificación antes de habilitar

Probar conteo cero/positivo/Pieza fraccionaria, vacío, repetido, versión vieja,
rollback y repetición. Para el cierre: pendiente total, parcial ya registrado,
cancelado, costos desconocidos y concurrencia con surtido/devolución. Comprobar en
PostgreSQL que sólo cambian documento, evidencia y recibo; stock y movimientos
permanecen idénticos. Verificar autorización, procedencia en reportes, recuperación
tras perder la respuesta y ausencia de escrituras independientes por fila.
