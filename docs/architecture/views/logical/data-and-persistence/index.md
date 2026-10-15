# Modelo persistente

## Datos generales del documento

| Versión documental | Versión del sistema | Estado | Fecha | Responsable |
| --- | --- | --- | --- | --- |
| 1.1 | 1.0.0 | En revisión | 2026-10-08 | Equipo Nexus |

## Vistas del modelo

1. [Diagramas ER](generated/database-schema.md): tablas, claves y cardinalidades,
   agrupadas por área; la tabla final detalla cada correspondencia FK → clave referenciada.
2. [Diccionario técnico](generated/data-dictionary.md): campos, tipos, obligatoriedad,
   valores predeterminados y relaciones.

Prisma y sus migraciones son la fuente técnica. El
[modelo conceptual](../../../../requirements/domain-and-use-cases/01-conceptual-domain-model.md)
define el significado de negocio; los procedimientos de migración y cuentas pertenecen
a la [vista física](../../physical/index.md).

## Lectura del ER

Las líneas unen tablas, no filas individuales de atributos. Su etiqueta identifica
la FK del dependiente y la clave que referencia; la tabla final da ambos nombres
completos. `PK` significa clave primaria, `FK` clave foránea y `UK` unicidad individual.
Las claves y restricciones compuestas se comprueban en Prisma.

Cada figura muestra las claves de sus modelos y las relaciones que éstos declaran
como dependientes. Los modelos referenciados muestran sus PK completas y las columnas
utilizadas en esas conexiones. Las relaciones entrantes se consultan en la tabla final;
los atributos restantes, en el diccionario. Las propiedades de relación del ORM
no son columnas adicionales.

`GoodsIssue.projectId` referencia opcionalmente a `Project`. En cambio,
`projectNumber` es texto en las salidas de materiales, consumibles y mermas;
no es una FK ni implica un CRUD de proyectos. `Project.client` también es texto,
mientras `GoodsIssue.clientId` referencia a `Client`.

## Necesidad de la tabla Project

`Project` no es necesaria para la operación vigente: no tiene rutas, servicios,
selectores ni uso explícito en los DTO o pruebas actuales. `createIssueHeaderDto`
captura `projectNumber`; la cantidad de proyecto de un detalle tampoco requiere
un catálogo. `RF-PRJ-001` y `RF-PRJ-002` permanecen modelados, sin un caso de uso vigente.

Se recomienda retirar `Project`, la FK y `GoodsIssue.projectId` mediante una migración
incremental una vez revisados sus datos históricos. Antes del retiro se deben contar
los proyectos y las salidas vinculadas, conciliar cualquier referencia que deba
conservarse y verificar tanto la actualización de una base existente como la cadena
de migraciones de una instalación nueva. No se deben modificar las migraciones
históricas que creaban proyectos o requisiciones.

La conexión configurada no respondió durante esta revisión (`P1001`), por lo que no
se comprobó si existen registros legados. La recomendación queda documentada sin
eliminar la tabla ni aplicar una migración; el ER sigue reflejando el esquema vigente.

## Contextos de inventario compartidos

| Estructura | Separación y reutilización |
| --- | --- |
| `Material.type` | El enum `MaterialType` distingue `MATERIAL` y `CONSUMABLE`. Ambos comparten oferta, existencia y movimiento; no es un catálogo administrable. |
| `GoodsReceipt` y `GoodsReceiptDetail` | Compras de materiales y consumibles comparten tablas. El encabezado conserva `type` y los detalles deben pertenecer al mismo contexto. |
| `GoodsIssue` y `GoodsIssueDetail` | Salidas de materiales y consumibles comparten tablas, con `type` en el encabezado y validación del contexto de sus detalles. Las mermas conservan sus propios modelos. |

Las rutas delegan en fachadas específicas que fijan el contexto en el servidor y
reutilizan el núcleo transaccional. El frontend elige endpoints, selectores y etiquetas;
no decide el discriminador persistido. Consultas, escrituras y reportes conservan la
separación de tipos y rechazan operaciones desde el contexto contrario.

Las compras de materiales y consumibles tienen series anuales independientes
`CMA` y `CCO`, respectivamente. La reutilización física de tablas
no elimina los casos de uso propios de cada tipo de inventario.

## Trazabilidad y mantenimiento

Revisar el requisito o caso de uso, confirmar su significado en el
[glosario](../../../../requirements/business-glossary.md) y contrastar campos y
restricciones con Prisma. El [contrato HTTP](../../../openapi/api-contract.md) explica
cómo se intercambian esos datos; las [decisiones de acceso](../02-identity-access-and-audit.md)
explican quién puede operarlos.

Los diagramas y el diccionario se regeneran con `npm run docs:architecture` y se
comprueban con `npm run docs:check`. No se editan manualmente. Una restricción de
columna no sustituye una regla de negocio ni concede permisos a un actor.

## Folios de salidas por contexto

Cada serie mantiene su contador por prefijo y año en `ReferenceNumberCounter`.
El formato es `PREFIJO-AAAA-consecutivo`, con seis dígitos como mínimo; por ejemplo,
`SMA-2026-000001`. Las letras identifican operación y contexto; año y consecutivo
conservan continuidad sin alargar el prefijo.

| Operación | Modelo y contexto | Prefijo |
| --- | --- | --- |
| Salida de materiales | `GoodsIssue`, `MATERIAL` | `SMA` |
| Salida de consumibles | `GoodsIssue`, `CONSUMABLE` | `SCO` |
| Salida de merma | `WasteIssue` | `SME` |
| Compra de materiales | `GoodsReceipt`, `MATERIAL` | `CMA` |
| Compra de consumibles | `GoodsReceipt`, `CONSUMABLE` | `CCO` |

