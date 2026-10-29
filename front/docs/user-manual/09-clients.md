# 9. Clientes

<!-- manual:all clients:create clients:read -->
## Registrar un cliente desde el selector

Utilice este procedimiento cuando esté preparando una salida y no encuentre el
cliente. El alta se abre dentro de la captura; no necesita una página de Directorio.

1. Abra **Cliente** y busque el nombre. Si ya existe, selecciónelo y continúe la salida.
2. Si no existe y aparece **Registrar cliente**, pulse esa acción.
3. En el modal **Registrar cliente**, revise el nombre precargado y complete **Nombre**.
4. Mantenga **Activo** marcado para poder utilizarlo en la operación.
5. Pulse **Guardar** una sola vez y espere la confirmación.
6. Compruebe que se cierra el alta y vuelve a la salida con el cliente nuevo seleccionado.
7. Continúe la captura y confirme la salida cuando haya revisado sus datos y detalles.

![Formulario para registrar un cliente.](images/16-client-form.png)

El formulario captura nombre y disponibilidad; no requiere teléfono. No utilice
el nombre para guardar datos ajenos a la identificación del cliente.
**Cerrar** abandona el alta sin crear ni seleccionar otro registro. Si falla el
alta, corrija el aviso y reintente; la salida permanece en preparación. El cliente
confirmado queda guardado por separado: cerrar después la salida no lo elimina.
<!-- manual:end -->

<!-- manual:any clients:page-view -->
## Consulta independiente

Con acceso de administración, abra **Directorio comercial → Clientes** y utilice
**Buscar por nombre** y **Buscar**. La tabla permite comprobar nombre y disponibilidad.
<!-- manual:end -->

<!-- manual:all clients:page-view clients:create -->
Para dar de alta desde esta página, pulse **Nuevo cliente**, complete los mismos
campos y guarde. El listado se actualiza; no hay una salida de origen que deba guardarse.
<!-- manual:end -->

<!-- manual:all clients:page-view clients:update -->
## Editar y desactivar

1. Localice la fila y pulse **Editar registro**.
2. Corrija **Nombre** o cambie **Activo**.
3. Pulse **Actualizar** y compruebe el resultado.

Desactivar impide utilizar el cliente en operaciones nuevas que requieren recursos
activos; conserva las salidas que ya lo utilizaron. Un conflicto requiere consultar
la versión vigente antes de preparar otra edición.
<!-- manual:end -->

<!-- manual:all clients:page-view client:reports-read -->
## Exportar clientes

Aplique la búsqueda y pulse **Exportar Excel**. El archivo utiliza la consulta
completa, no sólo la página visible. El [capítulo de reportes](14-reports.md)
explica las descargas y cómo resolver un fallo.
<!-- manual:end -->
