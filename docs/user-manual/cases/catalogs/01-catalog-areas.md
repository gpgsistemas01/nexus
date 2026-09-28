# Áreas

**Propósito.** Consultar, crear y editar el catálogo de áreas que configura los flujos del sistema.

**Ruta en el menú:** **Menú principal → Catálogos auxiliares → Áreas**.

**Casos de uso:** `CU-CAT-09` a `CU-CAT-11`, correspondientes a consultar, crear y editar.

**Acceso:** esta pantalla y sus escrituras son exclusivas del administrador del sistema del área Sistemas. Que una opción aparezca en un selector operativo no concede acceso a su mantenimiento.

1. Abra **Áreas** y compruebe que el encabezado y la tabla correspondan al catálogo que desea modificar:

   ![CAP-CAT-AREA-01-LIST: consulta de áreas](../../images/catalogs/areas/01-list.png)

2. Seleccione **Nueva área** y compruebe que se abra el formulario de alta:

   ![CAP-CAT-AREA-02-CREATE: alta de área](../../images/catalogs/areas/02-form-creation.png)

   Complete **Nombre** —máximo 50 caracteres—. Revise la casilla **Activo** y seleccione **Guardar**.

3. Seleccione **Editar registro** en la fila requerida y compruebe que se abra el formulario de edición:

   ![CAP-CAT-AREA-03-EDIT: edición de área](../../images/catalogs/areas/03-form-edit.png)

   Cambie únicamente los campos habilitados —incluido **Activo**— y seleccione **Actualizar**.

4. Compruebe que la tabla de esa misma pantalla muestre el resultado.

Una entrada inactiva permanece en la tabla para poder consultarla o reactivarla, pero deja de ofrecerse en formularios operativos nuevos. El cambio de estado se confirma junto con los demás datos mediante **Guardar** o **Actualizar** y puede descartarse con **Regresar**.

**Errores posibles:** [Validación de formularios](../../error-messages.md#errores-validacion), [Acceso y autorización](../../error-messages.md#errores-acceso), [Catálogos e inventario](../../error-messages.md#errores-catalogos).
