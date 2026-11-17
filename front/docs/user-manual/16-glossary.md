# 16. Glosario para trabajar en Nexus

## Navegación y captura

| Término | Qué significa para su trabajo |
| --- | --- |
| Registro | Elemento guardado en el módulo. |
| Filtro | Condición que reduce los resultados de una consulta. |
| Selector | Campo para buscar y elegir un registro existente. |
| Borrador | Datos preparados que todavía no ha guardado. |
| Confirmación de guardado | Mensaje que indica que Nexus aceptó el cambio. |
| Conflicto | Aviso de que el registro cambió desde que lo abrió. |

## Su cuenta y su área

| Término | Qué significa para su trabajo |
| --- | --- |
| Usuario o cuenta | Acceso personal con nombre de usuario y contraseña. |
| Área | Departamento de una asignación o solicitud. |
| Rol | Función de la cuenta dentro de su área. |
| Permiso | Autorización para consultar o realizar una acción. |

<!-- module:any persons users purchases issues clients -->

**Persona:** individuo registrado; no implica una cuenta de ingreso.

<!-- module:end -->

<!-- module:any persons -->
<!-- manual:any persons:page-view -->

**Responsabilidad de persona:** área y rol que describen su participación en el trabajo. Se administra en Personas y no concede una cuenta de ingreso.

<!-- manual:end -->
<!-- module:end -->

<!-- module:any users -->
<!-- manual:any users:manage -->

**Acceso de usuario:** área y rol de la cuenta que determinan sus acciones. Se administra en Usuarios.

<!-- manual:end -->
<!-- module:end -->

<!-- manual:any materials:read wastes:page-view -->
<!-- module:any inventory -->

## Artículos y existencias

| Término | Qué significa para su trabajo |
| --- | --- |
| Artículo | Registro identificado por proveedor, presentación y unidad. |
| Proveedor | Suministra artículos; sus existencias se controlan por separado. |
| Presentación | Forma comercial o física del artículo. |
| Unidad de medida | Unidad de una cantidad. |
| Cantidad convertida | Cantidad expresada en la unidad de control. |
| Existencia o Stock actual | Cantidad disponible del artículo y proveedor consultados. |

<!-- module:any materials -->

### Materiales

| Término | Qué significa para su trabajo |
| --- | --- |
| Material | Artículo identificado por proveedor, presentación y medidas. |
| Base y Altura | Medidas físicas del artículo; no indican cuántas unidades hay disponibles. |

<!-- module:end -->

<!-- module:any consumables -->

### Consumibles

| Término | Qué significa para su trabajo |
| --- | --- |
| Consumible | Artículo con presentación y unidad, sin dimensiones. |

<!-- module:end -->

<!-- module:any wastes -->

### Mermas

| Término | Qué significa para su trabajo |
| --- | --- |
| Merma | Sobrante reutilizable con medidas y existencias propias. |
| Base y Altura | Medidas físicas de la merma; no indican cuántas unidades hay disponibles. |
| Material de referencia | Artículo de origen que determina presentación, unidad y características de la merma. |

<!-- module:end -->

<!-- module:any warehouse -->

### Datos del inventario

| Término | Qué significa para su trabajo |
| --- | --- |
| Stock mínimo | Referencia para identificar existencias bajas; cambiarla conserva el saldo. |
| Activo / Inactivo | Disponibilidad para nuevas operaciones; desactivar conserva historia y stock. |

<!-- manual:any materials:adjust-stock wastes:adjust-stock -->

**Nuevo stock:** saldo final que debe quedar después de un ajuste. Si hay 8 y captura 3, el saldo queda en 3: se reduce en 5. Compruebe el conteo y el motivo.

<!-- manual:end -->

<!-- module:any wastes -->
<!-- manual:any wastes:add-stock -->

**Cantidad a agregar:** incremento de existencias. Si hay 8 y agrega 3, el nuevo stock calculado será 11. Es distinto de reemplazar el saldo en un ajuste.

<!-- manual:end -->
<!-- module:end -->

<!-- manual:any inventory:costs-read -->

**Costo máximo unitario:** referencia por unidad configurada en Almacén; no es el total de una compra.

<!-- manual:end -->
<!-- module:end -->
<!-- module:end -->

<!-- manual:end -->

<!-- manual:any goods:receipts-page-view goods:issues-page-view waste:issues-page-view -->
<!-- module:any documents -->

## Documentos y participantes

| Término | Qué significa para su trabajo |
| --- | --- |
| Folio | Referencia para localizar un documento. |
| Encabezado | Datos comunes del documento: folio, fecha y observaciones. |
| Detalle | Artículo incluido en el documento, con su cantidad y demás datos. |
| Observaciones | Notas de la operación; cada registro conserva las suyas. |

<!-- module:end -->

<!-- manual:end -->

<!-- manual:any goods:receipts-page-view -->
<!-- module:any purchases -->

## Compras

| Término | Qué significa para su trabajo |
| --- | --- |
| Compra o entrada de compra | Recepción de artículos de un proveedor; al confirmarse incrementa existencias. |
| Persona que recibe | Persona a cuyo nombre queda la recepción; puede ser distinta del usuario que captura. |
| Factura / Remisión | Comprobante de la compra; sólo Factura requiere número de factura. |
| Costo por presentación | Costo de una presentación del artículo; difiere del costo máximo del inventario. |
| Monto sin IVA / Monto con IVA | Importe antes o después del impuesto. |
| Corrección de detalle | Cambio de cantidad o costo que conserva los valores anteriores. |
| Cancelación de detalle | Reversión del inventario del detalle, con su historia conservada. |

