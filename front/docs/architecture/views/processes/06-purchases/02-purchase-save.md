# Compra: alta y edición confirmadas

## Escenario y contratos

**Casos relacionados:** CU-ENT-02/03/08/09.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-012`.

**Lectura visual:** [líneas de vida, números y mensajes](../../diagram-reading.md#secuencias).

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario autorizado
    box Interfaz
    participant Form@{ "type": "boundary" } as Purchase<br/>Editor.vue
    participant Page@{ "type": "boundary" } as Purchase<br/>Editor<br/>Page.vue
    end
    box Coordinación
    participant Editor@{ "type": "control" } as usePurchase<br/>Editor.ts
    participant Save@{ "type": "control" } as useRecord<br/>Save.ts
    end
    box Reglas y datos
    participant Schema@{ "type": "control" } as purchase<br/>Form.ts
    participant Mapper@{ "type": "control" } as purchase<br/>Request<br/>Mapper.ts
    end
    Page->>Editor: crear editor con resource y target
    Editor->>Schema: createInitialPurchaseValues y createPurchaseValidationSchema
    Schema-->>Editor: captura inicial y esquema del modo
    U->>Form: Guardar compra
    Form->>Page: submit
    Page->>Editor: submit()
    alt consulta, pendiente, conflicto o desmontado
        Editor-->>Page: sin nuevo guardado
    else captura editable
        Editor->>Editor: validar esquema de captura
        alt inválida
            Editor-->>Page: errors, conservar captura
        else válida
            Editor->>Save: execute(operation)
            Save->>Editor: operation(signal)
            Editor->>Mapper: mapPurchaseFormToRequest(values, document)
            Mapper-->>Editor: campos admitidos y sólo partidas nuevas
            Note over Editor,Mapper: Continúa en SEQ-031
        end
    end
```

## Envío y resultado de la operación

**Identificador:** `DIA-VUE-SEQ-031`. **Pregunta:** ¿Cuándo se reconoce una compra
guardada y quién cierra la captura? **Fuentes:** `purchaseService.save`,
`confirmMutation`, `useRecordSave` y `usePurchaseActions.handleSaved`.
**Notación:** continuación del callback `operation(signal)` con respuesta alternativa.

```mermaid
sequenceDiagram
    autonumber
    box Coordinación
    participant Editor@{ "type": "control" } as usePurchase<br/>Editor.ts
    participant Save@{ "type": "control" } as useRecord<br/>Save.ts
    end
    box Reglas y datos
    participant Contract@{ "type": "control" } as record<br/>Contract.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as purchase<br/>Service.ts
    participant HTTP@{ "type": "boundary" } as apiClient.ts
    end
    box Sistema externo
    participant API@{ "type": "boundary" } as API del sistema
    end
    Editor->>Service: save con resource, target, payload y signal
    Service->>HTTP: request(url, method, data, signal)
    HTTP->>API: POST compra o PATCH compra/id
    API-->>HTTP: respuesta de operación
    alt fallo HTTP o red
        HTTP-->>Service: ApiError
        Service-->>Editor: propagar rechazo
        Editor-->>Save: rechazo de operation
        break operación rechazada
            Save->>Save: conservar mensaje y errores, sin onSaved
        end
    else petición admitida
        HTTP-->>Service: cuerpo JSON
    end
    Service->>Contract: confirmMutation(response, expected)
    alt código esperado
        Contract-->>Service: MutationConfirmation
        Service-->>Editor: confirmación
        Editor-->>Save: resultado de operation
        Note over Save: onSaved se entrega al contenedor, SEQ-041
    else respuesta inesperada o rechazo
        Contract-->>Service: ApiError de confirmación
        Service-->>Editor: error
        Editor-->>Save: rechazo de operation
        Save->>Save: mensaje, campos y conflicto si corresponde
    end
```

| Condición anterior o posterior al envío | Comportamiento |
| --- | --- |
| Consulta, pendiente, conflicto o desmontado | `submit` no inicia otro guardado. |
| Formulario inválido | `handleSubmit` muestra errores y no ejecuta el callback válido. |
| Código confirmado | Cierra/recarga/avisa sólo si la señal del consumidor sigue vigente. |
| API 400 o campos rechazados | `useRecordSave` conserva captura y publica errores recibidos. |
| 401/403 | Comunica denegación al contenedor. |
| Error de red o confirmación inesperada | Conserva captura y presenta error; no anuncia éxito. |

