# Compra: lectura y preparación de partidas

## Escenario y contratos

**Casos relacionados:** CU-ENT-01/02/03/07/08/09.

**Fuente técnica:** usePurchaseActions.ts, useDocumentRead.ts, PurchaseEditorPage.vue y usePurchaseLineEntry.ts. El diagrama describe el código Vue y sus fronteras. La API es un participante externo; sus transacciones internas no se atribuyen al navegador.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-011`. Mensajes numerados; líneas continuas = invocación/solicitud, discontinuas = respuesta o resultado. Las ramas representan decisiones reales; no son ejecuciones simultáneas.

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant Actions as usePurchaseActions
    participant Reader as useDocumentRead
    participant Service as purchaseService
    participant Page as PurchaseEditorPage
    participant Line as usePurchaseLineEntry
    Usuario->>Actions: abrir compra view o edit
    Actions->>Reader: load por ID
    Reader->>Service: get(resource, id, signal)
    Service-->>Reader: documento normalizado con ID coincidente
    Reader-->>Actions: documento vigente
    Actions->>Actions: canEditPurchase y resolver modo
    Actions-->>Page: target y nueva instancia de editor
    opt modo permite partidas nuevas
        Usuario->>Line: seleccionar artículo, cantidad y costo
        Line->>Line: validar y construir borrador de partida
        Line-->>Page: evento add(line)
        Page->>Page: editor.addDetail y recalcular preview
        Note over Page,Line: Agregar sólo modifica borrador y no escribe compra ni stock.
    end
    opt cerrar o solicitar otro documento
        Actions->>Reader: close o load invalida lectura anterior
    end
```

## Reglas y recuperación

En alta se elige proveedor; en edición el proveedor persistido permanece fijo. La página conserva detalles recibidos separados de nuevas partidas. Una lectura fallida ofrece retry y no abre un editor con datos inventados.

## Evidencia

purchaseTest.ts y purchases.spec.ts. La [matriz por caso](../../../testing/04-use-case-coverage.md) identifica alcance y límites, y el [registro CP](../../../testing/03-test-cases.md) concreta datos y oráculos críticos.
