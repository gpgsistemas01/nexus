# CP-VUE-SEC-001-01 — texto hostil en confirmación y error

## Diseño y trazabilidad

DP-VUE-SEC-001; RN-VUE-004. Particiones título/descripción/error y transición confirmar → fallo.

## Especificación del caso y datos

| ID de caso | Precondiciones y estado inicial | Datos de prueba | Acción / pasos | Resultado esperado | Limpieza |
| --- | --- | --- | --- | --- | --- |
| `CP-VUE-SEC-001-01` | Vitest/jsdom con SweetAlert2 real, matchMedia/scrollTo simulados, timers controlados y AbortController. | Texto de fixture &lt;img data-injected src=x onerror="window.injected=true"&gt;; submit rechaza con Error que incluye el mismo texto. | 1. Abrir confirmAction con título/descripción de fixture. 2. Confirmar y esperar rechazo. 3. Abortar y finalizar timers. | El popup presenta título/descripción como texto y no crea nodo data-injected. Submit se llama una vez; el error queda como texto, no hay éxito y la confirmación termina false al abortar. | Cerrar Swal, completar timers, restaurar timers reales, mocks y globals. |

## Fuente ejecutable y alcance

[feedbackTest.ts](../../../tests/unit/shared/ui/feedbackTest.ts), la confirmación y el error del servidor no interpretan HTML. Oráculo de DOM en jsdom, sin una evaluación general de seguridad del servidor.

## Ejecución

El resultado real se registra como EP con revisión, ambiente, fecha, comando, estado y evidencia conforme al [plan](../01-test-plan.md). Esta ficha no contiene resultados de corridas.
