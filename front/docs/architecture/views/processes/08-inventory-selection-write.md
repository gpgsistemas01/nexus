# Selección dependiente y escritura de inventario

## Escenario y contratos

**Casos relacionados:** CU-ALM-02/03/05/10/11/12/13/18/19/21.

**Fuente técnica:** useInventoryEditor.ts, useInventorySelection.ts, formModel.ts e inventoryService.ts. El diagrama describe el código Vue y sus fronteras. La API es un participante externo; sus transacciones internas no se atribuyen al navegador.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-007`. Mensajes numerados; líneas continuas = invocación/solicitud, discontinuas = respuesta o resultado. Las ramas representan decisiones reales; no son ejecuciones simultáneas.

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant Page as InventoryEditorPage
    participant Editor as useInventoryEditor
    participant Selection as useInventorySelection
    participant Service as inventoryService
    participant API
    Page->>Editor: resource, target y contexto de alta
    Editor->>Selection: valores, callbacks y catálogos
    Usuario->>Page: cambiar proveedor o plantilla o unidad
    Page->>Editor: update de captura
    Editor->>Selection: reaccionar a dependencias
    Selection-->>Editor: limpiar campos dependientes y ajustar selección
    Editor-->>Page: captura y preview actualizados sin validar campos intactos
    Usuario->>Page: Guardar
    Page->>Editor: submit y validación por recurso/modo
    alt inválido
        Editor-->>Page: errores sin request
    else válido
        Editor->>Editor: buildInventoryPayload explícito
        opt alta o entrada de merma
            Editor->>Editor: conservar operación pendiente antes de enviar
        end
        Editor->>Service: mutate o createForPurchase
        Service->>API: operación del recurso y campos permitidos
        API-->>Service: confirmación o rechazo
        Service-->>Editor: resultado validado o ApiError
        Editor-->>Page: onSaved si vigente o captura/conflicto
    end
```

## Reglas y recuperación

El recurso fija reglas; Consumibles omite medidas, edición preserva identidad/stock y el ajuste conserva versión/motivo. La recuperación de merma se detalla en las siguientes secuencias y no se resuelve como un reintento genérico.

## Evidencia

inventoryFormTest.ts, inventoryListTest.ts y warehouse.spec.ts. La [matriz por caso](../../../testing/04-use-case-coverage.md) identifica alcance y límites, y el [registro CP](../../../testing/03-test-cases.md) concreta datos y oráculos críticos.
