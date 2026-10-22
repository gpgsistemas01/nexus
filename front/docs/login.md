# Login Vue

## Alcance y ejecución

`/` redirige a `/inicio-sesion`. El login usa Vuetify y VeeValidate, conserva la
tarjeta verde oscura y la distribución del EJS y envía las credenciales a Express.
Al autenticar se abre `/almacen` mediante Vue Router: la guarda selecciona
Materiales o Mermas según los permisos. Materiales, Consumibles y Mermas son Vue;
El menú Vue incorpora también los [seis catálogos administrables](catalogs.md)
para `catalogs:manage`, con acceso directo a Áreas si es el único permiso de entrada.

Desde la raíz, inicia cada aplicación en una terminal:

```bash
npm --prefix back run dev
```

```bash
npm --prefix front ci --include=dev
npm --prefix front run dev
```

Abre `http://localhost:5173/inicio-sesion`. Express debe contar con su configuración
habitual y una cuenta existente. Vite usa `http://127.0.0.1:3000` como destino del
proxy. Para cambiarlo, crea `front/.env.local` con `BACKEND_PROXY_TARGET`, tomando
como referencia `.env.example`, y reinicia Vite. Esta variable es del servidor de
desarrollo, no una clave pública `VITE_*`.

### Error 502 al renovar la sesión en local

El proxy de Vite devuelve `502 Bad Gateway` si no logra conectarse a Express.
Se puede abrir Vue en el puerto 5173 aunque el backend esté detenido: la pantalla
disponible no garantiza que la API esté escuchando. Ante un 401 de una consulta
protegida, Axios intenta `POST /api/auth/refresh`; si Express no responde, esa
renovación también falla a través del proxy.

1. Mantén `npm --prefix back run dev` activo en otra terminal. Comprueba el puerto
   anunciado y cualquier error que cierre el proceso; `back/.env` configura Express.
2. El destino predeterminado es `http://127.0.0.1:3000`. Si Express anuncia otro
   puerto, configura `BACKEND_PROXY_TARGET` en `front/.env.local` con ese origen y
   reinicia Vite. Las variables `VITE_*` no configuran este proxy.
3. Comprueba directamente el endpoint desde PowerShell, sin compartir tokens:

   ```powershell
   curl.exe -i -X POST http://127.0.0.1:3000/api/auth/refresh -H "Content-Type: application/json" -d "{}"
   ```

   Sin cookie de renovación, la respuesta esperada es `401 INVALID_AUTH`: confirma
   que la API responde. Una conexión rechazada indica que hay que corregir el
   arranque o el puerto antes de revisar cookies. Si responde directamente pero
   falla desde 5173, contrasta el destino configurado y el error de la terminal de Vite.

Un 502 no se trata como sesión vencida ni dispara reenvíos automáticos. Tras recuperar
el backend, el reintento explícito puede renovar la sesión; un 401 del propio refresh
sí requiere volver a iniciar sesión. El origen concreto de un incidente se confirma
con la URL y el error de conexión del proxy, no sólo con el mensaje del navegador.

## Diseño y responsabilidades

- `pages/LoginPage.vue` compone la pantalla y navega después del acceso.
- `components/LoginForm.vue` usa controles Vuetify y sólo recibe props/emite eventos.
- `composables/useLoginForm.ts` conecta VeeValidate, captura, envío y errores.
- `services/authService.ts` adapta el contrato del login usando el cliente Axios compartido, con `requiresAuth: false`.

Los colores, fondo, tarjeta y distribución se adaptaron de `loginPage.ejs` y de
su sección de `style.css`; no se modifica el EJS ni se carga MDB en este login.
El repositorio no contiene el `/img/logo.png` referenciado por el EJS: se usa una
N provisional. Coloca una imagen en `front/public/` y define, por ejemplo,
`VITE_LOGIN_LOGO_URL=/logo.png` antes de arrancar o compilar. Un fallo de carga
recupera la N. Los valores `VITE_*` son públicos y se incorporan al build.
En Docker puedes pasar `--build-arg VITE_LOGIN_LOGO_URL=/logo.png`; la imagen debe
estar en `front/public/` antes de construir.

## Captura y validación

Las reglas públicas del login se extrajeron a
`back/src/public/js/utils/validations/loginValidation.js` sin cambiar su comportamiento.
El formulario EJS importa ese módulo directamente. Los alias de
Vite/TypeScript importan esa misma fuente y los mensajes públicos existentes;
no hay una copia de las reglas en Vue ni se importa código privado de Express.

