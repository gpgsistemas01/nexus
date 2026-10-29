# 2. Inventario de materiales, consumibles y mermas

## Propósito y fuentes

Referencia de responsabilidades y contratos del dominio `warehouse`. El [corte de componentes](../../logical/components/02-inventory.md) muestra sus colaboradores; las secuencias siguientes explican el proceso y sus decisiones. Los objetivos están en el [catálogo de casos](../../../../requirements/use-cases/index.md).

## Responsabilidades

| Propietario | Responsabilidad |
| --- | --- |
| `InventoryWorkspace` | Componer inventario y alta auxiliar de proveedor. |
| `InventoryPage` / `useInventory` | Permisos, consulta, editor, baja y reporte. |
| `useInventoryList` | Query, recarga visible y filtro de proveedor. |
| `useInventoryEditor` | Captura, esquema, envío, conflicto y operación pendiente. |
| `useInventorySelection` | Catálogos/plantillas y limpieza dependiente; no guarda ni abre modales. |
| `formModel` / mappers | Valores iniciales, reglas, vista previa y payload por modo. |
| Servicios de inventario/catálogos | Transporte, normalización e identidad de cada operación. |
| `pendingWasteOperation` / recuperación | Cuerpo/clave inciertos y transición de duplicado definitivo a entrada. |

## Datos y operaciones

| Modo | Datos y protección |
| --- | --- |
| Alta de material/consumible | Proveedor, identidad, presentación/unidad, mínimos/costo/estado y stock inicial admitido. Consumibles no envía medidas. |
| Merma | Plantilla material-proveedor; medidas/pesos según presentación, cantidad inicial y observaciones. Rollo usa referencia completa, sobrante y cono para vista previa. |
| Edición | Metadatos permitidos y versión original; no reescribe identidad/stock o pesos históricos protegidos. |
| Ajuste | Nueva existencia absoluta, motivo, observaciones y versión original. |
| Agregar stock | Cantidad positiva/observaciones; merma conserva operationId y cuerpo para reintento. |
| Baja | Usa ID de relación proveedor-artículo, no confundirlo con entityId. Confirmar no equivale a eliminar antes de recibir respuesta. |
| Alta desde compra | Contexto goodsReceipt, proveedor fijado y sin stock inicial; devuelve opción confirmada. |
| Tabla | Encabezados/columnas por recurso, permiso de costo/estado y filas de stock bajo. |

La [matriz de captura, eventos y recuperación](08-form-and-event-contracts.md) precisa los campos editables y los resultados de interacción.

## Diagramas del proceso

| Pregunta | Secuencia aplicada |
| --- | --- |
| Selección y guardado por modo | [Selección y guardado por modo](../../processes/05-warehouse/01-inventory-selection-write.md) |
| Operación incierta y recuperación | [Operación incierta y recuperación](../../processes/05-warehouse/02-waste-pending.md) |
| Duplicado y apertura de entrada | [Duplicado y apertura de entrada](../../processes/05-warehouse/03-waste-duplicate.md) |
| Baja confirmada de relación | [Baja confirmada de relación](../../processes/05-warehouse/04-inventory-removal.md) |
| Recarga visible | [Recarga visible](../../processes/02-shared-runtime/04-visible-refresh.md) |

## Evidencia

inventoryFormTest.ts, wasteDuplicateRecoveryTest.ts, inventoryListTest.ts, warehouse.spec.ts y selectCreation.spec.ts. La [matriz por CU](../../../../testing/04-use-case-coverage.md) precisa condiciones y límites; la API simulada no acredita stock, autorización o transacciones reales.