Las columnas e índices existentes admiten estos folios; no se agregan columnas.
`20261012180000_shorten_issue_and_purchase_reference_prefixes` normaliza salidas
`SAL`, `SAL-MAT` y `SAL-CON` según `GoodsIssue.type`, compras `REC` según
`GoodsReceipt.type` y merma `SAL-MER` o `SM` en su propio modelo. Conserva año,
sufijo, UUID y relaciones. Si todos los documentos antiguos son materiales,
resultan `SMA` y `CMA`; la conversión no reclasifica un consumible guardado.

La cadena conserva las migraciones previas: la de agosto convirtió `SM` a
`SAL-MER` y la primera de octubre dividió `SAL` en `SAL-MAT` y `SAL-CON`.
La nueva migración continúa esa evolución sin reescribir su SQL. Los contadores
vigentes toman el máximo de los folios emitidos y los contadores históricos
correspondientes, sin disminuir valores existentes. Merma no participa en los
máximos de materiales ni consumibles; los contadores retirados se conservan.
Véanse el [despliegue y comprobaciones](../../physical/02-postgresql-runtime-and-migration-roles.md#migración-de-folios-de-salidas-por-contexto)
y el [resumen de Prisma](../../development/code-structure/06-prisma-and-persistence.md).

## Peso unitario de merma de rollo

`Waste` conserva `coneWeightKg`, `totalWeightKg` y `weightKg` (neto) por unidad,
con tipo `DECIMAL(5,2)` nullable. El neto se calcula como total con cono menos cono. La identidad de la merma se define por
`(supplierId, name, base, height, coneWeightKg, totalWeightKg)`. El neto derivado no
forma parte de la clave. Los pesos desconocidos conservan la identidad anterior mediante
un índice parcial; véase la migración física.

El [recorrido de negocio](../../../../requirements/requirements-specification/04-unified-catalog-by-scope/04-queries-reports-and-modeled-functions.md#recorrido-del-peso-de-merma)
define la captura y consulta. La implementación distribuye sus responsabilidades:

| Componente | Responsabilidad |
| --- | --- |
| `weightValidations.js` · `getWasteWeightCaptureValidationError` | Valida formato, precisión, rango, captura conjunta y total mayor que cono en formulario y HTTP. |
| `wasteDTO.js` | Normaliza cono, total y dimensiones manuales para el alta; excluye los pesos del DTO de edición. |
| `wasteService.js` | Comprueba la presentación persistida, consulta la oferta y recibe el peso del rollo completo, delega las medidas a `prepareWasteMeasurements` y protege pesos y referencias en edición. |
| `wasteHelpers.js` | Prepara neto, dimensión transversal y longitud a partir del DTO con pesos y las dimensiones del material persistido; comprueba las dimensiones finales sin consultar ni guardar datos. |
| PostgreSQL | Conserva el tipo decimal y los CHECK de rango, captura conjunta y neto igual a total menos cono. Véase la [migración](../../physical/02-postgresql-runtime-and-migration-roles.md#migración-de-peso-unitario-de-merma). |
| `reportService.js` | Calcula `totalWeightKg` por identidad y luego agrupa los rollos por ancho. `weightStatus` distingue `complete`, `unknown` y `notApplicable`. |

El reporte conserva el peso desconocido cuando falta en un rollo con existencia;
una existencia cero aporta cero. El Excel incluye la fórmula de suma cuando el
total está completo.

Los registros anteriores conservan su peso neto; cono y total permanecen `NULL`.

### Referencia y medida utilizada

| Ubicación | Datos y propósito |
| --- | --- |
| `SupplierMaterial` | Sus pesos anteriores son históricos y no se capturan ni modifican desde material. |
| `Material` | Tipo MATERIAL, unidad m². Para Rollo aporta ancho menor, orientación y largo del rollo completo. |
| `Waste` | Conserva `sourceMaterialId`, dimensiones, cono, total y neto del sobrante, total del rollo completo y la referencia calculada (`sampleLengthM`, `sampleNetWeightKg`). Son inmutables tras el alta. |

La muestra es el rollo completo, incluyendo el mismo cono de la merma:

```text
netoMerma = totalMerma − cono
netoRollo = totalRolloCompleto − cono
largoMerma = netoMerma × largoRolloCompleto / netoRollo
```

Sólo se captura como referencia adicional `referenceRollTotalWeightKg`. El servidor
obtiene el largo del material y guarda ambos valores netos calculados; no confía en
resultados del navegador. Los pesos capturados usan `Decimal(5,2)`, hasta 999.99 kg.
Los campos de referencia anteriores conservan su precisión `Decimal(18,6)` y sus
valores históricos, sin convertirlos a un rollo completo.

La migración incremental `20261015210000_add_waste_full_roll_reference` añade el total
del rollo completo nullable y un CHECK que exige descontar el mismo cono. Mantiene las
muestras anteriores y los registros sin referencia. No altera medidas, pesos ni saldos.
Las migraciones aplicadas permanecen intactas.

La identidad conserva proveedor, nombre, medidas y pesos. Una referencia distinta que
produce la misma identidad no reemplaza la guardada: devuelve `meta.waste` y permite
abrir Agregar stock. Consumibles y unidades distintas de m² no originan mermas.
