# 1. Catálogos auxiliares
**Propósito.** Consultar, crear y editar las opciones auxiliares que configuran otros flujos del sistema.

**Ruta en el menú:** **Menú principal → Catálogos auxiliares →** elija **Áreas**, **Roles**, **Presentaciones**, **Unidades de medida**, **Motivos de ajuste** o **Estados de cumplimiento**.

**Casos de uso:** Áreas: `CU-CAT-27` a `CU-CAT-29`; Roles: `CU-CAT-30` a `CU-CAT-32`; Presentaciones: `CU-CAT-33` a `CU-CAT-35`; Unidades de medida: `CU-CAT-36` a `CU-CAT-38`; Motivos de ajuste: `CU-CAT-39` a `CU-CAT-41`; Estados de cumplimiento: `CU-CAT-42` a `CU-CAT-44`. Cada rango corresponde, en orden, a consultar, crear y editar.

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

**Errores posibles:** [Validación de formularios](../../error-messages.md#errores-validacion), [Acceso y autorización](../../error-messages.md#errores-acceso), [Catálogos e inventario](../../error-messages.md#errores-catalogos).
