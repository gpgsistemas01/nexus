# 3. Composables y operaciones por callback

## Propósito y funcionamiento

Un composable crea el estado reactivo de una interacción y expone sus operaciones.
En los listados administra carga, error, cancelación y paginación. El consumidor
aporta la consulta como callback: así el mismo mecanismo trabaja con recursos
distintos y cada pantalla conserva su propia instancia.

## Modelo general de composición por callback

**Identificador:** `DIA-VUE-GEN-002`. **Pregunta:** ¿cómo varía la operación sin
acoplar el núcleo al dominio? **Fuente:** contratos de `usePagedList`,
`useRemoteLookup` y `useRecordSave`. **Notación:** secuencia UML de roles genéricos;
el callback pertenece al consumidor y el coordinador lo ejecuta. Los nombres
ilustran el mecanismo; las funciones concretas se identifican en los casos aplicados.

**Lectura visual:** [líneas de vida, números y mensajes](../../diagram-reading.md#secuencias); [formas, límites y flechas del mapa](../../diagram-reading.md#mapas-y-actividades).

```mermaid
sequenceDiagram
    autonumber
    participant Consumer@{ "type": "control" } as Consumidor
    participant Core@{ "type": "control" } as Composable
    Consumer->>Core: nowrap: crear instancia con callbacks<br/>de coordinación
    Core-->>Consumer: nowrap: estado y métodos de esa<br/>instancia
    Consumer->>Core: nowrap: ejecutar la operación<br/>configurada
    Core->>Consumer: nowrap: invocar callback con entrada y<br/>signal
    alt nowrap: la operación resuelve
        Consumer-->>Core: nowrap: resultado
        opt nowrap: instancia y solicitud vigentes
            Core->>Core: nowrap: actualizar estado
            Core-->>Consumer: nowrap: resultado observable
        end
    else nowrap: la operación rechaza
        Consumer-->>Core: nowrap: error
        opt nowrap: instancia y solicitud vigentes
            Core->>Core: nowrap: publicar error
            Core->>Consumer: nowrap: callback de error
        end
    end
```

## Dependencias y composición de un listado

**Identificador:** `DIA-VUE-PAT-001`. **Pregunta:** ¿quién configura y quién ejecuta
la consulta del listado? **Fuente:** `CatalogPage`, `useCatalogList`, `usePagedList`
y `catalogService`. Secuencia de configuración y de una carga; el transporte
interno del servicio queda fuera de este corte.

```mermaid
sequenceDiagram
    autonumber
    participant Page@{ "type": "control" } as Catalog<br/>Page.vue
    participant List@{ "type": "control" } as useCatalog<br/>List.ts
    participant Core@{ "type": "control" } as usePaged<br/>List.ts
    participant Service@{ "type": "boundary" } as catalog<br/>Service.ts
    Page->>List: nowrap: useCatalogList(catalog,<br/>onDenied)
    List->>Core: nowrap: usePagedList({ initialQuery,<br/>request, onError, errorMessage<br/>})
    Core-->>List: nowrap: { query, rows, total, load,<br/>applyQuery, ... }
    List-->>Page: nowrap: misma instancia del listado
    Page->>Core: nowrap: list.load()
    Core->>Core: nowrap: fetchPage(false)<br/>abortar consulta anterior
    Core->>List: nowrap: options.request({ ...query },<br/>signal)
    List->>Service: nowrap: catalogService.list(catalog,<br/>query, signal)
    alt nowrap: consulta confirmada y<br/>requestId vigente
        Service-->>List: nowrap: PageResult con CatalogEntry[]
        List-->>Core: nowrap: resultado
        Core->>Core: nowrap: actualizar rows y total
        Core-->>Page: nowrap: estado reactivo actualizado
    else nowrap: error y solicitud vigente sin<br/>abortar
        Service-->>List: nowrap: error
        List-->>Core: nowrap: error
        Core->>Core: nowrap: error.value = mensaje
        Core->>List: nowrap: options.onError(cause)
        opt nowrap: ApiError 401 o 403
            List->>Page: nowrap: onDenied(cause.status)
        end
    end
```

## Código, contrato y límites

[useCatalogList](../../../../../src/modules/catalogs/composables/useCatalogList.ts)
configura `request(query, signal)` y traduce 401/403 mediante `onDenied`.
El [ciclo de lectura](../../logical/states/04-state-ownership-and-save.md#consulta-y-actualización)
define cancelación y respuestas tardías; el
[contrato de callbacks](../../../contracts/form-and-event-contracts.md#callbacks-de-composición),
los intercambios del lector y guardado.

El callback debe conservar resultados, errores y `AbortSignal`; una firma válida
de TypeScript no demuestra sustitución de comportamiento.
Los lectores reciben su consulta al crearse; `useRecordSave` recibe la escritura
en cada `execute(operation)`.
[catalogListTest](../../../../../tests/unit/modules/catalogs/catalogListTest.ts) y
[remoteLookupTest](../../../../../tests/unit/shared/composables/remoteLookupTest.ts)
comprueban estado, paginación y respuestas tardías según sus contratos.

## Coordinación de la alternativa de merma duplicada

[useWasteDuplicateRecovery](../../../../../src/modules/warehouse/composables/useWasteDuplicateRecovery.ts)
decide si puede ofrecer la transición: permiso, rechazo definitivo, identidad
recibida y confirmación. [mapWasteStockAddition](../../../../../src/modules/warehouse/mappers/wasteStockAdditionMapper.ts)
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
    actor U as Usuario
    box Coordinación
    participant Page@{ "type": "control" } as Inventory<br/>Editor<br/>Page.vue
    participant Parent@{ "type": "control" } as Inventory<br/>Page.vue
    participant Editor@{ "type": "control" } as useInventory<br/>Editor.ts
    participant Recovery@{ "type": "control" } as useWaste<br/>Duplicate<br/>Recovery.ts
    participant Inventory@{ "type": "control" } as use<br/>Inventory.ts
    end
    U->>Page: nowrap: submit
    Page->>Editor: nowrap: editor.submit()
    Editor->>Recovery: nowrap: duplicateRecovery.recover(cause, payload)
    opt nowrap: confirmed && !options.signal.aborted
        Recovery->>Page: nowrap: options.onAddStock(target)
        Page->>Parent: nowrap: emit('addStock', target)
        Parent->>Inventory: nowrap: inventory.openEditor(target)
        Inventory->>Inventory: nowrap: editor.value = target
        Inventory-->>Parent: nowrap: editor
        Parent->>Page: nowrap: { target: editor, resource, userId }
    end
```

Las pruebas de [recuperación](../../../../../tests/unit/modules/warehouse/wasteDuplicateRecoveryTest.ts)
y [navegador](../../../../../tests/e2e/warehouse.spec.ts) protegen cancelación, cero/positivo,
permiso, incertidumbre y confirmación separada de la escritura.

## Selección dependiente de inventario

El [modelo general de composición por callback](#modelo-general-de-composición-por-callback)
se aplica a la selección del formulario sin trasladar a ese colaborador el guardado.
[useInventoryEditor](../../../../../src/modules/warehouse/composables/useInventoryEditor.ts)
es propietario de VeeValidate, validación, envío versionado y captura pendiente de
merma. [useInventorySelection](../../../../../src/modules/warehouse/composables/useInventorySelection.ts)
compone las consultas y opciones elegidas; los cambios de unidad, proveedor o
plantilla actualizan sólo sus campos dependientes mediante callbacks del editor.
Esos cambios programáticos no se confunden con interacción del usuario ni disparan
validación al abrir el modal.

**Identificador:** `DIA-VUE-PAT-004`. **Pregunta:** ¿cómo separar selección y guardado
conservando un único propietario de la captura? **Fuente:** `useInventoryEditor`,
`useInventorySelection`, `useSelectedOption` y los callbacks del editor.
Secuencia del cambio a una unidad sin medidas en un alta de Materiales. Los callbacks
`setValue` y `clearError` se declaran en el editor; la selección no posee el formulario.

```mermaid
sequenceDiagram
    autonumber
    participant Editor@{ "type": "control" } as useInventory<br/>Editor.ts
    participant Selection@{ "type": "control" } as useInventory<br/>Selection.ts
    participant Selected@{ "type": "control" } as useSelected<br/>Option.ts
    Editor->>Selection: nowrap: useInventorySelection({<br/>values, setValue, clearError,<br/>... })
    Selection->>Selected: nowrap: useSelectedOption(units.items,<br/>() => values.unitMeasureId)
    Selected-->>Selection: nowrap: selectedUnit
    Selection-->>Editor: nowrap: { usesMeasurements, lookups,<br/>... }
    Editor->>Editor: nowrap: update('unitMeasureId', id)
    Selected-->>Selection: nowrap: selectedUnit actualizado desde<br/>el ID
    opt nowrap: alta de materials y unidad sin<br/>medidas
        loop nowrap: field de ['base', 'height']
            Selection->>Editor: nowrap: options.setValue(field, '')
            Editor->>Editor: nowrap: form.setFieldValue(field, '',<br/>false)
            Selection->>Editor: nowrap: options.clearError(field)
            Editor->>Editor: nowrap: form.setFieldError(field,<br/>undefined)
        end
    end
```

`useSelectedOption` admite una precarga que debe coincidir con el ID vigente.
La opción remota actualiza datos; después se conserva aunque cambie la página.
Limpiar o cambiar el ID invalida la selección anterior. Compras y Salidas usan el
mismo núcleo para altas recientes y documentos cargados; sus composables conservan
reglas de inactivos, permisos, captura y renovación del catálogo.

[selectedOptionTest](../../../../../tests/unit/shared/composables/selectedOptionTest.ts)
comprueba precarga, actualización remota, limpieza e independencia de instancias.
Las pruebas de Inventario, Compras y Salidas observan captura, payloads,
dependencias y recuperación del consumidor.

## Fuentes de los participantes

[InventoryEditorPage.vue](../../../../../src/modules/warehouse/pages/InventoryEditorPage.vue),
[InventoryPage.vue](../../../../../src/modules/warehouse/pages/InventoryPage.vue),
[useInventoryEditor.ts](../../../../../src/modules/warehouse/composables/useInventoryEditor.ts),
[useWasteDuplicateRecovery.ts](../../../../../src/modules/warehouse/composables/useWasteDuplicateRecovery.ts),
[useInventory.ts](../../../../../src/modules/warehouse/composables/useInventory.ts).
