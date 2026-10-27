# Salida: devolución por saldo leído

## Escenario y contratos

**Casos relacionados:** CU-SAL-06/13/20.

**Fuente técnica:** useIssueReturn.ts, getIssueReturnableQuantity e issueService.returnDetail. El diagrama describe el código Vue y sus fronteras. La API es un participante externo; sus transacciones internas no se atribuyen al navegador.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-017`. Mensajes numerados; líneas continuas = invocación/solicitud, discontinuas = respuesta o resultado. Las ramas representan decisiones reales; no son ejecuciones simultáneas.

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant Actions as useIssueActions
    participant Return as useIssueReturn
    participant Save as useRecordSave
    participant Service as issueService
    participant API
    Usuario->>Actions: abrir devolución
    Actions->>Actions: canReturnIssue y permiso sobre lectura vigente
    Actions-->>Return: documento y detalle surtidos
    Return->>Return: availableQuantity desde entregado menos devuelto
    Usuario->>Return: cantidad y observaciones y Guardar
    Return->>Return: validar positivo y máximo leído
    alt cantidad inválida
        Return-->>Usuario: error sin request
    else captura admitida
        Return->>Save: execute con payload explícito
        Save->>Service: returnDetail con documento e ID de detalle
        Service->>API: PATCH details/id/returns
        alt saldo vigente o estado rechazado
            API-->>Service: error
            Service-->>Save: ApiError
            Save-->>Usuario: conservar captura y permitir recuperación
        else confirmado
            API-->>Service: código esperado
            Service-->>Save: confirmación
            Save->>Actions: onSaved si consumidor vigente
            Actions->>Actions: cerrar, recargar y avisar
        end
    end
```

## Reglas y recuperación

La frontera local usa el saldo leído y no reserva inventario. La API comprueba el saldo vigente, la pertenencia del detalle y el movimiento inverso; la solicitud no reutiliza el guardado general de documento.

## Evidencia

issueTest.ts, issues.spec.ts y CP-VUE-ISS-002-02/03. La [matriz por caso](../../../testing/04-use-case-coverage.md) identifica alcance y límites, y el [registro CP](../../../testing/03-test-cases.md) concreta datos y oráculos críticos.
