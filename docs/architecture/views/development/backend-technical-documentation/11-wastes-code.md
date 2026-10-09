# 11. Mermas: estructura de código

**Identificador:** `DIA-BE-MOD-WAS-001`.
**Alcance:** grupos de implementación del módulo y sus dependencias directas.
**Fuente:** imports de los archivos de la tabla.

```mermaid
flowchart TB
    R["routes/api<br/>wasteApiRoute.js"]
    C["controllers/api<br/>wasteController.js"]
    S["services<br/>wasteService.js<br/>wasteInventoryService.js"]
    D["DTO<br/>wasteDTO.js"]
    X["Colaboradores de dominio<br/>referenceNumberService.js<br/>materialIdentity.js<br/>y colaboradores"]
    V["Validadores<br/>wasteValidations.js"]
    P["baseRepository.js<br/>getDb(tx)"]
    C --> D
    C --> S
    R --> C
    R --> V
    S --> P
    S --> X
    X --> P
```

wasteService utiliza snapshot de material, conversión y servicios de ajuste/entrada de stock de merma. wasteInventoryService y wasteMovementService mantienen su persistencia propia.

| Grupo del mapa | Archivos que lo componen |
| --- | --- |
| routes/api · wasteApiRoute.js | `src/routes/api/warehouse/wasteApiRoute.js` |
| controllers/api · wasteController.js | `src/controllers/api/warehouse/`<br/>`wasteController.js` |
| services · wasteInventoryService.js · wasteMaterialService.js · y colaboradores | `src/services/warehouse/wastes/`<br/>`wasteInventoryService.js`<br/>`src/services/warehouse/wastes/`<br/>`wasteMaterialService.js`<br/>`src/services/warehouse/wastes/`<br/>`wasteMovementService.js`<br/>`src/services/warehouse/wastes/`<br/>`wasteService.js`<br/>`src/services/warehouse/wastes/`<br/>`wasteStockAdjustmentService.js`<br/>`src/services/warehouse/wastes/`<br/>`wasteStockEntryService.js` |
| DTO · wasteDTO.js | `src/dtos/wasteDTO.js` |
| Colaboradores de dominio · referenceNumberService.js · materialIdentity.js · y colaboradores | `src/services/document/`<br/>`referenceNumberService.js`<br/>`src/services/inventory/materialIdentity.js`<br/>`src/services/inventory/stockHelpers.js`<br/>`src/services/warehouse/reasonService.js`<br/>`src/services/warehouse/supplierService.js` |
| Validadores · wasteValidations.js | `src/validators/forms/wasteValidations.js` |
| baseRepository.js · getDb(tx) | `src/repository/baseRepository.js` |

Los reportes y la infraestructura transversal se localizan en el
[capítulo 3](03-shared-code-and-coverage.md); el orden de llamadas está en
[procesos](../../processes/backend-code-sequences/index.md).

