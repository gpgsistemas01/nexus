# CP-VUE-SESSION-002-01 — recuperar un refresh con 502

## Diseño y trazabilidad

`RF-AUT-002`; riesgo de confundir indisponibilidad con credenciales inválidas, `DP-VUE-SESSION-002`. Transición 401 → refresh 502 → reintento explícito.

## Especificación del caso y datos

| ID de caso | Precondiciones y estado inicial | Datos de prueba | Acción / pasos | Resultado esperado | Limpieza |
| --- | --- | --- | --- | --- | --- |
| `CP-VUE-SESSION-002-01` | Chromium y sessionScenario nuevos; acceso vencido y cookie de renovación; la API simulada empieza indisponible. | Destino /directorio/clientes?consulta=Ana#tabla; primer refresh 502 y siguiente 200 después de habilitar recuperación. | Abrir el destino; observar la pantalla de sesión no disponible; habilitar el refresh y pulsar Volver a comprobar el acceso. | Se muestra recuperación después del fallo. Antes del clic hay un refresh; al recuperar se presenta Clientes y el contador total es dos. No se exige capturar credenciales de nuevo. | Contexto Playwright y estado del harness descartados al terminar; sin escrituras SQL. |

## Fuente ejecutable y alcance

[sessionRecovery.spec.ts](../../../tests/e2e/sessionRecovery.spec.ts), `sesión: un 502 del refresh se puede recuperar sin volver a capturar credenciales`. Aislamiento Playwright. El fallo y la recuperación son simulados.

## Ejecución

El resultado real se registra como EP con revisión, ambiente, fecha, comando, estado y evidencia conforme al [plan](../01-test-plan.md). Esta ficha no contiene resultados de corridas.
