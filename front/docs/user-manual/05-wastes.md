# 5. Mermas

<!-- manual:any wastes:write wastes:adjust-stock -->
## Importar desde Excel

Cada Excel representa una operación elegida en **Operación del archivo**: **Alta**,
**Editar datos** o **Ajustar existencias**. Las primeras columnas siguen el orden del
inventario de consulta. Los registros operativos son individuales aunque el reporte
agrupa totales. Después se añaden los IDs/versiones y los campos necesarios.

1. Pulse **Importar Excel** y seleccione la operación para todo el archivo.
2. En Alta, seleccione proveedor y descargue la plantilla con sus materiales de referencia en m². En edición o ajuste, filtre los registros actuales y descargue sus IDs/versiones.
3. Capture los datos de la operación. En Alta de Rollo use cono, merma con cono y rollo completo con cono, en kg; el sistema calcula las medidas.
4. Seleccione la misma operación y el archivo; pulse **Validar archivo**. Revise los datos y errores.
5. Corrija los errores en el original, descarte el borrador y vuelva a validar.
6. Pulse **Confirmar importación** y espere el recibo.

El ID de la nueva merma lo genera el sistema. Seleccione el material de referencia
de la lista; la opción ya incluye su ID. En edición y ajuste conserve los IDs/versiones
que se descargan automáticamente para quien tiene el permiso, sin exigir ser administrador.
La edición conserva stock. El ajuste captura **Stock contado**, motivo y observaciones;
cero es válido y vacío se rechaza. En Alta se usa **Cantidad inicial**.
Para cambiar datos y stock, complete dos operaciones con una descarga actual después
de la primera. Cambiar la operación retira el archivo seleccionado.

Si una fila está repetida o es inválida, **no se aplica ninguna fila**. Descargue
los errores, corrija o retire los repetidos y vuelva a validar. Un alta repetida no suma stock.

Máximo: 100 filas y 2 MiB. Actualizar sólo cambia nombre, mínimo, costo y activo;
conserva stock, medidas y pesos. Para entradas posteriores use **Agregar stock**.
Si se pierde la respuesta, pulse **Revisar y reintentar confirmación** desde la
misma opción de importación. El borrador vence en 24 h; el archivo de su equipo no se elimina.
<!-- manual:end -->

## Consultar una merma

Abra **Almacén → Mermas**. Busque por nombre y proveedor y revise medidas, cantidad y
conversión. **Detalles de peso** muestra los pesos guardados cuando están disponibles;
**Cerrar detalles** termina esa consulta.

![Tabla de mermas con sus medidas y existencias.](images/08-wastes-list.png)

<!-- manual:any wastes:write -->
## Registrar una merma

**Antes de empezar.** Debe existir el material de referencia del proveedor. Para
un rollo necesita el peso del rollo completo con cono y los pesos de la merma.
Tome los pesos en kilogramos y las medidas en metros.

1. Pulse **Nueva merma** para abrir **Crear merma**.
2. Seleccione **Proveedor** y después **Material de referencia del proveedor**.
3. Escriba **Nombre de la merma**. Revise presentación y unidad heredadas.
4. Complete los pesos o las medidas habilitadas según la presentación.
5. Revise la vista previa de las medidas calculadas.
6. Capture **Stock mínimo**, **Costo máximo unitario**, **Activo**,
   **Cantidad inicial** y **Observaciones**, según corresponda.
7. Pulse **Guardar** una sola vez y compruebe el registro y su existencia.

| Campo para rollos | Significado |
| --- | --- |
| Peso del rollo completo con cono (kg) | Peso de la muestra completa del material de origen. Incluye el cono. |
| Peso del cono de la merma (kg) | Peso del cono que se descuenta para obtener el peso neto. |
| Peso de la merma con cono (kg) | Peso total de una unidad de la merma, incluido su cono. |
| Peso neto de la merma (kg) | Resultado de consulta; no se captura como un total independiente. |
| Base (m), Altura (m) | Se calculan para rollos; en otros casos se capturan cuando están habilitadas. |
| Cantidad inicial | Número de unidades de esa merma, distinto del peso por unidad. |

![Selección del material de origen e identidad de la merma.](images/09-waste-create.png)

![Referencia del rollo, pesos y medidas calculadas de la merma.](images/09a-waste-measurements.png)

![Existencia inicial y observaciones de la merma antes de guardar.](images/09b-waste-stock.png)

Capture el peso de una sola merma. Los pesos con cono deben superar el peso del
cono. Revise las medidas calculadas antes de guardar.
<!-- manual:end -->

<!-- manual:any wastes:add-stock -->
## Merma existente y entradas adicionales

Si aparece una merma existente, compruebe su identidad antes de continuar.

**Antes de confirmar.** La entrada suma unidades al saldo. No repita una cantidad
ya registrada; compruebe el resultado si se interrumpió el envío.

Para una entrada posterior, use **Agregar stock** cuando esté disponible en el registro:

1. Compruebe el nombre y las características de la merma.
2. En **Cantidad a agregar**, capture la entrada positiva.
3. Explique la entrada en **Observaciones** y pulse **Guardar**.
4. Compruebe el saldo incrementado y el movimiento correspondiente.

![Entrada adicional a una merma existente.](images/10-waste-add-stock.png)

Use esta acción para unidades que ingresan. Si el conteo físico difiere del saldo,
avise al responsable del inventario.
<!-- manual:end -->

<!-- manual:any wastes:write -->
## Editar datos

Use **Editar** para los campos habilitados. Identidad, medidas y pesos se conservan
como consulta. **Referencia histórica** muestra la muestra guardada; no debe recapturarla.
<!-- manual:end -->

<!-- manual:any wastes:adjust-stock -->
## Ajustar el saldo

El ajuste reemplaza el saldo con un conteo comprobado. Para recibir otras unidades,
use **Agregar stock**.

1. Localice la merma y pulse **Ajustar stock**.
2. Compruebe nombre, proveedor, medidas y **Stock actual**.
3. Seleccione **Motivo del ajuste**.
4. Capture en **Nuevo stock** la cantidad total que debe quedar. Puede ser cero;
   no escriba la diferencia que desea sumar o restar.
5. Explique la corrección en **Observaciones** y pulse **Guardar**.
6. Espere la confirmación, compruebe el saldo y consulte su movimiento cuando tenga acceso.

El ajuste conserva identidad y pesos. Ante un conflicto, siga
[Errores y recuperación](15-errors-and-recovery.md#conflictos-de-edición).
<!-- manual:end -->

<!-- manual:any warehouse:reports-read -->
## Descargar el inventario

Revise la búsqueda y el proveedor, seleccione **Incluir en Excel** y pulse
**Exportar Excel**. En Mermas, el proveedor elegido sí delimita el archivo.
Revise cantidades y pesos; un peso desconocido no es cero. Las opciones de inclusión
se explican en [Reportes](14-reports.md).
<!-- manual:end -->

<!-- manual:any wastes:write wastes:add-stock -->
## Recuperar una captura pendiente

Pulse **Recuperar captura** para comprobar el envío anterior. Conserve sus datos y
evite abrir otra alta. Si el servicio no responde, consulte
[Errores y recuperación](15-errors-and-recovery.md).
<!-- manual:end -->
