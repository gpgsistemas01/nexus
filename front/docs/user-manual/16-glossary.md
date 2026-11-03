# 16. Glosario para trabajar en Nexus

## Cómo consultar este glosario

Busque el término que necesita entender. Los procedimientos están en cada capítulo.

## Navegación y captura

| Término | Qué significa para su trabajo |
| --- | --- |
| Registro | Elemento guardado, como un material, cliente o solicitud. |
| Filtro | Condición que reduce los resultados, por ejemplo nombre, área o fecha. |
| Selector | Campo para buscar y elegir un registro existente. |
| Borrador | Datos preparados que todavía no ha guardado. |
| Confirmación de guardado | Mensaje que indica que Nexus aceptó el cambio. |
| Conflicto | Aviso de que el registro cambió desde que lo abrió. |

## Su cuenta y su área

| Término | Qué significa para su trabajo |
| --- | --- |
| Persona | Individuo registrado, por ejemplo un solicitante. Su registro no crea una cuenta de ingreso. |
| Usuario o cuenta | Acceso personal con nombre de usuario y contraseña. |
| Área | Departamento de una asignación o solicitud, como Impresión o Router. |
| Rol | Función de la cuenta, como Auxiliar, Coordinador, Operador o Instalador. |
| Permiso | Autorización para consultar o realizar una acción, según el rol y área. |

<!-- manual:any persons:page-view -->
**Responsabilidad de persona:** área y rol que describen su participación en el
trabajo. Se administra en Personas y no concede una cuenta de ingreso.
<!-- manual:end -->
<!-- manual:any users:manage -->
**Acceso de usuario:** área y rol de la cuenta que determinan sus acciones. Se
administra en Usuarios.
<!-- manual:end -->

<!-- manual:any materials:read wastes:page-view -->
## Artículos y existencias

| Término | Qué significa para su trabajo |
| --- | --- |
| Material | Artículo identificado por proveedor, presentación y medidas. |
| Consumible | Artículo con presentación y unidad, sin dimensiones. |
| Merma | Recurso residual o reutilizable con medidas y existencias propias. Puede seguir siendo útil. |
| Proveedor | Organización que suministra el artículo. Cada proveedor puede tener existencias distintas del mismo material. |
| Presentación | Forma comercial o física del artículo, por ejemplo un rollo. |
| Unidad de medida | Unidad de una cantidad, por ejemplo metros cuadrados. |
| Base y Altura | Medidas físicas del artículo o merma. No indican cuántas unidades hay disponibles. |
| Cantidad convertida | Cantidad expresada en la unidad de control del artículo; por ejemplo, metros cuadrados obtenidos de rollos. |
| Existencia o Stock actual | Cantidad disponible del artículo y proveedor consultados. |
| Stock mínimo | Referencia para identificar existencias bajas. Cambiarla conserva el saldo. |
| Activo / Inactivo | Disponibilidad para nuevas operaciones. Desactivar conserva historia y stock. |

<!-- manual:any wastes:add-stock materials:adjust-stock wastes:adjust-stock -->
### Cantidad a agregar y Nuevo stock

**Cantidad a agregar** es un incremento; **Nuevo stock**, el saldo que quedará.

<!-- manual:any wastes:add-stock -->
En **Agregar stock** de una merma, si hay 8 unidades y captura 3 en **Cantidad a
agregar**, el **Nuevo stock** calculado será 11. Los pasos están en [Mermas](05-wastes.md).
<!-- manual:end -->

<!-- manual:any materials:adjust-stock wastes:adjust-stock -->
En **Ajustar stock**, si hay 8 unidades y captura 3, el saldo queda en 3: se reduce en 5.
Compruebe el conteo y el motivo.
<!-- manual:end -->
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
| Folio | Referencia para localizar un documento. Es distinto de factura y proyecto. |
| Encabezado | Datos comunes del documento: fecha, proveedor, cliente u observaciones. |
| Detalle | Artículo incluido en una compra o salida, con su cantidad y demás datos. |
| Observaciones | Notas de la operación. Cada compra, ajuste o devolución conserva las suyas. |
<!-- manual:end -->

<!-- manual:any goods:receipts-page-view -->
## Compras

| Término | Qué significa para su trabajo |
| --- | --- |
| Compra o entrada de compra | Recepción de artículos de un proveedor. Al confirmarse incrementa existencias. |
| Persona que recibe | Persona a cuyo nombre queda la recepción. Puede ser distinta del usuario que captura la compra. |
| Factura / Remisión | Comprobante de la compra. Sólo Factura requiere número de factura. |
| Costo por presentación | Costo de una presentación del artículo. Difiere del costo máximo unitario del inventario. |
| Monto sin IVA / Monto con IVA | Importe antes o después del impuesto. |
| Corrección de detalle | Cambio de cantidad o costo que conserva los valores anteriores. |
| Cancelación de detalle | Reversión del inventario del detalle, con su historia conservada. Cancelar todos los detalles cancela la compra. |

Para capturar o corregir una recepción, siga [Compras](11-purchases.md).
<!-- manual:end -->

<!-- manual:any goods:issues-page-view waste:issues-page-view -->
## Salidas y cantidades entregadas

| Término | Qué significa para su trabajo |
| --- | --- |
| Salida o solicitud | Documento para pedir artículos a Almacén. Su registro aún no confirma la entrega. |
| Cliente | Organización o contexto comercial de la salida. Es distinto del número de proyecto. |
| Asesor | Persona asociada al contexto comercial de la salida. |
| Solicitante | Persona que requiere los artículos para el área elegida; puede ser distinta de quien captura. |
| Cantidad solicitada | Cantidad requerida en el detalle. Revísela antes de guardar la solicitud. |
| Cantidad suministrada o surtida | Cantidad entregada y registrada por Almacén. |
| Cantidad pendiente de surtir | Cantidad solicitada que todavía no se ha entregado. Una devolución no vuelve a abrir el detalle como pendiente. |
| Devolución / Cantidad devuelta | Reingreso de artículos entregados. Almacén registra la devolución; la consulta muestra cuánto regresó. |
| Estado de cumplimiento | **Pendiente**, **Surtido parcial**, **Surtido** o **Cancelado**. El surtido parcial deja otros detalles pendientes; es distinto de Activo/Inactivo. |

<!-- manual:any goods:issue-details-manage waste:issues-supply -->
### Referencias para surtir o devolver

| Término | Qué debe distinguir |
| --- | --- |
| Surtir | Registrar la entrega completa de los detalles seleccionados y descontar sus existencias. |
| Cantidad de proyecto | Referencia capturada al surtir para comparar el consumo previsto con la cantidad convertida. No sustituye la cantidad que se descuenta del inventario. |
| Saldo entregado | Cantidad suministrada menos devoluciones anteriores. Es el máximo que aún puede devolver, no el stock de Almacén. |

Si entregó 10 unidades y ya regresaron 4, puede recibir hasta 6 más en devolución.
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
