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
| services · adjustmentService.js · materialHelpers.js · y colaboradores | `src/services/warehouse/`<br/>`adjustmentService.js`<br/>`src/services/warehouse/materials/`<br/>`materialHelpers.js`<br/>`src/services/warehouse/materials/`<br/>`materialService.js`<br/>`src/services/warehouse/materials/`<br/>`supplierMaterialService.js` |
| DTO · materialDTO.js | `src/dtos/materialDTO.js` |
| Colaboradores de dominio · referenceNumberService.js · movementHelpers.js · y colaboradores | `src/services/document/`<br/>`referenceNumberService.js`<br/>`src/services/inventory/movementHelpers.js`<br/>`src/services/inventory/movementService.js`<br/>`src/services/inventory/stockHelpers.js`<br/>`src/services/warehouse/`<br/>`presentationService.js`<br/>`src/services/warehouse/reasonService.js`<br/>`src/services/warehouse/supplierService.js`<br/>`src/services/warehouse/`<br/>`unitMeasureService.js` |
| Validadores · materialValidations.js | `src/validators/forms/`<br/>`materialValidations.js` |
| baseRepository.js · getDb(tx) | `src/repository/baseRepository.js` |


## Contratos de implementación

`supplierMaterialStockService.js` concentra las consultas operativas y escrituras de
existencias que antes estaban en `supplierMaterialService.js`. Este último conserva
administración de la oferta y costos. Las variaciones de stock son atómicas y devuelven
el saldo utilizado en el historial; los ajustes absolutos consultan después de obtener
el bloqueo de la oferta. Los pesos de referencia anteriores se conservan como históricos;
el API rechaza su captura o modificación con el código de campo de `errorMap`.
La nueva muestra se registra exclusivamente desde merma.

Las validaciones de alta permiten omitir ambas medidas; si se informa una, exigen la
pareja positiva y responden con los códigos de campo de `errorMap`. El DTO normaliza
las medidas omitidas como `null`; la conversión sin dimensiones conserva la cantidad.
El formulario reutiliza `updateMaterialMeasurementFields` al abrir el modal y cambiar
la unidad con Select2: sólo habilita medidas para metros y litros durante el alta,
oculta y limpia la sección en pieza y otras unidades, y conserva la identidad bloqueada
en edición y ajustes. Abrir el selector de unidad no descarta su selección. No se añade
una consulta de unidad ni una validación duplicada en el servicio.

### Datos, resultados y efectos del módulo

| Capacidad | Entrada y retorno | Reglas, errores y persistencia |
| --- | --- | --- |
| Materiales: `materialController.js`, `materials/materialService.js`, `materialHelpers.js`, `supplierMaterialService.js`, `adjustmentService.js` | El listado retorna relaciones `SupplierMaterial` con `material` y `supplier` anidados; alta, edición y consultas operativas conservan ese contrato. El retiro recibe el `id` de la relación y las mutaciones retornan material o confirmación. | Prepara identidad, crea la oferta de proveedor mediante INSERT estricto, rechaza la captura de referencias históricas y usa ajuste/movimiento para cambiar existencias; las escrituras relacionadas comparten `tx`. |


| Archivo bajo `src/` | Símbolos públicos y puntos de configuración |
| --- | --- |
| `controllers/api/warehouse/`<br/>`materialController.js` | `getAllMaterials`<br/>`registerMaterial`<br/>`editMaterial`<br/>`editMaterialStock`<br/>`removeMaterial` |

### Normalización de datos

| Archivo bajo `src/` | Símbolos públicos y puntos de configuración |
| --- | --- |
| `dtos/materialDTO.js` | `createMaterialDtoForRegister`<br/>`createMaterialDtoForEdit`<br/>`createMaterialDtoForStockUpdate` |

## Variantes y límites de reutilización

materialService colabora con materialHelpers, supplierMaterialService y adjustmentService. El selector base no encapsula esas reglas ni sus consultas.

El validador de alta admite omitir costo máximo y existencia inicial si el material o
consumible se crea desde compra. Esta excepción no se comparte con edición o ajuste:
`materialEditValidation` siempre valida `maxUnitCost` y `materialStockValidation`,
`newStock`, aunque el body incluya `creationContext='goodsReceipt'`. Se reutilizan las
comprobaciones del campo y los códigos de error, conservando la condición de cada operación.

Los reportes y la infraestructura transversal se localizan en el
[capítulo 3](03-shared-code-and-coverage.md); el orden de llamadas está en
[procesos](../../processes/backend-code-sequences/index.md).

