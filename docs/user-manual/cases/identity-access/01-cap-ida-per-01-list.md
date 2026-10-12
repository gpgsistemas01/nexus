<a id="CAP-IDA-PER-01-LIST"></a>
# 1. CAP-IDA-PER-01-LIST — Listado

**Casos de uso:** `CU-IDA-01` — Consultar personas; `CU-IDA-04` — Generar reporte de personas.

**Antes de empezar:** Vamos a localizar un persona y reconocer sus datos. Tenga el nombre, folio o período que necesita consultar.

**Errores posibles:** [Catálogos e inventario](../../error-messages.md#errores-catalogos).

**Controles que debe usar:** Buscador **Buscar por Nombre**; filtros **Área** y **Rol**; botones **Buscar / filtrar**, **Limpiar filtros**, **Exportar Excel** y **Nueva persona**, y acción **Editar registro** por fila.

1. Abra **Filtros** y compruebe que los controles desplegados coincidan con la captura:

   ![CAP-IDA-PER-01-LIST: listado](../../images/people/01-list.png)

2. Escriba un término en **Buscar por Nombre** o elija opciones en los filtros **Área** y **Rol**.
3. Seleccione **Buscar / filtrar** para actualizar la tabla; use **Limpiar filtros** para restablecerla.
4. En la tabla, seleccione **Nueva persona**, **Exportar Excel** o **Editar registro** en una fila.
5. Si selecciona **Exportar Excel**, Nexus abre el modal **Exportar reporte**. Confirme que se aplicarán la búsqueda, los filtros y el orden actuales; seleccione **Descargar** para continuar o cierre el modal para cancelar.

   <a id="CAP-IDA-PER-04-EXPORT"></a>
   ![CAP-IDA-PER-04-EXPORT: modal para exportar personas](../../images/people/04-export-report.png)

**Compruebe el resultado:** Confirme que la fila corresponde al nombre o folio buscado. Consultar no modifica datos ni existencias.
