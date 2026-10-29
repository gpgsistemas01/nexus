# CP-VUE-AUT-001 — captura de login y credencial histórica

## Diseño y trazabilidad

`RF-AUT-001`, `CU-AUT-01`, `DP-VUE-AUTH-002`. Particiones vacío/rechazado/válido y transición de reintento.

## Especificación del caso y datos

| ID de caso | Precondiciones y estado inicial | Datos de prueba | Acción / pasos | Resultado esperado | Limpieza |
| --- | --- | --- | --- | --- | --- |
| `CP-VUE-AUT-001` | Chromium con `mockWarehouse`, ruta `/inicio-sesion` y lista de solicitudes vacía. API y cuenta simuladas. | Nombre `" usuario "`; contraseña rechazada `" legado "` y luego `" válida "`. Las comillas delimitan los valores, no se capturan; cada uno contiene un espacio al inicio y otro al final. Recordar usuario activado. | Abrir y mover foco sin editar; enviar vacío; completar y enviar la credencial rechazada; cambiar la contraseña y reenviar. | Antes de enviar no hay errores iniciales; vacío muestra errores y no solicita login. Las solicitudes contienen nombre `usuario` y las contraseñas con sus espacios intactos. Rechazo muestra el mensaje genérico; éxito abre Materiales y conserva únicamente `nexus.rememberedUser=usuario` en almacenamiento local. Al volver al login la contraseña está vacía. La cookie de respuesta simulada es HttpOnly. | Contexto Playwright y estado del harness descartados al terminar; sin escrituras SQL. |

## Fuente ejecutable y alcance

[login.spec.ts](../../../tests/e2e/login.spec.ts), `login: captura inválida, rechazo genérico y reintento con cookies hacia materiales`. Aislamiento Playwright. No comprueba hash, cuenta real ni emisión JWT.
