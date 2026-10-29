# Salida: selección y agregado de partidas al borrador

La selección remota usa `SEQ-010`; esta colaboración empieza con una opción disponible.
Agregar una partida cambia la captura local y no escribe la salida ni el inventario.

## Construcción de la partida

**Identificador:** `DIA-VUE-SEQ-043`. **Pregunta:** ¿Dónde se crea el borrador y quién lo incorpora a la salida?

**Lectura visual:** [roles y callbacks](../00-reading-and-roles.md).

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario autorizado
    box Interfaz
    participant Form@{ "type": "boundary" } as IssueLine<br/>Entry<br/>Form.vue
    participant Page@{ "type": "boundary" } as IssueLine<br/>Entry<br/>Page.vue
    participant Parent@{ "type": "boundary" } as IssueEditor<br/>Page.vue
    end
    box Coordinación
    participant Line@{ "type": "control" } as useIssueLine<br/>Entry.ts
    participant Editor@{ "type": "control" } as useIssue<br/>Editor.ts
    end
    box Reglas y datos
    participant Details@{ "type": "control" } as issue<br/>Details.ts
    end
    U->>Form: seleccionar artículo y cantidad, Agregar
    Form->>Page: add
    Page->>Line: add()
    Line->>Line: validar opción activa y cantidad por recurso
    alt inválido o deshabilitado
        Line-->>Page: errors sin modificar el documento
    else captura válida
        Line->>Details: createIssueDetailDraft(selected, cantidad, resource)
        Details-->>Line: IssueDetail con identidad local
        Line->>Page: onAdd(line)
        Page->>Parent: emitir add(line)
        Parent->>Editor: addDetail(line)
        Editor->>Details: addIssueDetail(details, line)
        Details-->>Editor: nueva colección de captura
        Line->>Line: limpiar formulario y búsqueda de opciones
    end
```

## Fuentes de los participantes

[IssueLineEntryForm.vue](../../../../../src/modules/issues/components/IssueLineEntryForm.vue),
[IssueLineEntryPage.vue](../../../../../src/modules/issues/pages/IssueLineEntryPage.vue),
[IssueEditorPage.vue](../../../../../src/modules/issues/pages/IssueEditorPage.vue),
[useIssueLineEntry.ts](../../../../../src/modules/issues/composables/useIssueLineEntry.ts),
[useIssueEditor.ts](../../../../../src/modules/issues/composables/useIssueEditor.ts),
[issueDetails.ts](../../../../../src/modules/issues/issueDetails.ts).
