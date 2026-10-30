# 3. Compilación y despliegue del cliente Vue

Vite produce los archivos estáticos de `front/dist`. El alojamiento los entrega
al navegador y reenvía las peticiones de datos a la API.

## Construcción reproducible

Desde la raíz del repositorio:

```bash
npm --prefix front ci --include=dev
npm --prefix front run build
npm --prefix front run preview
```

`build` comprueba tipos; `preview` permite revisar el resultado local. Conserva el
checkout completo: el build incorpora los módulos públicos `@nexus/*` de `back/`.

## Variables y momento de aplicación

| Variable | Se aplica en | Efecto |
| --- | --- | --- |
| `BACKEND_PROXY_TARGET` | Vite local, mediante `front/.env.local`. | Destino de API y cierre de sesión. |
| `VITE_LOGIN_LOGO_URL` | Compilación. | Logo público incluido en los archivos; cambiarlo requiere recompilar. |
| `BACKEND_UPSTREAM` | Arranque del contenedor Nginx. | Destino de la API; predeterminado `http://backend:3000`. |

La [configuración local](01-getting-started.md#configurar-frontenvlocal-para-vue)
explica la plantilla y las prioridades. En Docker o hosting, proporciona los
valores de build mediante su configuración. Los secretos y la conexión de datos
pertenecen al entorno de la API.

## Servir rutas y API

Configura el alojamiento en este orden:

1. `/api` y `/cerrar-sesion`: proxy hacia la API conservando rutas, cabeceras y cookies.
2. `/assets/`: archivo existente o respuesta 404.
3. Páginas Vue, como `/compras/materiales`: fallback a `index.html` para abrirlas o recargarlas.

El cliente usa rutas relativas y credenciales con un proxy del mismo origen.
Un despliegue entre orígenes necesita configurar CORS, credenciales y atributos
de cookies en la API y comprobar los recorridos de sesión.

## Docker y VPS

Antes de iniciar el frontend, deben existir la red Docker `nexus` y la API con
el alias `backend`, escuchando en 3000. Desde la raíz:

```bash
docker build -f front/Dockerfile -t nexus-front .
docker run --rm --name nexus-front --network nexus -p 8080:80 -e BACKEND_UPSTREAM=http://backend:3000 nexus-front
```

El ejemplo publica Vue en `http://localhost:8080`. La etapa Node compila y la
etapa final ejecuta Nginx con `dist`; no hace falta generar `dist` previamente.
`front/Dockerfile.dockerignore` excluye dependencias locales, `.env`, documentación
y herramientas. La imagen backend se construye por separado.

`front/nginx.conf` define el proxy y el fallback. Si usas Nginx fuera de Docker,
adapta su resolver y upstream a la VPS. Configura TLS, dominio y el proxy externo
en ese servidor. Al cambiar código público compartido, reconstruye Vue.

## Hosting estático

El proveedor debe descargar el repositorio completo y permitir las fuentes
públicas de `back/` durante el build. Con directorio raíz `front`, utiliza
`npm ci`, `npm run build` y salida `dist`.

| Proveedor | Configuración necesaria |
| --- | --- |
| Vercel | `front/vercel.json` aporta el fallback SPA. Agrega antes las reglas de `/api/:path*` y `/cerrar-sesion` hacia tu API. |
| Render Static Site | Configura el acceso a la API y sus cookies. En Redirects/Rewrites agrega `/*` → `/index.html`, acción Rewrite, para las páginas. |

El proxy de Vite funciona en desarrollo/vista previa; Nginx y el hosting utilizan
sus propias reglas. Sin la regla de API anterior al fallback, puede recibirse
HTML donde se espera JSON.

## Comprobación y recuperación

| Comprobación | Resultado esperado |
| --- | --- |
| Abrir login y recargar una URL Vue | Se presenta la página y se comprueba el acceso. |
| Solicitar `/api/auth/me` | Respuesta JSON/estado de la API. |
| Iniciar sesión y renovar acceso | Cookies compatibles con el origen y recuperación de sesión. |
| Pedir un asset inexistente | Respuesta 404. |
| Inspeccionar el sitio y la imagen | Archivos compilados, sin secretos, fuentes documentales ni resultados de pruebas. |

Si falla la publicación, conserva la versión anterior y revisa los logs de build,
proxy y Network del navegador. Corrige las variables de compilación y reconstruye
cuando corresponda. Las guías se publican mediante el
[procedimiento documental](../governance/02-generation-and-publication.md).
