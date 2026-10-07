# Modelo persistente

## Datos generales del documento

| Versión documental | Versión del sistema | Estado | Fecha | Responsable |
| --- | --- | --- | --- | --- |
| 1.0 | 1.0.0 | En revisión | 2026-09-10 | Equipo Nexus |

## Vistas del modelo

1. [Diagramas entidad–relación](generated/database-schema.md): cuatro vistas por área y
   vistas de relaciones por grupos de modelos, generadas desde Prisma. Los atributos
   se distribuyen en figuras de hasta tres modelos. Cada figura muestra
   también las asociaciones con modelos externos para evitar entidades aparentemente
   aisladas; sus atributos se detallan en la figura propietaria.
2. [Diccionario técnico](generated/data-dictionary.md): modelos, campos, tipos, claves y
   relaciones que complementan la lectura de los diagramas.

## Propósito

Esta página presenta la estructura de datos mediante sus vistas ER. No es una guía para
ejecutar migraciones, recuperar despliegues ni aprovisionar cuentas de base de datos. Esos
procedimientos pertenecen a la [vista física](../../physical/index.md). Tampoco redefine
reglas funcionales: Prisma es la fuente técnica y los requisitos explican el significado
de negocio.

`Project` existe como modelo persistente y `GoodsIssue.projectId` lo referencia de
forma opcional. El campo textual `projectNumber`, presente en salidas de materiales y
mermas, no es una FK ni implica una relación con `Project`. De igual forma,
`Project.client` es texto, mientras `GoodsIssue.clientId` referencia a `Client`.
Los diagramas representan únicamente las relaciones declaradas en Prisma; los
modelos sin FK entrantes ni salientes se identifican explícitamente en la vista ER.

## Propiedad de la información

