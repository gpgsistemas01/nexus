# 15. Errores y recuperación

Si aparece un aviso de error al enviar un formulario, lea el mensaje y pulse
**Volver al formulario**. Se conservan sus datos; cerrar el aviso no repite el envío.
Los errores junto a un campo se corrigen directamente en ese campo.

## Elegir la acción adecuada

| Situación observable | Qué hacer | Cómo comprobar la recuperación |
| --- | --- | --- |
| Un campo señala un dato requerido o inválido. | Corrija el campo y vuelva a enviar. | Se confirma el guardado. |
| Falta una opción en el selector. | Busque el nombre y revise la selección previa, por ejemplo el proveedor. | Puede seleccionar el registro correcto. |
| La tabla está vacía. | Limpie filtros, revise contexto y fechas, y vuelva a buscar. | La consulta general muestra los registros esperados o confirma que no existen. |
| La consulta informa un error de carga. | Compruebe conexión y pulse **Reintentar**. | Se muestran los datos. |
| Aparece Página no encontrada. | Revise el enlace o pulse **Volver al inicio**. | Se abre el acceso a Nexus. |
| Aparece No se pudo cargar la aplicación. | Compruebe conexión y pulse **Volver a intentar**. | Se carga la página; si persiste, solicite soporte. |
| Aparece Acceso no permitido. | Solicite revisión de permisos para esa función. | La persona autorizada puede entrar con su propia cuenta. |
| La sesión sigue sin poder comprobarse tras los reintentos automáticos. | Restablezca conexión y use **Volver a comprobar el acceso**; ingrese de nuevo si se solicita. | Se abre una página autorizada. |
| El registro cambió durante la edición. | Siga **Conflictos de edición**, abajo. | Puede revisar y guardar la corrección vigente. |
| Se perdió la respuesta al guardar. | Siga **Resultado incierto al guardar**, abajo. | Comprueba si el envío anterior se registró. |

<!-- manual:any materials:write materials:adjust-stock wastes:write wastes:add-stock wastes:adjust-stock goods:receipts-manage goods:issue-details-manage waste:issues-supply -->
Si el saldo o el estado impiden operar, vuelva a consultar el documento y las existencias.
<!-- manual:end -->

## Costo sin registrar

El costo puede ser cero sólo en el alta inicial. Si un artículo sin costo impide
registrar o surtir una salida, solicite su configuración al responsable de **Almacén**.
Las compras no actualizan ese costo.

<!-- manual:any materials:write wastes:write -->
En **Almacén**, edite el artículo y capture un costo máximo mayor que cero.
Un costo vacío o cero impide guardar la edición.
<!-- manual:end -->

<!-- manual:any goods:issues-page-view waste:issues-page-view -->
## Una salida antigua entregada sigue pendiente

Anote el folio y solicite su regularización al responsable de Almacén.
**Surtir** registra una entrega y descuenta stock; repetir una entrega ya realizada
puede descontarla dos veces. El cierre histórico sin movimiento aún no está disponible.
El saldo actual puede corregirse con **Ajustar stock**, con un conteo físico y sus permisos.
<!-- manual:end -->

## Conflictos de edición

El formulario conserva su captura y bloquea el envío. Use **Cerrar y actualizar
listado**, o cierre y vuelva a abrir el registro. Compare los datos actuales antes
de preparar otra corrección.

## Resultado incierto al guardar

El cambio puede haberse guardado aunque no haya recibido la confirmación.

1. Espere a que el servicio vuelva a responder.
2. Consulte el documento por folio, fecha, proveedor o proyecto, según el módulo.
3. Revise cantidades, estado, inventario e historial correspondientes.
4. Si ya está aplicado, continúe sin registrarlo otra vez.
5. Si no puede determinar el resultado, solicite soporte antes de repetir la operación.

<!-- manual:any wastes:write wastes:add-stock -->
En Mermas, use **Recuperar captura** cuando aparezca. Conserva el intento anterior;
abrir otra alta puede duplicarlo.

<!-- manual:end -->

## Solicitar soporte

Informe módulo, acción, hora, folio y mensaje. Indique si pulsó guardar y si pudo
consultar el resultado. Adjunte una captura cuando su organización lo permita.
No comparta su contraseña.
