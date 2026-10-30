# 6. Operaciones, campos y efectos

Cada tabla indica cuándo está disponible una acción, qué datos pueden cambiar y
qué resultado produce. Los permisos por actor están en
[Actores y responsabilidades](03-actors-and-system-responsibilities.md).

En catálogos, **Activo** es un campo de alta o edición que conserva identidad,
relaciones, stock e historia. Los estados de Compras y Salidas se derivan de las
operaciones; no se eligen libremente.

## Materiales y Consumibles

| Acción y condición previa | Datos editables | Efecto |
| --- | --- | --- |
| **Crear**: no existe la oferta de proveedor. | nombre, proveedor, presentación, unidad, ambas dimensiones o ninguna sólo para material; consumible sin dimensiones; stock mínimo, costo máximo, estado de la oferta, existencia inicial y observaciones | crea o reutiliza la identidad compartida y crea la oferta; una oferta repetida se rechaza sin modificar stock ni costo |
| **Crear desde compra**: formulario invocado desde una compra y no existe la oferta de proveedor. | nombre, proveedor, presentación, unidad, ambas dimensiones o ninguna sólo para material; consumible sin dimensiones; stock mínimo y estado de la oferta | crea la oferta con existencia cero y sin costo máximo, no genera ajuste inicial y deja que el detalle establezca costo y existencia sólo al confirmar la compra |
| **Editar**: relación existente. | nombre y stock mínimo compartidos; costo máximo y estado de la oferta seleccionada | proveedor, presentación, unidad y dimensiones permanecen bloqueados; un nombre que produzca otra identidad se rechaza y no cambia existencia |
| **Ajustar**: relación existente. | nueva existencia total, motivo y observaciones | crea ajuste y movimiento; no permite elegir otro proveedor, no cambia identidad ni interpreta la cantidad como incremento |

## Mermas

| Acción y condición previa | Datos editables | Efecto |
| --- | --- | --- |
| **Crear**: no existe la combinación de nombre, proveedor, dimensiones y pesos. | proveedor, material de referencia, nombre, base, altura, stock mínimo, costo máximo, estado, existencia inicial, observaciones y, para Rollo, peso del cono editable, total de merma con cono y total del rollo completo con cono; dimensiones calculadas | crea la merma y, con cantidad positiva, una entrada de merma (`EME`) con movimiento; cantidad cero no crea documento ni consume folio; una identidad repetida se rechaza sin sumar stock |
| **Editar**: merma existente. | nombre, stock mínimo, costo máximo y estado | proveedor, material de referencia, presentación, unidad y dimensiones permanecen bloqueados; no cambia existencia |
| **Ajustar**: merma existente. | nuevo stock total, motivo y observaciones | crea ajuste de merma (`AME`) y su movimiento; no cambia identidad ni interpreta el stock como incremento |
| **Agregar stock**: merma existente. | cantidad positiva y observaciones opcionales | crea una entrada de merma (`EME`) vinculada a su movimiento; suma la cantidad sin reemplazar el saldo |

## Compras

| Acción y condición previa | Datos editables | Efecto |
| --- | --- | --- |
| **Crear**: documento nuevo. | tipo de comprobante, factura cuando aplica, proveedor, receptor, fecha de recepción, observaciones y detalles | incrementa existencias y registra movimientos sin cambios parciales |
| **Editar**: entrada no cancelada. | tipo de comprobante, factura cuando aplica, receptor, fecha, observaciones y detalles **nuevos** | el proveedor permanece bloqueado; un detalle persistido se cambia mediante la corrección, sin sobrescribirlo |
| **Ver compra cancelada**: entrada cancelada. | ninguno | formulario, detalles y acciones permanecen en sólo lectura |
| **Corregir detalle**: detalle activo y entrada habilitada. | cantidad corregida positiva no mayor que la recibida vigente; costo positivo | registra el motivo según el cambio y requiere una diferencia real de cantidad o costo; reducir cantidad exige existencia suficiente y genera movimiento; corregir sólo costo conserva cantidades e historia sin movimiento de inventario |
| **Cancelar detalle**: detalle activo y existencia suficiente para revertirlo. | sin captura adicional | registra el motivo y la reversión; revierte la cantidad vigente, excluye el detalle de totales activos y conserva su historia; si no quedan detalles activos, la compra queda cancelada |

## Salidas

| Acción y condición previa | Datos editables | Efecto |
| --- | --- | --- |
| **Crear**: documento nuevo. | cliente, asesor, área, solicitante, número de proyecto, fecha de solicitud, observaciones y detalles solicitados | no descuenta stock mientras el detalle no se surta |
| **Editar encabezado y detalles**: salida pendiente. | encabezado y detalles nuevos o cantidades todavía no surtidas | no reescribe cantidades ya surtidas o devueltas |
| **Editar encabezado**: salida no cancelada que ya no está pendiente. | cliente, asesor, área, solicitante, número de proyecto, fecha de solicitud y observaciones | los detalles permanecen en sólo lectura y no cambia inventario |
| **Surtir**: detalle con cantidad pendiente; la salida puede estar pendiente o parcialmente surtida. | selección del detalle y Cantidad de proyecto | entrega toda la cantidad pendiente del detalle; el encabezado permanece bloqueado; reduce existencia y crea movimiento sin cambios parciales; otros detalles pendientes mantienen el documento parcialmente surtido |
| **Devolver**: salida completamente surtida y detalle con saldo entregado disponible. | cantidad positiva no mayor que lo surtido menos devoluciones anteriores; observaciones de devolución | encabezado y detalles originales permanecen bloqueados; incrementa existencia y crea movimiento inverso; una devolución parcial conserva el detalle Surtido, devolver todo su saldo lo cancela y cancelar todos los detalles cancela la salida |
| **Ver salida cancelada**: salida cancelada. | ninguno | formulario y detalles permanecen en sólo lectura |

Los [estados de los documentos](../domain-model/06-document-lifecycles.md)
describen sus transiciones. La
[regla de actividad](catalog/05-cross-cutting-business-policies.md#identidad-y-estado-de-registros)
precisa el uso de registros inactivos.

## Separación de documentos e historia

Las compras separan materiales y consumibles; las salidas separan materiales,
consumibles y mermas. Cada documento debe tener al menos un detalle y todos,
incluidos los cancelados, deben pertenecer a su contexto. Los documentos históricos
vacíos o mixtos conservan su historia y quedan fuera de los flujos operativos; su
regularización requiere un flujo aprobado, todavía no disponible.
La [regla `RN-034`](catalog/05-cross-cutting-business-policies.md#identidad-y-estado-de-registros)
detalla la separación de materiales y consumibles en consultas, reportes y escrituras.
