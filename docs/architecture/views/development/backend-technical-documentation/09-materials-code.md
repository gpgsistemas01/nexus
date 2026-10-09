# 9. Materiales: estructura de código

**Identificador:** `DIA-BE-MOD-MAT-001`.
**Alcance:** grupos de implementación del módulo y sus dependencias directas.
**Fuente:** imports de los archivos de la tabla.

```mermaid
flowchart TB
    R["routes/api<br/>materialApiRoute.js"]
    C["controllers/api<br/>materialController.js"]
    S["services<br/>materialService.js<br/>supplierMaterialService.js"]
    D["DTO<br/>materialDTO.js"]
    X["Colaboradores de dominio<br/>referenceNumberService.js<br/>movementHelpers.js<br/>y colaboradores"]
    V["Validadores<br/>materialValidations.js"]
    P["baseRepository.js<br/>getDb(tx)"]
    C --> D
    C --> S
    R --> C
    R --> V
    S --> P
    S --> X
    X --> P
    X --> S
```

| Grupo del mapa | Archivos que lo componen |
| --- | --- |
| routes/api · materialApiRoute.js | `src/routes/api/warehouse/`<br/>`materialApiRoute.js` |
| controllers/api · materialController.js | `src/controllers/api/warehouse/`<br/>`materialController.js` |
| services · adjustmentService.js · materialHelpers.js · y colaboradores | `src/services/warehouse/`<br/>`adjustmentService.js`<br/>`src/services/warehouse/materials/`<br/>`materialHelpers.js`<br/>`src/services/warehouse/materials/`<br/>`materialRelations.js`<br/>`src/services/warehouse/materials/`<br/>`materialService.js`<br/>`src/services/warehouse/materials/`<br/>`supplierMaterialService.js` |
| DTO · materialDTO.js | `src/dtos/materialDTO.js` |
| Colaboradores de dominio · referenceNumberService.js · movementHelpers.js · y colaboradores | `src/services/document/`<br/>`referenceNumberService.js`<br/>`src/services/inventory/movementHelpers.js`<br/>`src/services/inventory/movementService.js`<br/>`src/services/inventory/stockHelpers.js`<br/>`src/services/warehouse/`<br/>`presentationService.js`<br/>`src/services/warehouse/reasonService.js`<br/>`src/services/warehouse/supplierService.js`<br/>`src/services/warehouse/`<br/>`unitMeasureService.js` |
| Validadores · materialValidations.js | `src/validators/forms/`<br/>`materialValidations.js` |
| baseRepository.js · getDb(tx) | `src/repository/baseRepository.js` |


## Contratos de implementación

### Datos, resultados y efectos del módulo

| Capacidad | Entrada y retorno | Reglas, errores y persistencia |
| --- | --- | --- |
| Materiales: `materialController.js`, `materials/materialService.js`, `materialHelpers.js`, `materialRelations.js`, `supplierMaterialService.js`, `adjustmentService.js` | El listado retorna relaciones `SupplierMaterial` con `material` y `supplier` anidados; alta, edición y consultas operativas conservan ese contrato. El retiro recibe el `id` de la relación y las mutaciones retornan material o confirmación. | Prepara identidad, sincroniza proveedor, protege referencias y usa ajuste/movimiento para cambiar existencias; las escrituras relacionadas comparten `tx`. |


Los controllers de este módulo exponen estas operaciones. Un export construido por
un handler conserva su configuración local; no se supone un DTO ni una transacción
para todas las operaciones. Los datos, resultados y efectos están definidos en la tabla anterior.

| Archivo bajo `src/` | Símbolos públicos y puntos de configuración |
| --- | --- |
| `controllers/api/warehouse/`<br/>`materialController.js` | `getAllMaterials`<br/>`registerMaterial`<br/>`editMaterial`<br/>`editMaterialStock`<br/>`removeMaterial` |

### Normalización de datos

| Archivo bajo `src/` | Símbolos públicos y puntos de configuración |
| --- | --- |
| `dtos/materialDTO.js` | `createMaterialDtoForRegister`<br/>`createMaterialDtoForEdit`<br/>`createMaterialDtoForStockUpdate` |

## Variantes y límites de reutilización

materialService colabora con materialHelpers, materialRelations, supplierMaterialService y adjustmentService. El selector base no encapsula esas reglas ni sus consultas.

Los grupos del mapa representan imports seleccionados. Los permisos y middleware
se comprueban en cada router; los servicios conservan validaciones, errores y
persistencia propios. Compartir `getDb(tx)` no implica que toda operación abra una
transacción. La integración de [Prisma](../code-structure/06-prisma-and-persistence.md)
y los [mecanismos backend reutilizables](../reuse-and-refactoring/01-backend-handlers-and-services.md)
tienen una fuente de detalle común.

Los reportes y la infraestructura transversal se localizan en el
[capítulo 3](03-shared-code-and-coverage.md); el orden de llamadas está en
[procesos](../../processes/backend-code-sequences/index.md).

