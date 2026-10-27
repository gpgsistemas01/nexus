# CP-VUE-SESSION-004-01 — cierre y rechazo posterior

## Diseño y trazabilidad

`RF-AUT-003`, `CU-AUT-02`, `DP-VUE-SESSION-004`. Transición sesión válida → cierre → acceso protegido.

## Especificación del caso y datos

| ID de caso | Precondiciones y estado inicial | Datos de prueba | Acción / pasos | Resultado esperado | Limpieza |
| --- | --- | --- | --- | --- | --- |
| `CP-VUE-SESSION-004-01` | Chromium con sessionScenario nuevo, cookies HttpOnly y acceso inicial a Clientes; cierre simulado elimina ambas cookies. | Destino Clientes; después de cerrar, /me y refresh responden 401. Cookies access/refresh de fixture. | Abrir Clientes, pulsar Cerrar sesión y volver a abrir el destino protegido. | Un POST a `/cerrar-sesion`; login visible; no quedan cookies access/refresh. El acceso directo vuelve al login con destino conservado. El contador de refresh es dos: recuperación inicial y rechazo posterior al cierre. | Contexto Playwright y estado del harness descartados al terminar; sin escrituras SQL. |

## Fuente ejecutable y alcance

[sessionRecovery.spec.ts](../../../tests/e2e/sessionRecovery.spec.ts), `sesión: cerrar elimina cookies y el acceso directo posterior vuelve al login`. Aislamiento Playwright. El caso de sistema siguiente comprueba además el router real.

## Ejecución

El resultado real se registra como EP con revisión, ambiente, fecha, comando, estado y evidencia conforme al [plan](../01-test-plan.md). Esta ficha no contiene resultados de corridas.
