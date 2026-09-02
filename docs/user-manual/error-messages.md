# Mensajes de error y recuperación

## Cómo presenta Nexus un error

Nexus conserva el formulario abierto cuando detecta datos inválidos y marca el campo que debe
corregirse. Los errores que no corresponden a un campo aparecen como notificación o diálogo. No
se debe repetir una operación que modifica datos hasta comprobar si el registro, el documento o
la existencia cambiaron.

| Situación | Presentación | Acción recomendada |
|---|---|---|
| Datos incompletos o con formato inválido | Mensaje junto al campo y desplazamiento al primer error. | Corrija únicamente los campos señalados y vuelva a confirmar. |
| Sesión inválida o vencida | Mensaje **Sesión inválida. Inicia sesión nuevamente.** y regreso al acceso. | Inicie sesión nuevamente; no comparta credenciales. |
| Permiso insuficiente | Mensaje **No tienes permisos para realizar esta acción.** | Solicite que se revisen el rol, el área y el permiso asignado. |
| Registro relacionado no encontrado | Diálogo de advertencia con el nombre del elemento que no se encontró. | Actualice el listado y seleccione un registro vigente. |
| Conflicto con el estado o las reglas del proceso | Diálogo de advertencia que explica la regla incumplida. | Revise el estado actual y siga la alternativa indicada en este catálogo. |
| Error del servidor o de base de datos | Notificación **Error del servidor.**, **Error interno del servidor.** o un mensaje que comienza con **Error de base de datos...** | Conserve el mensaje y el folio visible, deje de repetir la escritura y contacte a soporte. |
| Problema de conexión | Mensaje **No fue posible conectar con el servidor.** u **Ocurrió un error inesperado.** | Verifique la conexión; antes de repetir una escritura, actualice el listado para confirmar su estado. |

Los textos pueden incluir el nombre de un material, proveedor, área, proyecto o folio ficticio del
registro involucrado. Esos valores dan contexto al mensaje y no representan otro tipo de error.

## Acceso y autorización

| Mensaje visible | Motivo habitual | Qué hacer |
|---|---|---|
| **Usuario o contraseña incorrectos.** | Las credenciales no coinciden con una cuenta habilitada. | Capture nuevamente los datos o solicite restablecimiento; no pruebe credenciales ajenas. |
| **Sesión inválida. Inicia sesión nuevamente.** | La sesión venció, fue revocada o no puede validarse. | Regrese al acceso e inicie una sesión nueva. |
| **No tienes permisos para realizar esta acción.** | La cuenta no posee el permiso de la operación solicitada. | Solicite revisión del rol y el área. |
| **Reuso de sesión detectado.** | Nexus detectó que una sesión o token se intentó reutilizar. | Cierre las ventanas abiertas, vuelva a iniciar sesión y reporte el evento si se repite. |
| **Enlace inválido. Solicita uno nuevo.** | El enlace ya no es válido o no corresponde al flujo actual. | Solicite un enlace nuevo. |

## Validación de formularios

Nexus puede combinar varios mensajes en un mismo intento. Los más frecuentes son:

- **El campo es requerido**: proveedor, material, persona que recibe, asesor, solicitante,
  cliente, área, presentación, unidad, razón, rol, nombre, usuario, contraseña, fechas, cantidad,
  existencia nueva, existencia mínima o costo máximo no fueron capturados.
- **El valor no es válido**: un selector conserva un identificador inexistente, una fecha no tiene
  el formato admitido o una selección ya no está disponible.
- **Debe ser un número** o **debe ser un número mayor a cero**: cantidades, dimensiones,
  existencias o costos contienen texto, son cero cuando el proceso exige un valor positivo o
  exceden el tamaño admitido.
- **No debe exceder _N_ caracteres** o **es demasiado grande**: el texto o número supera el
  límite del campo.
- **Contiene caracteres no válidos**: nombres, observaciones, facturas o usuarios contienen un
  formato no permitido.
