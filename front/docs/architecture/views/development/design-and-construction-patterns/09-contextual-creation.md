# 9. Composición de altas contextuales: modelo y casos Vue

## Propósito y funcionamiento

El formulario conserva su captura mientras otro modal crea un proveedor,
artículo o cliente. El Workspace compone los módulos y devuelve el registro
confirmado mediante un callback. `RemoteSelect` emite la búsqueda; el formulario
de origen decide si puede seleccionar el resultado.

## Modelo general

**Identificador:** `DIA-VUE-GEN-007`. **Pregunta:** ¿cómo coordinar una captura auxiliar conservando el propietario del formulario origen? **Alcance:** apertura, cancelación, confirmación y retorno. **Fuente:** composición aplicada por los Workspaces. Secuencia de roles; la composición incluye el adaptador que recibe el resultado del auxiliar.

**Lectura visual:** [líneas de vida, llamadas y retornos](../../diagram-reading.md#secuencias).

```mermaid
sequenceDiagram
    autonumber
    actor User as Usuario
    participant Owner@{ "type": "control" } as Propietario de captura
    participant Origin@{ "type": "control" } as Contenedor origen
    participant Coordinator@{ "type": "control" } as Composición y adaptación
    participant Auxiliary@{ "type": "control" } as Captura auxiliar
    Origin->>Coordinator: nowrap: solicitarAlta({ búsqueda,<br/>onCreated })
    Coordinator->>Auxiliary: nowrap: abrir con valores iniciales
    alt nowrap: cancela la captura auxiliar
        User->>Auxiliary: nowrap: cancelar
        Auxiliary->>Coordinator: nowrap: cierre sin resultado
    else nowrap: confirma la captura auxiliar
        User->>Auxiliary: nowrap: enviar captura
        Auxiliary->>Auxiliary: nowrap: validar y guardar con su<br/>propio flujo
        alt nowrap: resultado confirmado
            Auxiliary->>Coordinator: nowrap: registro confirmado
            Coordinator->>Owner: nowrap: onCreated(opción adaptada)
            opt nowrap: origen vigente y opción<br/>admitida
                Owner->>Owner: nowrap: conservar opción y actualizar<br/>ID
                Owner-->>Origin: nowrap: selección actualizada
            end
            Coordinator->>Coordinator: nowrap: cerrar auxiliar
        else nowrap: error de alta
            Auxiliary-->>User: nowrap: campos y mensaje para corregir
        end
    end
```

El [contrato de composición](../../../contracts/form-and-event-contracts.md#callbacks-de-composición)
define `LookupCreation`, `ItemCreation` y la adaptación a `LookupItem`.

## Caso 1: proveedor desde Inventario

**Identificador:** `DIA-VUE-APL-007`. **Pregunta:** ¿cómo llega la solicitud de proveedor al auxiliar? **Fuente:** `InventoryEditorPage`, `InventoryPage`, `InventoryWorkspace`, `DirectoryCreationPage` y `DirectoryEditorPage`. Apertura autorizada en Materiales/Consumibles; el retorno continúa en `DIA-VUE-APL-013`.

```mermaid
sequenceDiagram
    autonumber
    participant Origin@{ "type": "control" } as InventoryEditor<br/>Page.vue
    participant Page@{ "type": "control" } as Inventory<br/>Page.vue
    participant Workspace@{ "type": "control" } as Inventory<br/>Workspace.vue
    participant Creation@{ "type": "control" } as DirectoryCreation<br/>Page.vue
    participant Auxiliary@{ "type": "control" } as DirectoryEditor<br/>Page.vue
    Origin->>Page: nowrap: emit('createSupplier',<br/>{ search, onCreated })
    Page->>Workspace: nowrap: emit('createSupplier',<br/>request)
    Workspace->>Workspace: nowrap: createSupplier(request)<br/>creation.value = request
    Workspace->>Creation: nowrap: resource="suppliers"<br/>:request="creation"
    Creation->>Auxiliary: nowrap: :target={ action: 'create',<br/>initialName:<br/>request.search }
```

### Retorno del proveedor a Inventario

**Identificador:** `DIA-VUE-APL-013`. **Pregunta:** ¿quién aplica el proveedor y cierra el auxiliar? **Fuente:** `DirectoryEditorPage`, `DirectoryCreationPage`, `useInventoryEditor` e `InventoryWorkspace`. Retorno de un `entry` confirmado mientras `DirectoryCreationPage` conserva permiso de alta y lectura; el guardado interno de Directorio queda fuera del corte.

```mermaid
sequenceDiagram
    autonumber
    participant Auxiliary@{ "type": "control" } as DirectoryEditor<br/>Page.vue
    participant Creation@{ "type": "control" } as DirectoryCreation<br/>Page.vue
    participant Editor@{ "type": "control" } as useInventory<br/>Editor.ts
    participant Workspace@{ "type": "control" } as Inventory<br/>Workspace.vue
    Auxiliary->>Creation: nowrap: emit('saved', entry)
    Creation->>Editor: nowrap: request.onCreated(LookupItem)<br/>selectCreatedSupplier(created)
    opt nowrap: alta vigente y proveedor<br/>activo, sin bloqueo
        Editor->>Editor: nowrap: selection.selectedSupplier.value<br/>= created
        Editor->>Editor: nowrap: update('supplierId',<br/>created.id)<br/>selection.refreshSuppliers()
    end
    Creation->>Workspace: nowrap: emit('close')
    Workspace->>Workspace: nowrap: creation = undefined
```

## Caso 2: proveedor o artículo desde Compras

### Proveedor desde el encabezado

**Identificador:** `DIA-VUE-APL-008`. **Pregunta:** ¿cómo se abre el alta desde el encabezado de compra? **Fuente:** `PurchaseEditorPage`, `PurchasePage`, `PurchaseWorkspace`, `DirectoryCreationPage` y `DirectoryEditorPage`. Apertura autorizada; el retorno continúa en `DIA-VUE-APL-014`.

```mermaid
sequenceDiagram
    autonumber
    participant Origin@{ "type": "control" } as PurchaseEditor<br/>Page.vue
    participant Page@{ "type": "control" } as Purchase<br/>Page.vue
    participant Workspace@{ "type": "control" } as Purchase<br/>Workspace.vue
    participant Creation@{ "type": "control" } as DirectoryCreation<br/>Page.vue
    participant Auxiliary@{ "type": "control" } as DirectoryEditor<br/>Page.vue
    Origin->>Page: nowrap: emit('createSupplier',<br/>{ search, onCreated })
    Page->>Workspace: nowrap: emit('createSupplier',<br/>request)
    Workspace->>Workspace: nowrap: auxiliary.value = { kind:<br/>'supplier', ...request }
    Workspace->>Creation: nowrap: resource="suppliers"<br/>:request="auxiliary"
    Creation->>Auxiliary: nowrap: :target={ action: 'create',<br/>initialName:<br/>request.search }
```

### Retorno del proveedor a Compras

**Identificador:** `DIA-VUE-APL-014`. **Pregunta:** ¿qué callback selecciona el proveedor en la compra? **Fuente:** `DirectoryEditorPage`, `DirectoryCreationPage`, `usePurchaseEditor` y `PurchaseWorkspace`. Retorno confirmado con permiso de alta/lectura vigente en el adaptador de Directorio.

```mermaid
sequenceDiagram
    autonumber
    participant Auxiliary@{ "type": "control" } as DirectoryEditor<br/>Page.vue
    participant Creation@{ "type": "control" } as DirectoryCreation<br/>Page.vue
    participant Editor@{ "type": "control" } as usePurchase<br/>Editor.ts
    participant Workspace@{ "type": "control" } as Purchase<br/>Workspace.vue
    Auxiliary->>Creation: nowrap: emit('saved', entry)
    Creation->>Editor: nowrap: request.onCreated(LookupItem)<br/>selectCreatedSupplier(item)
    opt nowrap: compra nueva editable,<br/>instancia vigente y proveedor<br/>activo
        Editor->>Editor: nowrap: supplier.value = item<br/>interaction.update('supplierId',<br/>item.id)
        Editor->>Editor: nowrap: suppliers.updateSearch('')<br/>suppliers.refresh()
    end
    Creation->>Workspace: nowrap: emit('close')
    Workspace->>Workspace: nowrap: auxiliary = undefined
```

### Artículo desde un detalle

**Identificador:** `DIA-VUE-APL-010`. **Pregunta:** ¿cómo se abre el artículo con el proveedor de la compra? **Fuente:** `PurchaseLineEntryPage`, `PurchaseEditorPage`, `PurchasePage`, `PurchaseWorkspace` e `InventoryEditorPage`. Apertura autorizada; el retorno continúa en `DIA-VUE-APL-015`.

```mermaid
sequenceDiagram
    autonumber
    participant Origin@{ "type": "control" } as PurchaseLine<br/>EntryPage.vue
    participant EditorPage@{ "type": "control" } as PurchaseEditor<br/>Page.vue
    participant Page@{ "type": "control" } as Purchase<br/>Page.vue
    participant Workspace@{ "type": "control" } as Purchase<br/>Workspace.vue
    participant Auxiliary@{ "type": "control" } as InventoryEditor<br/>Page.vue
    Origin->>EditorPage: nowrap: emit('create', { supplier,<br/>search, onCreated })
    EditorPage->>Page: nowrap: emit('createItem',<br/>request)
    Page->>Workspace: nowrap: emit('createItem',<br/>request)
    Workspace->>Workspace: nowrap: auxiliary.value = { kind:<br/>'item', ...request }
    Workspace->>Auxiliary: nowrap: :initial-supplier=<br/>"auxiliary.supplier"<br/>creation-context=<br/>"goodsReceipt"
```

### Retorno del artículo al detalle

**Identificador:** `DIA-VUE-APL-015`. **Pregunta:** ¿qué resultado selecciona el artículo sin agregar el detalle? **Fuente:** `InventoryEditorPage`, `PurchaseWorkspace` y `usePurchaseLineEntry`. El editor de Inventario ya confirmó su escritura antes de emitir `saved`.

```mermaid
sequenceDiagram
    autonumber
    participant Auxiliary@{ "type": "control" } as InventoryEditor<br/>Page.vue
    participant Workspace@{ "type": "control" } as Purchase<br/>Workspace.vue
    participant Line@{ "type": "control" } as usePurchase<br/>LineEntry.ts
    Auxiliary->>Workspace: nowrap: emit('saved', item)
    Workspace->>Workspace: nowrap: handleItemSaved(item)
    opt nowrap: auxiliary.kind === 'item' y<br/>resultado presente
        Workspace->>Line: nowrap: auxiliary.onCreated(item)<br/>selectCreatedItem(created)
        opt nowrap: captura disponible y artículo<br/>activo
            Line->>Line: nowrap: item.value = created<br/>interaction.update('materialId',<br/>created.id)
            Line->>Line: nowrap: items.updateSearch('')<br/>items.refresh()
        end
        Workspace->>Workspace: nowrap: auxiliary.value = undefined
    end
```

`PurchaseWorkspace` discrimina `kind=supplier` y `kind=item`; el segundo incluye
el proveedor fijado para el artículo.

## Caso 3: cliente desde Salidas

**Identificador:** `DIA-VUE-APL-009`. **Pregunta:** ¿cómo se abre el cliente desde el encabezado de salida? **Fuente:** `IssueEditorPage`, `IssuePage`, `IssueWorkspace`, `DirectoryCreationPage` y `DirectoryEditorPage`. Apertura autorizada en Materiales, Consumibles y Mermas; el retorno continúa en `DIA-VUE-APL-016`.

```mermaid
sequenceDiagram
    autonumber
    participant Origin@{ "type": "control" } as IssueEditor<br/>Page.vue
    participant Page@{ "type": "control" } as Issue<br/>Page.vue
    participant Workspace@{ "type": "control" } as Issue<br/>Workspace.vue
    participant Creation@{ "type": "control" } as DirectoryCreation<br/>Page.vue
    participant Auxiliary@{ "type": "control" } as DirectoryEditor<br/>Page.vue
    Origin->>Page: nowrap: emit('createClient',<br/>{ search, onCreated })
    Page->>Workspace: nowrap: emit('createClient',<br/>request)
    Workspace->>Workspace: nowrap: creation.value = request
    Workspace->>Creation: nowrap: resource="clients"<br/>:request="creation"
    Creation->>Auxiliary: nowrap: :target={ action: 'create',<br/>initialName:<br/>request.search }
```

### Retorno del cliente a Salidas

**Identificador:** `DIA-VUE-APL-016`. **Pregunta:** ¿quién selecciona el cliente y actualiza el encabezado? **Fuente:** `DirectoryEditorPage`, `DirectoryCreationPage`, `useIssueHeaderSelection`, `useIssueEditor` e `IssueWorkspace`. Retorno confirmado con permiso de alta/lectura vigente en el adaptador de Directorio.

```mermaid
sequenceDiagram
    autonumber
    participant Auxiliary@{ "type": "control" } as DirectoryEditor<br/>Page.vue
    participant Creation@{ "type": "control" } as DirectoryCreation<br/>Page.vue
    participant Selection@{ "type": "control" } as useIssueHeader<br/>Selection.ts
    participant Editor@{ "type": "control" } as useIssue<br/>Editor.ts
    participant Workspace@{ "type": "control" } as Issue<br/>Workspace.vue
    Auxiliary->>Creation: nowrap: emit('saved', entry)
    Creation->>Selection: nowrap: request.onCreated(<br/>LookupItem)<br/>callback selectCreatedClient
    opt nowrap: encabezado disponible y<br/>cliente activo
        Selection->>Selection: nowrap: selectedClient.value<br/>= item
        Selection->>Editor: nowrap: options.selectClient(<br/>item.id)
        Editor->>Editor: nowrap: interaction.update(<br/>'clientId', id)
        Selection->>Selection: nowrap: clients.updateSearch('')<br/>clients.refresh()
    end
    Creation->>Workspace: nowrap: emit('close')
    Workspace->>Workspace: nowrap: creation = undefined
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
