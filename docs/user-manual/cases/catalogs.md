# Casos: Catálogos e inventario

Cada procedimiento identifica sus casos de uso, controles, errores posibles y captura de referencia.

## Catálogos auxiliares

**Propósito.** Consultar, crear y editar las opciones auxiliares que configuran otros flujos del sistema.

**Ruta en el menú:** **Menú principal → Catálogos auxiliares →** elija **Áreas**, **Roles**, **Presentaciones**, **Unidades de medida**, **Motivos de ajuste** o **Estados de cumplimiento**.

**Casos de uso:** Áreas: `CU-CAT-31` a `CU-CAT-33`; Roles: `CU-CAT-34` a `CU-CAT-36`; Presentaciones: `CU-CAT-37` a `CU-CAT-39`; Unidades de medida: `CU-CAT-40` a `CU-CAT-42`; Motivos de ajuste: `CU-CAT-43` a `CU-CAT-45`; Estados de cumplimiento: `CU-CAT-46` a `CU-CAT-48`. Cada rango corresponde, en orden, a consultar, crear y editar.

**Acceso:** estas pantallas y sus escrituras son exclusivas del administrador del sistema del área Sistemas. Que un rol, área, presentación, unidad, motivo o estado aparezca en un selector operativo no concede acceso a su mantenimiento.

Cada opción abre una pantalla propia con la tabla del recurso seleccionado. **Clientes** y
**Proveedores** también son catálogos comerciales, pero no se administran desde este recorrido:
conservan módulos, formularios, permisos y reglas independientes.

1. Seleccione el catálogo requerido en el submenú y revise que el encabezado corresponda al recurso que desea modificar.
2. Para registrar una entrada, seleccione **Nueva área**, **Nuevo rol**, **Nueva presentación**, **Nueva unidad de medida**, **Nuevo motivo de ajuste** o **Nuevo estado de cumplimiento**, según la pantalla, y complete **Nombre** (máximo 50 caracteres para Áreas, Roles, Presentaciones y Estados de cumplimiento; 20 para Unidades de medida; 100 para Motivos de ajuste). Complete también **Símbolo** —máximo 10— sólo para Unidades de medida, revise la casilla **Activo** y seleccione **Guardar**.
3. Para modificar una entrada, seleccione **Editar registro** en su fila, cambie únicamente los campos habilitados —incluido **Activo**— y seleccione **Actualizar**. Una entrada inactiva permanece en esta tabla para poder consultarla o reactivarla, pero deja de ofrecerse en formularios operativos nuevos.
4. Compruebe que la tabla de esa misma pantalla muestre el resultado antes de continuar con otro catálogo.

El estado **Activo** se controla dentro del mismo formulario: no existe una acción rápida fuera
del modal, porque el cambio debe confirmarse junto con los demás datos mediante **Guardar** o
**Actualizar** y puede descartarse con **Regresar**. El encabezado identifica el catálogo que se
está registrando o editando.

