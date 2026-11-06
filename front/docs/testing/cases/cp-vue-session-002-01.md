# CP-VUE-SESSION-002-01 — recuperar un refresh con 502

## Diseño y trazabilidad

`RF-AUT-002`, `RF-VUE-002`; riesgo de interrumpir el acceso por un corte breve o
de reintentar sin límite, `DP-VUE-SESSION-002`. Particiones transitorio/persistente.

## Especificación del caso y datos

| ID de caso | Precondiciones y estado inicial | Datos de prueba | Acción / pasos | Resultado esperado | Limpieza |
| --- | --- | --- | --- | --- | --- |
| `CP-VUE-SESSION-002-01`, transitorio | Chromium y sessionScenario nuevos; acceso vencido y cookie de renovación. | Destino /directorio/clientes?consulta=Ana#tabla; primer refresh 502, siguiente 200 con cookie HttpOnly. | Abrir el destino sin pulsar controles de recuperación. | El segundo refresh recupera la consulta y abre Clientes con query/fragmento; no exige login ni clic de reintento. | Contexto Playwright y fixtures descartados; sin escrituras SQL. |
| `CP-VUE-SESSION-002-01`, persistente | Mismo escenario, refresh permanentemente indisponible. | Refresh 502 hasta habilitar la recuperación después de mostrar el error. | Abrir el destino; esperar el error; habilitar el servicio y pulsar **Volver a comprobar el acceso**. | Se muestra recuperación después de tres intentos HTTP de refresh, sin bucle. El clic recupera Clientes con el cuarto intento y conserva el destino; no solicita credenciales. | Contexto Playwright y fixtures descartados; sin escrituras SQL. |

## Fuente ejecutable y alcance

[sessionRecovery.spec.ts](../../../tests/e2e/sessionRecovery.spec.ts), escenarios
de 502 transitorio en `me`/`refresh` y de caída persistente del refresh. La variante
de `/me` comprueba también tres consultas totales y un único refresh. Aislamiento
Playwright; fallos, recuperación y cookies son simulados.
