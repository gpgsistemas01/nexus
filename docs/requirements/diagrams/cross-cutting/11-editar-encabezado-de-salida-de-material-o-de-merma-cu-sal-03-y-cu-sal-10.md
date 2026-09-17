# 11. Editar encabezado de salida de material o de merma — `CU-SAL-03` y `CU-SAL-10`

```mermaid
flowchart LR
    issueHeaderRoute["PATCH /:id/header<br/>validación y permiso"] --> issueHeaderController["Controller del contexto"]
    issueHeaderController --> issueHeaderContext["goodsIssueService o wasteIssueService"]
    issueHeaderContext --> issueHeaderRules["issueHeaderService<br/>resolver campos admitidos"]
    issueHeaderRules --> issueHeaderDb[("Prisma<br/>actualizar encabezado")]
    issueHeaderDb --> issueHeaderResult["Respuesta sin efecto de inventario"]
```

`issueHeaderService` concentra la resolución compartida del encabezado y cada servicio
contextual conserva sus relaciones. La ruta general `PATCH /:id` es otra entrada del
contrato y no convierte esta edición en surtimiento.
