# Conciliación de inventario y entregas históricas

**Estado: implementado en Express, PostgreSQL y Vue.** El conteo forma parte del
Excel de inventario con una operación seleccionada para todo el archivo. El registro histórico se ejecuta por lotes desde Salidas.
El [procedimiento Vue](../../../../../front/docs/development/06-inventory-reconciliation.md)
y el [manual de Salidas](../../../../../front/docs/user-manual/12-issues.md) describen su uso.

## Efectos y orden de trabajo

| Necesidad | Operación y efecto |
| --- | --- |
| Identidad nueva | Alta; crea el artículo/oferta y su existencia inicial con historia. |
| Datos incorrectos | Editar; cambia nombre, mínimo, costo y activo, conservando stock e identidad. |
| Existencia desfasada | Ajustar; reemplaza el saldo por el conteo físico final comprobado y registra la diferencia. |
| Datos y existencia incorrectos | Completar Editar datos y descargar una plantilla actual para Ajustar existencias. Cada archivo confirma una operación. |
| Salida ya entregada que sigue pendiente o parcial | Registrar entrega histórica; reconoce sólo la cantidad faltante sin otro descuento. |

Contar físicamente las existencias actuales, evitar movimientos durante la captura,
conciliar ese saldo y después revisar los folios entregados antes del corte. Un
conteo no demuestra por sí mismo la entrega de una salida. No se necesitan compras
históricas para declarar hechos comprobados. Un conteo antiguo requiere conciliar
los movimientos posteriores antes de usarlo como saldo actual.

## Un archivo por operación y conteo

Un selector indica Alta (`create`), Editar datos (`update`) o Ajustar existencias
(`adjust`) para todo el archivo. La plantilla conserva las columnas/orden del
inventario de consulta y agrega las referencias técnicas y la captura necesaria.
El servidor comprueba formato, módulo y operación; no infiere operaciones por fila.
Para editar y contar se completan dos operaciones con una descarga actual entre ellas.

El conteo mantiene IDs y versiones originales, proveedor, saldo de referencia y
presentación. **Stock contado** empieza vacío: vacío se rechaza y cero es válido.
Motivo activo y observaciones son obligatorios. Las referencias no reemplazan datos
del servidor. Un mismo destino sólo ocupa una fila. Nombre y mínimo son comunes
entre proveedores. Alta captura **Cantidad inicial** y el servidor genera los IDs.
Los comprobantes mixtos anteriores conservan consulta y repetición exacta; un borrador
mixto anterior debe descartarse y recrearse con una operación.

La vista previa muestra anterior, final y diferencia. Un duplicado, permiso ausente,
captura inválida o versión vieja bloquea el archivo completo. Confirmar revalida el
borrador y protege versiones con bloqueos ordenados. Los datos compartidos se editan
una vez; stock, conversiones, AJU/AME, movimientos, folios y recibo se guardan en una
transacción. Repetir la clave devuelve el mismo resultado. Filas iguales no crean ajustes.

Lectura más ajuste autoriza conteo sin lectura de costos; alta/edición requieren
lectura, escritura y `inventory:costs-read`. El modo mixto verifica cada operación
antes de leer datos privados. No permite cambiar dimensiones ni presentación en edición.
Las altas usan los catálogos y reglas vigentes; merma necesita una referencia ya existente.

## Registro histórico por lote

Prefijo `/api/warehouse/historical-deliveries`, recursos `materials`, `consumables`,
`wastes`. `GET /:resource/preview` recibe corte ISO con zona horaria, búsqueda y página;
consulta hasta 100 folios pendientes/parciales anteriores al corte y devuelve su revisión.
`POST /:resource/confirm` recibe selección de IDs/revisiones originales, `operationId`,
corte, motivo, declaración de entrega física completa y fecha real opcional.
El servidor fija la fecha de registro; no deduce ni inventa una fecha de entrega.

`issues:reconcile` se concede al Administrador en Sistemas o Coordinador en Almacén,
conservando el alcance de área y tipo. El permiso de surtir no lo concede. El servidor
bloquea encabezados en orden de ID, igual que surtido/edición/devolución, y compara
la revisión completa de cada documento y sus partidas. Cancelados, ya conciliados,
sin pendientes o modificados devuelven conflicto sin aplicar parte del lote.

Por partida activa reconoce `quantity - suppliedQuantity`, conserva devoluciones,
cantidades ya surtidas, costos y datos de proyecto; no escribe `SupplierMaterial`,
`Waste` ni movimientos de inventario. El modelo `HistoricalDeliveryBatch` conserva
antes, cantidades reconocidas, actor, motivo, corte, fecha y recibo. La misma captura
con la misma clave se serializa y devuelve el recibo sin revalidar versiones consumidas.

Consulta y Excel de salidas identifican la procedencia histórica y valores sin verificar.
Los desconocidos permanecen desconocidos, sin usar costos actuales ni ceros calculados.
Una devolución posterior exige `physicalReturnConfirmed=true` y aplica sólo la entrada
física actual, mediante el flujo normal de devolución.

## Evidencia y recuperación

El navegador conserva el comando histórico por cuenta/recurso antes de enviarlo:
IDs, revisiones, clave y declaración, sin archivo ni costos. Una desconexión reintenta
exactamente esa captura. El recibo persistido es la evidencia autorizada del resultado.
No se habilita otra regularización mientras el resultado permanezca incierto.

Fuentes ejecutables: `inventoryImportControllerDbTest.js`, `historicalDeliveryControllerDbTest.js`,
`inventoryStockCountTest.js`, `historicalDeliveryTest.ts` y los recorridos Chromium de
importación y entregas históricas. Cubren saldo cero, Pieza fraccionaria, vacío,
repetidos, operación/archivo incompatibles, recuperación de comprobantes anteriores, versión vieja, fallo tardío, repetición y carreras con surtido.

Las constantes compartidas de regularización reúnen límites de documentos, búsqueda,
página, motivo, revisión y códigos de error. Se reutiliza el límite de observaciones
del formulario. `HistoricalDeliveryError` sigue el patrón de errores de dominio y
la detección de contención de Prisma/PostgreSQL es común con importaciones. Los
bloqueos SQL se mantienen en repositories y todas las escrituras reciben el mismo `tx`.
