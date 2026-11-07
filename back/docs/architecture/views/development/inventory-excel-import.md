# Importación de inventario por Excel

Almacén importa altas y actualizaciones de Materiales, Consumibles y Mermas.
El [procedimiento y cliente Vue](../../../../../front/docs/development/05-inventory-excel-import.md)
pertenecen a `front/`; los contratos HTTP están en [OpenAPI](../../openapi/index.md).

## Plantillas y alcance

| Operación | Datos admitidos |
| --- | --- |
| Alta de materiales | Nombre, código de proveedor, presentación, unidad, base/altura opcionales, mínimo, costo máximo unitario, activo, cantidad inicial y observaciones. |
| Alta de consumibles | Los mismos campos, sin base/altura. |
| Alta de mermas | Nombre, código de proveedor, material de referencia en m², mínimo, costo, activo, cantidad inicial y observaciones; base/altura para otras presentaciones o los tres pesos para Rollo. |
| Actualización de materiales y consumibles | IDs de material/proveedor y sus dos versiones; nombre, mínimo, costo y activo. |
| Actualización de mermas | ID y versión; nombre, mínimo, costo y activo. |

El formato `NEXUS_INVENTORY_V1` contiene `Datos`, `Instrucciones` y `Catalogos`.
La plantilla de actualización contiene hasta 100 relaciones por página y admite
filtros por nombre y proveedor. Sus IDs y versiones deben conservarse. La de alta
incluye hasta 500 opciones activas por catálogo; para merma se elige proveedor.

La actualización conserva stock, dimensiones, unidad, presentación y pesos. Un vacío
obligatorio produce error; no borra valores. Las filas sin cambios se omiten al escribir.
Nombre y mínimo son comunes a todos los proveedores del material. Costo y activo
corresponden a su relación con el proveedor.

## Identificación y duplicados

Las altas no reciben el ID del artículo nuevo: el servidor lo genera. Las referencias
a catálogos se resuelven por código de proveedor, presentación y unidad; en merma,
la opción seleccionada del catálogo contiene el ID del material de origen.
La actualización se descarga con IDs y versiones y se vuelve a subir conservándolos.
Se identifica el destino por ID, por lo que editar el nombre no crea otro artículo.
Una fila de actualización sin ID se rechaza; los dos modos usan plantillas distintas.

Materiales y consumibles comparan su identidad de nombre, tipo, presentación, unidad
y dimensiones, y verifican la relación con el proveedor. Una relación nueva puede
reutilizar el material existente. Merma compara proveedor, nombre, medidas y pesos
de cono/total aplicables. Costo y cantidad inicial no forman parte de esa identidad.

Un repetido interno señala la primera fila coincidente. Un duplicado existente
produce un error por fila; no se convierte en edición ni en una entrada de stock.
**Un solo error o duplicado bloquea todo el lote**, incluidas las filas válidas.
La confirmación vuelve a comprobarlo: un duplicado concurrente devuelve conflicto
y no deja efectos parciales. Las filas sin cambios de una edición se omiten al escribir.

## Flujo HTTP y permisos

Prefijo: `/api/warehouse/inventory-imports`. Recursos: `materials`, `consumables`,
`wastes`. Modos: `create`, `update`.

| Ruta | Resultado |
| --- | --- |
| `GET /:resource/template?mode=...&supplierId=...&search=...&page=1` | XLSX de captura o actualización; páginas de 100 registros. |
| `POST /:resource/preview?mode=...` | Multipart con un único `file`; `{ code, batch }` con versión, vencimiento, resumen y filas. No cambia inventario. |
| `POST /:id/confirm` | JSON `{ expectedVersion, operationId }`; confirma el borrador del servidor y devuelve su recibo. |
| `GET /:id` | `{ batch }` con vista previa vigente o resultado confirmado. |
| `DELETE /:id` | Descarta el borrador y elimina su contenido temporal. |
| `GET /:id/errors/excel` | Una hoja `Datos` con fila, nombre, columna y mensaje. No es una plantilla para reimportar. |

Todas requieren lectura y escritura del recurso y `inventory:costs-read`.
Consumibles usa los permisos de Materiales. Un lote sólo es accesible por su creador
mientras conserva esos permisos. La autorización precede al parser multipart.
Las rutas JSON existentes conservan su transporte.

## Reglas y confirmación

[La validación](../../../../src/services/warehouse/imports/inventoryImportValidationService.js)
reutiliza los validadores y DTO de los formularios, `assertPieceQuantity` y
`prepareWasteMeasurements`. Resuelve catálogos en consultas acotadas al lote;
rechaza duplicados, identidades ambiguas, proveedores inactivos y versiones viejas.
Pieza exige enteros. Costo cero sólo se admite en altas y genera una advertencia;
su uso posterior conserva los bloqueos de inventario sin costo.