<!-- module:end -->

<!-- manual:end -->

<!-- manual:any goods:issues-page-view waste:issues-page-view -->
<!-- module:any issues -->

## Salidas y cantidades entregadas

| Término | Qué significa para su trabajo |
| --- | --- |
| Salida o solicitud | Documento para pedir artículos a Almacén; su registro aún no confirma la entrega. |
| Cliente | Organización o contexto comercial de la salida; es distinto del número de proyecto. |
| Asesor | Persona asociada al contexto comercial de la salida. |
| Solicitante | Persona que requiere los artículos para el área elegida. |
| Cantidad solicitada | Cantidad requerida en el detalle. |
| Cantidad suministrada o surtida | Cantidad entregada y registrada por Almacén. |
| Cantidad pendiente de surtir | Cantidad solicitada que todavía no se ha entregado; una devolución no vuelve a abrir el pendiente. |
| Devolución / Cantidad devuelta | Reingreso de artículos entregados; Almacén registra la devolución y la consulta muestra cuánto regresó. |
| Estado de cumplimiento | Pendiente, Surtido parcial, Surtido o Cancelado; es distinto de Activo/Inactivo. |

<!-- manual:any goods:issue-details-manage waste:issues-supply -->

### Referencias para surtir o devolver

| Término | Qué debe distinguir |
| --- | --- |
| Surtir | Registrar una entrega parcial o completa y descontar existencias. |
| Cantidad a surtir | Lo que entregará ahora; no debe superar el saldo pendiente. |
| Cantidad de proyecto | Referencia de consumo previsto; no sustituye la cantidad que descuenta inventario. |
| Saldo entregado | Cantidad suministrada menos devoluciones anteriores; máximo que puede devolver, distinto del stock. |

Si entregó 10 y ya regresaron 4, puede recibir hasta 6 más en devolución.

<!-- manual:end -->

<!-- manual:any issues:reconcile -->

**Entrega histórica:** reconocimiento de una entrega física ya realizada cuyo registro faltaba; conserva existencias y permite recuperar el recibo con la misma clave.

<!-- manual:end -->
<!-- module:end -->

<!-- manual:end -->

<!-- manual:any movements:read -->
<!-- module:any movements -->

## Historial de inventario

| Término | Qué significa para su trabajo |
| --- | --- |
| Movimiento | Efecto de una operación sobre las existencias, con origen, cantidad y saldos. |
| Stock anterior / Nuevo stock | Saldo antes y después de ese movimiento; puede diferir del stock actual. |
| Trazabilidad | Posibilidad de seguir una operación mediante su folio, documento y movimientos. |

<!-- module:end -->

<!-- manual:end -->

<!-- manual:any warehouse:reports-read admin:reports-read person:reports-read client:reports-read supplier:reports-read materials:write materials:adjust-stock wastes:write wastes:adjust-stock -->
<!-- module:any import report -->

## Archivos de trabajo

<!-- module:any report -->

**Reporte de consulta:** archivo descargado para revisar información y totales; no guarda cambios en Nexus.

<!-- module:end -->

<!-- module:any import -->

| Término | Significado |
| --- | --- |
| Plantilla operativa | Excel de una operación de inventario, con hojas, captura y referencias. |
| Informe de errores | Filas y columnas que debe corregir en la copia de captura; no sustituye esa copia. |
| ID y versión | Identidad del registro y de la lectura descargada; detectan cambios posteriores. |
| Stock contado | Saldo físico final; cero expresa ausencia de existencias y vacío no es un conteo. |

<!-- module:end -->
<!-- module:end -->

<!-- manual:end -->


<!-- module:any catalogs -->

## Catálogo del módulo

| Término | Significado |
| --- | --- |
| Catálogo | Lista administrable cuyos registros aparecen como opciones en los formularios. |
| Activo | Opción disponible para las nuevas operaciones que utilizan este catálogo. |

<!-- module:end -->

<!-- module:any catalog-unit-measures -->

**Unidad de medida:** nombre y símbolo para expresar una cantidad. **Símbolo:** abreviatura de la unidad.

<!-- module:end -->

<!-- module:any catalog-presentations -->

**Presentación:** forma comercial o física en que se maneja un artículo.

<!-- module:end -->

<!-- module:any catalog-reasons -->

**Motivo de ajuste:** explicación clasificada de una corrección de existencias.

<!-- module:end -->

<!-- module:any catalog-fulfillment-statuses -->

**Estado de cumplimiento:** clasificación del avance de entrega, como Pendiente, Surtido parcial, Surtido o Cancelado.

<!-- module:end -->


<!-- module:any clients -->

## Clientes

| Término | Significado |
| --- | --- |
| Cliente | Organización o contexto comercial registrado para las solicitudes. |
| Asesor | Persona asociada al contexto comercial del cliente. |
| Número de proyecto | Referencia del trabajo; es distinto del nombre del cliente. |

<!-- module:end -->

<!-- module:any suppliers -->

## Proveedores

| Término | Significado |
| --- | --- |
| Proveedor | Organización que suministra artículos. |
| Código | Referencia del proveedor utilizada para localizarlo en las operaciones. |
| Nombre comercial | Nombre con el que se reconoce al proveedor en las listas. |

<!-- module:end -->
