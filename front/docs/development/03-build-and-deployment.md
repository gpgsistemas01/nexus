# 3. Compilación y despliegue del cliente Vue

Vite produce los archivos estáticos de `front/dist`. El alojamiento los entrega
al navegador y reenvía las peticiones de datos a la API.

## Consulta rápida

| Necesito… | Ir a |
| --- | --- |
| Publicar Vue en Render con Nginx | [Web Service Docker](#render-conservar-la-api-y-publicar-vue). |
| Configurar un Render Static Site | [Rutas hacia la API y fallback de Vue](#render-static-site-rutas-y-api). |
| Resolver `Not Found` o un login con `200` vacío | [Diagnóstico del despliegue](#diagnóstico-del-despliegue). |
| Comprobar qué cambios están publicados | [Rama y versión publicada](#rama-y-versión-publicada). |
| Configurar el servicio API | [Despliegue del backend](../../../back/docs/architecture/views/physical/01-system-runtime-and-deployment.md#configurar-el-servicio-api-en-render). |

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
| `PORT` | Arranque del contenedor Nginx. | Puerto HTTP interno; 80 por defecto. Render proporciona su propio valor. |

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

El ejemplo publica Vue en `http://localhost:8080`: Node compila y Nginx sirve `dist`. El
Dockerfile genera `dist` y excluye dependencias locales, `.env`, documentación y
herramientas mediante `front/Dockerfile.dockerignore`. El backend usa otra imagen.
La imagen comprueba los tipos de la aplicación; CI conserva la validación de
pruebas y herramientas con el checkout completo.

`front/nginx.conf` define el proxy y el fallback. El entrypoint oficial de Nginx
obtiene los servidores DNS de `/etc/resolv.conf`; no presupone el DNS de Docker
local. Si usas Nginx fuera de esta imagen, sustituye las variables de la plantilla
y configura TLS, dominio y proxy. Al cambiar código público compartido, reconstruye Vue.

## Render: conservar la API y publicar Vue

Ambos servicios pueden usar este repositorio. Cada Dockerfile genera su propia
imagen y Render los despliega por separado. Vue incorpora las reglas públicas al
compilar y consume la API por HTTP durante la ejecución.

Reutiliza el backend existente y agrega un **Web Service** Docker para Vue.
El navegador accede al dominio del frontend; Nginx reenvía `/api` y
`/cerrar-sesion` a la API. Así conserva las cookies `HttpOnly`, `Secure` y
`SameSite=Lax` sin cambios de CORS ni URLs absolutas en el cliente.

| Campo del servicio Vue | Valor |
| --- | --- |
| Repositorio / rama | Este repositorio y la versión compatible con el backend. |
| Runtime | Docker. |
| Root Directory | Vacío, para conservar acceso a los módulos públicos de `back/`. |
| Dockerfile Path | `./front/Dockerfile`. |
| Docker Build Context Directory | `.`. |
| Docker Command | Sin sobrescribir; usa el `CMD` de la imagen. |
| `BACKEND_UPSTREAM` | URL HTTPS pública del backend existente, sin rutas ni barra final. |
| `PORT` | El valor proporcionado por Render; la imagen lo utiliza al arrancar. |
| Health Check Path | `/inicio-sesion`; comprueba que Nginx entrega Vue. |

No configures `BACKEND_PROXY_TARGET` en producción: pertenece al servidor local
de Vite. Los secretos de sesión y PostgreSQL se mantienen en el servicio API.
La [configuración del backend](../../../back/docs/architecture/views/physical/01-system-runtime-and-deployment.md#configurar-el-servicio-api-en-render)
precisa sus rutas y migraciones.

Si habilitas filtros de construcción, incluye `front/**`, `back/src/shared/**`
y `back/src/public/js/**` en Vue. Los cambios en reglas públicas deben recompilar
el cliente aunque el archivo modificado esté en `back/`.

Publica primero una versión compatible de la API y después Vue. Comprueba login,
renovación, cierre, apertura directa de una ruta y descarga de Excel desde el
dominio frontend. El health check de Nginx no comprueba la conexión a PostgreSQL.

La URL pública de la API también permite usar un backend Free. Una conexión por
red privada requiere que el backend admita tráfico privado y que ambos servicios
compartan espacio y región. Los servicios Free pueden suspenderse por inactividad;
revisa ese comportamiento y el coste de dos servicios antes de usarlos en operación.

Referencias del proveedor: [Docker](https://render.com/docs/docker),
[monorepos](https://render.com/docs/monorepo-support) y
[red privada](https://render.com/docs/private-network).

### Rama y versión publicada

En cada servicio, revisa **Branch**, **Auto-Deploy** y el commit del despliegue
**Live** en **Deploys**. Si la rama es `main`, guardar en `features` requiere
integrar esos cambios en `main` para que se publiquen. La opción **After CI Checks
Pass** espera las comprobaciones del commit. Confirma la versión activa de Vue y
API antes de probar; un despliegue iniciado todavía puede estar construyéndose.

## Hosting estático

El proveedor debe descargar el repositorio completo y permitir las fuentes
públicas de `back/` durante el build. En Render conserva **Root Directory vacío**,
compila desde la raíz y publica `front/dist`:

```bash
npm --prefix front ci --include=dev && npm --prefix front run build
```

| Proveedor | Configuración necesaria |
| --- | --- |
| Vercel | `front/vercel.json` aporta el fallback SPA. Agrega antes las reglas de `/api/:path*` y `/cerrar-sesion` hacia tu API. |
| Render Static Site | Configura las [reglas de API y Vue](#render-static-site-rutas-y-api) y comprueba métodos HTTP, cookies y descargas. |

El sitio estático es una alternativa a la imagen Nginx. Antes de adoptarlo,
comprueba las escrituras y `Set-Cookie` mediante las reglas externas del proveedor;
el fallback SPA por sí solo no conecta la API. Si se usan orígenes distintos,
hay que adaptar el cliente y configurar CORS y cookies en el servidor.

El proxy de Vite funciona en desarrollo/vista previa; Nginx y el hosting utilizan
sus propias reglas. Sin la regla de API anterior al fallback, puede recibirse
HTML donde se espera JSON.

### Render Static Site: rutas y API

Abre el servicio frontend en Render y entra en **Redirects/Rewrites**. Configura
estas reglas en este orden. Sustituye la URL ficticia `https://api.example.com`
por la URL HTTPS pública de tu servicio API:

| Source | Destination | Action |
| --- | --- | --- |
| `/api/*` | `https://api.example.com/api/*` | Rewrite |
| `/cerrar-sesion` | `https://api.example.com/cerrar-sesion` | Rewrite |
| `/*` | `/index.html` | Rewrite |

Usa **Rewrite** para conservar la URL del frontend y deja el fallback al final.
Render permite abrir o recargar `/inicio-sesion` al servir `index.html` en esa
ruta. Las reglas de API deben conservar método, cuerpo, query y cookies.
Comprueba login, renovación, cierre, escrituras y Excel antes de dar el sitio por
operativo. Si el alojamiento no conserva esos contratos, usa el Web Service
Docker con Nginx descrito arriba.

Un Static Site publica `front/dist`; `front/vercel.json` pertenece a Vercel y
`front/nginx.conf` se utiliza al ejecutar la imagen Docker. El proxy de Vite y
`BACKEND_PROXY_TARGET` corresponden a desarrollo/vista previa.

Referencias: [reglas de Render](https://render.com/docs/redirects-rewrites) y
[despliegues y comprobaciones CI](https://render.com/docs/deploys).

## Comprobación y recuperación

| Comprobación | Resultado esperado |
| --- | --- |
| Abrir login y recargar una URL Vue | Se presenta la página y se comprueba el acceso. |
| Solicitar `/api/auth/me` | Respuesta JSON/estado de la API. |
| Iniciar sesión y renovar acceso | Cookies compatibles con el origen y recuperación de sesión. |
| Pedir un asset inexistente | Respuesta 404. |
| Inspeccionar el sitio y la imagen | Archivos compilados, sin secretos, fuentes documentales ni resultados de pruebas. |

### Diagnóstico del despliegue

En **DevTools → Network**, selecciona **POST `/api/auth/login`** y revisa URL,
estado, `Content-Type` y **Response**. El acceso correcto devuelve JSON con
`{"code":"SUCCESS_LOGIN"}` y establece las cookies de sesión. Un `200` vacío o
con HTML no cumple ese contrato; un `OPTIONS 200` tampoco confirma el login.

| Síntoma | Comprobar / corregir |
| --- | --- |
| `/` abre Vue, pero recargar `/inicio-sesion` muestra `Not Found` | Aplicar el fallback del alojamiento. En Static Site, revisar la última regla `/*` → `/index.html`; en Docker, usar `front/nginx.conf`. Para volver al formulario mientras se corrige, abrir `/`. |
| POST de login con `200`, vacío o HTML | Revisar que `/api/*` llegue al backend antes del fallback. Conservar la validación de `SUCCESS_LOGIN` del cliente. |
| Login correcto, pero `/api/auth/me` devuelve `401` | Comprobar `Set-Cookie` del login y el envío de cookies en `/me`, su dominio y el proxy del mismo origen. |
| `/api/auth/me` devuelve HTML | Corregir el destino o el orden de las reglas de API. Sin sesión, se espera un `401` JSON; con sesión válida, un `200` JSON con `user`. |
| Los cambios de `features` no aparecen | Revisar [rama y commit Live](#rama-y-versión-publicada) de ambos servicios. |

Si falla la publicación, conserva la versión anterior y revisa los logs de build,
proxy y Network del navegador. Corrige las variables de compilación y reconstruye
cuando corresponda. Las guías se publican mediante el
[procedimiento documental](../governance/02-generation-and-publication.md).
