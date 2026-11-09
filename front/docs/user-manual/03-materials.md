# 3. Materiales

## Consultar existencias

Abra **Almacén → Materiales**. **Tabla de Existencias** muestra material, proveedor,
presentación, unidad y stock. Las columnas agrupadas distinguen dimensiones y conversión.
Busque y filtre para localizar el registro correcto.

<!-- manual:any materials:write materials:adjust-stock -->
## Importar materiales o consumibles desde Excel

1. En el módulo correspondiente, pulse **Importar Excel**.
2. En **Operación del archivo**, elija **Alta**, **Editar datos** o **Ajustar existencias**. Todas las filas harán esa operación.
3. Filtre proveedor/nombre y página; pulse **Descargar plantilla**.
4. Complete los campos de captura sin cambiar hojas, encabezados ni columnas grises.
5. Seleccione la misma operación y el `.xlsx`; pulse **Validar archivo** y revise cambios, cantidades y errores.
6. Si hay errores, descárguelos, pulse **Descartar borrador**, corrija el original y vuelva a validarlo.
7. Pulse **Confirmar importación** y espere el recibo. Use **Otro archivo** para continuar.

Las columnas iniciales tienen los mismos nombres y orden que el reporte de consulta:
Proveedor, Material, Base, Altura, Stock actual, Stock mínimo, Presentación,
Conversión, Unidad y Costo unitario. El ajuste omite el costo. Al final se añaden
Activo, IDs/versiones y los campos propios de la operación. Para cargar cambios use
la plantilla operativa; el Excel de consulta conserva su función de reporte.

En Alta seleccione el proveedor del catálogo y capture **Cantidad inicial**. El
sistema genera el ID nuevo. Para Editar datos y Ajustar existencias, la descarga
incluye IDs/versiones automáticamente según su permiso, sin exigir ser administrador.
Consérvelos: permiten cambiar el nombre sin crear otro artículo. En ajuste, capture
el saldo físico final en **Stock contado**, motivo y observaciones. Cero es válido y
vacío se rechaza. Stock actual y Conversión son referencias.

Un archivo tiene una operación. Para editar y ajustar, complete primero una operación
y descargue una plantilla actual para la siguiente. Cambiar de operación retira el
archivo seleccionado; un Excel de otra operación se rechaza.

Un duplicado o error bloquea **todo el archivo**: todavía no se guarda ninguna fila.
**Descargar errores** indica cuáles corregir o retirar antes de volver a validar.

Máximo: 100 filas y 2 MiB. Actualizar cambia nombre, mínimo, costo y activo; conserva
existencias y medidas. Nombre y mínimo se comparten entre proveedores. Pieza exige
enteros. Un alta sin costo no podrá usarse en salidas hasta configurar un costo positivo.
Si se pierde la respuesta, vuelva a **Importar Excel** y pulse **Revisar y reintentar
confirmación**. No suba otra alta para repetirla. El borrador vence en 24 h; el archivo
de su equipo permanece bajo su control.
<!-- manual:end -->

![Tabla de existencias de materiales con filtros y acciones.](images/03-materials-list.png)

![Vista de materiales adaptada a un teléfono.](images/03a-material-mobile.png)

<!-- manual:any materials:write -->
## Registrar un material

**Antes de empezar.** Identifique proveedor, presentación y unidad del artículo.

1. Pulse **Nuevo material** para abrir **Crear material**.
2. Complete los campos de la tabla siguiente.
3. Revise la presentación, unidad y cantidad inicial.
4. Pulse **Guardar** y espere la confirmación.
5. Localice el material en el listado y compruebe sus datos y existencias.

| Campo | Cómo utilizarlo |
| --- | --- |
| Nombre | Identifique el material de forma reconocible para otros operadores. |
| Proveedor | Seleccione el proveedor del registro. |
| Presentación | Seleccione cómo se maneja el artículo, por ejemplo un rollo. |
| Unidad de medida | Elija la unidad de su conversión o control. |
| Base (m), Altura (m) | Capture las dimensiones cuando la unidad del material las requiera. |
| Stock mínimo | Indique el umbral de referencia del inventario. |
| Costo máximo unitario | Capture el costo correspondiente al campo, sin sustituirlo por el total de una compra. |
| Activo | Manténgalo marcado si el artículo debe estar disponible para la operación. |
| Cantidad inicial | Capture la existencia con la que comienza este registro. |
| Observaciones | Explique la captura inicial cuando corresponda. |

![Formulario para crear un material.](images/04-material-create.png)

Desde una compra se omiten cantidad inicial y costo máximo. La recepción registra
la existencia; el costo máximo se configura en **Almacén**. No duplique la entrada.
<!-- manual:end -->

<!-- manual:any materials:write -->
## Editar datos

1. Localice el registro y pulse **Editar**.
2. Revise los datos cargados y modifique únicamente los campos habilitados.
3. Pulse **Guardar** y compruebe el registro actualizado.

Proveedor, presentación, unidad y medidas son de consulta. Editar conserva el
saldo. Si necesita cambiar la identidad del artículo, consulte al responsable del inventario.
<!-- manual:end -->

<!-- manual:any materials:adjust-stock -->
## Ajustar el saldo

**Antes de confirmar.** El ajuste reemplaza el saldo. Compruebe el conteo y el
motivo; las recepciones se registran en Compras.

1. Pulse **Ajustar stock** en el registro correcto.
2. Compruebe **Stock actual** y **Cantidad convertida actual**.
3. Seleccione **Motivo del ajuste**.
4. En **Nuevo stock**, escriba el saldo final que debe quedar y capture las
   **Observaciones** que explican la corrección.
5. Pulse **Guardar**, confirme si se solicita y compruebe el nuevo saldo.

![Ajuste de existencias con saldo actual, motivo y nuevo saldo.](images/05-material-stock.png)

Si hay 10 unidades y el conteo correcto es 12, capture **12** en **Nuevo stock**.
Compruebe el historial en **Movimientos → Materiales**. Ante un conflicto, siga
[Errores y recuperación](15-errors-and-recovery.md#conflictos-de-edición).
<!-- manual:end -->

<!-- manual:any materials:write -->
## Retirar un registro

**Antes de eliminar.** Revise nombre y proveedor en la confirmación. Eliminar la
última relación con un proveedor también puede eliminar el material. Sus relaciones
o historial pueden impedirlo.

Desmarcar **Activo** conserva el registro y su historia para consulta.
<!-- manual:end -->

<!-- manual:any warehouse:reports-read -->
## Descargar el inventario

Revise los filtros y pulse **Exportar Excel**. El archivo incluye todos los
resultados de la consulta.
<!-- manual:end -->
