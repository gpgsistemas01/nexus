# 8. Responsabilidades y nombres de Salidas y Compras

Este capítulo describe cómo se distribuyen contratos, captura, operaciones y transporte en Compras y Salidas.

Participan `modules/issues`, `modules/purchases`, sus contenedores de `app` y
los colaboradores de `shared`. El [catálogo de patrones](01-applicability-and-principles.md)
conserva la definición general; aquí se localiza su aplicación.

## Propietarios del código

| Archivo o capa | Responsabilidad y motivo de cambio |
| --- | --- |
| `issue.ts` / `purchase.ts` | Tipos de documento, captura, consulta y operaciones. No contienen valores de configuración ni reglas ejecutables. |
| `issueConfig.ts` / `purchaseConfig.ts` | Descriptores de recursos, etiquetas, rutas Vue y permisos de presentación. Salidas también mantiene aquí los descriptores estáticos de sus filtros. |
| `issueRules.ts` / `purchaseRules.ts` | Decidir qué modo admite el estado leído. Salidas conserva además el saldo visible de devolución y la distinción entre destinos de lectura y escritura. No autorizan ni reemplazan transacciones del backend. |
| `issueForm.ts` / `purchaseForm.ts` | Crear valores iniciales y adaptar las reglas públicas al esquema de VeeValidate. La validación consulta la captura vigente mediante `getValues`; no conserva un payload anterior. |
| `issueDetails.ts` / `purchaseDetails.ts` | Crear borradores con identificador local. Salidas también acumula por artículo/proveedor, actualiza la selección de surtido y obtiene los detalles nuevos seleccionados. El ID local no se persiste como ID del documento. |
| `purchaseCalculations.ts` | Calcular totales visibles y el escenario de corrección. El servidor conserva el cálculo que persiste. |
| `mappers/*RequestMapper.ts` | Seleccionar y normalizar campos del request por operación. No envían HTTP, no conocen componentes ni deciden rutas de endpoints. |
| `mappers/*ResponseMapper.ts` | Comprobar respuestas y adaptar registros/opciones a los modelos de lectura. Los lectores internos de decimales, relaciones y detalles permanecen privados. |
| `services` | Resolver endpoints, verbos HTTP, código de éxito esperado, archivos y adaptación de respuestas mediante Axios compartido. |
| `composables` | Coordinar el estado reactivo y el ciclo de una interacción: captura, guardado, filtros, selección dependiente o acciones del editor. Componen capacidades sin implementar todo el módulo en un único composable. |
| `pages` | Conectar sesión/permisos, composables y eventos de presentación. Incluye contenedores de diálogo; no toda página tiene que ser una ruta independiente. |
| `components` | Presentar props y emitir intenciones. Un `Editor` presenta el formulario modal conforme a la convención existente; su nombre no implica que conozca la API. |
| `app/pages/*Workspace` | Componer las altas rápidas entre dominios mediante callbacks, sin importar las páginas de Directorio o Inventario desde Salidas/Compras. |

No se extrae una función a otro archivo únicamente por su longitud. Por ejemplo,
`useIssueHeaderSelection` conserva consultas de opciones, selección inicial,
dependencias cliente/asesor y área/solicitante y sugerencia de proyecto: todas
forman la misma interacción de selección del encabezado. Guardar el documento
pertenece a otro flujo. Los constructores de borradores están en `*Details`,
porque asignar una identidad local no corresponde al mapper de respuestas HTTP.

## Patrones y principios aplicados

| Mecanismo | Aplicación |
| --- | --- |
| Contenedor/presentación | Páginas coordinan; formularios, tablas y filtros usan props/eventos. ESLint protege imports. |
| Composición por callbacks | Lectura, guardado, selección y reportes tienen contratos propios; `useDocumentRead`/`useRecordSave` reciben operaciones del dominio. |
| Adaptadores | Request, respuesta y transporte conservan propietarios distintos. |
| Fábrica de esquemas | `createIssueValidationSchema`/`createPurchaseValidationSchema` adaptan reglas públicas al modo de captura. |
| Uniones discriminadas | Exigen documento cuando corresponde y separan consulta, escritura, corrección y cancelación. |