- **El nombre de usuario no debe contener espacios** y **Solo se permiten letras, números y
  guiones bajos.**
- **La contraseña debe tener al menos 8 caracteres**, **debe contener al menos un número**,
  **una mayúscula** y **un carácter especial**.
- **La lista de detalles debe contener al menos un material** o **Cada detalle debe contener un
  material, una cantidad y un costo por presentación.**
- **El stock mínimo no puede ser mayor al máximo.**

Los errores de formato no registran cambios. Se deben corregir los campos indicados en el mismo
formulario, sin abrir otra cuenta ni crear un registro duplicado.

## Catálogos e inventario

| Mensaje visible | Recuperación |
|---|---|
| **Material no encontrado.**, **Proveedor no encontrado.**, **Cliente no encontrado.**, **Persona no encontrada.**, **Usuario no encontrado.** o **La merma no existe.** | Actualice el listado. El registro pudo haberse retirado o modificado desde otra sesión. |
| **Presentación no encontrada.**, **Unidad no encontrada.**, **Departamento no encontrado.** o **Razón de stock inicial no encontrada para registrar...** | No continúe el alta o ajuste; solicite revisar el catálogo de configuración. |
| **Ya existe un material con el mismo nombre, presentación, unidad de medida y dimensiones.** | Seleccione el material existente o cambie únicamente los datos que realmente distinguen al material. |
| **Ya existe una merma con el nombre, proveedor y dimensiones indicados.** | Seleccione la merma existente; no duplique el registro. |
| **No se puede cambiar el proveedor del material porque ya tiene historial de compras o salidas.** | Conserve la relación histórica y registre la identidad correcta conforme al flujo de materiales. |
| **No se puede eliminar la relación entre el material y el proveedor porque el material tiene historial de compras, salidas, mermas, movimientos o ajustes de stock.** | Retire o desactive el registro cuando el flujo lo permita; no intente borrar su historia. |

## Compras

| Mensaje visible | Recuperación |
|---|---|
| **Recibo de mercancía no encontrado.** | Actualice el listado de compras y confirme el folio. |
| **La factura ya está registrada en otra compra (_folio_). Edita esa compra para agregar los materiales faltantes; crea una compra nueva únicamente cuando corresponda a otra factura o recepción.** | Abra la compra indicada; no vuelva a registrar la misma factura. |
| **No se puede modificar una compra cancelada.** | Consulte la compra como historial; no intente editarla. |
| **No se puede cambiar el proveedor de una compra confirmada porque sus movimientos de inventario ya están asociados al proveedor original.** | Conserve el proveedor original y aplique únicamente una corrección permitida. |
| **No hay cambios para aplicar en el detalle de la compra.** | Modifique un valor admitido o cierre el diálogo sin confirmar. |
| **La cantidad corregida del detalle debe ser mayor a cero y no exceder la cantidad registrada.** | Capture una cantidad dentro del intervalo permitido. |
| **Stock insuficiente para corregir la compra con el material...** | Revise la existencia actual y la cantidad que pretende descontar antes de corregir. |
| **El detalle de la compra ya está cancelado.** | Actualice la compra y no repita la cancelación. |
| **Razón para modificar el detalle de compra no encontrada.** | Solicite revisar el catálogo de motivos antes de continuar. |

## Salidas de material

