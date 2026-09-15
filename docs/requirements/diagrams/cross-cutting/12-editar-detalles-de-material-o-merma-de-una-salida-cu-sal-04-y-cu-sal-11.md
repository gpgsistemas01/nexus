# Editar detalles de material o merma de una salida — `CU-SAL-04` y `CU-SAL-11`

```mermaid
flowchart LR
    issueDetailRoute["PATCH /:id/details<br/>permiso de detalles"] --> issueDetailValidation["Validar cantidades y estado"]
    issueDetailValidation --> issueDetailService["Servicio contextual<br/>comparar detalles vigentes"]
    issueDetailService --> issueDetailDecision{"¿Sólo editar o<br/>confirmar surtimiento?"}
    issueDetailDecision -->|editar| issueDetailDb[("Actualizar detalles")]
    issueDetailDecision -->|confirmar| issueSupply["Aplicar reglas de CU-SAL-05 o CU-SAL-12"]
    issueDetailDb --> issueDetailStatus["Derivar estado del documento"]
    issueSupply --> issueDetailStatus
```

No existe una URL `/supply`: en material, la misma entrada de detalles puede confirmar
el surtimiento según el estado y los datos recibidos. La rama de confirmación continúa
en la máquina de estados y en la transacción de `CU-SAL-05` o `CU-SAL-12`; no se duplica aquí.
