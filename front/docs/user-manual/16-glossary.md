# 16. Glosario para trabajar en Nexus

## Cómo consultar este glosario

Busque la sección relacionada con su tarea. Cada tabla explica las palabras que
encontrará en las pantallas y qué debe comprobar al utilizarlas. Para realizar una
operación, siga los pasos del capítulo correspondiente. Conocer un término no
significa que su cuenta tenga acceso a esa acción.

## Navegación y captura

| Término | Qué significa para su trabajo |
| --- | --- |
| Registro | Elemento guardado, como un material, cliente o solicitud. |
| Fila | Línea de una tabla. Sus botones actúan sobre el registro de esa línea. |
| Filtro | Condición para reducir la lista, por ejemplo nombre, área o fecha. Pulse **Buscar** para aplicarla; filtrar no modifica registros. |
| Selector | Campo donde debe elegir una opción de la lista. Escribir el nombre sin seleccionarlo puede dejar la captura incompleta. |
| Borrador | Datos preparados en un formulario que todavía no ha guardado. Agregar un detalle al borrador no registra el documento completo. |
| Confirmación de guardado | Mensaje que indica que el sistema aceptó la operación. Cerrar la pantalla después no deshace el cambio. Si no recibió una respuesta, consulte [Errores y recuperación](15-errors-and-recovery.md) antes de repetirlo. |
| Conflicto | Aviso de que el registro cambió desde que lo abrió. Consulte los datos actuales antes de intentar guardar otra vez. |

## Su cuenta y su área

| Término | Qué significa para su trabajo |
| --- | --- |
| Persona | Individuo registrado, por ejemplo un solicitante. Tener un registro de persona no implica tener una cuenta para ingresar. |
| Usuario o cuenta | Acceso con nombre de usuario y contraseña. Utilice su propia cuenta para que las operaciones queden asociadas a quien las realiza. |
| Área | Departamento al que corresponde una asignación o solicitud, por ejemplo Impresión o Router. No es el tipo de artículo. |
| Rol | Función asignada a una cuenta, como Auxiliar, Coordinador, Operador o Instalador. Las acciones disponibles dependen de su combinación de rol y área. |
| Permiso | Autorización para consultar o realizar una acción. Ver un listado no significa que pueda modificar sus registros. |

<!-- manual:any persons:page-view users:manage -->
| Término de administración | Qué debe distinguir |
| --- | --- |
| Responsabilidad de persona | Rol y área que describen la participación de una persona en el trabajo. Asignarlos no le da acceso para ingresar a Nexus. |
| Acceso de usuario | Rol y área asignados a una cuenta para determinar sus acciones disponibles. Revise la asignación completa al administrar accesos. |
<!-- manual:end -->

<!-- manual:any materials:read wastes:page-view -->
## Artículos y existencias

| Término | Qué significa para su trabajo |
| --- | --- |
| Material | Artículo del inventario de **Materiales**. Compare proveedor, presentación y medidas para elegir el correcto. |
| Consumible | Artículo del inventario de **Consumibles**, con presentación y unidad, sin dimensiones. Se consulta por separado de Materiales. |
| Merma | Recurso residual o reutilizable con medidas y existencias propias. En Nexus no significa necesariamente material desechado. |
| Proveedor | Organización que suministra el artículo. Un mismo material puede tener existencias diferentes con cada proveedor. |
| Presentación | Forma comercial o física del artículo, por ejemplo un rollo. No la confunda con la unidad de medida. |
| Unidad de medida | Unidad que acompaña a una cantidad, por ejemplo metros cuadrados. Lea la unidad antes de interpretar o capturar una cantidad. |
| Base y Altura | Medidas físicas del artículo o merma. No indican cuántas unidades hay disponibles. |
| Cantidad convertida | Cantidad expresada según la conversión del artículo. Por ejemplo, los rollos y los metros cuadrados representan magnitudes distintas; consulte la unidad mostrada. |
| Existencia o Stock actual | Cantidad disponible en el registro consultado. Compruebe artículo y proveedor antes de usar ese saldo como referencia. |
| Stock mínimo | Umbral para identificar existencias bajas. Cambiar ese umbral no agrega ni retira artículos. |
| Activo / Inactivo | Disponibilidad del registro para operaciones posteriores. Desactivarlo conserva su historia y no cambia por sí solo su stock. |

### Cantidad a agregar y Nuevo stock

**Cantidad a agregar** es un incremento; **Nuevo stock**, el saldo que quedará.
Lea el nombre de la acción junto al campo: el mismo valor tiene consecuencias
diferentes en una entrada y en un ajuste.

<!-- manual:any wastes:add-stock -->
En **Agregar stock** de una merma, si hay 8 unidades y captura 3 en **Cantidad a
agregar**, el **Nuevo stock** calculado será 11. Los pasos están en [Mermas](05-wastes.md).
<!-- manual:end -->

<!-- manual:any materials:adjust-stock wastes:adjust-stock -->
En **Ajustar stock**, **Nuevo stock** es el total que debe quedar. Si hay 8 unidades
y captura 3, el saldo queda en 3: se reduce en 5. Revise el conteo y la razón antes
de confirmar; no utilice el ajuste para registrar una entrega ordinaria.
<!-- manual:end -->