**Errores posibles:** [Validación de formularios](../error-messages.md#errores-validacion), [Acceso y autorización](../error-messages.md#errores-acceso), [Catálogos e inventario](../error-messages.md#errores-catalogos).

## Materiales e inventario

**Propósito.** Consultar el inventario, registrar o editar materiales y ajustar existencias.

**Ruta en el menú:** **Menú principal → Almacén → Materiales**.

<a id="CAP-CAT-MAT-00-NAVIGATION"></a>
![CAP-CAT-MAT-00-NAVIGATION: acceso a materiales desde el menú principal](../images/materiales/00-acceso-menu-principal.png)

**Qué significa identidad y estado.** La identidad de un material es la combinación de
**Nombre**, **Presentación**, **Unidad**, **Base** y **Altura** que permite reconocer el mismo
artículo. **Proveedor** pertenece a una relación de inventario separada, por lo que una misma
identidad puede estar asociada con proveedores distintos. **Stock Mínimo**, **Costo Máximo**,
existencia y **Activo** no forman parte de la identidad. Desmarcar **Activo** conserva el material,
su relación con el proveedor, su existencia y su historia. Ya no puede incorporarse a una compra,
salida o relación nueva. Si estaba incluido en una salida antes de desactivarlo, todavía puede
surtirse el pendiente para completar ese compromiso, siempre que haya existencia suficiente. En
los reportes, **Sólo activos** lo excluye, mientras **Sólo con existencia** puede incluirlo si aún
conserva stock. Volver a marcarlo permite usarlo nuevamente en operaciones nuevas.

<a id="CAP-CAT-MAT-01-LIST"></a>
### CAP-CAT-MAT-01-LIST — Listado inventario

**Casos de uso:** `CU-AUT-02` — Cerrar sesión; `CU-CAT-01` — Consultar materiales; `CU-CAT-06` — Consultar inventario de materiales; `CU-CAT-07` — Generar reporte de inventario de materiales.

**Errores posibles:** [Catálogos e inventario](../error-messages.md#errores-catalogos).

**Controles que debe usar:** Buscador **Buscar por Material**, filtro **Proveedor**, botones **Buscar / filtrar**, **Limpiar filtros**, **Exportar Excel** y **Nuevo material**, además de las acciones de cada fila.

1. Abra **Filtros** y compruebe que los controles desplegados coincidan con la captura:

   ![CAP-CAT-MAT-01-LIST: listado inventario](../images/materiales/01-listado-inventario.png)

2. Escriba un término en el buscador **Buscar por Material** o elija una opción en el filtro **Proveedor**.
3. Seleccione el botón **Buscar / filtrar** para actualizar la tabla; use **Limpiar filtros** para restablecerla.
4. En la tabla, seleccione **Nuevo material**, **Exportar Excel**, **Editar registro** o **Ajustar stock**, según la operación requerida.

La columna **Activo**, ubicada antes de **Acciones**, se muestra en la tabla únicamente al
administrador del sistema; los demás usuarios autorizados consultan el inventario sin esa columna.

### CAP-REP-MAT-05-EXPORT — Exportar inventario

**Casos de uso:** `CU-CAT-07` — Generar reporte de inventario de materiales.

1. Seleccione **Exportar Excel** y compruebe el modal:

   ![CAP-REP-MAT-05-EXPORT: alcance del inventario](../images/materiales/05-exportar-reporte.png)

2. Elija **Activos o con existencia**, **Sólo activos** o **Sólo con existencia** y seleccione **Descargar**.

<a id="CAP-CAT-MAT-02-CREATE"></a>
### CAP-CAT-MAT-02-CREATE — Formulario alta

**Casos de uso:** `CU-CAT-02` — Crear material; `CU-CAT-27` — Consultar presentaciones; `CU-CAT-28` — Consultar unidades de medida.

**Errores posibles:** [Validación de formularios](../error-messages.md#errores-validacion), [Catálogos e inventario](../error-messages.md#errores-catalogos).

**Campos editables en modo alta:** **Nombre**, **Buscar proveedor...**, **Buscar presentación...**,
**Buscar unidad...**, **Stock Mínimo**, **Costo Máximo**, **Base**, **Altura**, **Nueva cantidad**,
**Observaciones** y **Activo**. La razón **Stock inicial** es automática. Use **Nuevo material** para
abrir el formulario y **Guardar** para confirmarlo.

1. Seleccione el botón **Nuevo material** para abrir el formulario de alta. Antes de continuar, compruebe que la pantalla mostrada coincida con la captura:

   ![CAP-CAT-MAT-02-CREATE: formulario alta](../images/materiales/02-formulario-alta.png)

2. Complete **Nombre**; elija opciones en **Buscar proveedor...**, **Buscar presentación...** y **Buscar unidad...**; capture **Stock Mínimo**, **Costo Máximo**, **Base**, **Altura**, **Nueva cantidad** y **Observaciones**, y revise la casilla **Activo**.
3. Seleccione el botón **Guardar** para registrar el material.

Si ya existe la misma combinación de nombre, presentación, unidad, dimensiones y proveedor, Nexus
rechaza el alta: localice el material existente y use **Ajustar stock**; **Nueva cantidad** representa
la existencia total que debe quedar, no una cantidad que se sume. Si la identidad ya existe para
otro proveedor, Nexus reutiliza el material y crea la relación de inventario con el proveedor
seleccionado.

<a id="CAP-CAT-MAT-03-EDIT"></a>
### CAP-CAT-MAT-03-EDIT — Formulario edicion

**Casos de uso:** `CU-CAT-03` — Editar material; `CU-CAT-04` — Retirar material.

**Errores posibles:** [Validación de formularios](../error-messages.md#errores-validacion), [Catálogos e inventario](../error-messages.md#errores-catalogos).

**Campos editables en modo edición:** **Nombre**, **Stock Mínimo**, **Costo Máximo** y **Activo**.
**Proveedor**, **Presentación**, **Unidad**, **Base**, **Altura** y la existencia no se pueden editar en
este modo. Use la acción **Editar registro** y el botón **Actualizar**.

1. En la fila del material, seleccione la acción **Editar registro** para abrir el formulario. Antes de continuar, compruebe que la pantalla mostrada coincida con la captura:

   ![CAP-CAT-MAT-03-EDIT: formulario edicion](../images/materiales/03-formulario-edicion.png)

2. Modifique **Nombre**, **Stock Mínimo**, **Costo Máximo** o **Activo** según corresponda. Revise los
   demás datos sólo como referencia.
3. Seleccione el botón **Actualizar** para guardar los cambios.

<a id="CAP-CAT-MAT-04-STOCK"></a>
### CAP-CAT-MAT-04-STOCK — Ajuste existencia

**Casos de uso:** `CU-CAT-05` — Ajustar existencia de material; `CU-CAT-29` — Consultar motivos de ajuste.

**Errores posibles:** [Validación de formularios](../error-messages.md#errores-validacion), [Catálogos e inventario](../error-messages.md#errores-catalogos).

**Campos editables en modo ajuste:** **Seleccione una razón...**, **Nueva cantidad** y
**Observaciones**. Los datos de identidad y catálogo quedan sólo para consulta. Use la acción
**Ajustar stock** y el botón **Ajustar**.

1. En la fila del material, seleccione la acción **Ajustar stock**. Antes de continuar, compruebe que la pantalla mostrada coincida con la captura:

   ![CAP-CAT-MAT-04-STOCK: ajuste existencia](../images/materiales/04-ajuste-existencia.png)

2. Elija una opción en **Seleccione una razón...** y complete los campos **Nueva cantidad** y **Observaciones**.

   🟨 **ADVERTENCIA:** **Nueva cantidad** sustituye la existencia actual; no es una cantidad que
   Nexus agregará al inventario.

3. Revise el efecto sobre la existencia y seleccione el botón **Ajustar**.

Al finalizar, vuelva al listado y confirme que la existencia mostrada sea exactamente la cantidad
capturada. Si no puede confirmarlo, actualice el listado antes de intentar otro ajuste.

## Proveedores

**Propósito.** Consultar y mantener el catálogo de proveedores.

**Ruta en el menú:** **Menú principal → Proveedores**.

<a id="CAP-CAT-SUP-00-NAVIGATION"></a>
![CAP-CAT-SUP-00-NAVIGATION: acceso a proveedores desde el menú principal](../images/proveedores/00-acceso-menu-principal.png)

La casilla **Activo** controla el estado del proveedor dentro del mismo formulario de alta o
edición. Desmarcarla no elimina el proveedor ni sus materiales o documentos históricos; volver a
marcarla lo reactiva. Este cambio no es un ajuste de stock.

<a id="CAP-CAT-SUP-01-LIST"></a>
### CAP-CAT-SUP-01-LIST — Listado

**Casos de uso:** `CU-CAT-10` — Consultar proveedores; `CU-CAT-14` — Generar reporte de proveedores.

**Errores posibles:** [Catálogos e inventario](../error-messages.md#errores-catalogos).

**Controles que debe usar:** Buscador **Buscar por Nombre comercial o Razón social**, botones **Exportar Excel** y **Nuevo proveedor**, y acción **Editar registro** de cada fila.

1. Antes de usar los controles, compruebe que la pantalla inicial coincida con la captura:

   ![CAP-CAT-SUP-01-LIST: listado](../images/proveedores/01-listado.png)

2. Escriba un término en el buscador **Buscar por Nombre comercial o Razón social** para localizar un proveedor.
3. En la tabla, seleccione **Nuevo proveedor**, **Exportar Excel** o la acción **Editar registro** de una fila.
4. Si selecciona **Exportar Excel**, Nexus abre el modal **Exportar reporte**. Confirme que se aplicarán la búsqueda, los filtros y el orden actuales; seleccione **Descargar** para continuar o cierre el modal para cancelar.

   <a id="CAP-CAT-SUP-04-EXPORT"></a>
   ![CAP-CAT-SUP-04-EXPORT: modal para exportar proveedores](../images/proveedores/04-exportar-reporte.png)

La columna **Activo**, ubicada antes de **Acciones**, se muestra en el listado únicamente al
administrador del sistema.

<a id="CAP-CAT-SUP-02-CREATE"></a>
### CAP-CAT-SUP-02-CREATE — Formulario alta

**Casos de uso:** `CU-CAT-11` — Crear proveedor.

**Errores posibles:** [Validación de formularios](../error-messages.md#errores-validacion), [Catálogos e inventario](../error-messages.md#errores-catalogos).

**Controles que debe usar:** Botón **Nuevo proveedor**; campos **Razón social**, **Nombre comercial** y **Teléfono**; casilla **Activo** y botón **Guardar**.

1. Seleccione el botón **Nuevo proveedor** para abrir el formulario de alta. Antes de continuar, compruebe que la pantalla mostrada coincida con la captura:

   ![CAP-CAT-SUP-02-CREATE: formulario alta](../images/proveedores/02-formulario-alta.png)

2. Complete los campos **Razón social**, **Nombre comercial** y **Teléfono**, y revise la casilla **Activo**.
3. Seleccione el botón **Guardar** para registrar el proveedor.

<a id="CAP-CAT-SUP-03-EDIT"></a>
### CAP-CAT-SUP-03-EDIT — Formulario edición y estado

**Casos de uso:** `CU-CAT-12` — Editar proveedor; `CU-CAT-13` — Cambiar estado de proveedor.

**Errores posibles:** [Validación de formularios](../error-messages.md#errores-validacion), [Catálogos e inventario](../error-messages.md#errores-catalogos).

**Controles que debe usar:** Acción **Editar registro**; campos **Razón social**, **Nombre comercial** y **Teléfono**; casilla **Activo** y botón **Actualizar**.

1. En la fila del proveedor, seleccione la acción **Editar registro**. Antes de continuar, compruebe que la pantalla mostrada coincida con la captura:

   ![CAP-CAT-SUP-03-EDIT: formulario edicion y estado](../images/proveedores/03-formulario-edicion-y-estado.png)

2. Modifique los campos **Razón social**, **Nombre comercial** o **Teléfono** necesarios y revise la casilla **Activo**.
3. Seleccione el botón **Actualizar** para guardar los cambios.

## Clientes

**Propósito.** Consultar y mantener el catálogo de clientes.

**Ruta en el menú:** **Menú principal → Clientes**.

La casilla **Activo** permite retirar un cliente de las selecciones de operaciones nuevas sin
eliminarlo ni perder sus salidas históricas. La pantalla de Clientes sigue mostrando ambos estados
para que el administrador pueda revisarlos o reactivarlos.

<a id="CAP-CAT-CLI-00-NAVIGATION"></a>
![CAP-CAT-CLI-00-NAVIGATION: acceso a clientes desde el menú principal](../images/clientes/00-acceso-menu-principal.png)

<a id="CAP-CAT-CLI-01-LIST"></a>
### CAP-CAT-CLI-01-LIST — Listado

**Casos de uso:** `CU-CAT-15` — Consultar clientes; `CU-CAT-18` — Generar reporte de clientes.

**Errores posibles:** [Catálogos e inventario](../error-messages.md#errores-catalogos).

**Controles que debe usar:** Buscador **Buscar por Nombre**, botones **Exportar Excel** y **Nuevo cliente**, y acción **Editar registro** de cada fila.

1. Antes de usar los controles, compruebe que la pantalla inicial coincida con la captura:

   ![CAP-CAT-CLI-01-LIST: listado](../images/clientes/01-listado.png)

2. Escriba un término en el buscador **Buscar por Nombre** para localizar un cliente.
3. En la tabla, seleccione **Nuevo cliente**, **Exportar Excel** o la acción **Editar registro** de una fila.
4. Si selecciona **Exportar Excel**, Nexus abre el modal **Exportar reporte**. Confirme que se aplicarán la búsqueda, los filtros y el orden actuales; seleccione **Descargar** para continuar o cierre el modal para cancelar.

   <a id="CAP-CAT-CLI-04-EXPORT"></a>
   ![CAP-CAT-CLI-04-EXPORT: modal para exportar clientes](../images/clientes/04-exportar-reporte.png)

<a id="CAP-CAT-CLI-02-CREATE"></a>
### CAP-CAT-CLI-02-CREATE — Formulario alta

**Casos de uso:** `CU-CAT-16` — Crear cliente.

**Errores posibles:** [Validación de formularios](../error-messages.md#errores-validacion), [Catálogos e inventario](../error-messages.md#errores-catalogos).

**Controles que debe usar:** Botón **Nuevo cliente**, campo **Nombre**, casilla **Activo** y botón **Guardar**.

1. Seleccione el botón **Nuevo cliente** para abrir el formulario de alta. Antes de continuar, compruebe que la pantalla mostrada coincida con la captura:

   ![CAP-CAT-CLI-02-CREATE: formulario alta](../images/clientes/02-formulario-alta.png)

2. Complete el campo **Nombre**, revise la casilla **Activo** y seleccione el botón **Guardar**.

<a id="CAP-CAT-CLI-03-EDIT"></a>
### CAP-CAT-CLI-03-EDIT — Formulario edicion

**Casos de uso:** `CU-CAT-17` — Editar cliente.

**Errores posibles:** [Validación de formularios](../error-messages.md#errores-validacion), [Catálogos e inventario](../error-messages.md#errores-catalogos).

**Controles que debe usar:** Acción **Editar registro**, campo **Nombre**, casilla **Activo** y botón **Actualizar**.

1. En la fila del cliente, seleccione la acción **Editar registro**. Antes de continuar, compruebe que la pantalla mostrada coincida con la captura:

   ![CAP-CAT-CLI-03-EDIT: formulario edicion](../images/clientes/03-formulario-edicion.png)

2. Modifique el campo **Nombre** o la casilla **Activo** y seleccione el botón **Actualizar**.

## Mermas e inventario

**Propósito.** Consultar y mantener mermas, ajustar existencias y delimitar reportes.

**Ruta en el menú:** **Menú principal → Almacén → Mermas**.

<a id="CAP-CAT-WAS-00-NAVIGATION"></a>
![CAP-CAT-WAS-00-NAVIGATION: acceso al inventario de mermas desde el menú principal](../images/mermas/00-acceso-menu-principal.png)

**Qué significa identidad y estado.** La identidad de una merma es la combinación de
**Proveedor**, **Nombre**, **Ancho/Base** y **Largo/Altura**. La presentación y unidad se conservan
como datos de la plantilla seleccionada; el stock mínimo, costo máximo, existencia y estado
**Activo** no forman parte de la identidad. Desmarcar **Activo** no elimina la merma ni cambia su
stock o historia, pero Nexus rechaza una merma inactiva al intentar registrarla en una nueva salida.
Si la merma ya pertenecía a una salida pendiente o parcial, puede surtirse el detalle restante para
cerrar el compromiso, siempre que haya stock; desactivarla no cancela la salida. Los reportes pueden
conservarla cuando se elige **Sólo con existencia** y aún tiene stock. Volver a marcarla permite
utilizarla nuevamente en una nueva salida.

<a id="CAP-CAT-WAS-01-LIST"></a>
### CAP-CAT-WAS-01-LIST — Listado inventario

**Casos de uso:** `CU-CAT-19` — Consultar mermas; `CU-CAT-23` — Consultar inventario de mermas; `CU-CAT-24` — Generar reporte de mermas.

**Errores posibles:** [Catálogos e inventario](../error-messages.md#errores-catalogos).

**Controles que debe usar:** Buscador **Buscar por Material o Proveedor**, filtro **Proveedor**, botones **Buscar / filtrar**, **Limpiar filtros**, **Exportar Excel** y **Nueva merma**, además de las acciones por fila.

1. Abra **Filtros** y compruebe que los controles desplegados coincidan con la captura:

   ![CAP-CAT-WAS-01-LIST: listado inventario](../images/mermas/01-listado-inventario.png)

2. Escriba un término en el buscador **Buscar por Material o Proveedor** o elija una opción en el filtro **Proveedor**.
3. Seleccione el botón **Buscar / filtrar** para actualizar la tabla; use **Limpiar filtros** para restablecerla.
4. En la tabla, seleccione **Nueva merma**, **Exportar Excel**, **Editar registro** o **Ajustar stock**, según la operación requerida.

La columna **Activo**, ubicada antes de **Acciones**, se muestra en la tabla únicamente al
administrador del sistema; los demás usuarios autorizados consultan las mermas sin esa columna.

### CAP-REP-WAS-05-EXPORT — Exportar inventario de mermas

**Casos de uso:** `CU-CAT-24` — Generar reporte de mermas.

1. Seleccione **Exportar Excel** y compruebe el modal:

   ![CAP-REP-WAS-05-EXPORT: alcance del inventario de mermas](../images/mermas/05-exportar-reporte.png)

2. Elija **Activos o con existencia**, **Sólo activos** o **Sólo con existencia** y seleccione **Descargar**.

<a id="CAP-CAT-WAS-02-CREATE"></a>
### CAP-CAT-WAS-02-CREATE — Formulario registro

**Casos de uso:** `CU-CAT-20` — Registrar merma.

**Errores posibles:** [Validación de formularios](../error-messages.md#errores-validacion), [Catálogos e inventario](../error-messages.md#errores-catalogos).

**Campos editables en modo alta:** **Buscar proveedor...**, **Buscar material de referencia...**,
**Ancho confirmado de la merma (m)**, **Largo real de la merma (m)**, **Stock mínimo**, **Costo
máximo unitario**, **Nuevo stock**, **Observaciones** y **Activo**. El nombre, presentación y unidad
provienen del material de referencia y la razón **Stock inicial** es automática. Use **Nueva merma**
para abrir el formulario y **Guardar** para confirmarlo.

1. Seleccione el botón **Nueva merma** para abrir el formulario de registro. Antes de continuar, compruebe que la pantalla mostrada coincida con la captura:

   ![CAP-CAT-WAS-02-CREATE: formulario registro](../images/mermas/02-formulario-registro.png)

2. Elija opciones en **Buscar proveedor...** y **Buscar material de referencia...**; complete **Ancho confirmado de la merma (m)**, **Largo real de la merma (m)**, **Stock mínimo**, **Costo máximo unitario**, **Nuevo stock** y **Observaciones**, y revise la casilla **Activo**.
3. Seleccione el botón **Guardar** para registrar la merma.

Si ya existe una merma con el mismo nombre, proveedor, ancho y largo, Nexus rechaza el alta y no
suma la existencia capturada. Localice esa merma en el listado y use **Ajustar stock**; **Nuevo
stock** representa la existencia total que debe quedar, no una cantidad que se agregue al valor
actual.

<a id="CAP-CAT-WAS-03-EDIT"></a>
### CAP-CAT-WAS-03-EDIT — Formulario edicion

**Casos de uso:** `CU-CAT-21` — Editar merma.

**Errores posibles:** [Validación de formularios](../error-messages.md#errores-validacion), [Catálogos e inventario](../error-messages.md#errores-catalogos).

**Campos editables en modo edición:** **Nombre**, **Stock mínimo**, **Costo máximo unitario** y
**Activo**. **Proveedor**, material de referencia, presentación, unidad, ancho, largo y existencia
quedan sólo para consulta. Use la acción **Editar registro** y el botón **Actualizar**.

1. En la fila de la merma, seleccione la acción **Editar registro**. Antes de continuar, compruebe que la pantalla mostrada coincida con la captura:

   ![CAP-CAT-WAS-03-EDIT: formulario edicion](../images/mermas/03-formulario-edicion.png)

2. Modifique **Nombre**, **Stock mínimo**, **Costo máximo unitario** o **Activo** según corresponda.
   Revise los demás datos sólo como referencia.
3. Seleccione el botón **Actualizar** para guardar los cambios.

<a id="CAP-CAT-WAS-04-STOCK"></a>
### CAP-CAT-WAS-04-STOCK — Ajuste existencia

**Casos de uso:** `CU-CAT-22` — Ajustar existencia de merma.

**Errores posibles:** [Validación de formularios](../error-messages.md#errores-validacion), [Catálogos e inventario](../error-messages.md#errores-catalogos).

**Campos editables en modo ajuste:** **Seleccione una razón...**, **Nuevo stock** y
**Observaciones**. Los datos de identidad y catálogo quedan sólo para consulta. Use la acción
**Ajustar stock** y el botón **Ajustar**.

1. En la fila de la merma, seleccione la acción **Ajustar stock**. Antes de continuar, compruebe que la pantalla mostrada coincida con la captura:

   ![CAP-CAT-WAS-04-STOCK: ajuste existencia](../images/mermas/04-ajuste-existencia.png)

2. Elija una opción en **Seleccione una razón...** y complete los campos **Nuevo stock** y **Observaciones**.

   🟨 **ADVERTENCIA:** **Nuevo stock** sustituye la existencia actual; no es una cantidad que Nexus
   sumará al inventario de merma.

3. Revise el efecto sobre la existencia y seleccione el botón **Ajustar**.

Al finalizar, vuelva al listado y confirme que la existencia mostrada sea exactamente la cantidad
capturada. Si no puede confirmarlo, actualice el listado antes de intentar otro ajuste.
