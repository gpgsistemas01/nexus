# Consultar salidas de material o de merma — `CU-SAL-01` y `CU-SAL-08`

```mermaid
flowchart LR
    issueContext{"¿Material o merma?"}
    issueContext --> goodsIssueRoute["goodsIssueApiRoute<br/>GET y permiso"]
    issueContext --> wasteIssueRoute["wasteIssueApiRoute<br/>GET y permiso"]
    goodsIssueRoute --> goodsIssueService["goodsIssueService<br/>filtros y estados"]
    wasteIssueRoute --> wasteIssueService["wasteIssueService<br/>filtros y estados"]
    goodsIssueService --> issuePage["Página de salidas"]
    wasteIssueService --> issuePage
```

La bifurcación es técnica además de funcional: cada contexto conserva router, permiso,
servicio e inventario propios. Compartir el resultado visual no significa consultar una
tabla o conversión única.