<!-- manual:any inventory:costs-read -->
### Costos

| Término | Qué debe distinguir |
| --- | --- |
| Costo máximo unitario / Costo Máximo | Referencia del mayor costo por unidad convertida conservado para el registro. No es el importe total de una compra. |
<!-- manual:end -->
<!-- manual:end -->

<!-- manual:any goods:receipts-page-view goods:issues-page-view waste:issues-page-view -->
## Documentos y participantes

| Término | Qué significa para su trabajo |
| --- | --- |
| Folio | Referencia visible para localizar un documento y pedir ayuda. No es el número de factura ni el número de proyecto. |
| Encabezado | Datos generales de un documento, como fecha, proveedor, cliente u observaciones. Se comparten entre sus detalles. |
| Detalle | Renglón del documento que identifica un artículo y una cantidad. Compruebe cada renglón antes de guardar. |
| Observaciones | Explicación adicional de la operación. Las observaciones de una compra, un ajuste o una devolución corresponden a registros distintos. |
<!-- manual:end -->

<!-- manual:any goods:receipts-page-view -->
## Compras

| Término | Qué significa para su trabajo |
| --- | --- |
| Compra o entrada de compra | Recepción registrada de materiales o consumibles de un proveedor. Confirmarla incrementa existencias; no es una solicitud de compra futura. |
| Persona que recibe | Persona a cuyo nombre queda la recepción. Puede ser distinta del usuario que captura la compra. |
| Factura / Remisión | Tipo de comprobante de la compra. Una compra con factura requiere su número; una compra con remisión no lleva número de factura. |
| Costo por presentación | Costo capturado en un detalle de compra según su presentación. No lo confunda con el costo máximo unitario del inventario. |
| Monto sin IVA / Monto con IVA | Importe antes o después del impuesto. Es un valor monetario, no una cantidad de artículos. |
| Corrección de detalle | Cambio que conserva el valor anterior y el motivo. Revise su efecto sobre existencias e importes antes de confirmar. |
| Cancelación de detalle | Operación que revierte el inventario de ese detalle y conserva su historia. La compra queda cancelada cuando todos sus detalles están cancelados. |

Para capturar o corregir una recepción, siga [Compras](11-purchases.md).
<!-- manual:end -->

<!-- manual:any goods:issues-page-view waste:issues-page-view -->
## Salidas y cantidades entregadas

| Término | Qué significa para su trabajo |
| --- | --- |
| Salida o solicitud | Documento para solicitar artículos a Almacén. Crear la solicitud todavía no registra su entrega. |
| Cliente | Organización o contexto comercial al que corresponde la salida. Se captura por separado del número de proyecto. |
| Asesor | Persona asociada al contexto comercial de la salida. No es necesariamente quien ingresa o captura en Nexus. |
| Solicitante | Persona que requiere los artículos para el área elegida. Puede ser distinta del usuario que registra la salida. |
| Cantidad solicitada | Cantidad requerida en el detalle. Revísela antes de guardar la solicitud. |
| Cantidad suministrada o surtida | Cantidad que Almacén ya entregó y registró. No equivale al stock que permanece disponible. |
| Cantidad pendiente de surtir | Cantidad solicitada que todavía no se ha entregado. Una devolución no vuelve a abrir el detalle como pendiente. |
| Devolución / Cantidad devuelta | Reingreso de artículos que se habían entregado. Almacén registra la devolución; la cantidad devuelta permite consultar cuánto regresó. |
| Estado de cumplimiento | Avance de la salida: **Pendiente**, **Surtido parcial**, **Surtido** o **Cancelado**. El surtido parcial significa que quedan otros detalles pendientes. No es el estado Activo/Inactivo de un catálogo. |

<!-- manual:any goods:issue-details-manage waste:issues-supply -->
### Referencias para surtir o devolver

| Término | Qué debe distinguir |
| --- | --- |
| Surtir | Registrar la entrega de la cantidad pendiente completa de los detalles seleccionados. Descuenta existencias al confirmarse. |
| Cantidad de proyecto | Referencia capturada al surtir para comparar el consumo previsto con la cantidad convertida. No sustituye la cantidad que se descuenta del inventario. |
| Saldo entregado | Cantidad suministrada menos devoluciones anteriores. Es el máximo que aún puede devolver, no el stock de Almacén. |

Por ejemplo, si entregó 10 unidades y ya regresaron 4, quedan 6 disponibles para
devolución. Devolverlas conserva el historial; no borra la entrega original.
<!-- manual:end -->

Consulte [Salidas](12-issues.md) para los pasos y las restricciones de cada operación.
<!-- manual:end -->

<!-- manual:any movements:read -->
## Historial de inventario

| Término | Qué significa para su trabajo |
| --- | --- |
| Movimiento | Registro del efecto de una operación sobre las existencias. Permite revisar su origen, cantidad y saldos. |
| Stock anterior / Nuevo stock | Saldo inmediatamente antes y después de ese movimiento. Un saldo histórico puede ser diferente del stock actual. |
| Trazabilidad | Posibilidad de seguir una operación mediante su folio, documento, movimientos y participantes. Use esas referencias al reportar una diferencia. |

Los pasos de consulta están en [Movimientos](13-movements.md).
<!-- manual:end -->
