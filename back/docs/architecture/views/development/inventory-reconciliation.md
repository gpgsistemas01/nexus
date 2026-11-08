# Conciliación de inventario y entregas históricas

**Estado: implementado en Express, PostgreSQL y Vue.** El conteo forma parte del
archivo único de inventario. El registro histórico se ejecuta por lotes desde Salidas.
El [procedimiento Vue](../../../../../front/docs/development/06-inventory-reconciliation.md)
y el [manual de Salidas](../../../../../front/docs/user-manual/12-issues.md) describen su uso.

## Efectos y orden de trabajo

| Necesidad | Operación y efecto |
| --- | --- |
| Identidad nueva | Alta; crea el artículo/oferta y su existencia inicial con historia. |
| Datos incorrectos | Editar; cambia nombre, mínimo, costo y activo, conservando stock e identidad. |
| Existencia desfasada | Ajustar; reemplaza el saldo por el conteo físico final comprobado y registra la diferencia. |
| Datos y existencia incorrectos | Editar y ajustar en una sola fila y transacción. |
| Salida ya entregada que sigue pendiente o parcial | Registrar entrega histórica; reconoce sólo la cantidad faltante sin otro descuento. |

Contar físicamente las existencias actuales, evitar movimientos durante la captura,
conciliar ese saldo y después revisar los folios entregados antes del corte. Un
conteo no demuestra por sí mismo la entrega de una salida. No se necesitan compras
históricas para declarar hechos comprobados. Un conteo antiguo requiere conciliar
los movimientos posteriores antes de usarlo como saldo actual.

## Archivo único y conteo

`mode=mixed` admite Alta, Editar, Ajustar, Editar y ajustar y Conservar en la columna
`operacion`. Un archivo por inventario puede mezclar esas filas; no son cargas separadas.
Las filas existentes se descargan como Conservar para exigir una decisión explícita.
`stock_contado_o_inicial` es existencia inicial en Alta y saldo final en los ajustes;
Editar lo deja vacío. Los contratos `create`, `update` y `adjust` conservan recuperación
para consumidores y borradores anteriores.

El conteo mantiene IDs y versiones originales, proveedor, saldo de referencia y
presentación. Stock contado empieza vacío: vacío se rechaza y cero es válido.
Motivo activo y observaciones son obligatorios. Las columnas de referencia no
reemplazan datos del servidor. Un mismo destino sólo ocupa una fila; para datos y
stock se usa Editar y ajustar. Nombre y mínimo son comunes entre proveedores.

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
repetidos, archivo mixto, versión vieja, fallo tardío, repetición y carreras con surtido.