VeeValidate comprueba campos obligatorios, tipo y longitudes máximas existentes.
El login no impone la política de contraseñas de altas: las credenciales históricas
cortas siguen siendo válidas para captura. Se recorta el usuario, pero se conservan
exactamente los espacios de la contraseña. Los errores se presentan al salir de un
campo modificado o al enviar; el foco automático y salir de campos intactos no
validan la captura. Editar limpia el error anterior. Durante el envío se deshabilitan
los controles y se bloquean solicitudes simultáneas. Zod no se incorpora porque
las reglas públicas existentes ya resuelven esta primera migración.

“Recordar usuario” guarda únicamente el nombre en `nexus.rememberedUser` después
de un acceso correcto. Desmarcarlo elimina ese valor al autenticar. Al abrir el
login se elimina la antigua clave `loginRememberedCredentials` del mismo origen;
no se recupera ni guarda su contraseña. Si el navegador bloquea el almacenamiento,
el inicio de sesión sigue funcionando. Las cookies no cambian su duración por
esta opción; no equivale a mantener la sesión abierta.

## Contrato HTTP y sesión

El frontend hace un único `POST /api/auth/login`, con JSON `{ name, password }` y
cookies del mismo origen. Sólo `200` con `code: SUCCESS_LOGIN` confirma el acceso;
una página HTML o un JSON inesperado no lo confirma. Los errores de campo con códigos
desconocidos no se muestran como mensajes sin traducir. No se intenta renovar tokens
cuando falla el login.

| Respuesta | Comportamiento de Vue |
| --- | --- |
| `400 VALIDATION_ERROR` y `errors.<campo>.code` | Traduce con los mensajes públicos y muestra errores de campo. |
| `401` | Mensaje genérico de usuario o contraseña incorrectos. |
| `429`, incluso con texto/HTML del proxy | Solicita esperar antes de volver a intentar. |
| `5xx`, respuesta inesperada, red o tiempo de espera de 15 s | Mensaje recuperable y controles habilitados para reintentar. |
| `200 SUCCESS_LOGIN` | Conserva cookies y navega al módulo permitido o a una ruta interna protegida registrada. |

Express conserva validación definitiva, autenticación, autorización y cookies
HttpOnly/SameSite=Lax. En `NODE_ENV=production` llevan Secure y requieren HTTPS.
Vue no lee ni guarda tokens. `createAuthSession` consulta `/api/auth/me`; la guarda
protege las rutas de Almacén y Catálogos y comparte el usuario readonly mediante provide/inject.
El cliente de solicitudes protegidas intenta una renovación ante `401`, nunca
ante `403`, conflictos o errores de conexión. Las notificaciones `flash`
HttpOnly del flujo EJS no se muestran en la pantalla Vue; el nuevo login muestra
sus propios resultados de envío.

### Renovación automática y recuperación del acceso

Cuando vence el access token, `/api/auth/me` puede responder `401 INVALID_AUTH`.
Axios envía automáticamente `POST /api/auth/refresh`, compartido entre las consultas
pendientes. Si la cookie HttpOnly de renovación sigue siendo válida, Express
establece las cookies y devuelve `200 text/plain OK`; Axios repite una vez la
consulta original. No se requiere pulsar un botón ni capturar credenciales.
Es la misma API de renovación que consume EJS; no se implementa otra política de tokens.

Si falla la conexión o el refresh devuelve 502, la pantalla de sesión no disponible
conserva en `returnTo` la ruta solicitada, incluida su consulta y fragmento.
«Volver a comprobar el acceso» muestra «Comprobando acceso…», evita clics simultáneos
y vuelve a ejecutar la guarda de esa ruta. Cuando vuelve el backend, la comprobación
puede renovar automáticamente la sesión y recuperar el módulo original. Si el fallo
persiste, muestra un aviso y permite otro intento explícito; no oculta el resultado.
Acceso denegado conserva también la ruta para revalidar permisos sin enviarlo a otro
módulo. Un refresh rechazado con 401 abre el login y conserva el destino.

`app/router/protectedDestination` comparte entre login y recuperación la resolución
de `returnTo`: sólo admite rutas internas registradas que requieren sesión. Una URL
externa, desconocida o de error usa `/almacen` como entrada autorizada, evitando
redirecciones externas y ciclos de recuperación.

