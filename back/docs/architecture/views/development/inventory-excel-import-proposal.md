# Propuesta de importación de inventario por Excel

**Estado: propuesta de implementación.** La importación, los endpoints y la
limpieza descritos aquí están pendientes de desarrollo y pruebas. La API actual
conserva sus altas y ediciones por registro. El [flujo propuesto para Vue](../../../../../front/docs/development/05-inventory-excel-import-proposal.md)
pertenece a la documentación del frontend.

## Decisiones recomendadas

| Tema | Propuesta |
| --- | --- |
| Primera entrega | Altas y actualización de datos de materiales, consumibles y mermas. Los ajustes y entradas posteriores conservan sus flujos actuales. |
| Archivo | Una plantilla `.xlsx` por recurso y operación, con hojas Datos, Instrucciones y Catálogos. |
| Procesamiento | Leer el archivo en memoria con ExcelJS, ya instalado en producción. |
| Confirmación | Validar y mostrar cambios antes de escribir inventario; aplicar todo el lote en una transacción. |
| Recuperación | Guardar un recibo junto a los efectos del lote. Repetir su confirmación consulta el resultado guardado. |
| Conservación | Descartar el XLSX tras analizarlo; conservar temporalmente el borrador y separar su limpieza de la auditoría. |

Límites iniciales propuestos: **2 MiB y 100 filas de datos** por archivo. Verificar
también el tamaño descomprimido y el número de hojas/celdas antes de procesar;
ajustar límites y tiempos con pruebas de volumen antes de habilitar la función.

## Estructura de las plantillas

La plantilla generada declara versión de formato, recurso y modo. El servidor
comprueba esos metadatos, los encabezados y las columnas admitidas. Catálogos
ofrece referencias vigentes; el servidor resuelve y verifica sus identificadores.
Las hojas ocultas o protegidas ayudan a capturar, pero no autorizan una operación.

| Recurso / modo | Campos de captura |
| --- | --- |
| Alta de materiales | Nombre, código de proveedor, presentación, unidad, base y altura cuando corresponden, cantidad inicial, stock mínimo, costo máximo unitario, activo y observaciones. |
| Alta de consumibles | Los mismos campos, sin dimensiones. |
| Alta de mermas | Nombre, proveedor, material de referencia, cantidad inicial, stock mínimo, costo máximo unitario, activo y observaciones. Para Rollo: peso del cono, peso de la merma con cono y peso del rollo completo con cono, en kg. En otras presentaciones: base y altura, en metros. |
| Actualización de materiales / consumibles | Identificadores de material y proveedor, `expectedVersion` de la relación y `expectedMaterialVersion` del material; nombre, stock mínimo, costo máximo unitario y activo. |
| Actualización de mermas | Identificador de merma y `expectedVersion`; nombre, stock mínimo, costo máximo unitario y activo. |

La actualización se descarga con valores e identificadores actuales. No identifica
registros sólo por nombre ni admite crear registros mediante filas sin ID.
Las celdas obligatorias vacías producen error; un vacío no ordena borrar datos.
Las filas sin cambios se muestran y se omiten al confirmar.

Mermas hereda presentación y unidad del material de referencia del proveedor,
que debe estar activo y ser un material de superficie en m². El servidor calcula
las medidas de Rollo y su peso neto. No se importan valores derivados ni se
habilita editar dimensiones, presentación, unidad o pesos fuera del contrato actual.

## Validación y reutilización

| Responsabilidad | Integración necesaria |
| --- | --- |
| Lectura de XLSX | Un lector común, con adaptadores por recurso y modo. Rechazar archivos corruptos, macros, fórmulas y columnas no admitidas; no ejecutar contenido del libro. |
| Transporte | Parser multipart limitado a la ruta de vista previa; autenticar y autorizar antes de cargar el archivo. Mantener el contrato JSON del resto de la API. El filtro `/upload` actual sólo comprueba el tipo y no implementa una importación. |
| Campos y catálogos | Reutilizar validadores, DTO y reglas de dominio. Resolver catálogos por ID o clave inequívoca; comprobar su estado según la operación e informar referencias inexistentes o ambiguas sin crearlas automáticamente. |
| Cantidades y costos | Conservar enteros para Pieza, precisión admitida y costo cero sólo en el alta. Modificar costo máximo desde Almacén, con sus permisos; mantener los rechazos al usar inventario sin costo. |
| Duplicados | Detectar duplicados dentro del archivo y contra la base, usando la identidad de cada recurso. Un alta duplicada no se convierte en una actualización ni en una entrada adicional. |
| Concurrencia | Conservar las versiones exportadas. Revalidar al confirmar; una edición posterior obliga a revisar una nueva plantilla, sin sustituir silenciosamente la versión recibida. |
| Datos compartidos | Nombre y mínimo pertenecen al material; costo y activo a su relación con el proveedor. Agrupar las filas del mismo material, exigir coherencia en sus datos comunes y actualizar éstos una sola vez. |

Los servicios actuales de [materiales](../../../../src/services/warehouse/materials/materialService.js)
y [mermas](../../../../src/services/warehouse/wastes/wasteService.js) abren sus propias
transacciones. Extraer las operaciones internas que reciben `tx`, conservando los
wrappers públicos y sus reglas. La confirmación del lote debe usar una sola
transacción; llamar a los wrappers por fila no proporciona rollback del archivo.
Consumibles conserva su reutilización del servicio de materiales.

El agrupamiento también evita que la primera fila de un material incremente su
versión y provoque un conflicto artificial en las filas de otros proveedores.
La vista previa debe indicar que modificar nombre o mínimo afecta al artículo
compartido, aunque el archivo sólo incluya algunos proveedores.

