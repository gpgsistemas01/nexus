# 15. Consulta de movimientos: estructura de código

**Identificador:** `DIA-BE-MOD-MOV-001`.
**Alcance:** grupos de implementación del módulo y sus dependencias directas.
**Fuente:** imports de los archivos de la tabla.

```mermaid
flowchart TB
    R["routes/api<br/>movementApiRoute.js"]
    C["controllers/api<br/>movementController.js"]
    S["services<br/>movementQueryService.js<br/>reportService.js"]
    P["baseRepository.js<br/>getDb(tx)"]
    C --> S
    R --> C
    S --> P
```

| Grupo del mapa | Archivos que lo componen |
| --- | --- |
| routes/api · movementApiRoute.js | `src/routes/api/admin/movementApiRoute.js` |
| controllers/api · movementController.js | `src/controllers/api/admin/`<br/>`movementController.js` |
| services · movementHelpers.js · movementQueryService.js · y colaboradores | `src/services/inventory/movementHelpers.js`<br/>`src/services/inventory/`<br/>`movementQueryService.js`<br/>`src/services/inventory/reportService.js` |
| baseRepository.js · getDb(tx) | `src/repository/baseRepository.js` |


## Contratos de implementación

### Datos, resultados y efectos del módulo

| Capacidad | Entrada y retorno | Reglas, errores y persistencia |
| --- | --- | --- |
| Movimientos y exportaciones contextuales: `movementController.js`, `movementQueryService.js`, `inventory/reportService.js`, controladores/servicios `report` de admin, ventas y almacén | La consulta del módulo aporta filtros y produce filas paginadas; su acción de exportar devuelve el Excel correspondiente con cabeceras HTTP. | Sólo lectura; cada reporte reutiliza la consulta de su contexto y transforma resultados sin modificar inventario. No existe un dominio funcional independiente de “reportes”. |


Los controllers de este módulo exponen estas operaciones. Un export construido por
un handler conserva su configuración local; no se supone un DTO ni una transacción
para todas las operaciones. Los datos, resultados y efectos están definidos en la tabla anterior.

| Archivo bajo `src/` | Símbolos públicos y puntos de configuración |
| --- | --- |
| `controllers/api/admin/`<br/>`movementController.js` | `getAllMaterialMovements`<br/>`getAllConsumableMovements`<br/>`getAllWasteMovements` |

## Variantes y límites de reutilización

movementController importa movementQueryService; no abre otra escritura de inventario. La escritura compartida de movimientos está en movementService y se documenta como colaborador transversal.

Los grupos del mapa representan imports seleccionados. Los permisos y middleware
se comprueban en cada router; los servicios conservan validaciones, errores y
persistencia propios. Compartir `getDb(tx)` no implica que toda operación abra una
transacción. La integración de [Prisma](../code-structure/06-prisma-and-persistence.md)
y los [mecanismos backend reutilizables](../reuse-and-refactoring/01-backend-handlers-and-services.md)
tienen una fuente de detalle común.

Los reportes y la infraestructura transversal se localizan en el
[capítulo 3](03-shared-code-and-coverage.md); el orden de llamadas está en
[procesos](../../processes/backend-code-sequences/index.md).


## Materiales, consumibles y reportes en un módulo

Las tres páginas pertenecen a Movimientos. Materiales y consumibles comparten
`InventoryMovement`/`MovementDetail`, la vista EJS y `findInventoryMovements`;
sus fachadas fijan `Material.type` a `MATERIAL` o `CONSUMABLE` antes de ejecutar
consulta y conteos. `recordsTotal` cuenta sólo el contexto, incluso sin filtros.
Merma conserva `WasteMovement`/`WasteMovementDetail`. La consulta es de sólo lectura.

Las rutas de Excel permanecen agrupadas bajo `admin/reports`, dentro del dominio
administrativo, y seleccionan la misma consulta contextual. El prefijo URL no
crea un módulo funcional separado de reportes ni justifica duplicar servicios.
Cada endpoint fija el contexto y comprueba su permiso; los filtros del cliente
no pueden cambiarlo. El Excel mensual conserva el contexto aunque elimine los
filtros de detalle. Consumibles identifica archivo, hoja y columna de artículo.
Las fechas ya presentadas por la consulta se conservan; no se formatean otra vez.
