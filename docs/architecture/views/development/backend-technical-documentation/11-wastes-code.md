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
    PresentationRule["warehouseInventoryUtils.js<br/>isRollPresentation<br/>getWasteWeightCaptureValidationError<br/>calculateWasteNetWeight<br/>calculateWasteRollLength"]
    C --> D
    C --> S
    R --> C
    R --> V
    S --> P
    S --> X
    V --> PresentationRule
    S --> PresentationRule
    X --> P
```

| Grupo del mapa | Archivos que lo componen |
| --- | --- |
| routes/api · wasteApiRoute.js | `src/routes/api/warehouse/wasteApiRoute.js` |
| controllers/api · wasteController.js | `src/controllers/api/warehouse/`<br/>`wasteController.js` |
| services · wasteInventoryService.js · wasteMaterialService.js · y colaboradores | `src/services/warehouse/wastes/`<br/>`wasteInventoryService.js`<br/>`src/services/warehouse/wastes/`<br/>`wasteMaterialService.js`<br/>`src/services/warehouse/wastes/`<br/>`wasteMovementService.js`<br/>`src/services/warehouse/wastes/`<br/>`wasteService.js`<br/>`src/services/warehouse/wastes/`<br/>`wasteStockAdjustmentService.js`<br/>`src/services/warehouse/wastes/`<br/>`wasteStockEntryService.js` |
| DTO · wasteDTO.js | `src/dtos/wasteDTO.js` |
| Colaboradores de dominio · referenceNumberService.js · materialIdentity.js · y colaboradores | `src/services/document/`<br/>`referenceNumberService.js`<br/>`src/services/inventory/materialIdentity.js`<br/>`src/services/inventory/stockHelpers.js`<br/>`src/services/warehouse/reasonService.js`<br/>`src/services/warehouse/supplierService.js` |
| Validadores · wasteValidations.js | `src/validators/forms/wasteValidations.js` |
| baseRepository.js · getDb(tx) | `src/repository/baseRepository.js` |
| Regla de presentación · warehouseInventoryUtils.js | `src/public/js/utils/warehouseInventoryUtils.js` |


## Contratos de implementación

### Datos, resultados y efectos del módulo

| Capacidad | Entrada y retorno | Reglas, errores y persistencia |
| --- | --- | --- |
| Mermas: `wasteController.js`, `wastes/wasteService.js`, `wasteMaterialService.js`, `wasteInventoryService.js`, `wasteMovementService.js`, `wasteStockAdjustmentService.js` | Lista, plantillas, alta, edición y ajuste reciben identificadores/DTO y retornan merma. | Coordina material origen, cantidades, inventario y movimientos; valida existencia y suficiencia antes de escrituras atómicas. |


| Archivo bajo `src/` | Símbolos públicos y puntos de configuración |
| --- | --- |
| `controllers/api/warehouse/`<br/>`wasteController.js` | `getWasteMaterialTemplates`<br/>`getAllWastes`<br/>`registerWaste`<br/>`editWaste`<br/>`editWasteStock`<br/>`registerWasteStockAddition` |

### Normalización de datos

| Archivo bajo `src/` | Símbolos públicos y puntos de configuración |
| --- | --- |
| `dtos/wasteDTO.js` | `createWasteDtoForRegister`<br/>`createWasteDtoForEdit`<br/>`createWasteDtoForStockUpdate`<br/>`createWasteDtoForStockAddition` |

## Variantes y límites de reutilización

wasteService reutiliza findSupplierMaterialByIds para consultar el material y sus pesos por proveedor, conversión y servicios de ajuste/entrada de stock de merma. wasteInventoryService y wasteMovementService mantienen su persistencia propia.

Los reportes y la infraestructura transversal se localizan en el
[capítulo 3](03-shared-code-and-coverage.md); el orden de llamadas está en
[procesos](../../processes/backend-code-sequences/index.md).


La captura, protección de la edición y cálculo de reportes se describen en
[datos de merma](../../logical/data-and-persistence/index.md#peso-unitario-de-merma-de-rollo).

Los pesos de referencia se administran mediante el CRUD de material. La merma
reutiliza `findSupplierMaterialByIds` dentro de su transacción, calcula el neto de
referencia al consultar y persiste el vínculo, el cono utilizado y los resultados.
Los validators verifican formato y relaciones numéricas antes del servicio;
la transacción comprueba presentación, oferta activa y referencia necesaria.