El logger del backend usa `warn` por defecto: registra el 401 de `/me`, pero puede
omitir un refresh exitoso con 200. Para comprobar la renovación, observa en Network
la secuencia `/me` → `/refresh` → `/me` y sus estados HTTP, sin compartir cookies
ni tokens. La ausencia de un mensaje de éxito en la terminal no demuestra por sí
sola que la renovación no se ejecutó.

## Proxy y despliegue

Vite y Nginx encaminan `/api` y el POST `/cerrar-sesion` a Express. Este último
limpia las cookies y redirige al login Vue, sin montar una vista EJS.
`/inicio-sesion`, `/almacen` y los assets compilados pertenecen a Vue. Esto permite
seguir usando el mismo origen y las cookies actuales sin habilitar CORS ni
trasladar tokens al almacenamiento del navegador. `npm run preview` usa el mismo
proxy para comprobar el build localmente.

El Dockerfile del frontend usa ahora la raíz del repositorio como contexto para
compilar las fuentes públicas compartidas:

```bash
docker build -f front/Dockerfile -t nexus-front .
docker network create nexus
docker run --rm --name nexus-front --network nexus -p 8080:80 \
  -e BACKEND_UPSTREAM=http://backend:3000 nexus-front
```

El contenedor Express debe estar en esa red con nombre o alias `backend`, escuchando
en el puerto indicado. `BACKEND_UPSTREAM` se aplica al iniciar Nginx, acepta un
origen HTTP/HTTPS sin ruta y no se publica en el bundle. Puede cambiarse por el
origen del backend elegido. El contenedor Vue puede servir la pantalla aunque el
backend aún no esté disponible; las solicitudes entonces fallarán de forma recuperable.
El resolver configurado es el DNS de redes Docker. Para otro entorno adapta el proxy.
El Dockerfile raíz y Compose continúan construyendo sólo Express.

En Vercel o Render Static Site, el fallback SPA por sí solo no integra el login.
Hace falta un proxy/rewrite del mismo origen hacia Express **antes** del fallback,
para `/api` y `/cerrar-sesion`. Las rutas de vistas pertenecen a Vue. El hostname de producción
no se ha definido ni se ha desplegado esta integración. No basta con usar directamente
una URL Render desde Vue: el backend actual no configura CORS y sus cookies son
`SameSite=Lax`. En Vercel permite acceso a archivos fuera de Root Directory `front`
para las fuentes públicas compartidas; conserva el repositorio completo al construir.

## Arquitectura y estándares revisados

Se aplica el [estándar de codificación del repositorio](../../back/docs/architecture/coding-standards/index.md):
cuatro espacios en fuentes/configuración, dos en pruebas, imports desde el módulo
propietario, booleanos con prefijo y sentencias y bloques legibles. El formulario
expresa cambios mediante eventos `update:<prop>`; la página conecta esos eventos
con el composable, sin mutar props ni introducir un store por formulario.

El proveedor visual único está en `app/plugins/vuetify.ts` y se carga al arrancar,
antes de registrar el router. No pertenece al dominio de autenticación.
Si falla la carga asíncrona de una página o proveedor durante el arranque, se
muestra StartupErrorPage con una acción de reintento. Esto no sustituye el manejo
de fallos de API dentro del formulario.

`useLoginForm` aborta al desmontar y descarta respuestas tardías. Su captura de
errores cubre la solicitud HTTP; el almacenamiento opcional y la navegación se
realizan después de confirmar el acceso, sin presentarlos como credenciales
rechazadas. Los mensajes nuevos reutilizados por esas capas viven en
`auth/loginMessages.ts`; LOGIN_ERROR y los códigos de campo conservan la traducción
pública existente. No se incluye el AppError privado de Express en el navegador.

ESLint rechaza imports directos de HTTP, stores, páginas, validadores y VeeValidate
en la presentación; también llamadas directas a fetch/XMLHttpRequest y acceso a
localStorage/sessionStorage, incluidas las formas window/globalThis. La revisión
manual sigue comprobando dependencias indirectas y comportamiento.

## Verificación

`npm run check` valida tipos, lint y pruebas unitarias; `npm run test:e2e` comprueba
la UI en Chromium. La suite del navegador simula respuestas de API y materiales:
no comprueba contraseñas reales, firmas de tokens ni PostgreSQL. Materiales usa sus
componentes Vue reales con respuestas HTTP simuladas. Los contratos persistentes
pertenecen a las pruebas existentes del backend con una base aislada.
