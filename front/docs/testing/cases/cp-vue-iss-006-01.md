# CP-VUE-ISS-006-01 — registrar y recuperar entregas históricas

`DP-VUE-ISS-006`; `RF-VUE-010`, `RF-ISS-009`.

| Precondiciones y datos | Acción | Resultado esperado | Limpieza |
| --- | --- | --- | --- |
| Cuenta con issues:reconcile. Folio SMA-HIST-001, cantidad 5, registradas 2, devuelta 1, pendiente 3; corte 2026-10-31 12:00 Ciudad de México. | Buscar, seleccionar, escribir motivo, declarar entrega y confirmar; perder respuesta y recargar. | Sin declaración no confirma. Envía revisión original, corte UTC 18:00, sin saldos derivados. Reabrir/reintentar conserva exactamente comando/clave; devuelve recibo. Vistas 390/1280 px sin desbordamiento. | Desmontar, restaurar adaptador y limpiar Storage/contexto. |
| Salida marcada histórica, 2 suministradas. | Solicitar devolución de 1 sin declaración física y después confirmarla. | Primero no envía; luego transmite physicalReturnConfirmed=true. Consulta muestra procedencia y no llama Surtir para regularizar. | Restaurar transporte y documento simulado. |

Fuentes: [unitarias](../../../tests/unit/modules/issues/historicalDeliveryTest.ts)
y [Chromium](../../../tests/e2e/historicalDelivery.spec.ts).
La [integración HTTP/Prisma](../../../../back/tests/integration/controllers/historicalDeliveryControllerDbTest.js)
comprueba ausencia de movimientos, estados, rollback, concurrencia y frontera 100/101 reales.
