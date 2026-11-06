# 3. Materiales

## Consultar existencias

Abra **Almacén → Materiales**. **Tabla de Existencias** muestra material, proveedor,
presentación, unidad y stock. Las columnas agrupadas distinguen dimensiones y conversión.
Busque y filtre para localizar el registro correcto.

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
