# 12. Entradas: materiales y consumibles: estructura de código

**Identificador:** `DIA-BE-MOD-REC-001`.
**Alcance:** grupos de implementación del módulo y sus dependencias directas.
**Fuente:** imports de los archivos de la tabla.

```mermaid
flowchart TB
    R["routes/api<br/>consumableGoodsReceiptApiRoute.js<br/>consumableGoodsReceiptReportApiRoute.js<br/>y colaboradores"]
    C["Controllers de entrada<br/>material / consumable<br/>y reportes"]
    H["Handlers compartidos<br/>goodsReceiptHandlers.js"]
    A["Adaptadores por tipo<br/>material / consumable"]
    S["services<br/>goodsReceiptService.js<br/>detailChanges/"]
    D["DTO<br/>goodsReceiptDTO.js"]
    X["Colaboradores de dominio<br/>personService.js<br/>referenceNumberService.js<br/>y colaboradores"]
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

Los controllers y adaptadores material/consumable configuran handlers/núcleo compartidos. goodsReceiptService, invoice, helpers y detailChanges mantienen responsabilidades distintas; las variantes fijan type.

| Grupo del mapa | Archivos que lo componen |
| --- | --- |
| routes/api · consumableGoodsReceiptApiRoute.js · consumableGoodsReceiptReportApiRoute.js · y colaboradores | `src/routes/api/warehouse/goodsReceipts/`<br/>`consumables/`<br/>`consumableGoodsReceiptApiRoute.js`<br/>`src/routes/api/warehouse/goodsReceipts/`<br/>`consumables/`<br/>`consumableGoodsReceiptReportApiRoute.js`<br/>`src/routes/api/warehouse/goodsReceipts/`<br/>`materials/materialGoodsReceiptApiRoute.js`<br/>`src/routes/api/warehouse/goodsReceipts/`<br/>`materials/`<br/>`materialGoodsReceiptReportApiRoute.js` |
| controllers/api · consumableGoodsReceiptController.js · consumableGoodsReceiptReportController.js · y colaboradores | `src/controllers/api/warehouse/`<br/>`goodsReceipts/consumables/`<br/>`consumableGoodsReceiptController.js`<br/>`src/controllers/api/warehouse/`<br/>`goodsReceipts/consumables/`<br/>`consumableGoodsReceiptReportController.js`<br/>`src/controllers/api/warehouse/`<br/>`goodsReceipts/materials/`<br/>`materialGoodsReceiptController.js`<br/>`src/controllers/api/warehouse/`<br/>`goodsReceipts/materials/`<br/>`materialGoodsReceiptReportController.js` |
| Handlers compartidos · goodsReceiptHandlers.js | `src/controllers/api/warehouse/`<br/>`goodsReceipts/shared/`<br/>`goodsReceiptHandlers.js` |
| Adaptadores por tipo · material / consumable | `src/services/warehouse/goodsReceipts/`<br/>`consumables/`<br/>`consumableGoodsReceiptService.js`<br/>`src/services/warehouse/goodsReceipts/`<br/>`materials/materialGoodsReceiptService.js` |
| services · goodsReceiptCancellationService.js · goodsReceiptCorrectionService.js · y colaboradores | `src/services/warehouse/goodsReceipts/`<br/>`detailChanges/`<br/>`goodsReceiptCancellationService.js`<br/>`src/services/warehouse/goodsReceipts/`<br/>`detailChanges/`<br/>`goodsReceiptCorrectionService.js`<br/>`src/services/warehouse/goodsReceipts/`<br/>`detailChanges/`<br/>`goodsReceiptDetailChangeService.js`<br/>`src/services/warehouse/goodsReceipts/`<br/>`goodsReceiptHelpers.js`<br/>`src/services/warehouse/goodsReceipts/`<br/>`goodsReceiptInvoiceService.js`<br/>`src/services/warehouse/goodsReceipts/`<br/>`goodsReceiptService.js` |
| DTO · goodsReceiptDTO.js | `src/dtos/goodsReceiptDTO.js` |
| Colaboradores de dominio · personService.js · referenceNumberService.js · y colaboradores | `src/services/admin/person/personService.js`<br/>`src/services/document/`<br/>`referenceNumberService.js`<br/>`src/services/inventory/movementHelpers.js`<br/>`src/services/inventory/movementService.js`<br/>`src/services/inventory/stockHelpers.js`<br/>`src/services/warehouse/materials/`<br/>`materialService.js`<br/>`src/services/warehouse/materials/`<br/>`supplierMaterialService.js`<br/>`src/services/warehouse/reasonService.js`<br/>`src/services/warehouse/supplierService.js` |
| baseRepository.js · getDb(tx) | `src/repository/baseRepository.js` |

Los reportes y la infraestructura transversal se localizan en el
[capítulo 3](03-shared-code-and-coverage.md); el orden de llamadas está en
[procesos](../../processes/backend-code-sequences/index.md).

