# 4.3 Entradas, salidas e inventario

Las recepciones y salidas de artículos se operan en contextos separados de materiales
y consumibles. Comparten las obligaciones de recepción `RF-REC-001` a `RF-REC-008`
y de salida `RF-ISS-001` a `RF-ISS-008`; compartir proceso no permite mezclar detalles.
Las salidas de merma conservan sus recursos y movimientos propios.

## Alcance de áreas en Salidas

Auxiliar y Coordinador de Almacén, además del Administrador del sistema, pueden
consultar y registrar salidas para todas las áreas. Los usuarios de áreas operativas
sólo pueden consultar, crear y editar solicitudes de sus áreas asignadas y autorizadas.
La regla aplica a Materiales, Consumibles y Mermas, incluidos filtros, conteos,
lectura por ID y reportes cuando el rol tiene permiso para exportarlos. Un filtro
reduce el alcance de la sesión; nunca lo amplía.

Si la respuesta completa de áreas disponibles contiene una sola opción, el cliente
la selecciona automáticamente y mantiene el campo visible y deshabilitado en el
alta y los filtros. Carga los solicitantes de esa área sin una selección manual.
Con varias áreas autorizadas permite elegir; una coincidencia de búsqueda no debe
bloquear el campo. La edición conserva el área registrada y limpiar filtros mantiene
la única área obligatoria.

En una edición, tanto el área original como la nueva deben estar autorizadas. El
sistema debe rechazar altas o cambios a un área ajena y no debe exponer un documento
fuera del alcance de la cuenta. Estos rechazos no deben modificar documentos,
detalles, existencias ni movimientos. Los estados HTTP se precisan en el
[contrato del cliente](../../../architecture/contracts/client-contracts.md).
Los permisos de surtido y devolución se verifican por separado y siguen reservados
a Almacén y administración.

