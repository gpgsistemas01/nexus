# Casos: Identidad y acceso

Cada procedimiento identifica sus casos de uso, controles, errores posibles y captura de referencia.

## Personas

**Propósito.** Consultar y mantener las personas que participan en la operación.

<a id="CAP-IDA-PER-01-LIST"></a>
### CAP-IDA-PER-01-LIST — Listado

**Casos:** `CU-IDA-01`, `CU-REP-14`.

**Errores posibles:** [Catálogos e inventario](../error-messages.md#errores-catalogos).

**Controles que debe usar:** Buscador **Buscar por Nombre**; filtros **Área** y **Rol**; botones **Buscar / filtrar**, **Limpiar filtros**, **Exportar Excel** y **Nueva persona**, y acción **Editar registro** por fila.

1. Revise el listado y use sus filtros o acciones disponibles.
2. Compruebe que la pantalla coincida con la captura antes de continuar.

![CAP-IDA-PER-01-LIST: listado](../images/personas/01-listado.png)

<a id="CAP-IDA-PER-02-CREATE"></a>
### CAP-IDA-PER-02-CREATE — Formulario alta

**Casos:** `CU-IDA-02`, `CU-IDA-08`, `CU-IDA-09`.

**Errores posibles:** [Validación de formularios](../error-messages.md#errores-validacion), [Catálogos e inventario](../error-messages.md#errores-catalogos).

**Controles que debe usar:** Botón **Nueva persona**; campo **Nombre completo**; selectores **Área** y **Rol**, botón **Agregar** para cada acceso y botón **Guardar**.

1. Abra la acción de alta, capture los campos requeridos y confirme.
2. Compruebe que la pantalla coincida con la captura antes de continuar.

![CAP-IDA-PER-02-CREATE: formulario alta](../images/personas/02-formulario-alta.png)

<a id="CAP-IDA-PER-03-EDIT"></a>
### CAP-IDA-PER-03-EDIT — Formulario edicion

**Casos:** `CU-IDA-03`.

**Errores posibles:** [Validación de formularios](../error-messages.md#errores-validacion), [Catálogos e inventario](../error-messages.md#errores-catalogos).

**Controles que debe usar:** Acción **Editar registro**; campo **Nombre completo**, selectores **Área** y **Rol**, botón **Agregar** y controles de los accesos existentes; botón **Actualizar**.

1. Seleccione un registro editable, revise los datos y confirme únicamente los cambios necesarios.
2. Compruebe que la pantalla coincida con la captura antes de continuar.

![CAP-IDA-PER-03-EDIT: formulario edicion](../images/personas/03-formulario-edicion.png)

## Usuarios

**Propósito.** Administrar cuentas y cambios de contraseña.

<a id="CAP-IDA-USR-01-LIST"></a>
### CAP-IDA-USR-01-LIST — Listado

**Casos:** `CU-IDA-04`, `CU-REP-15`.

**Errores posibles:** [Acceso y autorización](../error-messages.md#errores-acceso), [Catálogos e inventario](../error-messages.md#errores-catalogos).

**Controles que debe usar:** Buscador **Buscar por Usuario**, botones **Exportar Excel** y **Nuevo usuario**, y acciones para editar usuario o contraseña en cada fila.

1. Revise el listado y use sus filtros o acciones disponibles.
2. Compruebe que la pantalla coincida con la captura antes de continuar.

![CAP-IDA-USR-01-LIST: listado](../images/usuarios/01-listado.png)

<a id="CAP-IDA-USR-02-CREATE"></a>
### CAP-IDA-USR-02-CREATE — Formulario alta

**Casos:** `CU-IDA-05`.

**Errores posibles:** [Validación de formularios](../error-messages.md#errores-validacion), [Acceso y autorización](../error-messages.md#errores-acceso), [Catálogos e inventario](../error-messages.md#errores-catalogos).

**Controles que debe usar:** Botón **Nuevo usuario**; selectores **Área** y **Rol**; campos **Usuario** y **Contraseña**; botón **Guardar**.

1. Abra la acción de alta, capture los campos requeridos y confirme.
2. Compruebe que la pantalla coincida con la captura antes de continuar.

![CAP-IDA-USR-02-CREATE: formulario alta](../images/usuarios/02-formulario-alta.png)

<a id="CAP-IDA-USR-03-EDIT"></a>
### CAP-IDA-USR-03-EDIT — Formulario edicion

**Casos:** `CU-IDA-06`.

**Errores posibles:** [Validación de formularios](../error-messages.md#errores-validacion), [Acceso y autorización](../error-messages.md#errores-acceso), [Catálogos e inventario](../error-messages.md#errores-catalogos).

**Controles que debe usar:** Acción **Editar usuario**; selectores **Área** y **Rol**, campo **Usuario** y botón **Actualizar**.

1. Seleccione un registro editable, revise los datos y confirme únicamente los cambios necesarios.
2. Compruebe que la pantalla coincida con la captura antes de continuar.

![CAP-IDA-USR-03-EDIT: formulario edicion](../images/usuarios/03-formulario-edicion.png)

<a id="CAP-IDA-USR-04-PASSWORD"></a>
### CAP-IDA-USR-04-PASSWORD — Cambio contrasena

**Casos:** `CU-IDA-07`.

**Errores posibles:** [Validación de formularios](../error-messages.md#errores-validacion), [Acceso y autorización](../error-messages.md#errores-acceso), [Catálogos e inventario](../error-messages.md#errores-catalogos).

**Controles que debe usar:** Acción de cambio de contraseña; campo **Contraseña**, botón **Actualizar contraseña** y botón **Regresar**.

1. Seleccione la cuenta, capture la nueva contraseña conforme a la política y confirme.
2. Compruebe que la pantalla coincida con la captura antes de continuar.

![CAP-IDA-USR-04-PASSWORD: cambio contrasena](../images/usuarios/04-cambio-contrasena.png)
