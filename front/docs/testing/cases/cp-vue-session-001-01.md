# CP-VUE-SESSION-001-01 — renovación transparente

## Diseño y trazabilidad

`RF-AUT-002`, soporte de casos protegidos; `DP-VUE-SESSION-001`. Transición acceso vencido → renovación → lectura válida.

## Especificación del caso y datos

| ID de caso | Precondiciones y estado inicial | Datos de prueba | Acción / pasos | Resultado esperado | Limpieza |
| --- | --- | --- | --- | --- | --- |
| `CP-VUE-SESSION-001-01` | Chromium y sessionScenario nuevos; acceso vencido, renovación disponible y página protegida Clientes. | Destino /directorio/clientes?consulta=Ana#tabla; refresh OK, Set-Cookie y accessToken=renewed-fixture HttpOnly. | Abrir directamente el destino protegido. | Una llamada POST a refresh y dos lecturas de `/me`; se presenta Clientes sin pasar por login y se conserva query/fragmento. El navegador almacena `accessToken=renewed-fixture` como HttpOnly. | Contexto Playwright y estado del harness descartados al terminar; sin escrituras SQL. |

## Fuente ejecutable y alcance

[sessionRecovery.spec.ts](../../../tests/e2e/sessionRecovery.spec.ts), `sesión: un access token vencido se renueva automáticamente mediante la cookie HttpOnly`. Aislamiento Playwright. No demuestra validez criptográfica ni rotación persistente.