| ID | Requisito | Estado |
| --- | --- | --- |
| RF-REC-001 | Nexus debe permitir al Personal de almacén o al Administrador del sistema consultar entradas, encabezados, detalles y estados sin modificar inventario; cada consulta presenta únicamente compras del contexto elegido, materiales o consumibles. | Implementado |
| RF-REC-002 | Nexus debe permitir al Personal de almacén o al Administrador del sistema corregir cantidad o costo de un detalle activo conservando actor, motivo, valores anteriores y corregidos y el efecto correspondiente; se aplican los criterios de corrección. | Implementado |
| RF-REC-003 | Nexus debe rechazar una factura que ya pertenezca a otra entrada del mismo proveedor e identificar la entrada existente, conforme a `RN-018`. | Implementado |
| RF-REC-004 | Una entrada debe admitir detalles independientes del mismo material cuando tienen costos por presentación diferentes. | Implementado |
| RF-REC-005 | Nexus debe permitir al Personal de almacén o al Administrador del sistema editar el encabezado admitido de una entrada no cancelada y agregar detalles nuevos, sin cambiar el proveedor ni reescribir detalles persistidos. | Implementado |
| RF-REC-006 | Un material que se distinga físicamente por su marca debe registrarse como otra identidad del catálogo; la marca no debe capturarse como dato del detalle de compra. | Implementado |
| RF-REC-007 | Nexus debe permitir al Personal de almacén o al Administrador del sistema registrar una entrada con proveedor y detalles válidos del mismo contexto, incrementando existencias y generando movimientos como una sola operación; el alta contextual se rige por sus criterios. | Implementado |
| RF-REC-008 | Nexus debe permitir al Personal de almacén o al Administrador del sistema cancelar un detalle activo revirtiendo su efecto de inventario y conservando su historia; un fallo no debe dejar una reversión parcial. | Implementado |
| RF-REC-009 | Nexus debe asignar folios anuales únicos con series independientes: `CMA-AAAA-consecutivo` para compras de materiales y `CCO-AAAA-consecutivo` para compras de consumibles. Debe conservar la continuidad y la historia conforme a sus criterios. | Implementado |
| RF-REC-010 | El reporte generado desde cada consulta de compras debe incluir únicamente el contexto correspondiente y distinguirlo en el nombre del archivo y la hoja; el contexto no puede alterarse mediante filtros enviados por el usuario. | Implementado |
| RF-REC-011 | Las compras de consumibles deben rechazar detalles o documentos del contexto de materiales, y viceversa, sin cambios parciales; las operaciones de compra se rigen por `RF-REC-001` a `RF-REC-008`. | Implementado |
| RF-ISS-001 | Nexus debe permitir a los usuarios autorizados de áreas operativas, al Personal de almacén o al Administrador del sistema consultar salidas de material o consumible, sus detalles y contexto sin modificar existencias; cada consulta se limita a su contexto. | Implementado |
| RF-ISS-002 | Nexus debe permitir al Personal de almacén o al Administrador del sistema surtir toda la cantidad pendiente de un detalle cuando exista stock suficiente, actualizando documento, existencias y movimiento atómicamente. | Implementado |
| RF-ISS-003 | Nexus debe permitir al Personal de almacén o al Administrador del sistema devolver una cantidad positiva que no exceda el saldo entregado de un detalle de material o consumible, sólo cuando la salida esté completamente surtida, y conservar el vínculo con documento, detalle y movimiento inverso. | Implementado |
| RF-ISS-004 | Nexus debe permitir a los usuarios autorizados de áreas operativas, al Personal de almacén o al Administrador del sistema crear una salida pendiente de material o consumible con encabezado y detalles válidos del mismo contexto, sin descontar existencias. | Implementado |
| RF-ISS-005 | Nexus debe permitir a los usuarios autorizados de áreas operativas, al Personal de almacén o al Administrador del sistema actualizar únicamente los campos admitidos del encabezado de una salida cuyo estado permita edición. | Implementado |
| RF-ISS-006 | Nexus debe permitir a los usuarios autorizados de áreas operativas, al Personal de almacén o al Administrador del sistema agregar o actualizar detalles todavía modificables sin reescribir cantidades surtidas o devueltas. | Implementado |
| RF-ISS-007 | Las salidas de materiales y consumibles deben tener series anuales independientes y folios únicos: `SMA-AAAA-consecutivo` para materiales y `SCO-AAAA-consecutivo` para consumibles. Crear una salida de un contexto no debe consumir el contador del otro; un fallo al guardar tampoco debe consumir un consecutivo. | Implementado |
| RF-ISS-008 | Las salidas históricas con prefijos `SAL`, `SAL-MAT` o `SAL-CON` deben adoptar el prefijo de su clasificación registrada, conservando año, consecutivo, identidad, detalles e inventario. Las nuevas series deben continuar por encima del máximo emitido y del contador anterior; una colisión debe impedir la conversión completa sin cambios parciales. | Implementado |
| RF-WST-001 | Nexus debe permitir a los usuarios autorizados de áreas operativas, al Personal de almacén o al Administrador del sistema consultar el inventario de mermas y sus existencias; corresponde a la misma consulta de `RF-CAT-004`, no a documentos de salida. | Implementado |
| RF-WST-002 | Nexus debe permitir a los usuarios autorizados de áreas operativas, al Personal de almacén o al Administrador del sistema crear una salida de merma pendiente con encabezado y detalles válidos, sin descontar existencias. | Implementado |
| RF-WST-003 | Nexus debe permitir al Personal de almacén o al Administrador del sistema surtir toda la cantidad pendiente de un detalle de merma cuando exista stock suficiente, actualizando documento, existencias y movimiento atómicamente. | Implementado |
| RF-WST-004 | Nexus debe permitir a los usuarios autorizados de áreas operativas, al Personal de almacén o al Administrador del sistema actualizar únicamente los campos admitidos del encabezado de una salida de merma cuyo estado permita edición. | Implementado |
| RF-WST-005 | Nexus debe permitir a los usuarios autorizados de áreas operativas, al Personal de almacén o al Administrador del sistema agregar o actualizar detalles de merma todavía modificables sin reescribir cantidades surtidas o devueltas. | Implementado |
| RF-WST-006 | Nexus debe permitir al Personal de almacén o al Administrador del sistema devolver una cantidad positiva que no exceda el saldo entregado de un detalle de merma, sólo cuando la salida esté completamente surtida, y confirmar existencia y movimiento inverso como una sola operación. | Implementado |
| RF-WST-007 | Nexus debe permitir a los usuarios autorizados de áreas operativas, al Personal de almacén o al Administrador del sistema consultar salidas de merma, sus detalles y contexto sin modificar existencias. | Implementado |
| RF-ADJ-001 | Nexus debe permitir al Administrador del sistema establecer la nueva existencia total no negativa de un material, consumible o merma mediante un ajuste con motivo y observaciones; se aplica inmediatamente, se deriva su tipo de la diferencia y el usuario queda registrado como creador y aprobador, sin una aprobación posterior. | Implementado |
| RF-ADJ-002 | Al aplicar un ajuste, el sistema debe actualizar atómicamente la existencia y cantidad convertida, y generar el movimiento con los valores anterior, nuevo y diferencia. | Implementado |

## Criterios de recepción y corrección

- **CA-RF-REC-007-1:** la entrada tiene al menos un detalle y todos pertenecen al
  contexto correspondiente. Un documento vacío, mixto o de otro contexto se rechaza
  sin modificar documento, existencia ni movimientos.
