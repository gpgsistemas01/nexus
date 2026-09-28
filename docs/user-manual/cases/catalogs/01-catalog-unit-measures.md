# Unidades de medida

**Propósito.** Consultar, crear y editar el catálogo de unidades de medida que configura los flujos del sistema.

**Ruta en el menú:** **Menú principal → Catálogos auxiliares → Unidades de medida**.

**Casos de uso:** `CU-CAT-18` a `CU-CAT-20`, correspondientes a consultar, crear y editar.

**Acceso:** esta pantalla y sus escrituras son exclusivas del administrador del sistema del área Sistemas. Que una opción aparezca en un selector operativo no concede acceso a su mantenimiento.

1. Abra **Unidades de medida** y compruebe que el encabezado y la tabla correspondan al catálogo que desea modificar:

   ![CAP-CAT-UNIT-01-LIST: consulta de unidades de medida](../../images/catalogs/unit-measures/01-list.png)

2. Seleccione **Nueva unidad de medida** y compruebe que se abra el formulario de alta:

   ![CAP-CAT-UNIT-02-CREATE: alta de unidad de medida](../../images/catalogs/unit-measures/02-form-creation.png)

   Complete **Nombre** —máximo 20 caracteres—. Complete también **Símbolo** —máximo 10 caracteres—. Revise la casilla **Activo** y seleccione **Guardar**.

3. Seleccione **Editar registro** en la fila requerida y compruebe que se abra el formulario de edición:

   ![CAP-CAT-UNIT-03-EDIT: edición de unidad de medida](../../images/catalogs/unit-measures/03-form-edit.png)

   Cambie únicamente los campos habilitados —incluido **Activo**— y seleccione **Actualizar**.

4. Compruebe que la tabla de esa misma pantalla muestre el resultado.

Una entrada inactiva permanece en la tabla para poder consultarla o reactivarla, pero deja de ofrecerse en formularios operativos nuevos. El cambio de estado se confirma junto con los demás datos mediante **Guardar** o **Actualizar** y puede descartarse con **Regresar**.

**Errores posibles:** [Validación de formularios](../../error-messages.md#errores-validacion), [Acceso y autorización](../../error-messages.md#errores-acceso), [Catálogos e inventario](../../error-messages.md#errores-catalogos).
