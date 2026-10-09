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

Las compras comparten la serie anual `REC`; los saltos de folio dentro de una pantalla
pueden corresponder a registros del otro contexto. La reutilización física de tablas
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
