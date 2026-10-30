# 3. Compilación y despliegue del cliente Vue

## Alcance y procesos

Vite compila TypeScript, SFC, CSS y módulos públicos compartidos a `front/dist`. Ese directorio contiene archivos estáticos; Express es otro proceso y PostgreSQL no se publica al navegador. Los dos servicios pueden ejecutarse en contenedores o proveedores distintos, siempre que el acceso a la API y las cookies queden correctamente configurados.

## Construcción reproducible

Desde la raíz del repositorio:

```bash
npm --prefix front ci --include=dev
npm --prefix front run build
npm --prefix front run preview
```

`build` comprueba tipos antes de generar assets. `preview` sirve localmente la compilación y anuncia su URL; no reemplaza al servidor de producción. El contexto conserva el repositorio completo: los alias `@nexus/*` necesitan archivos públicos bajo `back/src` al compilar. Copiar sólo `front/` a un repositorio vacío rompe esa dependencia.

Las versiones de Node admitidas proceden de `front/package.json`; `npm ci` usa el lockfile. Cambiar `engines` no instala Node en el proveedor. Las pruebas se ejecutan antes de publicar, no dentro de Nginx.

## Variables y momento de aplicación

La [configuración de `.env.local`](01-getting-started.md#configurar-frontenvlocal-para-vue)
explica la copia inicial y su prioridad. Vite puede leer ese archivo al compilar
localmente; el Dockerfile lo excluye. Los valores `VITE_*` deben suministrarse en
el build del proveedor o como argumentos admitidos por el Dockerfile.

| Configuración | Ubicación y efecto |
| --- | --- |
| `BACKEND_PROXY_TARGET` | `front/.env.local`, Vite dev/preview. Predeterminado `http://127.0.0.1:3000`. Reiniciar Vite después de cambiarlo. |
| `VITE_LOGIN_LOGO_URL` | Valor público de compilación; URL/archivo del logo. Se incorpora a los assets y exige recompilar para cambiarlo. |
| `BACKEND_UPSTREAM` | Entorno del contenedor Nginx al arrancar; predeterminado `http://backend:3000`. No es una variable de Vite. |
| Conexión PostgreSQL y secretos JWT | Sólo entorno del proceso Express. Nunca se configuran como `VITE_*` ni se copian al sitio estático. |

## Servir rutas y API

Vue Router usa historial HTML5: una recarga de `/compras/materiales` debe recibir `index.html`, sin convertir una petición API o un asset ausente en esa página. El orden necesario es:

1. API `/api` y acción `/cerrar-sesion`: proxy hacia Express conservando ruta, cabeceras y cookies.
2. `/assets/`: servir el archivo real o devolver 404 si no existe.
3. Rutas de página Vue: fallback a `index.html`.

Axios realiza solicitudes con credenciales. Un proxy del mismo origen permite que el navegador gestione cookies HttpOnly sin leer tokens desde Vue. Si se elige acceso entre orígenes distintos, hay que configurar explícitamente CORS, credenciales y atributos de cookies en la API; el código actual del cliente usa rutas relativas y no configura esa variante por sí solo.

## Docker y VPS

Desde la raíz:

```bash
docker build -f front/Dockerfile -t nexus-front .
docker run --rm --name nexus-front --network nexus -p 8080:80 -e BACKEND_UPSTREAM=http://backend:3000 nexus-front
```

La red `nexus` debe existir; Express debe resolver con el alias `backend` en esa red y escuchar en 3000. El comando de ejemplo publica Vue en `http://localhost:8080`. `front/Dockerfile` tiene etapa de compilación con Node y etapa final con Nginx; copia únicamente `dist` al sitio servido. La construcción usa la raíz como contexto para incluir los módulos públicos permitidos. No es necesario generar `dist` antes de construir la imagen.

`front/Dockerfile.dockerignore` excluye dependencias locales, compilaciones previas,
archivos `.env`, documentación y sus herramientas. Las guías permanecen en
`front/docs`; copiarlas a `public/` las incorporaría al sitio compilado.

`front/nginx.conf` aplica fallback SPA y proxy a la API/cierre. Su resolución DNS corresponde a Docker. Si se ejecuta Nginx fuera de Docker, hay que adaptar el resolver y upstream al entorno de la VPS. TLS, dominio y proxy externo pertenecen a la configuración de ese servidor; estos archivos no demuestran que ya estén instalados en una VPS.

El Dockerfile raíz y Compose mantienen la aplicación backend; el frontend usa su Dockerfile propio. Las imágenes y procesos pueden actualizarse por separado cuando no cambien contratos compartidos. Un cambio de código público compilado requiere reconstruir Vue para que sus assets incorporen la versión nueva.

## Hosting estático

En Vercel o Render Static Site se ejecuta la compilación de Vite y se publica `dist`; no se necesita el Dockerfile frontend para ese modo. El proveedor debe descargar el repositorio completo y permitir que el build lea las fuentes públicas fuera de `front/`. Con Root Directory `front`, instalación y build son `npm ci` / `npm run build` y salida `dist`, sujetos al contexto permitido por el proveedor.

`front/vercel.json` contiene únicamente el fallback SPA. No contiene el destino real de Express: antes de usar la sesión hay que configurar los rewrites/proxy de `/api/:path*` y `/cerrar-sesion` hacia la API propia, con prioridad sobre el fallback. En Render Static Site se necesita también el fallback de página y una solución para el acceso a la API con sus cookies. Este documento no atribuye una configuración remota activa a un archivo local.

En Render Static Site, el fallback se añade en **Redirects/Rewrites** con fuente
`/*`, destino `/index.html` y acción **Rewrite**, después de resolver el acceso a
la API. La página de ruta desconocida la dibuja Vue; el servidor que entrega el
fallback puede responder HTTP 200 aunque se muestre esa página.

| Configuración | Para qué sirve |
| --- | --- |
| `front/vercel.json` | Archivo opcional para desplegar en Vercel. Permite abrir o recargar rutas como `/almacen/materiales` entregando `index.html` a Vue Router. |
| `front/vite.config.ts` | Servidor local y proxy en desarrollo/vista previa. No lee `vercel.json`. |
| `front/nginx.conf` | Rutas y proxy de la imagen Docker. No lee `vercel.json`. |

El archivo de Vercel tiene utilidad para ese proveedor; no es necesario para ejecutar
Vue con Vite ni para la VPS con Nginx. Su regla actual `/(.*)` dirige también una
petición `/api/...` al fallback si no se configura una regla de API previa: podría
recibirse HTML en lugar del JSON esperado. Por eso este archivo no constituye una
configuración completa de despliegue del sistema. El destino de Express depende del
entorno y debe definirse antes de publicar en Vercel.

## Comprobación y recuperación

| Verificación | Resultado esperado |
| --- | --- |
| Abrir login y recargar una ruta Vue | Se sirve la SPA; una URL protegida comprueba sesión/permisos. |
| Solicitar `/api/auth/me` | Llega a Express y devuelve su JSON/estado, nunca `index.html`. |
| Iniciar sesión y renovar acceso | Cookies coherentes con el origen; 401 recuperable puede renovar; 502 se presenta como fallo de conexión. |
| Solicitar un asset inexistente | Devuelve 404; no una página HTML anunciada como JavaScript. |
| Revisar imagen/sitio publicados | Assets y Nginx; no `.env`, `node_modules`, guías o reportes de pruebas. |

Ante un despliegue fallido se conserva la versión anterior y se revisan logs de build/proxy y Network del navegador, sin copiar tokens. Recompilar con variables corregidas soluciona valores `VITE_*`; cambiar sólo el entorno de un Nginx ya iniciado no modifica assets previos. La aplicación no migra la base de datos desde Vue.

Las fuentes y artefactos documentales se publican por el [procedimiento local](../governance/02-generation-and-publication.md), fuera de la imagen y del sitio.