- **CA-RF-REC-007-2:** un artículo no catalogado puede darse de alta desde la compra;
  su oferta queda sin existencia hasta confirmar la recepción conforme a `RF-CAT-006`
  o `RF-CAT-026`. No se contabiliza dos veces la cantidad recibida.
- **CA-RF-REC-002-1:** la cantidad corregida es positiva y no supera la cantidad
  recibida vigente; el costo es positivo y debe existir un cambio de cantidad o costo.
- **CA-RF-REC-002-2:** reducir la cantidad requiere existencia suficiente para revertir
  la diferencia. Una corrección sólo de costo conserva cantidades y no genera movimiento
  de inventario; recalcula los importes y conserva su historia.
- **CA-RF-REC-008-1:** cancelar un detalle revierte su cantidad vigente; si la existencia
  no lo permite, se rechaza sin cambios. La compra queda cancelada cuando no conserva
  detalles activos.
- **CA-RF-REC-009-1:** registrar una compra no debe consumir un consecutivo de otro
  contexto ni consumirlo si falla la operación.
- **CA-RF-REC-009-2:** normalizar folios históricos debe conservar año, consecutivo,
  identidad, detalles y efectos de inventario. Una colisión debe impedir cambios
  parciales.

## Criterios de salida y ajuste

- **Alta y entradas de merma:** registrar una merma con cantidad positiva genera una
  entrada `EME-AAAA-consecutivo` y un movimiento ENTRY; se incrementa una sola vez.
  Con cantidad cero sólo se crea la merma. Agregar stock utiliza la misma serie EME.
  Una corrección administrativa de saldo genera `AME-AAAA-consecutivo` y movimiento
  ADJUSTMENT, con motivo. Ambos usan el generador anual y un mínimo de seis dígitos.
- **Historia de merma:** se normalizan `ENT-MER` → `EME` y `AJU-MER` → `AME` sin
  reclasificar documentos, modificar saldos o reiniciar consecutivos. Una colisión
  revierte la normalización completa; los contadores históricos se conservan.

- **Acceso operativo:** Impresión, Taller 3D (Taller/Herrería), Router, PT/Tráfico, Instalaciones y Acabados
  pueden consultar inventario y crear/editar solicitudes de salida con rol autorizado.
  La edición conserva las restricciones por estado; solicitar o editar no descuenta
  existencias. Este acceso no concede surtido, devolución ni escritura de inventario.
  La política de acceso
  especifica roles, permisos independientes y coincidencia por asignación.

- **CA-RF-ISS-002-1:** cada detalle seleccionado se surte por toda su cantidad pendiente.
  La salida queda parcialmente surtida si permanecen otros detalles pendientes; no se
  ofrece captura libre de una entrega parcial de un detalle.
- **CA-RF-ISS-003-1:** la nueva devolución no supera cantidad suministrada menos
  devoluciones anteriores. Una devolución parcial conserva `Surtido`; devolver el saldo
  completo cancela el detalle. Cancelar todos los detalles cancela la salida.
- **CA-RF-WST-003-1:** las mismas condiciones de surtimiento completo del detalle se
  aplican a merma; la existencia y sus movimientos permanecen independientes.
- **CA-RF-WST-006-1:** se aplican las mismas condiciones de saldo y cancelación derivada
  de devolución, sin una acción de cancelación directa de la salida.
- **CA-RF-ADJ-001-1:** la cantidad indicada es el saldo final, no un incremento. Puede
  ser cero; la diferencia con la existencia anterior puede ser positiva, negativa o cero.
  No se admite una existencia final negativa.

- **CA-RF-WST-002-1:** la salida de merma utiliza `SME-AAAA-consecutivo`, una
  serie propia que no consume los consecutivos de materiales ni consumibles.
  Sus folios anteriores se normalizan conservando año, consecutivo e identidad.
- **CA-RF-ISS-004-1:** al agregar otra vez el mismo material o consumible con el mismo
  proveedor a una captura de salida, el cliente debe sumar la cantidad y su conversión
  al detalle existente. Un proveedor distinto debe conservar otro detalle.
- **CA-RF-ISS-006-1:** la misma agrupación debe aplicarse cuando se agregan cantidades
  a los detalles de una salida pendiente editable. Agregar no debe modificar stock
  hasta que se ejecute el surtido.
- **CA-RF-WST-002-2:** al agregar otra vez la misma merma, el cliente debe sumar su
  cantidad y conversión en un único detalle. La regla también aplica al editar
  detalles pendientes conforme a `RF-WST-005`; no permite enviar IDs de merma duplicados.