La [evaluación SOLID](01-applicability-and-principles.md) describe cohesión y dependencias.
La API conserva las reglas definitivas de permiso, estado y stock.

## Composición del editor y adaptadores

**Identificador:** `DIA-VUE-DOC-001`. **Pregunta:** ¿qué cambia al modificar la vista,
las reglas o el contrato HTTP? **Alcance:** dependencias del editor de Salidas;
Compras aplica el mismo corte con sus propios módulos. Flechas continuas = consumo
o composición; discontinuas = eventos o ejecución de una operación configurada.
Es un diagrama de colaboración funcional, no un diagrama UML de clases.

**Lectura visual:** [líneas de vida, números y mensajes](../../diagram-reading.md#secuencias); [formas, límites y flechas del mapa](../../diagram-reading.md#mapas-y-actividades).

```mermaid
flowchart TB
    page["IssueEditorPage<br/>contenedor"] --> ui["IssueEditor<br/>props y presentación"]
    ui -.->|eventos| page
    page --> editor["useIssueEditor<br/>captura y coordinación"]
    editor --> rules["issueForm y RequestMapper<br/>esquema y payload"]
    editor --> save["useRecordSave<br/>ciclo de guardado"]
    save -.->|operation signal| editor
    editor --> service["issueService<br/>ruta y confirmación"]
    service --> http["apiClient<br/>Axios compartido"]
    http --> api["API<br/>confirmación de la operación"]
```

El callback que ejecuta `useRecordSave` está definido en `useIssueEditor`: construye
el payload con `mapIssueFormToRequest` y llama al servicio. El núcleo compartido
no importa el servicio de Salidas. La página pasa props y conecta eventos; el
componente visual no conoce Axios. La figura omite selectores y lectura para
centrarse en esa frontera, sin atribuir sus tareas al editor visual.

| Frontera / mecanismo | Fuente en Salidas | Consumidor equivalente en Compras |
| --- | --- | --- |
| Contenedor/presentación | [IssueEditorPage](../../../../../src/modules/issues/pages/IssueEditorPage.vue) y [IssueEditor](../../../../../src/modules/issues/components/IssueEditor.vue). | [PurchaseEditorPage](../../../../../src/modules/purchases/pages/PurchaseEditorPage.vue) y [PurchaseEditor](../../../../../src/modules/purchases/components/PurchaseEditor.vue). |
| Composición del formulario | [useIssueEditor](../../../../../src/modules/issues/composables/useIssueEditor.ts). | [usePurchaseEditor](../../../../../src/modules/purchases/composables/usePurchaseEditor.ts). |
| Fábrica de esquemas | [createIssueValidationSchema](../../../../../src/modules/issues/issueForm.ts). | [createPurchaseValidationSchema](../../../../../src/modules/purchases/purchaseForm.ts). |
| Adaptación de request | [mapIssueFormToRequest](../../../../../src/modules/issues/mappers/issueRequestMapper.ts). | [mapPurchaseFormToRequest](../../../../../src/modules/purchases/mappers/purchaseRequestMapper.ts). |
| Adaptación de respuesta | [issueResponseMapper](../../../../../src/modules/issues/mappers/issueResponseMapper.ts), consumido por [issueService](../../../../../src/modules/issues/services/issueService.ts). | [purchaseResponseMapper](../../../../../src/modules/purchases/mappers/purchaseResponseMapper.ts), consumido por [purchaseService](../../../../../src/modules/purchases/services/purchaseService.ts). |
| Lectura por callback | [useIssueActions](../../../../../src/modules/issues/composables/useIssueActions.ts) configura [useDocumentRead](../../../../../src/shared/composables/useDocumentRead.ts) con `issueService.get`. | [usePurchaseActions](../../../../../src/modules/purchases/composables/usePurchaseActions.ts) configura el mismo lector con `purchaseService.get`. |
| Guardado por callback | Ambos editores configuran [useRecordSave](../../../../../src/shared/composables/useRecordSave.ts). | El mismo contrato conserva `AbortSignal`, errores y confirmación sin conocer el dominio. |

Los [contratos de Salidas](../../logical/class-and-type-models/08-issues.md#modos-y-contrato-de-escritura)
y [Compras](../../logical/class-and-type-models/07-purchases.md#datos-y-modos) comparan
los modos, datos exigidos y cuerpos admitidos. Las variantes son contratos de interacción;
los [estados](../../logical/states/index.md) desarrollan sus transiciones.

## Secuencia de guardado confirmado

**Identificador:** `DIA-VUE-DOC-002`. **Pregunta:** ¿qué evidencia permite cerrar el
editor y actualizar el listado? **Fuente:** `useIssueEditor`, `useRecordSave`,
`issueService.save`, `confirmMutation` y `useIssueActions.handleSaved`.
Secuencia UML del camino válido; los participantes son módulos funcionales.
El [guardado](../../processes/07-issues/01-issue-open-save.md) y su
[transporte](../../processes/07-issues/07-issue-save-transport.md) confirman la operación.
Esta figura desarrolla la entrega del callback y los eventos entre contenedores.

```mermaid
sequenceDiagram
    autonumber
    box Interfaz
    participant EditorPage@{ "type": "boundary" } as IssueEditor<br/>Page.vue
    participant Page@{ "type": "boundary" } as Issue<br/>Page.vue
    participant Feedback@{ "type": "boundary" } as feedback.ts
    end
    box Coordinación
    participant Save@{ "type": "control" } as useRecord<br/>Save.ts
    participant Actions@{ "type": "control" } as useIssue<br/>Actions.ts
    participant State@{ "type": "control" } as useList<br/>Editor.ts
    participant Reader@{ "type": "control" } as useDocument<br/>Read.ts
    end
    Note over Save: operation completó issueService.save y confirmMutation, SEQ-027 y SEQ-045
    alt señal vigente
        Save->>EditorPage: options.onSaved(confirmation)
        EditorPage->>Page: emitir saved(confirmation)
        Page->>Actions: handleSaved(confirmation)
        Actions->>Actions: close()
        Actions->>Reader: close()
        Actions->>State: closeEditor()
        Actions->>Page: options.reload() configurado
        Page->>Page: cargar listado vigente
        Actions->>Feedback: showSuccess(confirmation.message)
    else desmontado
        Save->>Save: omitir onSaved
    end
```

`onSaved` emite `saved` desde `IssueEditorPage`; `IssuePage` conecta ese evento con
`useIssueActions.handleSaved`, que cierra, solicita la recarga y muestra el mensaje.
Compras usa el mismo ciclo con `purchaseService`. `confirmMutation` comprueba el
código recibido: no genera un folio ni confirma una transacción por sí mismo.
El servicio de lectura usa el mapper de respuesta; el guardado devuelve una
confirmación, sin simular que retorna un documento completo.

| Condición alternativa | Resultado |
| --- | --- |
| Captura inválida | VeeValidate evita la operación HTTP. |
| Rechazo HTTP/código inesperado | Sin `onSaved`; conserva mensaje y errores de `ApiError`. Sólo `RECORD_VERSION_CONFLICT` bloquea por conflicto; 401/403 notifican `onDenied`. |
| Desmontaje | Aborta e impide callback tardío; no acredita reversión de una escritura confirmada. |
| Lectura sustituida/cerrada | `useDocumentRead` invalida/aborta; el resultado antiguo no reemplaza el actual. |

## Composición entre dominios para altas rápidas

**Identificador:** `DIA-VUE-DOC-003`. **Pregunta:** ¿cómo registrar un cliente desde
una salida sin acoplar Salidas a las pantallas de Directorio? **Fuente:**
`IssueWorkspace.createClient`, `handleClientSaved`, el evento `createClient` de
`IssuePage` y `useIssueHeaderSelection.selectCreatedClient`. Flechas continuas =
composición; discontinuas = evento o callback. Es un mapa de colaboración, no una
secuencia de llamadas HTTP.

```mermaid
flowchart TB
    workspace["IssueWorkspace<br/>composición entre dominios"] --> issues["IssuePage y editor<br/>dominio Salidas"]
    workspace --> directory["DirectoryEditorPage<br/>dominio Directorio"]
    issues -.->|createClient con callback| workspace
    directory -.->|saved con DirectoryEntry| workspace
    workspace -.->|handleClientSaved invoca callback| selection["selectCreatedClient<br/>selección del encabezado"]
    issues --> selection
```

El [workspace](../../../../../src/app/pages/IssueWorkspace.vue) comprueba permisos de crear y
leer clientes antes de abrir [DirectoryEditorPage](../../../../../src/modules/directory/pages/DirectoryEditorPage.vue).
Tras el alta convierte `DirectoryEntry` en `LookupItem` y ejecuta el callback
recibido. [useIssueHeaderSelection](../../../../../src/modules/issues/composables/useIssueHeaderSelection.ts)
conserva la opción creada, selecciona su id y refresca opciones; no selecciona una
opción inactiva. El guardado permanece en Directorio y la autorización definitiva
en el backend. Cerrar el diálogo elimina el callback pendiente.

[PurchaseWorkspace](../../../../../src/app/pages/PurchaseWorkspace.vue) aplica la misma composición
para proveedores y artículos con sus contratos de callback. No hay un bus global
ni una importación de pantallas entre los módulos. La [sesión proporcionada](01-applicability-and-principles.md)
es compartida por la aplicación; estas capturas conservan estado por instancia.

## Convenciones de nombres comprobadas

| Elemento | Ejemplo y significado |
| --- | --- |
| Operación de servicio | `get`, `list`, `save`, `changeDetail`, con el recurso aportado por el servicio. |
| Función independiente | `createInitialIssueValues`, `mapIssueFormToRequest`, `createIssueDetailDraft`, `resolveIssueEditMode`, `getIssueReturnableQuantity`, `calculatePurchaseTotals`: expresan efecto. |
| Capacidad/estado | `canEditHeader`, `canEditDetails`, `isOriginallySupplied`. |
| Callback/evento | `handleSaved`, `handleDetailSaved`, `handleClientSaved`; el evento Vue es `saved`. |
| Composable/componente | `useIssueHeaderSelection` nombra su interacción; componentes en PascalCase y composables con prefijo `use`. |
| Operación con varios IDs | Objeto con `resource`, `documentId`, `detailId`, `change`, `signal`. Campos API en el borde; imports al propietario real. |

El [estándar de código](../../../coding-standards/index.md) conserva las reglas generales.

## Verificación

Se conservan las pruebas de contratos, payloads, filtros, totales, conflictos,
cancelación al desmontar y recorridos de navegador de ambos módulos. Los casos
adicionales comprueban que consulta/devolución no escriban el documento y que el
surtido no altere detalles ya persistidos o cancelados ni el documento leído.
Estas pruebas observan comportamiento; no fijan el número de archivos ni el
nombre de una función privada.

## Fuentes de los participantes

[IssueEditorPage.vue](../../../../../src/modules/issues/pages/IssueEditorPage.vue),
[IssuePage.vue](../../../../../src/modules/issues/pages/IssuePage.vue),
[useRecordSave.ts](../../../../../src/shared/composables/useRecordSave.ts),
[useIssueActions.ts](../../../../../src/modules/issues/composables/useIssueActions.ts),
[useListEditor.ts](../../../../../src/shared/composables/useListEditor.ts),
[useDocumentRead.ts](../../../../../src/shared/composables/useDocumentRead.ts),
[feedback.ts](../../../../../src/shared/ui/feedback.ts).
