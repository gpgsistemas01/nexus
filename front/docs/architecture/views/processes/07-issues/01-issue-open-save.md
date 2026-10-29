# Salida: apertura, modos y escritura

## Escenario y contratos

**Casos relacionados:** CU-SAL-02/03/04/09/10/11/16/17/18.

## Apertura y resolución del modo

**Identificador:** `DIA-VUE-SEQ-015`.

**Lectura visual:** [líneas de vida, números y mensajes](../../diagram-reading.md#secuencias).

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario autorizado
    box Interfaz
    participant Page@{ "type": "boundary" } as Issue<br/>Page.vue
    end
    box Coordinación
    participant Actions@{ "type": "control" } as useIssue<br/>Actions.ts
    participant Reader@{ "type": "control" } as useDocument<br/>Read.ts
    participant State@{ "type": "control" } as useList<br/>Editor.ts
    end
    box Reglas y datos
    participant Rules@{ "type": "control" } as issue<br/>Rules.ts
    end
    U->>Page: abrir fila en modo solicitado
    Page->>Actions: open(row, mode)
    Actions->>Actions: comprobar canRead()
    Actions->>Reader: load(row.id)
    Note over Reader: Callback de lectura y transporte en SEQ-042
    Reader-->>Actions: IssueDocument vigente o undefined
    opt documento disponible
        alt mode edit con gestión
            Actions->>Rules: resolveIssueEditMode(document)
            Rules-->>Actions: view, edit o header
        else edit sin gestión
            Actions->>Actions: resolver view
        end
        opt modo supply o return
            Actions->>Rules: canSupplyIssue o canReturnIssue(document)
            Rules-->>Actions: estado admitido o no
        end
        alt capacidad y estado admitidos
            Actions->>State: openEditor con modo y documento
            State-->>Page: editor, editorKey incrementado
        else estado cambió o capacidad insuficiente
            Actions-->>Page: readError sin abrir modo solicitado
        end
    end
```

## Decisiones de apertura

| Condición | Resultado |
| --- | --- |
| Sin lectura | `open` no inicia GET. |
| Lectura fallida o sustituida | No abre el editor; la lectura vigente presenta error y permite retry. |
| `edit` sin gestión | Resuelve `view`. |
| `edit` con gestión | `resolveIssueEditMode` decide `view`, `edit` o `header` sobre el documento leído. |
| `supply`/`return` sin capacidad o estado admitido | Publica error de estado y no abre el modo solicitado. |
| Modo admitido | Incrementa `editorKey` y abre el destino con el documento. |
| `create` | Requiere gestión y abre captura nueva sin lectura de documento. |

La figura muestra la lectura satisfactoria; la tabla y la
[lectura compartida](../02-shared-runtime/05-document-read.md) completan rechazo y reintento.

## Escritura de creación, edición y encabezado

**Identificador:** `DIA-VUE-SEQ-027`. **Pregunta:** ¿Quién decide qué datos salen
según el modo y cuándo se comunica el éxito? **Fuentes:** `useIssueEditor`,
`mapIssueFormToRequest`, `useRecordSave` e `issueService.save`.
**Notación:** secuencia de escritura con validación local y confirmación contractual.

```mermaid
sequenceDiagram
    autonumber
    box Interfaz
    participant Page@{ "type": "boundary" } as IssueEditor<br/>Page.vue
    end
    box Coordinación
    participant Editor@{ "type": "control" } as useIssue<br/>Editor.ts
    participant Save@{ "type": "control" } as useRecord<br/>Save.ts
    end
    box Reglas y datos
    participant Mapper@{ "type": "control" } as issueRequest<br/>Mapper.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as issue<br/>Service.ts
    end
    Page->>Editor: submit()
    Editor->>Editor: guardas, esquema del modo e isIssueWriteTarget
    alt captura inválida o no editable
        Editor-->>Page: errors o bloqueo, sin operación
    else captura válida
        Editor->>Save: execute(operation)
        Save->>Editor: operation(signal)
        Editor->>Mapper: mapIssueFormToRequest(values, resource, mode)
        Mapper-->>Editor: cuerpo create, edit o header
        Editor->>Service: save con target y signal
        Note over Service: apiClient y confirmMutation en SEQ-045
        Service-->>Editor: MutationConfirmation o ApiError
        Editor-->>Save: resultado o rechazo de operation
        alt confirmado y vigente
            Save->>Page: onSaved(confirmation)
            Note over Page: Evento saved y cierre en DOC-002
        else rechazo
            Save-->>Editor: mensaje, campos y conflicto si corresponde
            Editor-->>Page: captura recuperable
        end
    end
```

La figura se concentra en create/edit/header. El modo supply reutiliza el coordinador
pero construye otro cuerpo y endpoint; su colaboración está en
[surtido](02-issue-supply.md). Return usa el
[flujo de devolución](03-issue-return.md). `create` abre una captura nueva sin GET previo;
`open` carga el documento antes de decidir el modo. La
[lectura compartida](../02-shared-runtime/05-document-read.md) detalla sustitución y aborto.

## Guardas y resultados del guardado

`submit` comprueba que el editor no sea de sólo lectura, no esté enviando, no tenga
conflicto y no esté desmontado. `handleSubmit` comprueba el esquema del modo y el
callback exige `isIssueWriteTarget`; sin valores válidos no se llama al servicio.
`useRecordSave` ejecuta el callback que construye el cuerpo, por eso la transformación
aparece después de `execute` en la secuencia.

El POST crea; PATCH utiliza el ID del documento y `/header` cuando corresponde.
`confirmMutation` exige el código de creación/edición del recurso de artículos o merma.
Un rechazo conserva captura y mensaje/errores; 401/403 comunican denegación. Sólo una
confirmación con consumidor vigente llama a `useIssueActions.handleSaved`, que cierra,
recarga el listado y presenta el mensaje recibido. La figura muestra el recorrido
confirmado; el [guardado compartido](../02-shared-runtime/01-list-and-record-save.md)
desarrolla conflicto, cancelación y rechazo.

## Reglas y recuperación

La selección dependiente de encabezado pertenece a useIssueHeaderSelection. Editar después de surtir no reescribe detalles protegidos. La API conserva la decisión definitiva de estado/pertenencia.

## Evidencia

issueTest.ts e issues.spec.ts. La [matriz por caso](../../../../testing/04-use-case-coverage.md) identifica alcance y límites, y el [registro CP](../../../../testing/03-test-cases.md) concreta datos y oráculos críticos.

## Fuentes de los participantes

[IssuePage.vue](../../../../../src/modules/issues/pages/IssuePage.vue),
[useIssueActions.ts](../../../../../src/modules/issues/composables/useIssueActions.ts),
[useDocumentRead.ts](../../../../../src/shared/composables/useDocumentRead.ts),
[useListEditor.ts](../../../../../src/shared/composables/useListEditor.ts),
[issueRules.ts](../../../../../src/modules/issues/issueRules.ts),
[IssueEditorPage.vue](../../../../../src/modules/issues/pages/IssueEditorPage.vue),
[useIssueEditor.ts](../../../../../src/modules/issues/composables/useIssueEditor.ts),
[useRecordSave.ts](../../../../../src/shared/composables/useRecordSave.ts),
[issueRequestMapper.ts](../../../../../src/modules/issues/mappers/issueRequestMapper.ts),
[issueService.ts](../../../../../src/modules/issues/services/issueService.ts).