| Mensaje visible | Recuperación |
|---|---|
| **Salida de almacén no encontrada.** o **Detalle de salida de almacén no encontrado.** | Actualice el listado y vuelva a seleccionar la salida o el detalle. |
| **Stock inexistente para realizar la salida...** | Verifique material, proveedor y dimensiones; no confirme la salida. |
| **Stock insuficiente para realizar la salida...** | Reduzca la cantidad o espere a que exista disponibilidad confirmada. |
| **No se puede realizar la salida porque el material no tiene costo unitario máximo configurado...** | Solicite configurar el costo máximo del material antes de surtir. |
| **La salida solo puede editarse cuando está pendiente.** | Actualice la salida y use únicamente la acción disponible para su estado. |
| **La salida ya tiene materiales surtidos y no puede editarse en general.** | Edite sólo el encabezado o use devolución, según las acciones disponibles. |
| **No se pueden editar o eliminar detalles que ya fueron surtidos.** | Devuelva primero la cantidad surtida cuando el proceso lo permita. |
| **La cantidad a devolver no puede exceder la cantidad surtida del detalle.** | Capture como máximo la cantidad retornable mostrada. |
| **Solo se pueden registrar devoluciones cuando la salida está surtida.** | Revise el estado de cumplimiento antes de devolver. |
| **Para el cliente GPG INTERNO, el asesor debe tener el rol Coordinador.** | Seleccione una persona con el rol requerido. |
| **Para el cliente GPG INTERNO, el número de proyecto _X_ no coincide con el área _Y_.** | Corrija el proyecto o el área de acuerdo con la solicitud autorizada. |

## Salidas de merma

| Mensaje visible | Recuperación |
|---|---|
| **La salida de merma no existe.** o **Uno o más detalles no pertenecen a la salida de merma.** | Actualice el listado y vuelva a abrir el registro. |
| **El solicitante de la salida de merma no existe.** o **El asesor de la salida de merma no existe.** | Seleccione una persona vigente. |
| **Stock insuficiente para surtir la merma...** | Reduzca la cantidad o confirme disponibilidad antes de surtir. |
| **La salida de merma no puede modificarse en su estado actual.** | Actualice el registro y utilice sólo las acciones habilitadas. |
| **La salida de merma ya tiene detalles surtidos y solo puede editarse el encabezado.** | No modifique los detalles surtidos; use devolución cuando corresponda. |
| **El asesor no corresponde al cliente seleccionado.** | Seleccione la relación autorizada entre asesor y cliente. |
| **El número de proyecto no corresponde al cliente y área seleccionados.** | Corrija cliente, área o proyecto antes de confirmar. |
| **La cantidad a devolver no es válida.** | Capture una cantidad positiva que no exceda la cantidad retornable. |
| **Solo se pueden devolver detalles de una salida surtida.** | Revise el estado de la salida antes de devolver. |

## Reportes

| Mensaje visible | Recuperación |
|---|---|
| **No se pudo exportar el archivo. Inténtalo nuevamente.** | Conserve los filtros, verifique la conexión y vuelva a solicitar el archivo una sola vez. |
| **No se pudo exportar el archivo. Verifica tu conexión e inténtalo de nuevo.** | Verifique la conexión. Si persiste, conserve el módulo, los filtros y el periodo seleccionados para soporte. |
| Un mensaje específico devuelto por el servidor durante la descarga. | No se genera un archivo válido. Conserve el texto y los filtros; no publique un archivo parcial. |

## Error 404 — Página no encontrada

Nexus muestra una página con **Error 404** y el texto **La página que estás buscando no existe.**
cuando la dirección web no corresponde a una vista registrada. También puede mostrarla cuando
una cuenta intenta abrir directamente una vista para la cual no tiene autorización; así no se
revela la existencia de opciones restringidas.

Seleccione **Volver**. Con una sesión válida, el botón conduce al inventario de materiales; sin
sesión, conduce al inicio de sesión. Si el error apareció desde una opción visible de Nexus,
conserve la dirección y repórtela. No modifique manualmente la URL para intentar acceder a otra
área.

La captura automatizada tiene el ID `CAP-ERR-404-NOT-FOUND` y la ruta
`docs/user-manual/images/errores/01-pagina-no-encontrada.png`. Se incorpora al manual únicamente
después de generar y revisar la imagen real.

Una petición técnica a una ruta de API inexistente recibe el mensaje **Ruta no encontrada.** en
formato JSON; este caso corresponde a integraciones y no requiere una acción distinta del usuario
final.
