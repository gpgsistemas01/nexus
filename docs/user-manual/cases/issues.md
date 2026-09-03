# Casos: Salidas de material y merma

Cada procedimiento identifica sus casos de uso, controles, errores posibles y captura de referencia.

## Salidas de material

**Propósito.** Registrar y dar seguimiento al surtido y devolución de materiales.

<a id="CAP-SAL-MAT-01-LIST"></a>
### CAP-SAL-MAT-01-LIST — Listado

**Casos:** `CU-CAT-20`, `CU-SAL-01`.

**Errores posibles:** [Salidas de material](../error-messages.md#errores-salidas-material).

**Controles que debe usar:** Buscador **Buscar por Folio o Proyecto**; filtros **Fecha de inicio:**, **Fecha de fin:**, **Cliente:**, **Área:**, **Persona:**, **Estado de surtido:** y **Observaciones contiene:**; botones **Buscar / filtrar**, **Limpiar filtros**, **Exportar Excel** y **Nueva salida**; acciones **Editar registro**, **Surtir detalle** y **Devolver material surtido** por fila.

1. Antes de usar los controles, compruebe que la pantalla inicial coincida con la captura:

   ![CAP-SAL-MAT-01-LIST: listado](../images/salidas-material/01-listado.png)

2. Escriba un término en **Buscar por Folio o Proyecto** o complete **Fecha de inicio:**, **Fecha de fin:**, **Cliente:**, **Área:**, **Persona:**, **Estado de surtido:** y **Observaciones contiene:**.
3. Seleccione **Buscar / filtrar** para actualizar la tabla; use **Limpiar filtros** para restablecerla.
4. En la tabla, seleccione **Nueva salida**, **Exportar Excel**, **Editar registro**, **Surtir detalle** o **Devolver material surtido**, según la operación requerida.

<a id="CAP-SAL-MAT-02-CREATE"></a>
### CAP-SAL-MAT-02-CREATE — Formulario registro

**Casos:** `CU-SAL-02`.

**Errores posibles:** [Validación de formularios](../error-messages.md#errores-validacion), [Salidas de material](../error-messages.md#errores-salidas-material).

**Controles que debe usar:** Botón **Nueva salida**; selectores **Buscar cliente...**, **Buscar asesor...**, **Buscar área...** y **Buscar solicitante...**; campos **Número de proyecto**, **Fecha y hora de solicitud:** y **Observaciones**; selector **Buscar material...**, campo **Cantidad**, botón **Agregar** y botón **Guardar**.

1. Seleccione **Nueva salida** para abrir el formulario. Antes de continuar, compruebe que la pantalla mostrada coincida con la captura:

   ![CAP-SAL-MAT-02-CREATE: formulario registro](../images/salidas-material/02-formulario-registro.png)

2. Elija opciones en **Buscar cliente...**, **Buscar asesor...**, **Buscar área...** y **Buscar solicitante...**.
3. Complete **Número de proyecto**, **Fecha y hora de solicitud:** y **Observaciones**.
4. Elija una opción en **Buscar material...**, complete **Cantidad** y pulse **Agregar** por cada detalle.
5. Revise los datos y seleccione **Guardar**.

<a id="CAP-SAL-MAT-03-EDIT"></a>
### CAP-SAL-MAT-03-EDIT — Edicion encabezado

**Casos:** `CU-SAL-03`, `CU-SAL-04`.

**Errores posibles:** [Validación de formularios](../error-messages.md#errores-validacion), [Salidas de material](../error-messages.md#errores-salidas-material).

**Controles que debe usar:** Acción **Editar registro**; selectores **Buscar cliente...**, **Buscar asesor...**, **Buscar área...** y **Buscar solicitante...**; campos **Número de proyecto**, **Fecha y hora de solicitud:** y **Observaciones**; cuando el estado lo permita, selector **Buscar material...**, campo **Cantidad** y botón **Agregar**; botones **Editar** y **Regresar**.

1. En la fila de la salida, seleccione **Editar registro**. Antes de continuar, compruebe que la pantalla mostrada coincida con la captura:

   ![CAP-SAL-MAT-03-EDIT: edicion encabezado](../images/salidas-material/03-edicion-encabezado.png)

2. Modifique los selectores y campos indicados y, si el estado lo permite, use **Buscar material...**, **Cantidad** y **Agregar** para incorporar detalles.
3. Seleccione **Editar** para guardar o **Regresar** para salir sin confirmar.

<a id="CAP-SAL-MAT-04-SUPPLY"></a>
### CAP-SAL-MAT-04-SUPPLY — Surtir detalles

**Casos:** `CU-SAL-05`.

**Errores posibles:** [Validación de formularios](../error-messages.md#errores-validacion), [Salidas de material](../error-messages.md#errores-salidas-material).

**Controles que debe usar:** Acción **Surtir detalle**; casilla de la columna **Surtir** y campo de la columna **Cantidad de proyecto** de cada renglón pendiente; botón **Editar detalles de la**.

1. En la fila de la salida, seleccione **Surtir detalle** para abrir sus renglones pendientes. Antes de continuar, compruebe que la pantalla mostrada coincida con la captura:

   ![CAP-SAL-MAT-04-SUPPLY: surtir detalles](../images/salidas-material/04-surtir-detalles.png)

2. Marque la casilla de la columna **Surtir** y complete **Cantidad de proyecto** en cada renglón que se entregará.
3. Revise la existencia y seleccione **Editar detalles de la**.

<a id="CAP-SAL-MAT-05-RETURN"></a>
### CAP-SAL-MAT-05-RETURN — Devolver detalle

**Casos:** `CU-SAL-06`.

**Errores posibles:** [Validación de formularios](../error-messages.md#errores-validacion), [Salidas de material](../error-messages.md#errores-salidas-material).

**Controles que debe usar:** Acción **Devolver material surtido** y botón **Devolver detalle de salida**; campo **Cantidad a devolver**, campo **Observaciones**, botón **Devolver** y botón **Regresar**.

1. En la fila correspondiente, seleccione **Devolver material surtido** y después **Devolver detalle de salida**. Antes de continuar, compruebe que la pantalla mostrada coincida con la captura:

   ![CAP-SAL-MAT-05-RETURN: devolver detalle](../images/salidas-material/05-devolver-detalle.png)

2. Complete **Cantidad a devolver** y **Observaciones**.
3. Seleccione **Devolver** para confirmar o **Regresar** para salir sin aplicar la devolución.

<a id="CAP-REP-SAL-MAT-06-EXPORT"></a>
### CAP-REP-SAL-MAT-06-EXPORT — Exportar reporte

**Casos:** `CU-REP-04`.

**Errores posibles:** [Salidas de material](../error-messages.md#errores-salidas-material).

**Controles que debe usar:** Botón **Exportar Excel**; opciones de alcance mensual, otro mes o filtros aplicados; campo **Mes del reporte** y botón **Descargar**.

1. Seleccione **Exportar Excel** para abrir el diálogo de alcance. Antes de continuar, compruebe que la pantalla mostrada coincida con la captura:

   ![CAP-REP-SAL-MAT-06-EXPORT: exportar reporte](../images/salidas-material/06-exportar-reporte.png)

2. Elija el alcance mensual, otro mes o los filtros aplicados y complete **Mes del reporte** cuando corresponda.
3. Seleccione **Descargar** para generar el archivo.

## Salidas de merma

**Propósito.** Registrar y dar seguimiento al surtido y devolución de mermas.

<a id="CAP-SAL-WAS-01-LIST"></a>
### CAP-SAL-WAS-01-LIST — Listado

**Casos:** `CU-SAL-07`, `CU-REP-08`.

**Errores posibles:** [Salidas de merma](../error-messages.md#errores-salidas-merma).

**Controles que debe usar:** Buscador **Buscar por Folio o Proyecto**; filtros **Fecha de inicio:**, **Fecha de fin:**, **Cliente:**, **Área:**, **Persona:**, **Estado de surtido:** y **Observaciones contiene:**; botones **Buscar / filtrar**, **Limpiar filtros**, **Exportar Excel** y **Nueva salida**; acciones **Editar registro**, **Surtir detalle** y **Devolver material surtido** por fila.

1. Antes de usar los controles, compruebe que la pantalla inicial coincida con la captura:

   ![CAP-SAL-WAS-01-LIST: listado](../images/salidas-merma/01-listado.png)

2. Escriba un término en **Buscar por Folio o Proyecto** o complete **Fecha de inicio:**, **Fecha de fin:**, **Cliente:**, **Área:**, **Persona:**, **Estado de surtido:** y **Observaciones contiene:**.
3. Seleccione **Buscar / filtrar** para actualizar la tabla; use **Limpiar filtros** para restablecerla.
4. En la tabla, seleccione **Nueva salida**, **Exportar Excel**, **Editar registro**, **Surtir detalle** o **Devolver material surtido**, según la operación requerida.

<a id="CAP-SAL-WAS-02-CREATE"></a>
### CAP-SAL-WAS-02-CREATE — Formulario registro

**Casos:** `CU-SAL-08`.

**Errores posibles:** [Validación de formularios](../error-messages.md#errores-validacion), [Salidas de merma](../error-messages.md#errores-salidas-merma).

**Controles que debe usar:** Botón **Nueva salida**; selectores **Buscar cliente...**, **Buscar asesor...**, **Buscar área...** y **Buscar solicitante...**; campos **Número de proyecto**, **Fecha y hora de solicitud** y **Observaciones**; selector **Buscar merma...**, campo **Cantidad**, botón **Agregar** y botón **Guardar**.

1. Seleccione **Nueva salida** para abrir el formulario. Antes de continuar, compruebe que la pantalla mostrada coincida con la captura:

   ![CAP-SAL-WAS-02-CREATE: formulario registro](../images/salidas-merma/02-formulario-registro.png)

2. Elija opciones en **Buscar cliente...**, **Buscar asesor...**, **Buscar área...** y **Buscar solicitante...**.
3. Complete **Número de proyecto**, **Fecha y hora de solicitud** y **Observaciones**.
4. Elija una opción en **Buscar merma...**, complete **Cantidad** y pulse **Agregar** por cada detalle.
5. Revise los datos y seleccione **Guardar**.

<a id="CAP-SAL-WAS-03-EDIT"></a>
### CAP-SAL-WAS-03-EDIT — Edicion encabezado

**Casos:** `CU-SAL-09`, `CU-SAL-10`.

**Errores posibles:** [Validación de formularios](../error-messages.md#errores-validacion), [Salidas de merma](../error-messages.md#errores-salidas-merma).

**Controles que debe usar:** Acción **Editar registro**; selectores **Buscar cliente...**, **Buscar asesor...**, **Buscar área...** y **Buscar solicitante...**; campos **Número de proyecto**, **Fecha y hora de solicitud** y **Observaciones**; cuando el estado lo permita, selector **Buscar merma...**, campo **Cantidad** y botón **Agregar**; botones **Editar** y **Regresar**.

1. En la fila de la salida, seleccione **Editar registro**. Antes de continuar, compruebe que la pantalla mostrada coincida con la captura:

   ![CAP-SAL-WAS-03-EDIT: edicion encabezado](../images/salidas-merma/03-edicion-encabezado.png)

2. Modifique los selectores y campos indicados y, si el estado lo permite, use **Buscar merma...**, **Cantidad** y **Agregar** para incorporar detalles.
3. Seleccione **Editar** para guardar o **Regresar** para salir sin confirmar.

<a id="CAP-SAL-WAS-04-SUPPLY"></a>
### CAP-SAL-WAS-04-SUPPLY — Surtir detalles

**Casos:** `CU-SAL-11`.

**Errores posibles:** [Validación de formularios](../error-messages.md#errores-validacion), [Salidas de merma](../error-messages.md#errores-salidas-merma).

**Controles que debe usar:** Acción **Surtir detalle**; casilla de la columna **Surtir** y campo de la columna **Cantidad de proyecto** de cada renglón pendiente; botón **Surtir**.

1. En la fila de la salida, seleccione **Surtir detalle** para abrir sus renglones pendientes. Antes de continuar, compruebe que la pantalla mostrada coincida con la captura:

   ![CAP-SAL-WAS-04-SUPPLY: surtir detalles](../images/salidas-merma/04-surtir-detalles.png)

2. Marque la casilla de la columna **Surtir** y complete **Cantidad de proyecto** en cada renglón que se entregará.
3. Revise la existencia y seleccione **Surtir**.

<a id="CAP-SAL-WAS-05-RETURN"></a>
### CAP-SAL-WAS-05-RETURN — Devolver detalle

**Casos:** `CU-SAL-12`.

**Errores posibles:** [Validación de formularios](../error-messages.md#errores-validacion), [Salidas de merma](../error-messages.md#errores-salidas-merma).

**Controles que debe usar:** Acción **Devolver material surtido** de la fila y botón **Devolver detalle de salida**; campos **Cantidad a devolver** y **Observaciones**; botones **Devolver** y **Regresar**.

1. En la fila correspondiente, seleccione **Devolver material surtido** y después **Devolver detalle de salida**. Antes de continuar, compruebe que la pantalla mostrada coincida con la captura:

   ![CAP-SAL-WAS-05-RETURN: devolver detalle](../images/salidas-merma/05-devolver-detalle.png)

2. Complete **Cantidad a devolver** y **Observaciones**.
3. Seleccione **Devolver** para confirmar o **Regresar** para salir sin aplicar la devolución.

<a id="CAP-REP-SAL-WAS-06-EXPORT"></a>
### CAP-REP-SAL-WAS-06-EXPORT — Exportar reporte

**Casos:** `CU-REP-08`.

**Errores posibles:** [Salidas de merma](../error-messages.md#errores-salidas-merma).

**Controles que debe usar:** Botón **Exportar Excel**; opciones de alcance mensual, otro mes o filtros aplicados; campo **Mes del reporte** y botón **Descargar**.

1. Seleccione **Exportar Excel** para abrir el diálogo de alcance. Antes de continuar, compruebe que la pantalla mostrada coincida con la captura:

   ![CAP-REP-SAL-WAS-06-EXPORT: exportar reporte](../images/salidas-merma/06-exportar-reporte.png)

2. Elija el alcance mensual, otro mes o los filtros aplicados y complete **Mes del reporte** cuando corresponda.
3. Seleccione **Descargar** para generar el archivo.
