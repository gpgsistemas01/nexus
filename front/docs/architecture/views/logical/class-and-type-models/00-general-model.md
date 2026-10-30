# Vista general de los modelos de datos

## Maestros y acceso

**Identificador:** `DIA-VUE-DAT-015`. **Pregunta:** ¿cómo se relacionan los modelos
de sesión, catálogos, directorio e identidad? **Fuentes:** `session.ts`, `catalog.ts`,
`directory.ts` e `identity.ts`, enlazados en el [índice de modelos](index.md).
**Notación:** clases UML aplicadas a interfaces
y aliases TypeScript, sin atributos en esta vista general.

Las líneas continuas representan propiedades tipadas; las discontinuas,
dependencias de aliases o proyecciones. El triángulo apunta a la interfaz extendida.
Los capítulos de cada módulo detallan campos, variantes y contratos de escritura.

```mermaid
classDiagram
    direction LR
    class AuthSession {
        <<type>>
    }
    class SessionUser {
        <<interface>>
    }
    class CatalogValues {
        <<interface>>
    }
    class CatalogEntry {
        <<interface>>
    }
    class DirectoryValues {
        <<interface>>
    }
    class DirectoryEntry {
        <<interface>>
    }
    class IdentityEntry {
        <<interface>>
    }
    class PersonAccess {
        <<interface>>
    }
    class PersonValues {
        <<interface>>
    }
    class UserValues {
        <<interface>>
    }
    AuthSession "1" --> "0..1" SessionUser : user.value
    CatalogValues <|-- CatalogEntry
    DirectoryValues <|-- DirectoryEntry
    IdentityEntry "1" --> "0..*" PersonAccess : accesses
    PersonValues "1" --> "0..*" PersonAccess : accesses
```

## Inventario, documentos y captura

**Identificador:** `DIA-VUE-DAT-018`. **Pregunta:** ¿cómo se relacionan las filas,
documentos y capturas de las operaciones de almacén? **Fuentes:** `inventory.ts`,
`movement.ts`, `purchase.ts` e `issue.ts`, enlazados en el [índice de modelos](index.md).
**Notación:** la misma del mapa de maestros; una unión de tipos no implica herencia.

```mermaid
classDiagram
    direction LR
    class InventoryRow {
        <<interface>>
    }
    class InventoryValues {
        <<interface>>
    }
    class EditorTarget {
        <<type>>
    }
    class StockAdditionTarget {
        <<interface>>
    }
    class MovementRow {
        <<interface>>
    }
    class PurchaseRow {
        <<interface>>
    }
    class PurchaseDocument {
        <<interface>>
    }
    class PurchaseDetail {
        <<interface>>
    }
    class PurchaseValues {
        <<interface>>
    }
    class IssueRow {
        <<interface>>
    }
    class IssueDocument {
        <<interface>>
    }
    class IssueDetail {
        <<interface>>
    }
    class IssueValues {
        <<interface>>
    }
    EditorTarget ..> InventoryRow : row de otras acciones
    EditorTarget ..> StockAdditionTarget : variante add-stock
    StockAdditionTarget ..> InventoryRow : row parcial
    PurchaseRow <|-- PurchaseDocument
    PurchaseDocument "1" --> "0..*" PurchaseDetail : details
    PurchaseValues "1" --> "0..*" PurchaseDetail : details
    IssueRow <|-- IssueDocument
    IssueDocument "1" --> "0..*" IssueDetail : details
    IssueValues "1" --> "0..*" IssueDetail : details
```

Los modelos se relacionan según sus propiedades: `supplierId`, `clientId`,
`departmentId`, `roleId` e IDs de artículo son strings. No contienen instancias de
`DirectoryEntry`, `CatalogEntry` o `InventoryRow`. Los mappers construyen las
proyecciones que necesita cada módulo.

## Conexiones entre módulos mediante selectores

**Identificador:** `DIA-VUE-DAT-019`. **Pregunta:** ¿qué tipos enlazan Compras,
Salidas e Identidad con los selectores compartidos? **Fuentes:**
[lookup.ts](../../../../../src/shared/lookup.ts),
[purchase.ts](../../../../../src/modules/purchases/purchase.ts) e
[issue.ts](../../../../../src/modules/issues/issue.ts).
**Notación:** asociaciones por propiedad, generalización y dependencia del callback.

```mermaid
classDiagram
    direction TB
    class LookupState {
        <<interface>>
    }
    class LookupItem {
        <<interface>>
        id: string
        title: string
        data: Record~string, unknown~
        isDisabled?: boolean
    }
    class LookupCreation {
        <<interface>>
    }
    class ItemCreation {
        <<interface>>
    }
    class OrganizationState {
        <<type>>
    }
    class IssueHeaderSelect {
        <<interface>>
    }
    class IssueFilterSelect {
        <<interface>>
    }
    LookupState "1" --> "0..*" LookupItem : items
    LookupCreation ..> LookupItem : onCreated(item)
    LookupCreation <|-- ItemCreation
    ItemCreation "1" --> "1" LookupItem : supplier
    OrganizationState "1" --> "2" LookupState : departments y roles
    IssueHeaderSelect "1" --> "1" LookupState : state
    IssueHeaderSelect "1" --> "0..1" LookupItem : initialOption
    IssueFilterSelect "1" --> "1" LookupState : state
```

## Conexiones compartidas y detalle

| Conexión | Modelo que la desarrolla |
| --- | --- |
| Página de resultados y opciones de selección | [Transporte y selectores](02-shared-contracts.md#páginas-y-opciones-remotas). |
| Base de las solicitudes a selectores de cuatro módulos | [Consultas tipadas](02-shared-contracts.md#consultas-tipadas-de-selectores). |
| Tabla, filtros de Compras/Salidas/Movimientos e Identidad | [Consultas reutilizadas](06-movements-and-queries.md#contratos-de-consulta-reutilizados). |
| Opciones de Área/Rol y selección del encabezado de Salidas | [Identidad](04-identity.md#opciones-de-área-y-rol) y [Salidas](08-issues.md#contratos-visuales-de-selección). |
| Datos, claves y setters de formularios | [Genéricos y reactividad](09-reactive-contracts.md). |
| Props y eventos de componentes | [Contratos de formularios](../../../contracts/form-and-event-contracts.md). |

La [referencia TypeScript](../type-reference/index.md) conserva todas las
declaraciones. Esta vista reúne los modelos principales; los contratos visuales,
consultas y tipos auxiliares se consultan por responsabilidad.
