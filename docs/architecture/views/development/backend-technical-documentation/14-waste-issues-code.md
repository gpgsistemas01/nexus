# 14. Salidas de mermas: estructura de código

**Identificador:** `DIA-BE-MOD-WIS-001`.
**Alcance:** grupos de implementación del módulo y sus dependencias directas.
**Fuente:** imports de los archivos de la tabla.

```mermaid
flowchart TB
    R["routes/api<br/>wasteIssueApiRoute.js"]
    C["controllers/api<br/>wasteIssueController.js"]
    S["services<br/>wasteIssueService.js<br/>detailReturns/"]
    D["DTO<br/>wasteIssueDTO.js"]
    X["Colaboradores de dominio<br/>referenceNumberService.js<br/>stockHelpers.js<br/>y colaboradores"]
    V["Validadores<br/>issueReturnValidations.js<br/>wasteIssueValidations.js"]
    P["baseRepository.js<br/>getDb(tx)"]
    C --> D
    C --> S
    R --> C
    R --> V
    S --> P
    S --> X
    X --> P
```

wasteIssueController usa wasteIssueDTO y servicios propios de salida/devolución. Comparte encabezado/cumplimiento con goodsIssues, pero conserva movimientos e inventario de merma.

| Grupo del mapa | Archivos que lo componen |
| --- | --- |
| routes/api · wasteIssueApiRoute.js | `src/routes/api/warehouse/`<br/>`wasteIssueApiRoute.js` |
| controllers/api · wasteIssueController.js | `src/controllers/api/warehouse/`<br/>`wasteIssueController.js` |
| services · wasteIssueReturnService.js · wasteIssueFulfillmentService.js · y colaboradores | `src/services/warehouse/wasteIssues/`<br/>`detailReturns/wasteIssueReturnService.js`<br/>`src/services/warehouse/wasteIssues/`<br/>`wasteIssueFulfillmentService.js`<br/>`src/services/warehouse/wasteIssues/`<br/>`wasteIssueService.js` |
| DTO · wasteIssueDTO.js | `src/dtos/wasteIssueDTO.js` |
| Colaboradores de dominio · referenceNumberService.js · stockHelpers.js · y colaboradores | `src/services/document/`<br/>`referenceNumberService.js`<br/>`src/services/inventory/stockHelpers.js`<br/>`src/services/warehouse/`<br/>`fulfillmentStatusService.js`<br/>`src/services/warehouse/issues/`<br/>`issueFulfillmentRules.js`<br/>`src/services/warehouse/issues/`<br/>`issueHeaderService.js`<br/>`src/services/warehouse/wastes/`<br/>`wasteMovementService.js` |
| Validadores · issueReturnValidations.js · wasteIssueValidations.js | `src/validators/forms/`<br/>`issueReturnValidations.js`<br/>`src/validators/forms/`<br/>`wasteIssueValidations.js` |
| baseRepository.js · getDb(tx) | `src/repository/baseRepository.js` |

Los reportes y la infraestructura transversal se localizan en el
[capítulo 3](03-shared-code-and-coverage.md); el orden de llamadas está en
[procesos](../../processes/backend-code-sequences/index.md).