## Contrato HTTP propuesto

Estas rutas **no están registradas** ni forman parte del OpenAPI vigente.
El servidor admite sólo `materials`, `consumables` y `wastes`, con modos `create`
o `update`, y resuelve identidad y permisos desde la sesión.

| Operación | Petición / resultado |
| --- | --- |
| `GET /api/warehouse/inventory-imports/:resource/template?mode=...` | Descargar XLSX. Para actualizar, aplicar el alcance autorizado de la consulta e incluir IDs y versiones. Exigir los permisos de lectura de costos cuando se incluyen esos valores. |
| `POST /api/warehouse/inventory-imports/:resource/preview?mode=...` | Multipart con un campo `file`. Devolver `importId`, `version`, `expiresAt`, resumen y filas con número, valores anteriores/propuestos, errores y advertencias. Guardar un borrador privado sin cambiar inventario. |
| `POST /api/warehouse/inventory-imports/:id/confirm` | JSON con `expectedVersion` del borrador y `operationId` UUID estable. Usar el borrador del servidor, verificar otra vez permisos y reglas y confirmar el lote. |
| `GET /api/warehouse/inventory-imports/:id` | Consultar resumen y resultado de un lote propio autorizado, sin necesitar el archivo original. |
| `DELETE /api/warehouse/inventory-imports/:id` | Cancelar un borrador todavía no confirmado y eliminar su contenido temporal. No revierte registros ya confirmados. |

Respuestas y fallos reutilizan el formato de errores de la API. Los errores de
captura identifican fila y columna; conflictos de versión o duplicados surgidos
durante la confirmación dejan el lote sin cambios. El frontend no debe enviar
peticiones de escritura independientes por cada fila.

## Persistencia, confirmación y recuperación

Agregar mediante una migración el almacenamiento de borradores y recibos: actor,
recurso, modo, versión de formato y borrador, nombre seguro y hash del archivo,
contenido normalizado temporal, vencimiento, clave/hash de confirmación, resultado
y referencias de los registros afectados. Las restricciones únicas y el bloqueo
del lote deben resolver confirmaciones concurrentes.

La confirmación comprueba todo el lote y ejecuta inventario, movimientos iniciales,
recibo y evidencia de los cambios en la misma transacción. Ante cualquier fallo,
se revierte todo el lote. Al confirmar se retira el contenido temporal y se
conserva el resultado. La clave repetida con otro comando se rechaza; la misma
confirmación ya guardada devuelve su recibo sin volver a generar movimientos.
Comprobar ese recibo antes de volver a validar las versiones consumidas por la
confirmación anterior, manteniendo siempre la autorización sobre el resultado.
El [mecanismo de operaciones de merma](../../../../src/services/warehouse/wastes/wasteOperationService.js)
sirve de referencia, pero hoy sólo cubre ese dominio.

La auditoría HTTP actual se persiste después de `finish`, fuera de la transacción
funcional. No sustituye el recibo del lote. Registrar sólo metadatos del upload en
esa auditoría, nunca el buffer ni todo el libro; el resultado transaccional conserva
actor, fecha, filas, IDs y cambios aplicados con el control de acceso correspondiente.

Una desconexión no demuestra que el lote falló. Consultar su resultado y recuperar
con el mismo `importId`/`operationId`; no crear otra importación automáticamente.
Los recibos deben sobrevivir reinicios y despliegues de Render.

## Archivos y retención

| Elemento | Tratamiento propuesto |
| --- | --- |
| XLSX recibido por el servidor | Procesar en memoria y liberar sus referencias tras analizarlo, también ante rechazo o desconexión. No guardarlo en `public`, `uploads`, Git ni almacenamiento permanente. |
| Archivo temporal si una herramienta lo exige | Directorio privado por operación, nombre generado y borrado en `finally`. Limpiar sólo los huérfanos propios de esa herramienta tras cierres inesperados. El [exportador Excel](../../../../src/utils/reportExcelUtils.js) aporta un patrón de temporales y limpieza. |
| Borrador normalizado | Borrar al confirmar o cancelar. Vencimiento inicial propuesto: 24 horas, configurable; impedir confirmar después de vencer y ejecutar una limpieza periódica real de los vencidos. |
| Recibo e historial | Conservar metadatos, resumen y cambios necesarios para revisión y recuperación, sin guardar el XLSX. Su plazo de retención sigue [pendiente de acuerdo](../../../requirements/vision-scope-and-requirements/10-known-gaps-and-pending-decisions.md); no vincular su borrado al de los borradores. |
| Informe de errores descargable | Generar desde el resultado; limpiar los temporales después de enviarlo. |
| Original y descargas en el equipo del usuario | Permanecen bajo control del usuario. La aplicación no los elimina automáticamente. |

El vencimiento lógico no demuestra que se borraron los datos: la implementación
debe incluir y probar la limpieza programada de borradores. No se necesita conservar
el archivo en un disco de Render para consultar resultados o recuperar un envío.

## Verificación antes de habilitar

Comprobar lectura/plantilla, captura y permisos, duplicados, versiones antiguas,
varios proveedores del mismo material, Pieza con decimales, costo cero y Rollo
con pesos/medidas incompatibles. En integración con una base aislada, provocar un
fallo en una fila tardía y comprobar rollback de inventario, movimientos y recibo.
Probar confirmaciones concurrentes, reintento tras perder la respuesta y reinicio.
Verificar limpieza en éxito, rechazo, cancelación, expiración y cierre inesperado.

Al implementar, actualizar requisitos, OpenAPI, pruebas, documentación técnica y
el procedimiento Vue. Esta propuesta no agrega botones, migraciones ni garantías
disponibles al producto actual.
