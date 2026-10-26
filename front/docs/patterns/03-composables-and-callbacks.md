# 3. Composables y operaciones por callback

## Problema y decisión

Los listados comparten carga, error, cancelación y paginación, pero consultan
recursos distintos. Un composable concentra el comportamiento reactivo común
y recibe la operación variable como función. Es composición y estrategia
funcional; no se declaran clases Strategy ni se comparte el estado de todas las
pantallas en una única instancia.

## Modelo general de composición por callback

**Identificador:** `DIA-VUE-GEN-002`. **Pregunta:** ¿cómo varía la operación sin
acoplar el núcleo al dominio? **Fuente:** contratos de `usePagedList`,
`useRemoteLookup` y `useRecordSave`. Flechas continuas = configuración/consumo;
discontinuas = invocación configurada o resultado observable.

```mermaid
flowchart TB
    consumer["Consumidor del dominio"] -->|configura| core["Composable compartido<br/>estado por instancia"]
    consumer -->|aporta| operation["Operación concreta<br/>consulta o guardado"]
    core -.->|invoca callback con signal| operation
    core -.->|estado y métodos| consumer
    core --> cleanup["Ciclo de vida<br/>cancelar e invalidar"]
```

## Dependencias y composición de un listado

**Identificador:** `DIA-VUE-PAT-001`. **Pregunta:** ¿cómo reutilizar el listado sin
acoplar presentación y HTTP? **Fuente:** `CatalogPage`, `useCatalogList`,
`usePagedList`, `catalogService`, `RecordListPanel` y `CatalogTable`. Flechas
continuas = composición/llamada; discontinuas = datos, eventos o callbacks.

```mermaid
flowchart TB
    page["CatalogPage<br/>acceso y coordinación"] --> list["useCatalogList<br/>recurso y política de error"]
    page --> panel["RecordListPanel / CatalogTable<br/>presentación"]
    panel -.->|eventos de usuario| page
    list --> core["usePagedList<br/>carga, cancelación y estado"]
    list -.->|callback request| service["catalogService.list<br/>parámetros y DTO de respuesta"]
    core -.->|invoca callback configurado| service
    service --> http["requestPage / apiClient<br/>Axios y errores"]
    http --> api["Express API"]
    core -.->|filas y estado| page
```

## Código, contrato y límites

[useCatalogList](../../src/modules/catalogs/composables/useCatalogList.ts)
configura `request(query, signal)` y traduce rechazos 401/403 mediante `onDenied`.
[usePagedList](../../src/shared/composables/usePagedList.ts) conserva la consulta,
las filas y el error, aborta la solicitud anterior e invalida respuestas antiguas
con una secuencia; al desmontar cancela el trabajo. No importa `catalogService`.

[useDocumentRead](../../src/shared/composables/useDocumentRead.ts) y
[useRecordSave](../../src/shared/composables/useRecordSave.ts) aplican el mismo
criterio a contratos distintos. No se fusionan sólo porque todos tengan una
promesa. Cancelar en el navegador no revierte una escritura ya confirmada.

