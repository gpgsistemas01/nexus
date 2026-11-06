# 6. Conciliación de inventario y entregas históricas

**Estado: propuesta de ampliación; no describe botones ni modos disponibles.**
Hoy existen Ajustar stock por registro y la importación de altas/ediciones.
Faltan el Excel de conteo y el cierre de entregas históricas sin otro descuento.

## Flujo recomendado

| Situación | Captura |
| --- | --- |
| Artículo nuevo | Crear registros; el servidor asigna su ID. |
| Corrección de datos | Actualizar datos con IDs/versiones descargados. |
| Saldo desactualizado | Ajustar al conteo físico, con motivo y observaciones. |
| Salida pendiente ya entregada completamente | Regularizar la entrega histórica y conservar evidencia, sin volver a descontar stock. |

Las salidas antiguas del escenario fueron entregadas por la totalidad registrada.
Se propone conciliar primero el saldo a una fecha de corte y después
revisar los documentos entregados antes de ella. Las compras antiguas no son un
requisito para contar el inventario actual ni para declarar una entrega realizada.

## Excel de conteo

Agregar **Ajustar por conteo** con el permiso de ajuste del recurso. Descargar IDs,
versiones, artículo/proveedor, presentación/unidad y saldo de referencia. Capturar
**Stock contado** y elegir motivo; dejarlo vacío debe producir error, no saldo cero.

La vista previa muestra saldo anterior, contado y diferencia. Un repetido o error
bloquea todo el lote; confirmar guarda los ajustes juntos y permite recuperar la
misma operación. Conservar los límites de 100 filas/2 MiB y la carga diferida del
formulario. El usuario no captura IDs ni envía una escritura por cada fila.

Si faltan artículos en el sistema, registrarlos primero con la plantilla de altas
y después descargar el conteo con sus IDs. Un alta repetida conserva su rechazo;
no se convierte automáticamente en ajuste.

## Regularizar una entrega histórica

1. Consultar el folio y abrir una acción específica de regularización.
2. Revisar cantidades registradas y el pendiente que se reconocerá como entregado.
3. Indicar el corte y el motivo; registrar una fecha de entrega sólo si se conoce.
4. Confirmar la declaración de entrega completa y el aviso de que no cambia stock.
5. Mostrar el resultado con actor, motivo, fecha y marca de procedencia histórica.

Mantener la acción separada de **Surtir**, que registra un descuento de existencias.
La pantalla no debe resolver un caso histórico mediante una cancelación de la entrega.
Las cantidades previamente registradas y devueltas se conservan. Un costo o consumo
de proyecto desconocido debe verse como información no verificada, sin rellenarlo
automáticamente con valores actuales.

La acción propuesta se reserva a Sistemas y Coordinación de Almacén con permiso
específico y control de servidor. Mientras se envía, se bloquea otra confirmación;
una pérdida de respuesta recupera el mismo recibo y no genera otro surtido.

El [diseño del backend](../../../back/docs/architecture/views/development/inventory-reconciliation-proposal.md)
define persistencia, efectos, contratos pendientes y pruebas necesarias.
