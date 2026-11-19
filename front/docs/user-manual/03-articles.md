# Artículos

Abra **Almacén → Artículos**. La **Tabla de Artículos** reúne materiales y consumibles
sin duplicarlos por proveedor. Use la búsqueda, la paginación y el contador para localizar un artículo.

![Listado de artículos sin proveedor ni existencia.](images/11a-articles-list.png)

## Registrar y editar artículos

La tabla incluye materiales y consumibles una vez por identidad, con tipo, presentación, unidad, medidas y stock mínimo. No muestra proveedor, stock, costo ni Activo.

1. Busque el nombre antes de registrar. Pulse **Nuevo artículo**.
2. Capture **Nombre**, seleccione **Tipo**, **Presentación** y **Unidad de medida**.
3. Deje **Base** y **Altura** vacías cuando no apliquen, o capture ambas. KILOGRAMOS y METRO LINEAL fijan `1 × 1` y ocultan estas entradas durante el alta.
4. El **Stock mínimo** es opcional; sin umbral se usa `0`. Pulse **Guardar**. El alta no crea proveedor, existencia ni movimiento.
5. Para editar, pulse **Editar registro**. Si el artículo no tiene proveedores vinculados, todos sus campos están habilitados. Con un proveedor vinculado, sólo puede cambiar **Nombre** y **Stock mínimo**; tipo, presentación, unidad y medidas quedan protegidos. Pulse **Actualizar**. El nombre actualizado aparece en Existencias y en las partidas nuevas. Las partidas registradas conservan su nombre, tipo y medidas originales si se corrige la ficha. El stock mínimo se comparte entre todas las ofertas del artículo.

6. Use **Eliminar artículo** para retirar un registro sin proveedores vinculados ni historial de inventario. Revise el nombre y confirme la baja.

Una compra o salida registrada impide retirar el vínculo de esa oferta, aunque el saldo
llegue a cero o el documento se cancele. Para dejar de usarla en operaciones nuevas,
desmarque **Activo** desde **Editar oferta** en Existencias. Las partidas históricas
conservan su artículo, proveedor y especificaciones.

Si necesita cambiar la presentación, unidad o medidas de un artículo con proveedor vinculado, registre otro artículo con los datos correctos. En Catálogos, una presentación o unidad vinculada conserva su nombre y, cuando aplica, su símbolo. Se puede cambiar su estado.

Almacén y Sistemas acceden a esta sección según su rol. El proveedor se vincula al registrar el artículo en Almacén o confirmar una compra; los ajustes de stock se realizan en Almacén. Si otro usuario modificó el artículo, actualice el catálogo y vuelva a abrir la edición.

![Formulario de alta de un artículo.](images/12a-article-form.png)

Para registrar existencias, vincular proveedores o ajustar stock, utilice
**Existencias de materiales** o **Existencias de consumibles**. Proveedores continúa
en **Directorio comercial** y las clasificaciones auxiliares en **Catálogos**.
