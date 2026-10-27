# 15. Errores y recuperación

## Elegir la acción adecuada

| Situación observable | Qué hacer | Cómo comprobar la recuperación |
| --- | --- | --- |
| Un campo tiene un mensaje de dato requerido o inválido. | Corrija el campo señalado, revise las demás secciones y vuelva a enviar. | El envío es aceptado y se muestra el resultado guardado. |
| Un selector no ofrece el registro esperado. | Compruebe su registro previo, disponibilidad, permisos y selección de la dependencia; busque y elija una opción. | El selector muestra el registro seleccionado. |
| La tabla está vacía. | Limpie filtros, revise contexto y fechas, y vuelva a buscar. | La consulta general muestra los registros esperados o confirma que no existen. |
| La consulta informa un error de carga. | Compruebe conexión y utilice Reintentar. | Se muestran datos del servicio. |
| Aparece Acceso no permitido. | Solicite revisión de permisos para esa función. | La persona autorizada puede entrar con su propia cuenta. |
| La sesión no puede comprobarse. | Restablezca conexión y use Volver a comprobar acceso; ingrese de nuevo si se solicita. | Se abre una página autorizada. |
| El registro cambió durante la edición. | Cierre y actualice el listado; vuelva a abrirlo y contraste la captura con la información vigente. | La nueva edición utiliza los datos actuales y se confirma sin conflicto. |
| Falta stock o la operación no corresponde al estado actual. | Consulte saldo y documento; prepare una operación que respete la existencia y el estado vigentes. | El documento y el saldo reflejan la operación aceptada. |
| Se perdió la respuesta después de guardar. | Consulte el documento o saldo antes de repetir; use la recuperación específica de merma si aparece. | Se determina si la operación anterior ya quedó registrada. |

## Conflictos de edición

Varias personas pueden trabajar sobre el mismo registro. Si el sistema informa
que cambió desde que lo abrió, conserva la captura para revisión y puede bloquear
el envío. En los formularios que lo ofrecen, use **Cerrar y actualizar listado**.
En los demás, cierre, vuelva a consultar y abra otra vez el registro.

Compare los datos actuales con la corrección que intentaba hacer. No use la
recarga del navegador como forma de forzar una captura antigua sobre un saldo
nuevo. Un conflicto evita que se pierda el trabajo ya guardado por otra persona.

## Resultado incierto al guardar

Una interrupción de conexión no demuestra que el servidor rechazó la operación:
puede haberla confirmado antes de perderse la respuesta.

1. Espere a que el servicio vuelva a responder.
2. Consulte el documento por folio, fecha, proveedor o proyecto, según el módulo.
3. Revise cantidades, estado, inventario e historial correspondientes.
4. Si ya está aplicado, continúe sin registrarlo otra vez.
5. Si no puede determinar el resultado, solicite soporte antes de repetir una
   entrada, recepción, surtido o devolución.

<!-- manual:any wastes:write wastes:add-stock -->
En altas y entradas adicionales de merma, **Recuperar captura** comprueba la misma
captura anterior. Utilice ese control cuando aparezca. No lo sustituya por una
nueva alta, un cambio de pesos o una segunda entrada independiente.

<!-- manual:end -->

## Solicitar soporte

Informe módulo, acción, hora aproximada, folio o nombre del registro y el mensaje
visible. Indique si había pulsado el botón que guarda y si después pudo consultar
el resultado. Una captura del mensaje y de los campos relevantes puede ayudar,
siempre que su organización autorice compartir esos datos.

No envíe contraseñas, cookies, tokens de sesión ni archivos de configuración.
El personal de soporte no necesita su contraseña para revisar un error de tabla,
conflicto de edición o descarga.
