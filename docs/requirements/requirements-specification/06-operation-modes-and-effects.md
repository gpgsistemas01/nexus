# 6. Modos, precondiciones y efectos de las operaciones

Esta tabla documenta las precondiciones, los datos modificables y los efectos de cada
acción. «Modo» es la configuración de pantalla y
«estado requerido» es la precondición persistida.

En catálogos, **estado** significa el indicador activo/inactivo que el actor modifica
con la casilla **Activo** dentro de `create` o `edit`; no es otro modo ni una operación
de inventario. El cambio conserva identidad, relaciones, stock e historia. En documentos
de compra o salida, en cambio, los estados y el cumplimiento se derivan de crear,
corregir, cancelar, surtir o devolver conforme a sus reglas; el actor no los captura
como un campo libre.

El efecto del indicador en consultas, reportes, altas y surtimientos se define mediante
`RN-023` y se resume en esta tabla. Los recursos inactivos no pueden incorporarse a operaciones nuevas. Una salida existente
con pendientes sí puede completarse después de la desactivación: usa su detalle histórico
y exige stock, pero no vuelve a seleccionar el recurso ni crea otra relación.

| Contexto / acción | Modo y estado requerido | Datos que pueden cambiar | Efectos que no deben confundirse con edición |
| --- | --- | --- | --- |
| Material / crear | `create`; no existe la relación material-proveedor | nombre, proveedor, presentación, unidad, ambas dimensiones o ninguna, stock mínimo, costo máximo, estado de la oferta, existencia inicial y observaciones | crea o reutiliza la identidad compartida y crea la oferta; una oferta repetida se rechaza sin modificar stock ni costo |
| Material / crear desde compra | `create`; formulario invocado desde una compra y no existe la relación material-proveedor | nombre, proveedor, presentación, unidad, ambas dimensiones o ninguna, stock mínimo y estado de la oferta | reutiliza el alta de material con contexto de compra; crea la oferta con existencia cero y sin costo máximo, no genera ajuste inicial y deja que el detalle establezca costo y existencia sólo al confirmar la compra |
| Material / editar | `edit`; relación existente | nombre y stock mínimo compartidos; costo máximo y estado de la oferta seleccionada | proveedor, presentación, unidad y dimensiones permanecen bloqueados; un nombre que produzca otra identidad se rechaza y no cambia existencia |
| Material / ajustar | `edit-stock`; relación existente y actor autorizado | proveedor asociado conservado desde la fila, nueva existencia total, motivo y observaciones | crea ajuste y movimiento; no permite elegir otro proveedor, no cambia identidad ni interpreta la cantidad como incremento |
| Merma / crear | `create`; no existe la combinación de nombre, proveedor y dimensiones | proveedor, material de referencia, nombre, base, altura, stock mínimo, costo máximo, estado, existencia inicial y observaciones | crea la merma y su movimiento inicial; una identidad repetida se rechaza sin sumar stock |
| Merma / editar | `edit`; merma existente | nombre, stock mínimo, costo máximo y estado | proveedor, material de referencia, presentación, unidad y dimensiones permanecen bloqueados; no cambia existencia |
| Merma / ajustar | `edit-stock`; merma existente y actor autorizado | nuevo stock total, motivo y observaciones | crea ajuste y movimiento; no cambia identidad ni interpreta el stock como incremento |
| Merma / agregar stock | `add-stock`; merma existente y actor autorizado | cantidad positiva y observaciones opcionales | crea un documento individual de entrada vinculado a su movimiento `ENTRY`; suma la cantidad sin reemplazar el saldo |
| Entrada / crear | `create`; documento nuevo | tipo de comprobante, factura cuando aplica, proveedor, receptor, fecha de recepción, observaciones y detalles | incrementa existencias y crea movimientos en una transacción |
| Entrada / editar | `edit`; entrada no cancelada | tipo de comprobante, factura cuando aplica, receptor, fecha, observaciones y detalles **nuevos** | el proveedor permanece bloqueado; una partida persistida se cambia mediante `correct`, no sobrescribiéndola |
| Entrada / consultar | `view`; entrada cancelada | ninguno | formulario, detalles y acciones permanecen en sólo lectura |
| Entrada / corregir o cancelar detalle | `correct`; detalle persistido y documento habilitado | cantidad/costo corregidos, motivo, valores anterior y nuevo | ajusta stock y movimiento conservando historia |
| Salida de material o merma / crear | `create`; documento nuevo | cliente, asesor, área, solicitante, proyecto, fecha de solicitud, observaciones y detalles solicitados | no descuenta stock mientras el detalle no se surta |
| Salida de material o merma / editar completa | `edit`; salida pendiente | encabezado y detalles nuevos o cantidades todavía no surtidas | no reescribe cantidades ya surtidas o devueltas |
| Salida de material o merma / editar encabezado | `edit-header`; salida no cancelada que ya no está pendiente | cliente, asesor, área, solicitante, proyecto, fecha de solicitud y observaciones | los detalles permanecen en sólo lectura y no cambia inventario |
| Salida de material o merma / surtir | `edit-detail`; detalle pendiente o parcial | selección del detalle y cantidad de proyecto a surtir | el encabezado permanece bloqueado; reduce existencia y crea movimiento atómicamente |
| Salida de material o merma / devolver | `return`; detalle con cantidad surtida disponible | cantidad devuelta y observaciones de devolución | encabezado y detalles originales permanecen bloqueados; incrementa existencia y crea movimiento inverso |
| Salida de material o merma / consultar | `view`; salida cancelada | ninguno | formulario y detalles permanecen en sólo lectura |

Los nombres técnicos de los campos HTTP pertenecen al
[contrato API](../../architecture/openapi/api-contract.md); las reglas observables pertenecen al
[catálogo unificado](04-unified-catalog-by-scope/index.md). Este capítulo enumera los controles por
modo para hacer verificable qué puede modificar el operador, sin convertir el estado
visual del formulario en un estado persistido del documento.

## Límites de interpretación

1. La tabla describe capacidades del producto, no personas autorizadas. La política de
   roles y departamentos se consulta en
   [usuarios y permisos](../../architecture/views/logical/02-identity-access-and-audit.md).
2. Los permisos de visualización de página son distintos de los permisos API y se
   comprueban en las rutas web; no se mezclan aquí con operaciones sobre datos.
3. «Modelado» o «Parcial» no significa permitido. Un modelo, permiso declarado o
   servicio aislado no equivale a un flujo disponible.
4. Una operación especializada conserva su permiso, transición, efecto de inventario y
   pruebas propios. No se resume como actualización genérica.
5. Los contextos equivalentes reutilizan fábricas, componentes y coordinación común,
   pero mantienen separadas sus reglas, existencias y movimientos.

### Separación de compras y salidas

La ruta fija el tipo persistido de materiales o consumibles; no puede cambiarse
por query ni payload. Cada documento debe tener al menos un detalle y todos
sus recursos deben coincidir con el tipo de cabecera, incluidos los cancelados.

Listados, reportes y escrituras aplican esta regla. Las operaciones cruzadas
se rechazan sin cambios de documento, stock ni trazabilidad. Los documentos
históricos mixtos o vacíos se conservan para regularización, pero quedan
excluidos de ambos contextos.
