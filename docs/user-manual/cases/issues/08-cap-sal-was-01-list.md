<a id="CAP-SAL-WAS-01-LIST"></a>
# 8. CAP-SAL-WAS-01-LIST — Listado

**Casos de uso:** `CU-SAL-08` — Consultar salidas de merma; `CU-SAL-14` — Generar reporte de salidas de merma.

**Errores posibles:** [Salidas de merma](../../error-messages.md#errores-salidas-merma).

**Controles que debe usar:** Buscador **Buscar por Folio o Proyecto**; filtros **Fecha de inicio:**, **Fecha de fin:**, **Cliente:**, **Área:**, **Persona:**, **Estado de surtido:** y **Observaciones contiene:**; botones **Buscar / filtrar**, **Limpiar filtros**, **Exportar Excel** y **Nueva salida**; acciones **Editar registro**, **Surtir detalle** y **Devolver material surtido** por fila.

1. Abra **Filtros** y compruebe que los controles desplegados coincidan con la captura:

   ![CAP-SAL-WAS-01-LIST: listado](../../images/salidas-merma/01-listado.png)

2. Escriba un término en **Buscar por Folio o Proyecto** o complete **Fecha de inicio:**, **Fecha de fin:**, **Cliente:**, **Área:**, **Persona:**, **Estado de surtido:** y **Observaciones contiene:**.
3. Seleccione **Buscar / filtrar** para actualizar la tabla; use **Limpiar filtros** para restablecerla.
4. Para localizar una devolución, cambie **Estado de surtido:** de **Pendiente** a **Surtido** y
   seleccione **Buscar / filtrar**. Compruebe el filtro aplicado y el resultado:

   <a id="CAP-SAL-WAS-07-FILTER"></a>
   ![CAP-SAL-WAS-07-FILTER: filtro Surtido aplicado](../../images/salidas-merma/07-filtro-surtido.png)

5. En la tabla, seleccione **Nueva salida**, **Exportar Excel**, **Editar registro**, **Surtir detalle** o **Devolver material surtido**, según la operación requerida.