Confirmar revalida las filas y compara sus datos normalizados, referencias y valores
anteriores con la vista previa. Una transacción guarda artículos, stock inicial,
documentos, movimientos, folios y recibo. Las escrituras se agrupan con `createMany`
y UPDATE condicionado por versión; los triggers incrementan cada versión. Los datos
comunes de un material se actualizan una sola vez por lote.

Los cálculos e historia inicial reutilizan los servicios de ajustes y entradas de
merma. Se reserva un intervalo de folios por tipo en una sola consulta. Cada fila
conserva su documento y observaciones; merma con cantidad inicial cero no genera
entrada. Un fallo también revierte folios e historia.

`InventoryImport` conserva el recibo en PostgreSQL. La misma clave y comando devuelve
el resultado ya confirmado sin revalidar las versiones consumidas ni repetir stock.
Otra clave o comando para ese lote devuelve conflicto. Un `DRAFT` consultado tras
una desconexión no demuestra rollback: se reintenta con la misma clave. El descarte
condicionado por estado no puede borrar una confirmación que ganó la carrera.

## Límites, rendimiento y retención

| Control | Implementación |
| --- | --- |
| Tamaño | 2 MiB, 100 filas, 600 caracteres por celda; ZIP de hasta 16 MiB descomprimidos y 200 entradas. |
| Contenido | Rechaza fórmulas, macros, vínculos externos, objetos de celda y hojas/encabezados incompatibles. |
| CPU | SheetKit se ejecuta en un worker temporal con 10 s de análisis/generación. Los límites de entrada y descompresión acotan el libro; el límite V8 del worker no limita la memoria nativa de Rust. |
| Admisión | Una vista previa y un trabajo XLSX por proceso; una confirmación de importación por base. Otra solicitud recibe `429` y puede reintentarse. |
| Bloqueos | Espera de 1,5 s y transacción de hasta 30 s; las consultas normales no usan la puerta de importación. |
| XLSX | Sólo memoria; se liberan referencias tras analizarlo y ante error. No se crea un archivo en disco ni se necesita un disco de Render. |
| Borrador | Vence a las 24 h. Confirmación y descarte eliminan payload/vista previa inmediatamente. La limpieza de vencidos procesa hasta 100 cada cinco minutos y se detiene antes de desconectar Prisma. |
| Recibo | Conserva actor, fechas, hash, resumen e IDs/cambios. Su retención sigue la política de historia pendiente de acuerdo. |
| Descargas | Plantillas y Excel de errores se generan en memoria y se envían como adjuntos. No se guardan en disco; no requieren un borrado de archivo en el servidor. El usuario administra sus copias locales. |

La [medición reproducible](../../../testing/backend-performance.md#importación-de-inventario)
compara consultas normales con seis lotes de 100 filas. Sus resultados locales no
establecen un SLA. Los comandos están en la sección de desarrollo de Vue y en esa guía.

## Código necesario y biblioteca XLSX

| Unidad | Motivo para conservarla |
| --- | --- |
| Upload y worker | Acotar archivo, descompresión y tiempo; liberar el trabajo al cancelar y evitar analizar XLSX en el hilo HTTP. |
| Contexto y validación | Resolver catálogos por lote y reutilizar DTO, validadores, cantidades y medidas del dominio. |
| Escritura y repository | Agrupar operaciones en una transacción, conservar versiones y generar historia sin una consulta por celda. |
| Borrador, recibo y limpieza | Revisar antes de escribir, recuperar una confirmación incierta y eliminar contenido temporal. |
| Plantilla | Generar hojas, catálogos, listas desplegables y referencias de edición. |

La plantilla y el informe de errores comparten la hoja y encabezados. El informe
sólo genera sus cuatro columnas; omite instrucciones y catálogos vacíos. Los errores
se conservan en el JSON del borrador hasta su descarte, confirmación o vencimiento;
no se conserva el XLSX descargado. Los reportes generales de otros módulos usan un
archivo temporal para escritura por flujo y lo eliminan en `finally` tras envío o error.

**SheetKit `@sheetkit/node@1.0.1`** procesa plantillas, errores y reportes generales
en el backend. `spreadsheetUtils` comparte la creación del libro y la conversión
de columnas. Requiere Node 24; `unzipper` conserva la inspección previa del ZIP.
Los límites, contratos, validaciones del dominio y recibos permanecen en sus capas.

ExcelJS queda como dependencia de desarrollo para generar fixtures anteriores y
comprobar estructura, estilos y fórmulas; `read-excel-file` contrasta sus valores.
Las seis variantes de plantilla se descargan, editan con el motor anterior y
vuelven a analizar con SheetKit. La [decisión del motor](excel-library-decision.md)
registra alternativas y criterios para futuras actualizaciones.
