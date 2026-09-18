<a id="CAP-CAT-WAS-01-LIST"></a>
# 13. CAP-CAT-WAS-01-LIST — Listado inventario

**Casos de uso:** `CU-ALM-09` — Consultar mermas e inventario; `CU-ALM-13` — Generar reporte de mermas.

**Errores posibles:** [Catálogos e inventario](../../error-messages.md#errores-catalogos).

**Controles que debe usar:** Buscador **Buscar por Material o Proveedor**, filtro **Proveedor**, botones **Buscar / filtrar**, **Limpiar filtros**, **Exportar Excel** y **Nueva merma**, además de las acciones por fila.

1. Abra **Filtros** y compruebe que los controles desplegados coincidan con la captura:

   ![CAP-CAT-WAS-01-LIST: listado inventario](../../images/mermas/01-listado-inventario.png)

2. Escriba un término en el buscador **Buscar por Material o Proveedor** o elija una opción en el filtro **Proveedor**.
3. Seleccione el botón **Buscar / filtrar** para actualizar la tabla; use **Limpiar filtros** para restablecerla.
4. En la tabla, seleccione **Nueva merma**, **Exportar Excel**, **Editar registro** o **Ajustar stock**, según la operación requerida.

La columna **Activo**, ubicada antes de **Acciones**, se muestra en la tabla únicamente al
administrador del sistema; los demás usuarios autorizados consultan las mermas sin esa columna.
