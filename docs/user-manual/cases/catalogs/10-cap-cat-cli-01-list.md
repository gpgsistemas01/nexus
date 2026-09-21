<a id="CAP-CAT-CLI-01-LIST"></a>
# 10. CAP-CAT-CLI-01-LIST — Listado

**Casos de uso:** `CU-CAT-05` — Consultar clientes; `CU-CAT-08` — Generar reporte de clientes.

**Errores posibles:** [Catálogos e inventario](../../error-messages.md#errores-catalogos).

**Controles que debe usar:** Buscador **Buscar por Nombre**, botones **Exportar Excel** y **Nuevo cliente**, y acción **Editar registro** de cada fila.

1. Antes de usar los controles, compruebe que la pantalla inicial coincida con la captura:

   ![CAP-CAT-CLI-01-LIST: listado](../../images/clients/01-list.png)

2. Escriba un término en el buscador **Buscar por Nombre** para localizar un cliente.
3. En la tabla, seleccione **Nuevo cliente**, **Exportar Excel** o la acción **Editar registro** de una fila.
4. Si selecciona **Exportar Excel**, Nexus abre el modal **Exportar reporte**. Confirme que se aplicarán la búsqueda, los filtros y el orden actuales; seleccione **Descargar** para continuar o cierre el modal para cancelar.

   <a id="CAP-CAT-CLI-04-EXPORT"></a>
   ![CAP-CAT-CLI-04-EXPORT: modal para exportar clientes](../../images/clients/04-export-report.png)