## Cuerpo y confirmación

| Dato | Tratamiento en el cliente |
| --- | --- |
| Proveedor | En alta se toma de captura; en edición del documento leído. |
| Factura | Sólo se incluye si está facturada; recorta y convierte a mayúsculas. |
| Fecha/observaciones | Convierte fecha local a UTC y recorta observaciones. |
| Partidas | Envía sólo `materialId`, cantidad y costo de las `isNew`; en edición sin nuevas omite `details`. |
| Importes y totales | No se envían como autoridad; la API los calcula. |
| Identidad | El ID del documento determina el PATCH; corregir/cancelar detalle usa su flujo específico. |

El [modelo estático](../../logical/class-and-type-models/07-purchases.md) muestra
fila/documento/captura. La [lectura compartida](../02-shared-runtime/05-document-read.md)
protege la apertura; `useRecordSave` impide dos ejecuciones simultáneas y evita callbacks
después del desmontaje. Los límites de responsabilidad se conservan en
[guardado confirmado](../../development/design-and-construction-patterns/08-document-responsibilities.md#secuencia-de-guardado-confirmado).

## Entrega del evento y actualización del listado

**Identificador:** `DIA-VUE-SEQ-041`. **Pregunta:** ¿Qué archivos enlazan onSaved con cierre, recarga y aviso?

```mermaid
sequenceDiagram
    autonumber
    box Interfaz
    participant EditorPage@{ "type": "boundary" } as Purchase<br/>Editor<br/>Page.vue
    participant Page@{ "type": "boundary" } as Purchase<br/>Page.vue
    participant Feedback@{ "type": "boundary" } as feedback.ts
    end
    box Coordinación
    participant Save@{ "type": "control" } as useRecord<br/>Save.ts
    participant Actions@{ "type": "control" } as usePurchase<br/>Actions.ts
    participant State@{ "type": "control" } as useList<br/>Editor.ts
    end
    Note over Save: Continuación de operation resuelta en SEQ-031
    opt señal vigente
        Save->>EditorPage: options.onSaved(confirmation)
        EditorPage->>Page: emitir saved(confirmation)
        Page->>Actions: handleSaved(confirmation)
        Actions->>Actions: close(): cerrar lector y captura
        Actions->>State: onSaved()
        State->>Page: options.reload() configurado
        Actions->>Feedback: showSuccess(confirmation.message)
    end
```

## Reglas y recuperación

Las observaciones de encabezado se incluyen en lectura y escritura admitida; el historial de corrección no se sustituye por ese texto. La compra no contabiliza otra vez el alta contextual de un artículo.

## Evidencia

purchaseTest.ts, purchases.spec.ts y recordContractTest.ts. La [matriz por caso](../../../../testing/04-use-case-coverage.md) identifica alcance y límites, y el [registro CP](../../../../testing/03-test-cases.md) concreta datos y oráculos críticos.

## Fuentes de los participantes

[PurchaseEditor.vue](../../../../../src/modules/purchases/components/PurchaseEditor.vue),
[PurchaseEditorPage.vue](../../../../../src/modules/purchases/pages/PurchaseEditorPage.vue),
[usePurchaseEditor.ts](../../../../../src/modules/purchases/composables/usePurchaseEditor.ts),
[useRecordSave.ts](../../../../../src/shared/composables/useRecordSave.ts),
[purchaseForm.ts](../../../../../src/modules/purchases/purchaseForm.ts),
[purchaseRequestMapper.ts](../../../../../src/modules/purchases/mappers/purchaseRequestMapper.ts),
[recordContract.ts](../../../../../src/shared/http/recordContract.ts),
[purchaseService.ts](../../../../../src/modules/purchases/services/purchaseService.ts),
[apiClient.ts](../../../../../src/shared/http/apiClient.ts),
[PurchasePage.vue](../../../../../src/modules/purchases/pages/PurchasePage.vue),
[feedback.ts](../../../../../src/shared/ui/feedback.ts),
[usePurchaseActions.ts](../../../../../src/modules/purchases/composables/usePurchaseActions.ts),
[useListEditor.ts](../../../../../src/shared/composables/useListEditor.ts).
