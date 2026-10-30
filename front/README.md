# Nexus · Frontend

Cliente web de Nexus para inventario, compras, salidas y movimientos. Incluye
catálogos, Personas, Usuarios, Clientes y Proveedores según los permisos de la
cuenta. Utiliza Vue 3, TypeScript, Composition API y Vite.

## Inicio rápido

Sigue los pasos en orden para iniciar Vue y la API en tu equipo. Ejecuta todos los
comandos desde la **raíz del repositorio**, la carpeta que contiene `front/` y
`back/`. Conserva ambas carpetas: Vue utiliza módulos públicos de `back/` al compilar.

### 1. Comprobar las herramientas

Necesitas Node.js y npm instalados, PostgreSQL funcionando y una base de desarrollo
creada. Para ingresar también necesitas una cuenta de Nexus habilitada en esa base;
solicítala al responsable del entorno si todavía no tienes una.

```bash
node --version
npm --version
```

Usa Node 24 desde `24.15.0`, Node 22 desde `22.22.2` o Node 26 desde `26.12.1`,
dentro de su rama. Los rangos vigentes están en los manifiestos de
[front](package.json) y [back](../back/package.json).

### 2. Instalar las dependencias

```bash
npm --prefix back ci --include=dev
npm --prefix front ci --include=dev
```

Espera a que cada comando termine correctamente. La raíz no tiene `package.json`;
`--prefix` indica en qué aplicación se ejecuta npm.

### 3. Configurar la conexión y la sesión

Crea **`back/.env`**, junto a `back/package.json`. Si ya tienes ese archivo
configurado, conserva sus valores. Ejemplo mínimo; sustituye la conexión y los
tres secretos por valores propios del entorno local:

```dotenv
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://usuario_local:clave_local@127.0.0.1:5432/nexus_dev"
JWT_SECRET_ACCESS="reemplazar-por-un-secreto-local"
JWT_SECRET_REFRESH="reemplazar-por-otro-secreto-local"
JWT_SECRET_ONE_TIME="reemplazar-por-otro-secreto-independiente"
```

La base, el usuario y la contraseña de PostgreSQL deben existir antes de continuar.
Usa tres secretos distintos. Guarda esta configuración en `back/.env`; las variables
`VITE_*` del frontend son públicas y no admiten estos secretos.

Con la API en el puerto 3000, Vue funciona con su configuración predeterminada.
Para otro puerto, prepara [front/.env.local](docs/development/01-getting-started.md#configurar-frontenvlocal-para-vue)
y ajusta `BACKEND_PROXY_TARGET` al origen real de la API.

### 4. Preparar la base y generar Prisma

Para la primera preparación o si hay migraciones pendientes, comprueba que
`back/.env` apunta a tu **base de desarrollo** y ejecuta:

```bash
npm --prefix back run db:migrate
```

Este comando aplica el esquema y genera el cliente Prisma. Si la base ya está
actualizada y sólo falta regenerar ese cliente, usa `npm --prefix back run db:generate`.
Estos comandos no crean una cuenta de Nexus.

### 5. Iniciar la API en la primera terminal

```bash
npm --prefix back run dev
```

Espera el mensaje **Servidor escuchando en puerto 3000** y deja esa terminal
abierta. Si cambiaste `PORT`, el mensaje mostrará ese otro puerto. Resuelve cualquier
error de arranque antes de continuar.

### 6. Iniciar Vue en una segunda terminal

Abre otra terminal en la **misma raíz del repositorio** y ejecuta:

```bash
npm --prefix front run dev
```

Deja ambas terminales abiertas. Vite muestra la dirección del frontend y usa el
puerto 5173; si está ocupado, informa del conflicto.

### 7. Abrir e ingresar

Abre **http://localhost:5173/inicio-sesion**, escribe las credenciales de tu cuenta
y comprueba que se abre una página autorizada. Para detener el sistema, pulsa
Ctrl+C en cada terminal.

En los siguientes arranques, repite los pasos 5, 6 y 7. Si descargaste cambios de
dependencias o del esquema, prepara primero lo que corresponda en los pasos 2 y 4.
La [guía de inicio](docs/development/01-getting-started.md) amplía la configuración;
el [diagnóstico por síntoma](docs/development/01-getting-started.md#diagnóstico-por-síntoma)
explica los errores de imports, Prisma, puertos y proxy.

## Comprobación y compilación

Desde la raíz:

```bash
npm --prefix front run check
```

Este comando comprueba formato, ESLint, pruebas unitarias y compilación con tipos.
Produce `front/dist/`; no ejecuta pruebas de navegador ni de sistema. Los comandos
individuales están en [Herramientas](docs/development/02-tooling.md#comandos-del-frontend).
El despliegue se prepara con la [guía de compilación y publicación](docs/development/03-build-and-deployment.md).

## Documentación

El [índice de documentación Vue](docs/index.md) organiza los documentos completos.

| Necesidad | Guía |
| --- | --- |
| Instalar, configurar y trabajar en local | [Entorno y flujo de trabajo](docs/development/index.md). |
| Entender el código por primera vez | [Incorporación y recorrido de una edición](docs/architecture/views/development/developer-onboarding.md). |
| Conocer responsabilidades, modelos y patrones | [Arquitectura](docs/architecture/index.md). |
| Consultar convenciones y ejemplos de código | [Estándar Vue/TypeScript](docs/architecture/coding-standards/index.md). |
| Revisar alcance, permisos y operaciones | [Requisitos y casos de uso](docs/requirements/index.md). |
| Ejecutar unitarias, navegador o sistema | [Archivos, credenciales y comandos de pruebas](docs/testing/06-test-files-and-credentials.md). |
| Desplegar con Docker/VPS o hosting estático | [Compilación y despliegue](docs/development/03-build-and-deployment.md). |
| Generar referencias y exportar documentos | [Publicación técnica](docs/governance/02-generation-and-publication.md). |
| Operar las pantallas | [Manual de usuario](docs/user-manual/index.md). |
| Generar manuales con las cuentas del entorno | [Credenciales, capturas y publicación por cuenta](docs/governance/07-manual-accounts-and-files.md). |

Las fuentes documentales se versionan en `front/docs`. Sus herramientas y resultados
permanecen fuera de `public/`, `dist/` y la imagen de producción.
