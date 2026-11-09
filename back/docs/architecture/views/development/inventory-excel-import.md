# Importación de inventario por Excel

Almacén importa un archivo para una sola operación, elegida en el selector:
**Alta**, **Editar datos** o **Ajustar existencias**. Todas las filas realizan esa
operación. Aplica a Materiales, Consumibles y Mermas desde el mismo botón.
El [procedimiento y cliente Vue](../../../../../front/docs/development/05-inventory-excel-import.md)
pertenecen a `front/`; los contratos HTTP están en [OpenAPI](../../openapi/index.md).

## Plantillas y alcance

| Operación | Datos admitidos |
| --- | --- |
| Alta de materiales | Nombre, código de proveedor, presentación, unidad, base/altura opcionales, mínimo, costo máximo unitario, activo, cantidad inicial y observaciones. |
| Alta de consumibles | Los mismos campos; base/altura son referencias vacías y no se capturan. |
| Alta de mermas | Nombre, código de proveedor, material de referencia en m², mínimo, costo, activo, cantidad inicial y observaciones; base/altura para otras presentaciones o los tres pesos para Rollo. |
| Actualización de materiales y consumibles | IDs de material/proveedor y sus dos versiones; nombre, mínimo, costo y activo. |
| Actualización de mermas | ID y versión; nombre, mínimo, costo y activo. |
| Ajuste de existencias en los tres inventarios | IDs/versiones originales, Stock contado final, motivo activo y observaciones; las demás columnas son referencias. |

El formato `NEXUS_INVENTORY_V2` contiene `Datos`, `Instrucciones` y `Catalogos`.
Las plantillas de edición y ajuste incluyen todos los registros que coinciden con
los filtros de nombre/proveedor, hasta 500. El servidor consulta una fila adicional
para detectar el exceso y no devuelve una plantilla parcial; el usuario debe filtrar
la consulta y procesar grupos de hasta 500. Sus IDs y versiones se incluyen automáticamente para
quien tiene el permiso operativo; no dependen de ser administrador y deben conservarse. La de alta
incluye hasta 500 opciones activas por catálogo; para merma se elige proveedor.

La estructura parte del Excel de consulta, con los mismos encabezados y orden:
Proveedor, Material, Base, Altura, Stock actual, Stock mínimo, Presentación,
Conversión, Unidad y Costo unitario. `INVENTORY_SPREADSHEET_COLUMNS` es la fuente
compartida por el reporte y las plantillas. En ajuste se omite el costo, sin exigir
su permiso de lectura. Después se agregan Activo, IDs/versiones cuando corresponden
y los campos propios de la operación: Cantidad inicial o Stock contado/Motivo.
En altas, Proveedor ofrece `código | nombre` del catálogo. En merma, los renglones
operativos son individuales, aunque el reporte de consulta agrupe sus totales.
Las columnas grises son referencias: el servidor calcula conversiones y usa los IDs
originales; una base/altura escrita en un alta de consumible se descarta.
El reporte de consulta conserva su contrato; para escribir se descarga la plantilla
operativa, que incluye instrucciones, catálogos y metadatos de módulo/operación.

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
Una edición o ajuste sin ID se rechaza. Cada destino ocupa una sola fila del archivo.
La operación se toma del selector y debe coincidir con `Instrucciones!B3`; no se
deduce por nombre, IDs o columnas, ni se elige por fila. Para editar y contar un
registro se completan dos operaciones y se descarga una plantilla actual tras la primera.

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
`wastes`. La captura admite `create`, `update` y `adjust`. Cada descarga incluye su
modo en el archivo y en el nombre; un XLSX de otra operación o módulo se rechaza.
La restricción `InventoryImport_mode_check` admite únicamente esas tres operaciones.
La migración `20261109000000_single_operation_inventory_import` conserva los datos y
se detiene ante un modo no admitido, sin convertir ni borrar registros.

| Ruta | Resultado |
| --- | --- |
| `GET /:resource/template?mode=...&supplierId=...&search=...` | XLSX de captura o actualización; devuelve todos los registros coincidentes hasta 500 o rechaza una consulta mayor. |
| `POST /:resource/preview?mode=...` | Multipart con un único `file`; `{ code, batch }` con versión, vencimiento, resumen y filas. No cambia inventario. |
| `POST /:id/confirm` | JSON `{ expectedVersion, operationId }`; confirma el borrador del servidor y devuelve su recibo. |
| `GET /:id` | `{ batch }` con vista previa vigente o resultado confirmado. |
| `DELETE /:id` | Descarta el borrador y elimina su contenido temporal. |
| `GET /:id/errors/excel` | Una hoja `Datos` con fila, nombre, columna y mensaje. No es una plantilla para reimportar. |

Alta/edición requiere lectura, escritura y `inventory:costs-read`; conteo requiere
lectura y ajuste. Los permisos se comprueban para la operación de todo el archivo.
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
| Tamaño | 2 MiB, 500 filas, 600 caracteres por celda; ZIP de hasta 16 MiB descomprimidos y 200 entradas. |
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

La plantilla y el informe de errores reutilizan la creación de hojas y encabezados. El informe
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
Las nueve variantes de plantilla se descargan, editan con el motor anterior y
vuelven a analizar con SheetKit. La [decisión del motor](excel-library-decision.md)
registra alternativas y criterios para futuras actualizaciones.

## Operación única, conteo y organización del código

`inventoryImportConfig` concentra modos admitidos, columnas editables/referencias y
permisos. Las constantes públicas reúnen modos, etiquetas, estados, acciones y
límites de captura. La configuración de descompresión, ZIP, catálogos y timeout del
worker, junto con el marcador del formato XLSX, pertenece al módulo privado
`src/constants/inventoryImport.js`. La configuración de columnas del reporte se reutiliza en las plantillas;
la traducción de campo a encabezado es común a la edición y al conteo.
Se retiró el agrupador de operaciones por fila y su escritura recursiva.

El conteo captura **Stock contado** como saldo final físico; cero es válido y vacío
se rechaza. Genera AJU/AME, conversiones e historia mediante los servicios existentes,
sin modificar costo, nombre ni medidas. Un fallo del recibo revierte todas las filas,
movimientos y folios de la operación. Los repositories encapsulan los bloqueos SQL;
la transacción y revalidación permanecen en el servicio. La traducción compartida de
contención reconoce también los códigos anidados del adaptador PostgreSQL de Prisma.
El [flujo de conciliación](inventory-reconciliation.md) explica la secuencia con
entregas antiguas sin otro descuento.
