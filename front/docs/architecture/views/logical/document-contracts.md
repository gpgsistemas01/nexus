# Contratos y relaciones de datos

Los diagramas representan interfaces TypeScript, con atributos seleccionados y
multiplicidades de sus colecciones. No describen tablas SQL ni clases instanciables.
Las asociaciones expresan referencias/colecciones; no se atribuye destrucción en cascada.
La serialización y validación de JSON corresponden a mappers/servicios.

**Identificador:** `DIA-VUE-DAT-001`. **Pregunta:** ¿Cómo se separan fila, documento, detalle y captura de compra?

**Fuente:** purchase.ts y purchaseRequestMapper.ts. **Notación y alcance:** UML de interfaces y asociaciones con multiplicidades; extends representa la extensión TypeScript real.

```mermaid
classDiagram
    class PurchaseRow {
        <<interface>>
        id: string
        supplierId: string
        status: string
        totalQuantity: Decimal
    }
    class PurchaseDocument {
        <<interface>>
        observations: string
    }
    class PurchaseDetail {
        <<interface>>
        id: string
        materialId: string
        quantity: Decimal
        costPerUnitType: Decimal
        status: ACTIVE_or_CANCELED
        isNew: boolean
    }
    class PurchaseValues {
        <<interface>>
        supplierId: string
        receivedById: string
        observations: string
    }
    PurchaseRow <|-- PurchaseDocument : extends
    PurchaseDocument "1" --> "0..*" PurchaseDetail : details recibidos
    PurchaseValues "1" --> "0..*" PurchaseDetail : details de captura
```

**Identificador:** `DIA-VUE-DAT-002`. **Pregunta:** ¿Qué datos de surtido y devolución pertenecen a un detalle de salida?

**Fuente:** issue.ts, issueRequestMapper.ts e issueRules.ts. **Notación y alcance:** UML de interfaces y asociaciones; no representa el estado autorizado de la API.

```mermaid
classDiagram
    class IssueRow {
        <<interface>>
        id: string
        clientId: string
        status: string
        fulfillmentStatus: string
    }
    class IssueDocument {
        <<interface>>
    }
    class IssueDetail {
        <<interface>>
        id: string
        itemId: string
        quantity: number
        suppliedQuantity: number
        returnedQuantity: number
        projectConvertedQuantity: string
        isOriginallySupplied: boolean
        isCanceled: boolean
    }
    class IssueValues {
        <<interface>>
        clientId: string
        observations: string
    }
    IssueRow <|-- IssueDocument : extends
    IssueDocument "1" --> "0..*" IssueDetail : details recibidos
    IssueValues "1" --> "0..*" IssueDetail : details de captura
```

`PurchaseTarget` discrimina create/edit/view; `IssueTarget` discrimina create/edit/header/supply/view/return. Esas uniones se explican mediante decisiones y secuencias, no como herencia de clases inexistente.
