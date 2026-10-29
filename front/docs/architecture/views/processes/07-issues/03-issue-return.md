# Salida: devolución por saldo leído

## Escenario y contratos

**Casos relacionados:** CU-SAL-06/13/20.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-017`.

**Lectura visual:** [líneas de vida, números y mensajes](../../diagram-reading.md#secuencias).

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario autorizado
    box Interfaz
    participant Form@{ "type": "boundary" } as IssueReturn<br/>Form.vue
    participant Page@{ "type": "boundary" } as IssueReturn<br/>Page.vue
    end
    box Coordinación
    participant Return@{ "type": "control" } as useIssue<br/>Return.ts
    participant Save@{ "type": "control" } as useRecord<br/>Save.ts
    end
    box Reglas y datos
    participant Rules@{ "type": "control" } as issue<br/>Rules.ts
    end
    Note over Page,Rules: IssuePage entrega documento y detalle después de abrir return
    Page->>Return: crear captura con document y detail
    Return->>Rules: getIssueReturnableQuantity(detail)
    Rules-->>Return: availableQuantity leído
    U->>Form: cantidad y observaciones, Guardar
    Form->>Page: submit
    Page->>Return: submit()
    Return->>Return: validar issueReturnValidation y límite availableQuantity
    alt inválido
        Return-->>Page: errors, conservar captura
    else captura válida
        Return->>Save: execute(operation)
        Note over Return,Save: Continúa en SEQ-032
    end
```

## Ejecución del callback y resultado

**Identificador:** `DIA-VUE-SEQ-032`. **Pregunta:** ¿Quién construye la devolución
y cuándo se comunica la confirmación? **Fuente:** `useIssueReturn`, `useRecordSave`
e `issueService.returnDetail`. Secuencia del callback después de validar.

```mermaid
sequenceDiagram
    autonumber
    box Interfaz
    participant Page@{ "type": "boundary" } as IssueReturn<br/>Page.vue
    participant Parent@{ "type": "boundary" } as IssueEditor<br/>Page.vue
    end
    box Coordinación
    participant Return@{ "type": "control" } as useIssue<br/>Return.ts
    participant Save@{ "type": "control" } as useRecord<br/>Save.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as issue<br/>Service.ts
    end
    Save->>Return: operation(signal)
    Return->>Return: IDs, cantidad numérica y observaciones recortadas
    Return->>Service: returnDetail con documentId, detailId, payload y signal
    Note over Service: PATCH details/id/returns, apiClient y código en SEQ-045
    alt rechazo
        Service-->>Return: ApiError
        Return-->>Save: rechazo del callback
        Save-->>Return: mensaje, campos y conflicto
        Return-->>Page: estado recuperable
    else código confirmado
        Service-->>Return: MutationConfirmation
        Return-->>Save: resultado del callback
        opt señal vigente
            Save->>Page: onSaved(confirmation)
            Page->>Page: emitir saved(confirmation)
            Note over Page: IssuePage conecta saved con useIssueActions.handleSaved
        end
    end
```

`useIssueReturn` construye IDs de documento/detalle, `returnQuantity` numérica y
observaciones recortadas. El coordinador compartido ejecuta el callback y presenta
sus errores; no importa el servicio de Salidas. La confirmación permite cerrar,
recargar y avisar desde el consumidor.

## Reglas y recuperación

La frontera local usa el saldo leído y no reserva inventario. La API comprueba el saldo vigente, la pertenencia del detalle y el movimiento inverso; la solicitud no reutiliza el guardado general de documento.

## Evidencia

issueTest.ts, issues.spec.ts y CP-VUE-ISS-002-02/03. La [matriz por caso](../../../../testing/04-use-case-coverage.md) identifica alcance y límites, y el [registro CP](../../../../testing/03-test-cases.md) concreta datos y oráculos críticos.

## Fuentes de los participantes

[IssueReturnForm.vue](../../../../../src/modules/issues/components/IssueReturnForm.vue),
[IssueReturnPage.vue](../../../../../src/modules/issues/pages/IssueReturnPage.vue),
[useIssueReturn.ts](../../../../../src/modules/issues/composables/useIssueReturn.ts),
[useRecordSave.ts](../../../../../src/shared/composables/useRecordSave.ts),
[issueRules.ts](../../../../../src/modules/issues/issueRules.ts),
[IssueEditorPage.vue](../../../../../src/modules/issues/pages/IssueEditorPage.vue),
[issueService.ts](../../../../../src/modules/issues/services/issueService.ts).
