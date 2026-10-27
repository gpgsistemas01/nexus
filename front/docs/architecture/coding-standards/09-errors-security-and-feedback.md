# 9. Errores, seguridad y avisos

## Frontera HTTP

Usar `apiClient` para solicitudes JSON/blob y la normalización `ApiError`. No crear
otra instancia Axios por formulario. El cliente rechaza respuestas JSON inesperadas;
los adaptadores de recurso comprueban campos/códigos. `confirmMutation` compara con
el código permitido por operación antes de anunciar éxito.

| Situación | Respuesta del cliente |
| --- | --- |
| Captura inválida | Mensaje por campo y ninguna escritura desde el formulario. |
| 400 con errores de campo | Aplicar errores admitidos al formulario y mantener captura. |
| 401 protegido | Una renovación coordinada; rechazo definitivo deriva a login con retorno interno. |
| 403 | Presentar acceso no permitido y reevaluar permisos vigentes. |
| Conflicto de versión | Conservar captura, impedir reenvío y exigir nueva lectura. |
| Red/5xx/contrato inválido | Mostrar recuperación; no inventar éxito ni repetir escrituras en bucle. |
| Cancelación/desmontaje | No notificar éxito ni modificar un consumidor posterior. |

## Texto y avisos

La interpolación Vue y props de texto presentan datos recibidos. `v-html` está
prohibido por ESLint. SweetAlert2 recibe `titleText` y `text`, no contenido de API
como HTML. Un fallo de confirmación destructiva conserva estado recuperable y no
produce aviso de éxito. Reutilizar `shared/ui/feedback.ts`.

## Sesión y secretos

Cookies HttpOnly se administran por navegador y servidor. No guardar tokens,
contraseñas o cookies en localStorage/sessionStorage. Recordar usuario conserva sólo
el nombre. La recuperación de merma almacena su captura con finalidad y propietario
específicos; no generalizarla a credenciales. Las variables `VITE_*` son públicas.

No registrar datos privados en consola ni incluir secretos en errores o capturas de
prueba. Las restricciones de menú y formulario mejoran la interacción; la autorización
y la integridad persistente se comprueban de nuevo en la API.

## Enlaces y archivos

Los destinos de retorno sólo admiten rutas protegidas registradas; descartar externos,
arrays, login y pantallas de error como retorno. Para Excel comprobar respuesta y tipo
antes de descargar; un HTML del proxy no es un archivo válido. Liberar URLs de blob
cuando termina la descarga según el helper compartido.
