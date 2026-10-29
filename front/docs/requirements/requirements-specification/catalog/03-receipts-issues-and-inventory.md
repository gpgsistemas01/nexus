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
servidor rechaza un alta o traslado a un área ajena con `403 FORBIDDEN`; una consulta
o edición por ID fuera del alcance responde `404` sin exponer el documento. No se
modifican documentos, detalles, existencias ni movimientos ante esos rechazos.
Los permisos de surtido y devolución se verifican por separado y siguen reservados
a Almacén y administración.

| ID | Requisito y criterio de aceptación | Estado del requisito de producto |
| --- | --- | --- |
| RF-REC-001 | Personal de almacén o el Administrador del sistema deben poder consultar entradas, encabezados, detalles y estados sin modificar inventario; cada consulta presenta únicamente compras del contexto elegido, materiales o consumibles. | Implementado |
| RF-REC-002 | Personal de almacén o el Administrador del sistema deben poder corregir cantidad o costo de un detalle activo conservando actor, motivo, valores anteriores y corregidos y el efecto correspondiente; se aplican los criterios de corrección. | Implementado |
| RF-REC-003 | El sistema debe impedir que una factura pertenezca a más de una entrada del mismo proveedor e identificar la entrada existente ante un conflicto. | Implementado |
| RF-REC-004 | Una entrada debe admitir detalles independientes del mismo material cuando tienen costos por presentación diferentes. | Implementado |
| RF-REC-005 | Personal de almacén o el Administrador del sistema deben poder editar el encabezado admitido de una entrada no cancelada y agregar detalles nuevos, sin cambiar el proveedor ni reescribir detalles persistidos. | Implementado |
| RF-REC-006 | Cuando una marca distingue físicamente un material, almacén debe registrarla como otra identidad del catálogo en lugar de capturarla en el detalle. | Implementado |
| RF-REC-007 | Personal de almacén o el Administrador del sistema deben poder registrar una entrada con proveedor y detalles válidos del mismo contexto, incrementando existencias y generando movimientos como una sola operación; el alta contextual se rige por sus criterios. | Implementado |
| RF-REC-008 | Personal de almacén o el Administrador del sistema deben poder cancelar un detalle activo revirtiendo su efecto de inventario y conservando su historia; un fallo no debe dejar una reversión parcial. | Implementado |
| RF-REC-009 | Las compras de materiales y consumibles deben tener series anuales independientes y folios únicos: `CMA-AAAA-consecutivo` para materiales y `CCO-AAAA-consecutivo` para consumibles. Una compra no debe consumir el contador del otro contexto ni consumir un consecutivo si falla su registro. Al normalizar folios históricos se deben conservar año, consecutivo, identidad, detalles y efectos de inventario; una colisión debe impedir cambios parciales. | Implementado |
| RF-REC-010 | El reporte generado desde cada consulta de compras debe incluir únicamente el contexto correspondiente y distinguirlo en el nombre del archivo y la hoja; el contexto no puede alterarse mediante filtros enviados por el usuario. | Implementado |
| RF-REC-011 | Las compras de consumibles deben rechazar detalles o documentos del contexto de materiales, y viceversa, sin cambios parciales; las operaciones de compra se rigen por `RF-REC-001` a `RF-REC-008`. | Implementado |
| RF-ISS-001 | Usuarios autorizados de áreas operativas, personal de almacén o el Administrador del sistema deben poder consultar salidas de material o consumible, sus detalles y contexto sin modificar existencias; cada consulta se limita a su contexto. | Implementado |
| RF-ISS-002 | Personal de almacén o el Administrador del sistema deben poder surtir toda la cantidad pendiente de un detalle cuando exista stock suficiente, actualizando documento, existencias y movimiento atómicamente. | Implementado |
| RF-ISS-003 | Personal de almacén o el Administrador del sistema deben poder devolver una cantidad positiva que no exceda el saldo entregado de un detalle de material o consumible, sólo cuando la salida esté completamente surtida, y conservar el vínculo con documento, detalle y movimiento inverso. | Implementado |
| RF-ISS-004 | Usuarios autorizados de áreas operativas, personal de almacén o el Administrador del sistema deben poder crear una salida pendiente de material o consumible con encabezado y detalles válidos del mismo contexto, sin descontar existencias. | Implementado |
| RF-ISS-005 | Usuarios autorizados de áreas operativas, personal de almacén o el Administrador del sistema deben poder actualizar únicamente los campos admitidos del encabezado de una salida cuyo estado permita edición. | Implementado |
| RF-ISS-006 | Usuarios autorizados de áreas operativas, personal de almacén o el Administrador del sistema deben poder agregar o actualizar detalles todavía modificables sin reescribir cantidades surtidas o devueltas. | Implementado |
| RF-ISS-007 | Las salidas de materiales y consumibles deben tener series anuales independientes y folios únicos: `SMA-AAAA-consecutivo` para materiales y `SCO-AAAA-consecutivo` para consumibles. Crear una salida de un contexto no debe consumir el contador del otro; un fallo al guardar tampoco debe consumir un consecutivo. | Implementado |
| RF-ISS-008 | Las salidas históricas con prefijos `SAL`, `SAL-MAT` o `SAL-CON` deben adoptar el prefijo de su clasificación registrada, conservando año, consecutivo, identidad, detalles e inventario. Las nuevas series deben continuar por encima del máximo emitido y del contador anterior; una colisión debe impedir la conversión completa sin cambios parciales. | Implementado |
| RF-WST-001 | Usuarios autorizados de áreas operativas, personal de almacén o el Administrador del sistema deben poder consultar el inventario de mermas y sus existencias; corresponde a la misma consulta de `RF-CAT-004`, no a documentos de salida. | Implementado |
| RF-WST-002 | Usuarios autorizados de áreas operativas, personal de almacén o el Administrador del sistema deben poder crear una salida de merma pendiente con encabezado y detalles válidos, sin descontar existencias. | Implementado |
| RF-WST-003 | Personal de almacén o el Administrador del sistema deben poder surtir toda la cantidad pendiente de un detalle de merma cuando exista stock suficiente, actualizando documento, existencias y movimiento atómicamente. | Implementado |
| RF-WST-004 | Usuarios autorizados de áreas operativas, personal de almacén o el Administrador del sistema deben poder actualizar únicamente los campos admitidos del encabezado de una salida de merma cuyo estado permita edición. | Implementado |
| RF-WST-005 | Usuarios autorizados de áreas operativas, personal de almacén o el Administrador del sistema deben poder agregar o actualizar detalles de merma todavía modificables sin reescribir cantidades surtidas o devueltas. | Implementado |
| RF-WST-006 | Personal de almacén o el Administrador del sistema deben poder devolver una cantidad positiva que no exceda el saldo entregado de un detalle de merma, sólo cuando la salida esté completamente surtida, y confirmar existencia y movimiento inverso como una sola operación. | Implementado |
| RF-WST-007 | Usuarios autorizados de áreas operativas, personal de almacén o el Administrador del sistema deben poder consultar salidas de merma, sus detalles y contexto sin modificar existencias. | Implementado |
| RF-ADJ-001 | El Administrador del sistema debe poder establecer la nueva existencia total no negativa de un material, consumible o merma mediante un ajuste con motivo y observaciones; se aplica inmediatamente, se deriva su tipo de la diferencia y el usuario queda registrado como creador y aprobador, sin una aprobación posterior. | Implementado |
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
