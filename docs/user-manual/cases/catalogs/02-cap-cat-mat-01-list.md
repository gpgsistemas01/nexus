<a id="CAP-CAT-MAT-01-LIST"></a>
# CAP-CAT-MAT-01-LIST — Listado inventario

**Casos de uso:** `CU-AUT-02` — Cerrar sesión; `CU-CAT-01` — Consultar materiales; `CU-CAT-06` — Consultar inventario de materiales; `CU-CAT-07` — Generar reporte de inventario de materiales.

**Errores posibles:** [Catálogos e inventario](../../error-messages.md#errores-catalogos).

**Controles que debe usar:** Buscador **Buscar por Material**, filtro **Proveedor**, botones **Buscar / filtrar**, **Limpiar filtros**, **Exportar Excel** y **Nuevo material**, además de las acciones de cada fila.

1. Abra **Filtros** y compruebe que los controles desplegados coincidan con la captura:

   ![CAP-CAT-MAT-01-LIST: listado inventario](../../images/materiales/01-listado-inventario.png)

2. Escriba un término en el buscador **Buscar por Material** o elija una opción en el filtro **Proveedor**.
3. Seleccione el botón **Buscar / filtrar** para actualizar la tabla; use **Limpiar filtros** para restablecerla.
4. En la tabla, seleccione **Nuevo material**, **Exportar Excel**, **Editar registro** o **Ajustar stock**, según la operación requerida.

La columna **Activo**, ubicada antes de **Acciones**, se muestra en la tabla únicamente al
administrador del sistema; los demás usuarios autorizados consultan el inventario sin esa columna.
