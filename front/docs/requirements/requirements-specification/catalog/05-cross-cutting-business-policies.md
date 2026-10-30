# 4.5 Políticas transversales del negocio

Las reglas se agrupan por tema. Cada identificador conserva una obligación verificable.

## Acceso y datos de entrada

| ID | Requisito | Estado |
| --- | --- | --- |
| RN-001 | Toda operación protegida debe comprobar autenticación válida en el servidor antes de acceder a datos. | Implementado |
| RN-009 | Toda operación protegida debe comprobar en el servidor el permiso requerido antes de ejecutar el caso de uso. | Implementado |
| RN-010 | Toda mutación debe validar en el servidor la entrada admitida antes de persistir cambios. | Implementado |

## Documentos y trazabilidad

| ID | Requisito | Estado |
| --- | --- | --- |
| RN-002 | Una operación que cambia documento, detalle, stock y movimiento debe ser atómica: se confirman todos los cambios o ninguno. | Implementado |
| RN-004 | Todo documento o movimiento identificado por folio debe tener un folio único. | Implementado |
| RN-005 | Las correcciones y ajustes deben conservar el valor anterior, el nuevo, el motivo y el actor que efectuó el cambio. | Implementado |
| RN-008 | Cada escritura crítica configurada debe registrar actor, acción, recurso, resultado y los datos de solicitud admitidos por la política de auditoría. | Implementado |
| RN-011 | Cada movimiento debe conservar el vínculo con el único documento, devolución o ajuste que lo originó. | Implementado |
| RN-017 | Un detalle cancelado de entrada no debe volver a cancelarse ni participar en los totales activos del documento. | Implementado |
| RN-018 | Una factura informada sólo puede identificar una entrada por proveedor; un conflicto debe señalar la entrada ya registrada. | Implementado |

## Existencias, surtido y devolución

| ID | Requisito | Estado |
| --- | --- | --- |
| RN-003 | La cantidad acumulada surtida de un detalle no debe superar su cantidad solicitada vigente. | Implementado |
| RN-012 | Una disminución de inventario debe rechazarse cuando la existencia vigente no alcance para cubrir la cantidad solicitada. | Implementado |
| RN-013 | Las cantidades solicitadas o recibidas, las nuevas devoluciones y las entradas adicionales de merma deben ser positivas. El saldo final de un ajuste admite cero; su diferencia puede ser positiva, negativa o cero. Las diferencias de corrección y reversión no se validan como cantidades de entrega. | Implementado |
| RN-014 | Cada nueva devolución debe ser positiva y no superar el saldo entregado, calculado como cantidad suministrada menos devoluciones anteriores; el acumulado devuelto no debe superar el acumulado suministrado. | Implementado |
| RN-015 | Durante el surtido vigente, un detalle debe permanecer `Pendiente` hasta entregar toda su cantidad pendiente y pasar a `Surtido`. Las devoluciones deben seguir `RN-028`; el cumplimiento parcial del documento no debe habilitar una entrega parcial libre de un detalle. | Implementado |
| RN-016 | Una salida debe estar `Pendiente` si no tiene detalles surtidos, `Surtido parcial` si tiene entregas y otros detalles pendientes, y `Surtido` cuando todos se han surtido. Las devoluciones conservan ese cumplimiento hasta la cancelación total definida por `RN-029`. | Implementado |
| RN-028 | Una devolución parcial debe conservar el detalle como `Surtido`; devolver todo el saldo entregado restante debe marcarlo `Cancelado`, sin una operación de cancelación separada. | Implementado |
| RN-029 | Una salida debe quedar `Cancelada` sólo cuando todos sus detalles queden cancelados después de sus devoluciones. | Implementado |

## Identidad y estado de registros

| ID | Requisito | Estado |
| --- | --- | --- |
| RN-007 | La eliminación física sólo debe proceder cuando el recurso no tenga relaciones históricas protegidas; en otro caso se debe conservar mediante estado o cancelación. | Implementado |
| RN-023 | Una oferta proveedor-material, merma o proveedor inactivo no debe incorporarse a una relación o detalle nuevo; su desactivación debe conservar identidad, stock e historia y no debe impedir completar un detalle registrado previamente, sujeto a las demás validaciones del surtimiento. | Implementado |
| RN-024 | Dos artículos de compra no deben coexistir con la misma clasificación como material o consumible, nombre recortado y comparado sin distinguir mayúsculas, presentación, unidad de medida, base y altura. | Implementado |
| RN-025 | Una identidad de material existente debe reutilizarse cuando otro proveedor ofrezca el mismo material. | Implementado |
| RN-026 | El formulario de material sólo debe habilitar medidas para unidades de metros o litros; pieza y otras unidades no utilizan esa sección. Ambas dimensiones pueden omitirse; si se envía una, el servidor requiere base y altura positivas. | Implementado |
| RN-027 | Al editar un material, presentación, unidad de medida y dimensiones deben permanecer inmutables. | Implementado |
| RN-030 | Existencia, cantidad convertida, costo máximo y estado activo deben pertenecer a cada oferta proveedor-material y no crear otra identidad de material. | Implementado |
| RN-031 | Un cambio de nombre de material debe rechazarse cuando produzca otra identidad existente. | Implementado |
| RN-032 | Base y altura deben compararse en sus posiciones respectivas y no intercambiarse al determinar la identidad de un material. | Implementado |
| RN-034 | Materiales y consumibles deben conservar ofertas por proveedor, existencias y movimientos comparables, pero permanecer separados en consultas, selectores, reportes, compras y salidas. Cada documento debe tener al menos un detalle y todos deben pertenecer al contexto de su cabecera, incluidos los cancelados; un documento vacío, mixto o de otro contexto queda excluido de ambos flujos operativos. | Implementado |

`RN-034` no autoriza regularizar documentos históricos mixtos o vacíos: se conserva su
historia y la regularización continúa pendiente de un flujo aprobado. El contexto no
puede cambiarse mediante filtros ni datos enviados por el usuario.

## Mermas y conversiones

| ID | Requisito | Estado |
| --- | --- | --- |
| RN-020 | La cantidad convertida de una merma debe calcularse a partir de existencia, base y altura con la misma fórmula en altas, ajustes y movimientos. | Implementado |
| RN-021 | Dos mermas no deben compartir la misma identidad normalizada de nombre, proveedor, base, altura, peso del cono y peso total. Si los pesos son desconocidos, la identidad conserva nombre, proveedor y medidas. | Implementado |
| RN-022 | El alta de una merma debe usar una oferta de proveedor sólo como plantilla y conservar proveedor, presentación, unidad, dimensiones y costo como datos propios históricos. | Implementado |
| RN-033 | La trazabilidad de una merma debe conservar el documento que origina cada entrada o salida y su movimiento con saldos; mientras la existencia se administre como saldo fungible y no por lotes, una salida no debe atribuirse a una entrada específica. | Implementado |

## Cliente interno

| ID | Requisito | Estado |
| --- | --- | --- |
| RN-019 | Una salida para el cliente interno GPG INTERNO sólo debe admitir como asesor a una persona con responsabilidad de coordinador; esa responsabilidad no le concede acceso a Nexus. | Implementado |
| RN-035 | En una salida para GPG INTERNO, el número de proyecto debe coincidir con el configurado para el área de destino. El sistema debe rechazar el alta o la edición del encabezado si el área no tiene un número configurado o si el valor no coincide. | Implementado |
