# 9. Composición de altas contextuales: modelo y casos Vue

## Propósito y funcionamiento

Un formulario puede necesitar un proveedor, artículo o cliente que todavía no existe. Debe abrir su captura completa, conservar el origen y seleccionar sólo el resultado confirmado. Una etiqueta de combobox no representa por sí misma un registro persistido.

La colaboración combina contenedor/presentación, eventos/callbacks y adaptación de datos. `RemoteSelect` usa el `VAutocomplete` instalado; emite texto de búsqueda y no conoce entidades, API o páginas de otro módulo. Los Workspaces de `app/pages` componen módulos mediante contratos explícitos. Cada formulario conserva la responsabilidad de aceptar la nueva opción según modo, disponibilidad y estado.

## Modelo general

**Identificador:** `DIA-VUE-GEN-007`. **Pregunta:** ¿cómo coordinar una captura auxiliar conservando el propietario del formulario origen? **Alcance:** apertura, cancelación, confirmación y retorno. **Fuente:** composición aplicada por los Workspaces. **Notación:** secuencia UML de roles genéricos; las llamadas y retornos muestran cuándo se invoca el callback.

**Lectura visual:** [líneas de vida, llamadas y retornos](../../diagram-reading.md#secuencias).

```mermaid
sequenceDiagram
    autonumber
    actor User as Usuario
    participant Origin@{ "type": "control" } as Captura origen
    participant Coordinator@{ "type": "control" } as Composición
    participant Auxiliary@{ "type": "control" } as Captura auxiliar
    participant Operation@{ "type": "boundary" } as Servicio de alta
    Origin->>Coordinator: solicitarAlta(texto, onCreated)
    Coordinator->>Auxiliary: abrir(textoInicial)
    alt cancela la captura auxiliar
        User->>Auxiliary: cancelar
        Auxiliary-->>Coordinator: cierre sin resultado
    else confirma la captura auxiliar
        User->>Auxiliary: enviar captura
        Auxiliary->>Operation: guardar(valores)
        alt resultado confirmado
            Operation-->>Auxiliary: registro creado
            Auxiliary-->>Coordinator: registro confirmado
            opt origen vigente
                Coordinator->>Origin: onCreated(opción)
            end
        else error de alta
            Operation-->>Auxiliary: error
            Auxiliary-->>User: campos y mensaje para corregir
        end
    end
```

El [contrato de composición](../../../contracts/form-and-event-contracts.md#callbacks-de-composición)
define `LookupCreation`, `ItemCreation` y la adaptación a `LookupItem`.

## Caso 1: proveedor desde Inventario

**Identificador:** `DIA-VUE-APL-007`. **Pregunta:** ¿qué código conserva el artículo y aplica el proveedor nuevo? **Fuente:** `InventoryEditor`, `InventoryEditorPage`, `InventoryWorkspace`, `DirectoryCreationPage`, `DirectoryEditorPage`, `useInventoryEditor` y `useInventorySelection`. Flujo de composición del alta de Materiales/Consumibles; Mermas mantiene sólo consulta de proveedor.

```mermaid
flowchart TB
    form["InventoryEditor<br/>InventoryEditorPage"] -->|LookupCreation| workspace["InventoryWorkspace"]
    workspace -->|suppliers y request| auxiliary["DirectoryCreationPage<br/>DirectoryEditorPage"]
    auxiliary -->|guardar proveedor| service["useDirectoryEditor<br/>directoryService"]
    service -->|DirectoryEntry| auxiliary
    auxiliary -.->|onCreated: LookupItem| editor["useInventoryEditor<br/>selectCreatedSupplier"]
    editor -->|opción confirmada| selection["useInventorySelection"]
    editor -.->|actualizar supplierId| form
```

## Caso 2: proveedor o artículo desde Compras

### Proveedor desde el encabezado

**Identificador:** `DIA-VUE-APL-008`. **Pregunta:** ¿cómo vuelve el proveedor al encabezado sin acoplar Compras a las páginas privadas de Directorio? **Fuente:** `PurchaseEditorPage`, `PurchaseWorkspace`, `DirectoryCreationPage` y `usePurchaseEditor`. Flechas continuas = evento/composición; discontinuas = resultado confirmado y captura actualizada.

```mermaid
flowchart TB
    form["PurchaseEditorPage"] -->|LookupCreation| workspace["PurchaseWorkspace"]
    workspace -->|suppliers y request| auxiliary["DirectoryCreationPage"]
    auxiliary -.->|onCreated| editor["usePurchaseEditor<br/>selectCreatedSupplier"]
    editor -->|conservar opción| option["useSelectedOption"]
    editor -.->|supplierId| form
```

### Artículo desde un detalle

**Identificador:** `DIA-VUE-APL-010`. **Pregunta:** ¿qué código fija el contexto del artículo y devuelve el ID al detalle? **Fuente:** `PurchaseLineEntryPage`, `PurchaseWorkspace`, `InventoryEditorPage`, `useInventoryEditor`, `inventoryService` y `usePurchaseLineEntry`. Alcance: composición y retorno; la escritura interna del editor usa el servicio de Inventario.

```mermaid
flowchart TB
    form["PurchaseLineEntryPage"] -->|ItemCreation| workspace["PurchaseWorkspace"]
    workspace -->|proveedor y búsqueda| auxiliary["InventoryEditorPage<br/>contexto goodsReceipt"]
    auxiliary -->|saved: LookupItem| workspace
    workspace -.->|onCreated| line["usePurchaseLineEntry<br/>selectCreatedItem"]
    line -->|conservar opción| option["useSelectedOption"]
    line -.->|materialId| form
```

`PurchaseWorkspace` discrimina `kind=supplier` y `kind=item`; el segundo incluye
el proveedor fijado para el artículo.

## Caso 3: cliente desde Salidas

**Identificador:** `DIA-VUE-APL-009`. **Pregunta:** ¿cómo vuelve el cliente confirmado y qué componente resuelve sus dependencias? **Fuente:** `IssueEditor`, `IssueEditorPage`, `IssueWorkspace`, `DirectoryCreationPage`, `useIssueHeaderSelection` y `useSelectedOption`. Aplica a Materiales, Consumibles y Mermas; no ofrece crear asesor/solicitante desde esos selectores.

```mermaid
flowchart TB
    form["IssueEditor<br/>IssueEditorPage"] -->|createClient: LookupCreation| workspace["IssueWorkspace"]
    workspace -->|clients y request| auxiliary["DirectoryCreationPage<br/>DirectoryEditorPage"]
    auxiliary -->|guardar cliente| service["useDirectoryEditor<br/>directoryService"]
    service -->|DirectoryEntry| auxiliary
    auxiliary -.->|onCreated: LookupItem| selection["useIssueHeaderSelection<br/>selectCreatedClient"]
    selection -->|ID y etiqueta| option["useSelectedOption<br/>catálogo de clientes"]
    selection -.->|seleccionar cliente| editor["useIssueEditor<br/>captura del encabezado"]
    editor -.->|encabezado actualizado| form
```

## Condiciones y excepciones

| Caso o condición | Regla de aplicación |
| --- | --- |
| Proveedor desde Inventario | Sólo alta de Materiales/Consumibles, con lectura y alta de proveedor. No aplica a Merma, proveedor fijado, envío o captura pendiente ni instancia desmontada. El texto buscado precarga el nombre comercial; la razón social se captura aparte. |
| Proveedor desde Compras | Sólo compra nueva editable y con permisos de lectura/alta. La edición conserva el proveedor original. |
| Artículo desde Compras | Requiere lectura/escritura de artículos y lectura de Presentación/Unidad. Usa el proveedor de la compra y `creationContext=goodsReceipt`; no captura stock ni costo inicial. |
| Cliente desde Salidas | Requiere encabezado editable y permisos de lectura/alta de cliente. Cambiarlo actualiza sus selecciones dependientes de asesor y proyecto. No permite crear asesor o solicitante. |
| Registro creado como inactivo | El alta permanece guardada, pero el origen no selecciona ese registro para la operación. |
| Opción aún fuera de la página remota | `useSelectedOption` conserva su ID y etiqueta; no necesita esperar a encontrarla en una página del selector. |
| Guardado auxiliar confirmado | Selecciona el registro; no guarda el documento principal ni agrega su detalle automáticamente. |
| Origen cerrado o incompatible al regresar | El consumidor comprueba vigencia, modo y disponibilidad antes de aplicar el resultado. La captura principal conserva sus datos ante cancelación o fallo del auxiliar. |
| Nombre sin coincidencia visible | No acredita unicidad; la API valida la identidad y autoriza el alta. |

El [ciclo de vida](../../logical/states/04-state-ownership-and-save.md#ciclo-de-guardado)
explica el límite de abortar una escritura ya confirmada por la API.

## Pruebas relacionadas

- [Altas desde selectores](../../../../../tests/e2e/selectCreation.spec.ts).
- [Inventario](../../../../../tests/unit/modules/warehouse/inventoryFormTest.ts), [Compras](../../../../../tests/unit/modules/purchases/purchaseTest.ts) y [Salidas](../../../../../tests/unit/modules/issues/issueTest.ts).
- [Opción seleccionada](../../../../../tests/unit/shared/composables/selectedOptionTest.ts).