| Pregunta | Artefacto propietario | Evidencia o vista complementaria |
| --- | --- | --- |
| ¿Qué comportamiento o restricción debe cumplir Nexus? | [Especificación de requisitos](../../../../requirements/requirements-specification/index.md) y [políticas transversales](../../../../requirements/requirements-specification/04-unified-catalog-by-scope/05-cross-cutting-business-policies.md#45-políticas-transversales-del-negocio). | Los [casos de uso](../../../../requirements/use-cases/index.md) organizan la interacción; no redefinen columnas. |
| ¿Qué significa un concepto para el negocio? | [Glosario](../../../../requirements/business-glossary.md) y [modelo de dominio](../../../../requirements/domain-and-use-cases/index.md). | El diccionario técnico enlaza estos artefactos, pero no infiere significado desde nombres de tablas. |
| ¿Cómo se separan cuenta, persona, asignación y autorización? | [Identidad, acceso y auditoría](../02-identity-access-and-audit.md), como decisión de diseño. | `prisma/schema.prisma`, políticas del servidor y el [diagrama ER](generated/database-schema.md) son evidencia. |
| ¿Qué estructura persistente existe? | `prisma/schema.prisma` y las migraciones de `prisma/migrations`. | El [diagrama ER](generated/database-schema.md) y el [diccionario técnico](generated/data-dictionary.md) se generan desde Prisma. |
| ¿Qué cuenta de PostgreSQL ejecuta la aplicación o las migraciones? | [Roles PostgreSQL](../../physical/02-postgresql-runtime-and-migration-roles.md), en la vista física. | `DATABASE_URL`, `DIRECT_URL`, `prisma.config.ts` y `docker-entrypoint.sh` prueban el enrutamiento; el proveedor administra los privilegios reales. |
| ¿Cuál es el contrato HTTP de un dato? | [Contrato de la API](../../../openapi/api-contract.md) y [OpenAPI 3.1](../../../openapi/openapi.json). | Rutas, validadores, DTO, controladores y pruebas de integración aportan la evidencia que debe conservarse sincronizada con el contrato procesable. |

## Recorrido de trazabilidad

Para revisar un dato o una relación se sigue este orden, sin buscar una segunda fuente
normativa:

1. partir del `RF-*`, `RN-*` o `CU-*` que justifica el comportamiento;
2. confirmar el significado en el glosario y el modelo de dominio;
3. revisar la decisión de diseño de acceso o persistencia cuando corresponda;
4. comprobar campos, claves y relaciones en Prisma y sus migraciones;
5. usar el diccionario y el diagrama ER sólo como vistas generadas;
6. localizar ruta, validación, servicio y prueba desde la evidencia del requisito.

La obligatoriedad de una columna no sustituye una precondición del caso de uso; una
restricción Prisma no sustituye una regla de negocio; y una decisión de privilegios de
PostgreSQL no concede permisos funcionales a un usuario de Nexus.

## Clasificación del material

`Material.type` se modela con el enum `MaterialType` porque sus valores determinan
comportamientos compilados y rutas separadas (`MATERIAL` y `CONSUMABLE`), no un catálogo
administrable. Esta forma mantiene la clasificación obligatoria, evita relaciones y
consultas adicionales y permite que ambas variantes reutilicen la misma identidad,
oferta, existencia y movimiento.

Una tabla de tipos sólo sería apropiada si el negocio necesitara crear tipos en tiempo
de ejecución o asociarles metadatos, permisos o reglas configurables. Mientras cada tipo
requiera soporte explícito en código, agregar otro valor mediante migración y actualizar
sus flujos conserva mejor la integridad que exponer una relación administrable.

Si una variante incorpora después atributos o relaciones que no corresponden a todos los
materiales, éstos pueden residir en un modelo de extensión con relación uno a uno hacia
`Material`. Esa evolución no exige convertir `MaterialType` en un catálogo: el enum sigue
actuando como discriminador cerrado y el modelo de extensión conserva únicamente los
datos propios de la variante.

## Persistencia de compras por tipo de inventario

Las compras de materiales y las compras de consumibles **comparten las tablas
`GoodsReceipt` y `GoodsReceiptDetail`**. No son dos entidades de negocio distintas: tienen
el mismo encabezado, proveedor, receptor, comprobante, estados, totales, correcciones,
cancelaciones y movimientos. Separarlas físicamente duplicaría esas restricciones y
obligaría a mantener dos flujos transaccionales equivalentes.

La separación requerida es de contexto operativo dentro del mismo agregado, no mediante
tablas duplicadas. `GoodsReceipt.type` conserva el contexto en el encabezado y permite
consultarlo directamente; cada ruta API delega en un controller y un servicio específico
de materiales o consumibles, sin aceptar el tipo como parámetro del cliente. Esas
operaciones específicas reutilizan internamente el flujo común y fijan el discriminador
en el backend. El servicio además comprueba `Material.type` en
todos los detalles antes de crear o ampliar una compra. Por tanto, una compra es
homogénea —todos sus detalles son `MATERIAL` o todos son `CONSUMABLE`— aunque ambas clases
se almacenen en el mismo modelo relacional. Los reportes conservan el mismo filtro para
no mezclar resultados.

Esta decisión mantiene una sola fuente para folios, facturas e historial. Sólo se
justificarían tablas separadas si alguno de los dos tipos adquiriera encabezado, ciclo de
vida o relaciones propios; una diferencia de navegación o de catálogo seleccionable no
es suficiente para duplicar el agregado persistente.

Los dos contextos también comparten la serie anual de folios `REC`: el folio identifica
una compra dentro del agregado común y no codifica el tipo de inventario. Por ello, las
secuencias visibles en cada pantalla pueden tener saltos cuando entre dos compras del
mismo tipo se registró una del otro; no existe duplicidad ni pérdida de trazabilidad.

Los reportes operativos también derivan el contexto de la operación del servidor. Las rutas
`/reports/goods-receipts/materials/excel` y
`/reports/goods-receipts/consumables/excel` fijan respectivamente `MATERIAL` y
`CONSUMABLE` mediante controllers específicos; el backend filtra por `GoodsReceipt.type` antes de construir el detalle y
los resúmenes, y distingue la hoja y el nombre del archivo. El frontend no envía ni puede
alterar el discriminador como parámetro de consulta.

### Organización de servicios de compras

El backend conserva el código reutilizable en la raíz de `goodsReceipts`: creación y
actualización transaccional, construcción de detalles y cambios compartidos de corrección
y cancelación. Las fachadas específicas se mantienen separadas en
`goodsReceipts/materials/materialGoodsReceiptService.js` y
`goodsReceipts/consumables/consumableGoodsReceiptService.js`. Cada fachada fija su
`MaterialType` y expone consulta, alta, edición, corrección, cancelación y reporte para un
solo contexto.

Así, consumibles no queda representado como un subcaso dentro de la carpeta de materiales:
ambos contextos son hermanos que dependen del mismo núcleo neutral. La reutilización del
modelo `Material` y de sus reglas de inventario permanece intencional, mientras las rutas
y controllers sólo importan la fachada específica que les corresponde. Como
`GoodsReceipt.type` identifica el encabezado, la consulta de edición ya no selecciona
`Material.type` de cada detalle; ese dato sólo se consulta al validar detalles nuevos.

Las rutas y controllers permanecen agrupados en archivos comunes porque comparten
autenticación, permisos, validadores y traducción HTTP; dentro de esos archivos existen
paths y exports explícitos para cada contexto. Separarlos en archivos duplicados no
aportaría aislamiento adicional: la frontera efectiva está en el endpoint y en la
fachada de servicio específica. Si los permisos o contratos divergen en el futuro, esa
diferencia sí justificaría routers o controllers físicos independientes.

En frontend se conserva únicamente `goodsReceiptContext.resource`. Es necesario para que
la vista EJS reutilizada elija endpoint, selector, etiquetas y nombre de exportación. No
contiene `MaterialType`, no se envía como dato de negocio y no decide la autorización ni
la persistencia; esas responsabilidades permanecen en las operaciones específicas del
backend.
