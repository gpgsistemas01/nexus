# CP-VUE-ISS-006-01 — registrar y recuperar entregas históricas

`DP-VUE-ISS-006`; `RF-VUE-010`, `RF-ISS-009`.

| Precondiciones y datos | Acción | Resultado esperado | Limpieza |
| --- | --- | --- | --- |
| Cuenta con issues:reconcile. Folios SMA-HIST-001 pendiente y SMA-HIST-002 parcialmente surtido en páginas consecutivas; corte 2026-10-31 12:00 Ciudad de México. | Cargar sin filtros, seleccionar todo, navegar y deseleccionar todo; elegir salidas de varias páginas, escribir motivo, declarar entrega y confirmar; perder respuesta y recargar. | Tabla accesible «Salidas pendientes y parcialmente surtidas». Seleccionar todo carga todos los resultados en todas las páginas; la selección y sus revisiones se conservan al navegar. Más de 100 no se seleccionan como lote; se eligen manualmente hasta 100. Sin declaración no confirma. Envía revisión original, corte UTC 18:00, sin saldos derivados. Reabrir/reintentar conserva exactamente comando/clave; devuelve recibo. Vistas 390/1280 px sin desbordamiento. | Desmontar, restaurar adaptador y limpiar Storage/contexto. |
| Salida marcada histórica, 2 suministradas. | Solicitar devolución de 1 sin declaración física y después confirmarla. | Primero no envía; luego transmite physicalReturnConfirmed=true. Consulta muestra procedencia y no llama Surtir para regularizar. | Restaurar transporte y documento simulado. |

Fuentes: [unitarias](../../../tests/unit/modules/issues/historicalDeliveryTest.ts)
y [Chromium](../../../tests/e2e/historicalDelivery.spec.ts).
La [integración HTTP/Prisma](../../../../back/tests/integration/controllers/historicalDeliveryControllerDbTest.js)
comprueba ausencia de movimientos, estados, rollback, concurrencia y frontera 100/101 reales.
