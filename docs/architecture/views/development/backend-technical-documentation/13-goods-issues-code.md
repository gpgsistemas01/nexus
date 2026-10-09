# 13. Salidas: materiales y consumibles: estructura de código

**Identificador:** `DIA-BE-MOD-ISS-001`.
**Alcance:** grupos de implementación del módulo y sus dependencias directas.
**Fuente:** imports de los archivos de la tabla.

```mermaid
flowchart TB
    R["routes/api<br/>consumableGoodsIssueApiRoute.js<br/>consumableGoodsIssueReportApiRoute.js<br/>y colaboradores"]
    C["Controllers de salida<br/>material / consumable<br/>y reportes"]
    H["Handlers compartidos<br/>goodsIssueHandlers.js"]
    A["Adaptadores por tipo<br/>material / consumable"]
    S["services<br/>goodsIssueService.js<br/>detailReturns/"]
    D["DTO<br/>goodsIssueDTO.js"]
    X["Colaboradores de dominio<br/>referenceNumberService.js<br/>movementService.js<br/>y colaboradores"]
    P["baseRepository.js<br/>getDb(tx)"]
    A --> S
    C --> A
    C --> H
    H --> D
    R --> C
    S --> P
    S --> X
    X --> P
```

Los controllers material/consumable configuran goodsIssueHandlers y servicios por tipo. El núcleo colabora con issues, movimientos y detailReturns; no se confunden devolución y edición de detalle.

| Grupo del mapa | Archivos que lo componen |
| --- | --- |
| routes/api · consumableGoodsIssueApiRoute.js · consumableGoodsIssueReportApiRoute.js · y colaboradores | `src/routes/api/warehouse/goodsIssues/`<br/>`consumables/`<br/>`consumableGoodsIssueApiRoute.js`<br/>`src/routes/api/warehouse/goodsIssues/`<br/>`consumables/`<br/>`consumableGoodsIssueReportApiRoute.js`<br/>`src/routes/api/warehouse/goodsIssues/`<br/>`materials/materialGoodsIssueApiRoute.js`<br/>`src/routes/api/warehouse/goodsIssues/`<br/>`materials/`<br/>`materialGoodsIssueReportApiRoute.js` |
| controllers/api · consumableGoodsIssueController.js · consumableGoodsIssueReportController.js · y colaboradores | `src/controllers/api/warehouse/goodsIssues/`<br/>`consumables/`<br/>`consumableGoodsIssueController.js`<br/>`src/controllers/api/warehouse/goodsIssues/`<br/>`consumables/`<br/>`consumableGoodsIssueReportController.js`<br/>`src/controllers/api/warehouse/goodsIssues/`<br/>`materials/materialGoodsIssueController.js`<br/>`src/controllers/api/warehouse/goodsIssues/`<br/>`materials/`<br/>`materialGoodsIssueReportController.js` |
| Handlers compartidos · goodsIssueHandlers.js | `src/controllers/api/warehouse/goodsIssues/`<br/>`shared/goodsIssueHandlers.js` |
| Adaptadores por tipo · material / consumable | `src/services/warehouse/goodsIssues/`<br/>`consumables/consumableGoodsIssueService.js`<br/>`src/services/warehouse/goodsIssues/`<br/>`materials/materialGoodsIssueService.js` |
| services · goodsIssueReturnService.js · goodsIssueDetailSelect.js · y colaboradores | `src/services/warehouse/goodsIssues/`<br/>`detailReturns/goodsIssueReturnService.js`<br/>`src/services/warehouse/goodsIssues/`<br/>`goodsIssueDetailSelect.js`<br/>`src/services/warehouse/goodsIssues/`<br/>`goodsIssueFulfillmentRules.js`<br/>`src/services/warehouse/goodsIssues/`<br/>`goodsIssueHelpers.js`<br/>`src/services/warehouse/goodsIssues/`<br/>`goodsIssueService.js` |
| DTO · goodsIssueDTO.js | `src/dtos/goodsIssueDTO.js` |
| Colaboradores de dominio · referenceNumberService.js · movementService.js · y colaboradores | `src/services/document/`<br/>`referenceNumberService.js`<br/>`src/services/inventory/movementService.js`<br/>`src/services/inventory/stockHelpers.js`<br/>`src/services/warehouse/`<br/>`fulfillmentStatusService.js`<br/>`src/services/warehouse/issues/`<br/>`issueFulfillmentRules.js`<br/>`src/services/warehouse/issues/`<br/>`issueHeaderService.js`<br/>`src/services/warehouse/materials/`<br/>`supplierMaterialService.js` |
| baseRepository.js · getDb(tx) | `src/repository/baseRepository.js` |

Los reportes y la infraestructura transversal se localizan en el
[capítulo 3](03-shared-code-and-coverage.md); el orden de llamadas está en
[procesos](../../processes/backend-code-sequences/index.md).

