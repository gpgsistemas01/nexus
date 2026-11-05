# Movimientos, consultas y reportes

**Identificador:** `DIA-VUE-DAT-010`. **Pregunta:** ¿Cómo se combina la consulta
de tabla con filtros operativos sin confundir historial y estado actual? **Fuentes:**
[movement.ts](../../../../../src/modules/movements/movement.ts),
[list.ts](../../../../../src/shared/list.ts),
[report.ts](../../../../../src/shared/report.ts).
**Notación:** interfaces, alias de intersección y dependencias. No hay `extends` en `MovementQuery`.

**Lectura visual:** [cajas, flechas y multiplicidades](../../diagram-reading.md#clases-y-dominio).

```mermaid
classDiagram
    direction TB
    class RecordQuery {
        <<interface>>
        page: number
        length: number
        search: string
        orderColumn: number
        direction: asc | desc
    }
    class MovementFilters {
        <<interface>>
        startDate: string
        endDate: string
        movementType: MovementType
        supplierId: string
        itemId: string
    }
    class MovementQuery {
        <<type>>
    }
    class MovementRow {
        <<interface>>
        id: string
        date: string
        type: string
        referenceNumber: string
        materialName: string
        supplierName: string
        previousStock: string | number | null
        quantity: string | number | null
        newStock: string | number | null
    }
    MovementQuery ..> RecordQuery : intersección
    note for MovementQuery "MovementFilters & RecordQuery"
    MovementQuery ..> MovementFilters : intersección
```

`MovementType` admite vacío para Todos y ENTRY/ISSUE/ADJUSTMENT/RETURN.
`MovementRow` también incluye dimensiones `materialBase`/`materialHeight`. Sus saldos
describen el efecto histórico; no se usan para sustituir el stock actual del editor.
`MovementResource` mantiene materiales, consumibles y mermas como consultas separadas.

La forma TypeScript admite cantidades numéricas serializadas y campos nulos; el
normalizador aplica una condición más estricta a la respuesta: `quantity` debe existir,
mientras que los saldos anterior/nuevo pueden ser nulos. Una referencia ausente se
presenta como «—». El tipo estático no elimina estas comprobaciones de ejecución.

## Contratos de consulta reutilizados

| Dominio | Declaración y filtros adicionales |
| --- | --- |
| Compras | `PurchaseQuery = RecordQuery & PurchaseFilters`: fechas, proveedor y persona receptora. |
| Salidas | `IssueQuery = RecordQuery & IssueFilters`: fechas, cliente, área, persona, estado de cumplimiento y búsqueda en observaciones. |
| Identidad | `IdentityQuery extends RecordQuery`: área y rol. Aquí sí existe extensión declarada. |
| Inventario | `InventoryQuery` declara sus campos propios: búsqueda, proveedor, página, longitud, dirección y columna opcional. No hereda de `RecordQuery`. |

`ReportScope` define `mode: filtered | current-month | specific-month` y `month: string`.
Los servicios validan el alcance, exigen mes válido en `specific-month` y omiten
paginación. La [secuencia](../../processes/08-movements-and-reports/02-reports.md) detalla
archivo y errores; la [cobertura](../../../../testing/04-use-case-coverage.md), sus
límites de prueba.
