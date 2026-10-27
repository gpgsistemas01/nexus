# Vista física y operación

La SPA se ejecuta en el navegador. Vite sirve desarrollo y genera assets; en producción
un alojamiento estático los entrega y un proxy conecta API/cierre de sesión. El
[procedimiento de construcción](../../../development/03-build-and-deployment.md)
contiene comandos, variables y verificaciones de Docker, VPS y hosting estático.

## Unidades y configuración

| Unidad | Ejecuta/contiene | Configuración |
| --- | --- | --- |
| Navegador | Vue, Router, controles y cliente HTTP. | Assets compilados, base del Router y cookies del origen. |
| Vite local | Servidor de desarrollo y proxy. | `BACKEND_PROXY_TARGET`; destino por defecto 127.0.0.1:3000. |
| Etapa build | TypeScript y compilación Vite. | Node compatible, lockfile, fuentes Vue y alias públicos. |
| Alojamiento/Nginx | Archivos `dist`, caché y fallback SPA. | `nginx.conf`, `BACKEND_UPSTREAM` en imagen frontend. |
| API | Autenticación, autorización, reglas y persistencia. | Variables privadas del servidor; no variables VITE. |

## Separación de build y ejecución

Los alias `@nexus/*` necesitan las fuentes públicas durante el build, por lo que el
contexto se prepara desde la raíz del checkout. La imagen final sólo copia `dist` y
configuración Nginx. No necesita el proceso Node de desarrollo, el código privado,
`node_modules`, pruebas o documentación. `front/Dockerfile.dockerignore` filtra el
contexto y las guías/artefactos permanecen fuera de producción.

## Fallos operativos observables

Una ruta recargada con 404 indica revisar fallback; un 502 local con ECONNREFUSED
indica revisar proceso/puerto del destino API; un 401 definitivo pertenece a sesión;
un HTML presentado como JSON o Excel se rechaza como contrato inválido.
Las variables de build VITE son públicas y quedan incorporadas al bundle. Cambiar
una variable del contenedor no recompila esos assets.

## Verificación

Comprobar acceso directo a una ruta protegida, login/refresh/cierre a través del
mismo origen, carga de assets y descarga real. Una compilación correcta no demuestra
que el upstream remoto o las cookies estén configurados. El [inicio local](../../../development/01-getting-started.md)
y [pruebas de sistema](../../../testing/05-system-tests.md) conservan la preparación reproducible.

Los [diagramas de ejecución y build](runtime-and-build.md) muestran procesos, proxy, assets y exclusiones de la imagen final.
