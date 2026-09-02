# Casos: Catálogos e inventario

Cada procedimiento identifica sus casos de uso, controles, errores posibles y captura de referencia.

## Materiales e inventario

**Propósito.** Consultar el inventario, registrar o editar materiales y ajustar existencias.

<a id="CAP-CAT-MAT-01-LIST"></a>
### CAP-CAT-MAT-01-LIST — Listado inventario

**Casos:** `CU-AUT-02`, `CU-CAT-01`, `CU-REP-01`, `CU-REP-03`.

**Errores posibles:** [Catálogos e inventario](../error-messages.md#errores-catalogos).

**Controles que debe usar:** Buscador **Buscar por Material**, filtro **Proveedor**, botones **Buscar / filtrar**, **Limpiar filtros**, **Exportar Excel** y **Nuevo material**, además de las acciones de cada fila.

1. Revise el listado y use sus filtros o acciones disponibles.
2. Compruebe que la pantalla coincida con la captura antes de continuar.

![CAP-CAT-MAT-01-LIST: listado inventario](../images/materiales/01-listado-inventario.png)

<a id="CAP-CAT-MAT-02-CREATE"></a>
### CAP-CAT-MAT-02-CREATE — Formulario alta

**Casos:** `CU-CAT-02`, `CU-CAT-17`, `CU-CAT-18`.

**Errores posibles:** [Validación de formularios](../error-messages.md#errores-validacion), [Catálogos e inventario](../error-messages.md#errores-catalogos).

**Controles que debe usar:** Botón **Nuevo material**; campos **Nombre**, **Proveedor**, **Presentación**, **Unidad de medida**, **Stock Mínimo**, **Costo Máximo**, **Base** y **Altura**; selector **Activo** y botón **Guardar**.

1. Abra la acción de alta, capture los campos requeridos y confirme.
2. Compruebe que la pantalla coincida con la captura antes de continuar.

![CAP-CAT-MAT-02-CREATE: formulario alta](../images/materiales/02-formulario-alta.png)

<a id="CAP-CAT-MAT-03-EDIT"></a>
### CAP-CAT-MAT-03-EDIT — Formulario edicion

**Casos:** `CU-CAT-03`, `CU-CAT-04`.

**Errores posibles:** [Validación de formularios](../error-messages.md#errores-validacion), [Catálogos e inventario](../error-messages.md#errores-catalogos).

**Controles que debe usar:** Acción **Editar registro** de la fila; los mismos campos de identidad del material, selector **Activo** y botón **Actualizar**.

1. Seleccione un registro editable, revise los datos y confirme únicamente los cambios necesarios.
2. Compruebe que la pantalla coincida con la captura antes de continuar.

![CAP-CAT-MAT-03-EDIT: formulario edicion](../images/materiales/03-formulario-edicion.png)

<a id="CAP-CAT-MAT-04-STOCK"></a>
### CAP-CAT-MAT-04-STOCK — Ajuste existencia

**Casos:** `CU-CAT-05`, `CU-CAT-19`.

**Errores posibles:** [Validación de formularios](../error-messages.md#errores-validacion), [Catálogos e inventario](../error-messages.md#errores-catalogos).

**Controles que debe usar:** Acción **Ajustar stock**; selector **Razón**, campo **Nueva cantidad**, campo **Observaciones** y botón **Ajustar**.

1. Abra el ajuste, capture la existencia autorizada y confirme después de comprobar su efecto.
2. Compruebe que la pantalla coincida con la captura antes de continuar.

![CAP-CAT-MAT-04-STOCK: ajuste existencia](../images/materiales/04-ajuste-existencia.png)

## Proveedores

**Propósito.** Consultar y mantener el catálogo de proveedores.

<a id="CAP-CAT-SUP-01-LIST"></a>
### CAP-CAT-SUP-01-LIST — Listado

**Casos:** `CU-CAT-06`, `CU-REP-12`.

**Errores posibles:** [Catálogos e inventario](../error-messages.md#errores-catalogos).

**Controles que debe usar:** Buscador **Buscar por Nombre comercial o Razón social**, botones **Exportar Excel** y **Nuevo proveedor**, y acción **Editar registro** de cada fila.

1. Revise el listado y use sus filtros o acciones disponibles.
2. Compruebe que la pantalla coincida con la captura antes de continuar.

![CAP-CAT-SUP-01-LIST: listado](../images/proveedores/01-listado.png)

<a id="CAP-CAT-SUP-02-CREATE"></a>
### CAP-CAT-SUP-02-CREATE — Formulario alta

**Casos:** `CU-CAT-07`.

**Errores posibles:** [Validación de formularios](../error-messages.md#errores-validacion), [Catálogos e inventario](../error-messages.md#errores-catalogos).

**Controles que debe usar:** Botón **Nuevo proveedor**; campos **Razón social**, **Nombre comercial** y **Teléfono**; selector **Activo** y botón **Guardar**.

1. Abra la acción de alta, capture los campos requeridos y confirme.
2. Compruebe que la pantalla coincida con la captura antes de continuar.

![CAP-CAT-SUP-02-CREATE: formulario alta](../images/proveedores/02-formulario-alta.png)

<a id="CAP-CAT-SUP-03-EDIT"></a>
### CAP-CAT-SUP-03-EDIT — Formulario edicion y estado

**Casos:** `CU-CAT-08`, `CU-CAT-09`.

**Errores posibles:** [Validación de formularios](../error-messages.md#errores-validacion), [Catálogos e inventario](../error-messages.md#errores-catalogos).

**Controles que debe usar:** Acción **Editar registro**; campos **Razón social**, **Nombre comercial** y **Teléfono**; selector **Activo** y botón **Actualizar**.

1. Seleccione un registro editable, revise los datos y confirme únicamente los cambios necesarios.
2. Compruebe que la pantalla coincida con la captura antes de continuar.

![CAP-CAT-SUP-03-EDIT: formulario edicion y estado](../images/proveedores/03-formulario-edicion-y-estado.png)

## Clientes

**Propósito.** Consultar y mantener el catálogo de clientes.

<a id="CAP-CAT-CLI-01-LIST"></a>
### CAP-CAT-CLI-01-LIST — Listado

**Casos:** `CU-CAT-10`, `CU-REP-13`.

**Errores posibles:** [Catálogos e inventario](../error-messages.md#errores-catalogos).

**Controles que debe usar:** Buscador **Buscar por Nombre**, botones **Exportar Excel** y **Nuevo cliente**, y acción **Editar registro** de cada fila.

1. Revise el listado y use sus filtros o acciones disponibles.
2. Compruebe que la pantalla coincida con la captura antes de continuar.

![CAP-CAT-CLI-01-LIST: listado](../images/clientes/01-listado.png)

<a id="CAP-CAT-CLI-02-CREATE"></a>
### CAP-CAT-CLI-02-CREATE — Formulario alta

**Casos:** `CU-CAT-11`.

**Errores posibles:** [Validación de formularios](../error-messages.md#errores-validacion), [Catálogos e inventario](../error-messages.md#errores-catalogos).

**Controles que debe usar:** Botón **Nuevo cliente**, campo **Nombre** y botón **Guardar**.

1. Abra la acción de alta, capture los campos requeridos y confirme.
2. Compruebe que la pantalla coincida con la captura antes de continuar.

![CAP-CAT-CLI-02-CREATE: formulario alta](../images/clientes/02-formulario-alta.png)

<a id="CAP-CAT-CLI-03-EDIT"></a>
### CAP-CAT-CLI-03-EDIT — Formulario edicion

**Casos:** `CU-CAT-12`.

**Errores posibles:** [Validación de formularios](../error-messages.md#errores-validacion), [Catálogos e inventario](../error-messages.md#errores-catalogos).

**Controles que debe usar:** Acción **Editar registro**, campo **Nombre** y botón **Actualizar**.

1. Seleccione un registro editable, revise los datos y confirme únicamente los cambios necesarios.
2. Compruebe que la pantalla coincida con la captura antes de continuar.

![CAP-CAT-CLI-03-EDIT: formulario edicion](../images/clientes/03-formulario-edicion.png)

## Mermas e inventario

**Propósito.** Consultar y mantener mermas, ajustar existencias y delimitar reportes.

<a id="CAP-CAT-WAS-01-LIST"></a>
### CAP-CAT-WAS-01-LIST — Listado inventario

**Casos:** `CU-CAT-13`, `CU-REP-06`, `CU-REP-09`.

**Errores posibles:** [Catálogos e inventario](../error-messages.md#errores-catalogos).

**Controles que debe usar:** Buscador **Buscar por Material o Proveedor**, filtro **Proveedor**, botones **Buscar / filtrar**, **Limpiar filtros**, **Exportar Excel** y **Nueva merma**, además de las acciones por fila.

1. Revise el listado y use sus filtros o acciones disponibles.
2. Compruebe que la pantalla coincida con la captura antes de continuar.

![CAP-CAT-WAS-01-LIST: listado inventario](../images/mermas/01-listado-inventario.png)

<a id="CAP-CAT-WAS-02-CREATE"></a>
### CAP-CAT-WAS-02-CREATE — Formulario registro

**Casos:** `CU-CAT-14`.

**Errores posibles:** [Validación de formularios](../error-messages.md#errores-validacion), [Catálogos e inventario](../error-messages.md#errores-catalogos).

**Controles que debe usar:** Botón **Nueva merma**; selectores **Proveedor** y **Material de referencia del proveedor**; campos **Ancho confirmado**, **Largo real**, **Stock mínimo** y **Costo máximo unitario**; selector **Activo** y botón **Guardar**.

1. Abra la acción de alta, capture los campos requeridos y confirme.
2. Compruebe que la pantalla coincida con la captura antes de continuar.

![CAP-CAT-WAS-02-CREATE: formulario registro](../images/mermas/02-formulario-registro.png)

<a id="CAP-CAT-WAS-03-EDIT"></a>
### CAP-CAT-WAS-03-EDIT — Formulario edicion

**Casos:** `CU-CAT-15`.

**Errores posibles:** [Validación de formularios](../error-messages.md#errores-validacion), [Catálogos e inventario](../error-messages.md#errores-catalogos).

**Controles que debe usar:** Acción **Editar registro**; controles de proveedor, material de referencia, dimensiones, stock mínimo, costo máximo y estado **Activo**; botón **Actualizar**.

1. Seleccione un registro editable, revise los datos y confirme únicamente los cambios necesarios.
2. Compruebe que la pantalla coincida con la captura antes de continuar.

![CAP-CAT-WAS-03-EDIT: formulario edicion](../images/mermas/03-formulario-edicion.png)

<a id="CAP-CAT-WAS-04-STOCK"></a>
### CAP-CAT-WAS-04-STOCK — Ajuste existencia

**Casos:** `CU-CAT-16`.

**Errores posibles:** [Validación de formularios](../error-messages.md#errores-validacion), [Catálogos e inventario](../error-messages.md#errores-catalogos).

**Controles que debe usar:** Acción **Ajustar stock**; selector **Razón**, campo **Nuevo stock**, campo **Observaciones** y botón **Ajustar**.

1. Abra el ajuste, capture la existencia autorizada y confirme después de comprobar su efecto.
2. Compruebe que la pantalla coincida con la captura antes de continuar.

![CAP-CAT-WAS-04-STOCK: ajuste existencia](../images/mermas/04-ajuste-existencia.png)

<a id="CAP-REP-WAS-05-EXPORT"></a>
### CAP-REP-WAS-05-EXPORT — Exportar reporte

**Casos:** `CU-REP-09`.

**Errores posibles:** [Catálogos e inventario](../error-messages.md#errores-catalogos).

**Controles que debe usar:** Botón **Exportar Excel**; opciones **Mes actual**, **Otro mes** o **Personalizado: usar filtros aplicados**; campo **Mes del reporte** cuando corresponda y botón **Descargar**.

1. Abra la exportación, seleccione el alcance o periodo y genere el archivo.
2. Compruebe que la pantalla coincida con la captura antes de continuar.

![CAP-REP-WAS-05-EXPORT: exportar reporte](../images/mermas/05-exportar-reporte.png)
