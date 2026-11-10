# CP-VUE-ISS-006-01 — registrar y recuperar entregas históricas

`DP-VUE-ISS-006`; `RF-VUE-010`, `RF-ISS-009`.

| Precondiciones y datos | Acción | Resultado esperado | Limpieza |
| --- | --- | --- | --- |
| Cuenta con issues:reconcile. Folios SMA-HIST-001 pendiente y SMA-HIST-002 parcialmente surtido en páginas consecutivas. | Abrir el diálogo y comprobar la carga automática sin fecha; seleccionar todo desde la casilla de encabezado, navegar y deseleccionar; elegir salidas de varias páginas, escribir motivo, declarar entrega y confirmar; perder respuesta y recargar. | Tabla accesible «Salidas pendientes y parcialmente surtidas» se muestra sin ingresar fecha y usa la hora actual como corte. No solicita una fecha real única de entrega y envía `deliveredAt: null`, ya que el lote puede incluir salidas entregadas en momentos distintos. Hay una sola casilla para selección global en el encabezado; carga todas las páginas y conserva selección/revisiones al navegar. Más de 100 se eligen manualmente hasta 100. Sin declaración no confirma. Envía revisión original, corte UTC y sin saldos derivados. Reabrir/reintentar conserva exactamente comando/clave; devuelve recibo. Vistas 390/1280 px sin desbordamiento. | Desmontar, restaurar adaptador y limpiar Storage/contexto. |
| Salida marcada histórica, 2 suministradas. | Solicitar devolución de 1 sin declaración física y después confirmarla. | Primero no envía; luego transmite physicalReturnConfirmed=true. Consulta muestra procedencia y no llama Surtir para regularizar. | Restaurar transporte y documento simulado. |

Fuentes: [unitarias](../../../tests/unit/modules/issues/historicalDeliveryTest.ts)
y [Chromium](../../../tests/e2e/historicalDelivery.spec.ts).
La [integración HTTP/Prisma](../../../../back/tests/integration/controllers/historicalDeliveryControllerDbTest.js)
comprueba ausencia de movimientos, estados, rollback, concurrencia y frontera 100/101 reales.
