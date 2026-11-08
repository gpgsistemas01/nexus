# 5. Importación de inventario por Excel

**Importar Excel** está disponible en Materiales, Consumibles y Mermas para cuentas
con lectura y capacidad de alta/edición o de ajuste. Alta/edición exige escritura y
lectura de costos; el conteo exige el permiso de ajuste. Cada fila conserva su permiso.
Comparte formulario, servicio y recuperación entre los tres módulos.

## Un archivo para altas, ediciones y ajustes

El diálogo descarga la plantilla mixta (`mode=mixed`) del inventario actual.
No es necesario dividir el trabajo en archivos de alta, edición y ajuste.

| Valor de `operacion` | Tratamiento |
| --- | --- |
| Alta | ID vacío; crea identidad/oferta y existencia inicial. |
| Editar | Conserva IDs/versiones; cambia nombre, mínimo, costo y activo, sin stock. |
| Ajustar | Conserva IDs/versiones; reemplaza el saldo por el conteo físico final. |
| Editar y ajustar | Cambia datos y saldo en la misma fila/transacción. |
| Conservar | No aplica cambios; es el valor inicial de las filas descargadas. |

`stock_contado_o_inicial` contiene existencia inicial en Alta y saldo físico final
en Ajustar o Editar y ajustar. Editar lo deja vacío. En ajuste, cero es válido;
vacío se rechaza. Motivo activo y observaciones son obligatorios al ajustar.
Las columnas grises de IDs/versiones y saldos de referencia se conservan.
Nombre y mínimo son comunes entre proveedores. Edición conserva identidad y medidas.
Pieza exige enteros; un alta sin costo avisa que no podrá surtirse hasta configurarlo.

## Recorrido

1. Abrir **Importar Excel** y filtrar los registros/proveedor y página de la plantilla.
2. Descargarla: hasta 100 filas existentes por página, inicialmente Conservar.
   Puede contener sólo altas si la consulta no tiene registros. Para referencias
   de alta de merma, seleccionar proveedor antes de descargar.
3. Indicar operación por fila y completar valores; las altas dejan vacío el ID.
4. Conservar hojas/encabezados, seleccionar el `.xlsx` y pulsar **Validar archivo**.
5. Revisar diez filas por página, sus datos anteriores/finales, diferencias y errores.
6. Si hay errores, descargarlos, descartar el borrador, corregir el archivo y validarlo.
7. **Confirmar importación** guarda todo junto y muestra el recibo; **Otro archivo** reinicia.

Un mismo registro sólo ocupa una fila. Para editarlo y contarlo se elige Editar y ajustar.
El [procedimiento de conciliación](06-inventory-reconciliation.md) explica el conteo
actual y el tratamiento de salidas antiguas entregadas.

## Duplicados y resultado

Se revisan las identidades dentro del Excel y contra lo registrado:

| Recurso | Identidad para detectar repetidos |
| --- | --- |
| Materiales | Nombre, presentación, unidad y medidas, junto con el proveedor de la relación. |
| Consumibles | Nombre, presentación y unidad, junto con el proveedor de la relación. |
| Mermas | Proveedor, nombre, medidas y pesos de cono/total cuando correspondan. |

Cambiar costo o cantidad inicial no convierte un registro existente en uno nuevo.
Un mismo material con otro proveedor puede crear esa relación sin duplicar el material.

Si una fila está repetida o tiene errores, **no se aplica ninguna fila**. La vista
previa señala fila/columna y, para repetidos internos, la primera fila coincidente.
Corregir o retirar los repetidos, descartar el borrador y volver a validar.
Las filas sin cambios de una actualización se omiten al confirmar.

Un duplicado surgido después de validar también bloquea el lote completo.

## Código y transporte

`InventoryPage` carga `InventoryImportPage` al abrir la función y pausa la recarga
automática del listado. `useInventoryImport` coordina el estado; el componente
`InventoryImportDialog` recibe datos y emite acciones. `EditorDialog` conserva foco,
carga y presentación de pantalla completa en móvil.

`inventoryImportService` reutiliza `apiClient`, validación de confirmaciones,
`requestExcel` y `useFileExport`. Envía `FormData` sólo en la vista previa; el navegador
establece su boundary. Confirmar envía una sola petición JSON con `expectedVersion`
y `operationId`, sin escrituras por fila. El contrato de respuesta se comprueba
antes de mostrar éxito. Un `200` incompleto no confirma la importación.

Los límites públicos se comparten por `@nexus/inventory-imports`: 2 MiB y 100 filas.
El navegador comprueba tamaño/extensión; Express valida el contenido y las reglas.
Las plantillas de actualización se descargan por páginas y sus catálogos se acotan.
SheetKit analiza el libro en el backend; Vue sólo transmite el archivo y muestra
la vista previa.

## Recuperación y archivos

Antes de confirmar se guarda sólo `{ id, expectedVersion, operationId }` en una clave
local separada por cuenta y recurso. No contiene archivo, filas ni costos. Si se pierde
la respuesta, **Revisar y reintentar confirmación** consulta el mismo lote: recupera
su recibo si terminó o repite la misma confirmación si sigue pendiente. No crea otra
importación. **Descartar borrador** queda condicionado por el estado del servidor.

El archivo subido y el Excel de errores sólo existen en memoria durante su procesamiento
o envío; no dejan copias en disco del servidor. El borrador de datos/errores vence en
24 horas; confirmar, descartar o limpiar su vencimiento elimina el contenido temporal.
El recibo confirmado permanece en la base. El usuario decide cuándo borrar su original
y sus descargas locales.

El [backend](../../../back/docs/architecture/views/development/inventory-excel-import.md)
documenta atomicidad, permisos, limpieza y límites de ejecución. El contrato HTTP
completo es [OpenAPI](../../../back/docs/architecture/openapi/index.md).
Los [comandos de comprobación](00-commands.md#pruebas) reúnen las pruebas y el benchmark.
