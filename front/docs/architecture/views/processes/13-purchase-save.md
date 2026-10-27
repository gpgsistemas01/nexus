# Compra: alta y edición confirmadas

## Escenario y contratos

**Casos relacionados:** CU-ENT-02/03/08/09.

**Fuente técnica:** usePurchaseEditor.ts, purchaseRequestMapper.ts, purchaseService.save y usePurchaseActions.handleSaved. El diagrama describe el código Vue y sus fronteras. La API es un participante externo; sus transacciones internas no se atribuyen al navegador.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-012`. Mensajes numerados; líneas continuas = invocación/solicitud, discontinuas = respuesta o resultado. Las ramas representan decisiones reales; no son ejecuciones simultáneas.

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant Editor as usePurchaseEditor
    participant Mapper as mapPurchaseFormToRequest
    participant Save as useRecordSave
    participant Service as purchaseService
    participant API
    participant Actions as usePurchaseActions
    Usuario->>Editor: Guardar encabezado y partidas nuevas
    Editor->>Editor: validar según target y documento
    alt consulta o captura inválida
        Editor-->>Usuario: sin escritura y errores si corresponden
    else modo de escritura válido
        Editor->>Mapper: values y documento leído
        Mapper-->>Editor: campos permitidos y sólo partidas nuevas
        Editor->>Save: execute operación con signal
        Save->>Service: save(resource, target, payload, signal)
        Service->>API: POST alta o PATCH edición por ID
        API-->>Service: respuesta o rechazo
        Note over Service: La API valida y persiste. Aquí se observa su respuesta.
        Service->>Service: confirmMutation con CREATED o UPDATED
        Service-->>Save: confirmación o error normalizado
        alt confirmado y consumidor vigente
            Save->>Actions: onSaved(confirmation)
            Actions->>Actions: cerrar, recargar listado y showSuccess
        else rechazado
            Save-->>Usuario: conservar captura y mostrar error
        end
    end
```

## Reglas y recuperación

Las observaciones de encabezado se incluyen en lectura y escritura admitida; el historial de corrección no se sustituye por ese texto. La compra no contabiliza otra vez el alta contextual de un artículo.

## Evidencia

purchaseTest.ts, purchases.spec.ts y recordContractTest.ts. La [matriz por caso](../../../testing/04-use-case-coverage.md) identifica alcance y límites, y el [registro CP](../../../testing/03-test-cases.md) concreta datos y oráculos críticos.
