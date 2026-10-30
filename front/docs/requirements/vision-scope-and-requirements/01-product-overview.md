# 1. Producto y objetivos

Nexus es la aplicación web de GPG para controlar materiales, consumibles y mermas.
Reúne existencias, documentos, cantidades, costos y participantes de la operación
del almacén.

## Necesidad y valor esperado

Los registros dispersos dificultan conciliar existencias, explicar diferencias y
supervisar entregas. Nexus busca conservar el vínculo de cada cantidad, costo o
entrega con su documento de origen y las personas que participaron.

| Objetivo | Resultado esperado |
| --- | --- |
| Controlar existencias | Consultar el saldo de materiales, consumibles y mermas en sus contextos separados. |
| Conservar la historia | Reconocer el origen, cantidades, costos y responsables de recepciones, entregas, devoluciones y ajustes. |
| Delimitar responsabilidades | Distinguir personas de cuentas y permitir sólo operaciones y áreas autorizadas. |
| Apoyar la supervisión | Buscar documentos y descargar información operativa autorizada para revisar saldos y entregas. |

Estos son resultados esperados. Sus indicadores, línea base, metas, período de
medición y responsables siguen [pendientes de acuerdo](04-open-decisions.md).

## Relación con la operación del almacén

| Momento | Información y resultado |
| --- | --- |
| Recibir una compra | Proveedor, comprobante, receptor y detalles recibidos, con cantidades, costos e importes. Confirmar la recepción incrementa las existencias. |
| Solicitar una salida | Cliente, área, asesor, solicitante, proyecto y artículos requeridos. Se crea un documento pendiente; solicitar no equivale a entregar ni descontar existencias. |
| Surtir y devolver | Cantidades entregadas o devueltas y estado de cumplimiento. Cada acción confirma su efecto en el inventario conforme al permiso y estado del documento. |
| Controlar existencias | Ofertas de materiales y consumibles por proveedor, inventario propio de mermas y movimientos que explican sus cambios. |
| Consultar y supervisar | Listados filtrados, folios, estados y reportes Excel del ámbito autorizado. |

Personas, áreas, clientes y proveedores identifican a los participantes y el destino
de las operaciones. La cuenta de usuario permite ingresar; aparecer en un documento
no concede acceso. El proyecto aporta contexto a la salida, sin un módulo de gestión.

## Uso desde Vue

La cuenta ve las páginas y acciones permitidas. Desde una consulta puede revisar
registros y abrir sus formularios. Si falta una opción y tiene permiso para crearla,
el selector permite abrir el alta, guardar y volver con el nuevo registro seleccionado
sin perder la captura principal.

Los formularios señalan errores corregibles y comunican el resultado del guardado.
La actualización de listados conserva una captura en curso. Los cálculos mostrados
antes de guardar son estimaciones; cantidades e importes se confirman con el servicio.

El [alcance](03-current-scope.md) reúne capacidades y límites; los
[usuarios y áreas](02-users-and-areas.md), sus participantes.