El callback debe conservar resultados, errores y `AbortSignal`; una firma válida
de TypeScript no demuestra sustitución de comportamiento.
[catalogListTest](../../tests/unit/modules/catalogs/catalogListTest.ts) y
[remoteLookupTest](../../tests/unit/shared/composables/remoteLookupTest.ts)
comprueban estado, paginación y respuestas tardías según sus contratos.
Referencia: [composables de Vue](https://vuejs.org/guide/reusability/composables.html).

## Coordinación de la alternativa de merma duplicada

[useWasteDuplicateRecovery](../../src/modules/warehouse/composables/useWasteDuplicateRecovery.ts)
decide si puede ofrecer la transición: permiso, rechazo definitivo, identidad
recibida y confirmación. [mapWasteStockAddition](../../src/modules/warehouse/mappers/wasteStockAdditionMapper.ts)
adapta el contexto reducido del error a `StockAdditionTarget`; no fabrica la versión
que necesitarían Editar o Ajustar. `useInventoryEditor` conserva validación, captura
e idempotencia; la página propietaria sustituye el editor mediante el evento tipado
`addStock`. La presentación no navega ni escribe por su cuenta.

**Identificador:** `DIA-VUE-PAT-002`. **Pregunta:** ¿cómo realiza Vue `CU-ALM-10` A2
sin acoplar dos modales ni escribir al aceptar el aviso? **Fuente:** `useInventoryEditor`,
`useWasteDuplicateRecovery`, `InventoryEditorPage`, `InventoryPage` y `useInventory`.
Secuencia del camino de confirmación; los participantes representan roles de
interacción y módulos funcionales, no clases. Cancelar conserva el alta;
un desmontaje impide la transición tardía.

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario autorizado
    participant E as Alta y entrada<br/>useInventory<br/>Editor
    participant A as Express API
    participant R as useWaste<br/>Duplicate<br/>Recovery
    participant P as Contenedor<br/>InventoryPage
    U->>E: Guardar alta
    E->>A: POST de alta con operationId
    A-->>E: 409, rechazo definitivo y merma existente
    E->>R: recover(error, captura)
    R->>U: Ofrecer Abrir Agregar stock
    U-->>R: Confirmar
    R->>P: callback y evento addStock(target)
    P->>E: Abrir entrada con la captura
    Note over P,A: Abrir el editor no registra entrada
    U->>E: Revisar y Guardar
    E->>A: POST stock-additions
```

Se aplican los patrones ya adoptados: contenedor/presentación, composición por
callback y adaptador de datos. La transición es un flujo local con una unión
discriminada de TypeScript; no constituye State de GoF ni requiere un almacén global.
Las pruebas de [recuperación](../../tests/unit/modules/warehouse/wasteDuplicateRecoveryTest.ts)
y [navegador](../../tests/e2e/warehouse.spec.ts) protegen cancelación, cero/positivo,
permiso, incertidumbre y confirmación separada de la escritura.

## Altas contextuales mediante eventos y callbacks

**Identificador:** `DIA-VUE-PAT-003`. **Pregunta:** ¿cómo abre un selector el
formulario de otro módulo sin consultar su API ni perder la captura de origen?
**Fuente:** `RemoteSelect`, `LookupCreation`, `InventoryWorkspace`, `PurchaseWorkspace`,
`IssueWorkspace`, `DirectoryCreationPage` e `InventoryEditorPage`.
Flujo de composición del cliente: las flechas representan eventos/callbacks y
responsabilidades; no son relaciones de clases ni una transacción de base de datos.

```mermaid
flowchart TB
    select["RemoteSelect<br/>VAutocomplete"] -->|create con búsqueda| origin["Formulario origen<br/>LookupCreation"]
    origin -->|solicitud tipada| workspace["Workspace<br/>composición"]
    workspace --> directory["DirectoryCreationPage<br/>Proveedor / Cliente"]
    workspace --> inventory["InventoryEditorPage<br/>Artículo"]
    directory --> save["Editor y servicio<br/>guardar en API"]
    inventory --> save
    save -->|registro confirmado| callback["onCreated<br/>ID del servidor"]
    callback -->|seleccionar y renovar catálogo| origin
```

Se reutiliza contenedor/presentación y composición por callbacks. `RemoteSelect`
no importa módulos de negocio; cada Workspace importa los contenedores necesarios.
No se implementa un bus de eventos global ni un store para estas capturas locales.
Cancelar no invoca `onCreated`; los formularios vivos admiten sólo la selección
compatible con su modo y disponibilidad. El alta desde Compras conserva el proveedor
fijado y su contrato de artículo sin existencia inicial capturada.

La [comparación de bibliotecas y correspondencia EJS](../architecture/03-ui-and-http.md#alta-contextual-desde-un-selector)
justifica extender el control Vuetify instalado. Las pruebas de
[navegador](../../tests/e2e/selectCreation.spec.ts) y
[captura de inventario](../../tests/unit/modules/warehouse/inventoryFormTest.ts)
comprueban los efectos observables, no las llamadas privadas entre componentes.
