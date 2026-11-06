# CP-VUE-STATUS-001-01 — recuperación del arranque y navegación

## Diseño y trazabilidad

`RF-VUE-003`; `DP-VUE-STATUS-001`. Particiones por estado y ancho de pantalla;
transición de fallo de carga a recarga válida. Sin API real ni base de datos.

| Caso | Precondiciones y datos | Acción | Resultado esperado | Limpieza |
| --- | --- | --- | --- | --- |
| `CP-VUE-STATUS-001-01` | Vue en Vite, Chromium, ancho 320 px. La primera carga del módulo Vuetify se interrumpe. | Abrir login, comprobar el aviso y pulsar **Volver a intentar**. | El fallback explica el fallo y ofrece una acción visible. La recarga abre login cuando el módulo vuelve a estar disponible. | Descartar el contexto del navegador; las imágenes de revisión permanecen fuera de las fuentes del manual. |

[fallbacks.spec.ts](../../../tests/e2e/fallbacks.spec.ts) comprueba además 404,
permiso denegado y sesión no disponible en 320/1440 px, teclado y regreso al inicio.
[sessionRecovery.spec.ts](../../../tests/e2e/sessionRecovery.spec.ts) conserva la
verificación de permisos, espera, errores y recuperación del destino solicitado.
