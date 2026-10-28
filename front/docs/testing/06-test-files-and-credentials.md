# 6. Archivos, credenciales y ejecución de pruebas

## Elegir la preparación necesaria

Esta guía permite ejecutar las pruebas existentes del frontend. Los comandos se
lanzan desde **la raíz del repositorio**, salvo que un bloque indique otra carpeta.
Para diseñar o modificar casos, consulte el [plan](01-test-plan.md), los
[diseños](02-test-design.md) y las [fichas](03-test-cases.md).

| Tipo | Qué prepara la persona que ejecuta | De dónde salen los usuarios y datos |
| --- | --- | --- |
| Unitarias, `test:unit` | Dependencias de `front/`. Sin PostgreSQL ni Chromium. | Fixtures y dobles definidos en las pruebas. No necesita usuario de Nexus. |
| Navegador con API simulada, `test:e2e` | Dependencias frontend y Chromium. Vite puede iniciarse desde la configuración. | Los casos simulan sesión, respuestas y datos. Los nombres y contraseñas de ejemplo no son cuentas para ingresar al sistema real. |
| Sistema, `test:e2e:system` | Dependencias de ambas aplicaciones, Chromium, base PostgreSQL aislada y variables de conexión. | El setup crea cuentas temporales, genera la contraseña y prepara registros en esa base. El caso inicia sesión con esa fixture y comprueba datos persistidos. |

`npm --prefix front run check` ejecuta formato, lint, unitarias y build con tipos.
No incluye Playwright ni aplica migraciones. Las integraciones del backend son
otra suite; `test:e2e` del frontend no ejecuta `back/tests`.

## 1. Instalar las herramientas

Compruebe la versión de Node según los manifiestos de ambas aplicaciones y conserve
el repositorio completo. Los alias públicos y las pruebas de sistema utilizan
archivos de `back/`. Desde la raíz:

```bash
node --version
npm --version
npm --prefix front ci --include=dev
```

Para navegador o sistema, instale Chromium una vez:

```bash
cd front
npx playwright install chromium
cd ..
```

En Linux, `npx playwright install --with-deps chromium` instala también sus
dependencias del sistema cuando se dispone de permisos para ello. Si ya tiene un
Chromium adecuado, puede indicar su ejecutable mediante
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Este valor es una ruta, no una credencial.

## 2. Ejecutar sin cuentas ni base de datos

Desde la raíz:

```bash
npm --prefix front run test:unit
npm --prefix front run test:e2e
```

No cree un archivo de credenciales para estos dos comandos. Las fixtures están en
`front/tests/fixtures` y en los archivos `*Fixtures.ts` de `front/tests/e2e`. Los
casos simulan los contratos de la API y los estados válidos o rechazados del login.
Una contraseña escrita en esos casos sólo es un dato del escenario simulado.

Para un recorrido concreto:

```bash
npm --prefix front run test:unit -- tests/unit/system/systemEnvironmentTest.ts
npm --prefix front run test:e2e -- tests/e2e/login.spec.ts
```

El primer ejemplo prueba las reglas de preparación de sistema con URLs ficticias;
no conecta a PostgreSQL. El segundo abre Chromium con autenticación simulada.
Los filtros de Vitest y Playwright seleccionan pruebas; no crean usuarios ni datos
fuera de lo que declare cada caso.

## 3. Qué significa cada archivo

Las rutas de la tabla son relativas a `front/`.

| Archivo | Propósito y preparación |
| --- | --- |
| [vitest.config.ts](../../vitest.config.ts) | Configuración versionada de unitarias: jsdom, archivos `*Test.ts` y setup común. No se copia a un archivo local. |
| [tests/setup.ts](../../tests/setup.ts) | Limpieza de montajes y preparación del Storage simulado. Lo ejecuta Vitest; no contiene credenciales. |
| [playwright.config.ts](../../playwright.config.ts) | Navegador con API simulada. Usa Vite en 5173 y puede reutilizar esta copia local fuera de CI. |
| [playwright.system.config.ts](../../playwright.system.config.ts) | Sistema real: valida el destino de prueba, prepara JWT de prueba cuando faltan y arranca Express en 3107 y Vite en 5175. |
| `.env.local` | Configuración de Vite para desarrollo. No sustituye la configuración de PostgreSQL de las pruebas de sistema. |
| `../back/.env` | Configuración habitual de Express. No coloque la base de prueba en `DATABASE_URL` para hacer funcionar un caso. Las pruebas seleccionan `DATABASE_TEST_URL` con `NODE_ENV=test`. |
| `manual.accounts.local.json` / `.env.manual.local` | Pertenecen a las capturas de manuales por cuentas existentes. Las pruebas unitarias, de navegador y de sistema no leen esos archivos. |

Las pruebas de sistema leen las variables del proceso. No requieren un archivo
JSON de cuentas ni tienen un archivo local de credenciales que deba rellenarse.
`npm run test:e2e:system` no carga automáticamente un archivo `.env.test.local`.
Use las variables de terminal del siguiente procedimiento o las de su CI.

## 4. Preparar PostgreSQL para sistema

La persona que administra el PostgreSQL de pruebas debe proporcionar:

1. Un servidor accesible y una base vacía dedicada, por ejemplo `nexus_vue_test`.
   El nombre debe contener el segmento `test`, separado por guiones o guiones bajos.
2. Un usuario de PostgreSQL y su contraseña con permisos para aplicar migraciones
   y crear, consultar, actualizar y eliminar los registros de prueba.
3. Host, puerto y nombre exactos de la base. Deben ser diferentes del destino
   habitual de desarrollo y de cualquier base de producción.

Puede crear esa base y usuario con las herramientas de administración de PostgreSQL
de su entorno. El comando de migraciones aplica el esquema, pero no crea el servidor,
la base ni la cuenta PostgreSQL. La herramienta de pruebas tampoco entrega su clave.
Si todavía no dispone de ese entorno, puede ejecutar unitarias y navegador simulado.

### Definir las variables de conexión

La [preparación de sistema](05-system-tests.md#preparación-desde-la-raíz) contiene
los bloques completos para PowerShell y Bash. Sustituya los valores de demostración
por las conexiones proporcionadas para su entorno. Cada asignación pertenece a la
terminal donde se ejecutará el comando, no a un formulario de Nexus.

| Variable | Significado |
| --- | --- |
| `DATABASE_URL` | Referencia de la base habitual: se compara para impedir que sistema utilice el mismo destino. No se consulta como base de aplicación bajo `NODE_ENV=test`. Indique el destino real que debe quedar excluido. |
| `DATABASE_TEST_URL` | Conexión al PostgreSQL aislado donde las pruebas crearán y borrarán sus fixtures. Es obligatoria para sistema. |
| `DIRECT_TEST_URL` | Conexión directa opcional para aplicar migraciones. Si se define, debe identificar la misma base de prueba. Puede coincidir con `DATABASE_TEST_URL` en PostgreSQL local sin pooler. |

Una URL PostgreSQL tiene esta forma:

```text
postgresql://usuario:contraseña@host:puerto/nombre_de_base
```

Esas credenciales son de **PostgreSQL**, no del login de Nexus. Si contienen
caracteres reservados de una URL, utilice su codificación porcentual. Host, puerto
y base determinan el destino: cambiar el usuario o agregar parámetros no convierte
la base habitual en una base aislada. No copie estas URLs a variables `VITE_*`.

Use una terminal dedicada para estas variables. Un cambio realizado en otra
terminal no modifica el proceso que ya está abierto. Los secretos JWT no requieren
valores manuales: la configuración de sistema genera valores efímeros cuando no
están definidos en el proceso. No reutilice secretos de producción.

### Aplicar el esquema y ejecutar

Instale el backend desde la raíz:

```bash
npm --prefix back ci --include=dev
```

Después de definir las variables en esa misma terminal y revisar sus destinos,
ejecute desde la raíz:

```bash
npm --prefix back run test:db:migrate
npm --prefix front run test:e2e:system
```

El primer comando aplica migraciones y genera Prisma. No reinicia la base.
El segundo valida el destino de sistema, arranca sus servicios y ejecuta la suite.
Los puertos 3107 y 5175 deben estar libres; no hace falta abrir Vue o Express de
desarrollo en otras terminales para ese recorrido. Los criterios de aislamiento y
la limpieza están en [Preparación de sistema](05-system-tests.md).

Al terminar, cierre la terminal dedicada. Si la conserva abierta, retire las
variables de prueba antes de usarla para otras tareas. La CI declara su propio
entorno para estos comandos; no necesita un archivo de credenciales de manuales.

## 5. Cómo se generan las credenciales de Nexus

En sistema, [tests/system/setup.ts](../../tests/system/setup.ts) genera un sufijo
único, un nombre de usuario y una contraseña aleatoria de fixture. Crea en la base
aislada una cuenta con acceso de Administrador del sistema en Sistemas y otra
cuenta de contraste para los reportes. También prepara proveedores y un cliente
que debe quedar fuera de los resultados filtrados.

El setup guarda temporalmente esos datos en
`build/test-results/system-fixture.json`. El caso los lee para ingresar desde Vue;
no necesita crear cuentas manualmente ni usar las credenciales de un empleado.
Ese JSON contiene la contraseña de prueba en claro: lo escribe y elimina la
automatización, está ignorado y no es una plantilla que deba rellenarse o distribuirse.

El caso puede escribir datos a través de la aplicación; no es un recorrido de
capturas sin escrituras. El teardown elimina las filas propias y el JSON temporal.
Las trazas de fallo pueden contener los datos de esa sesión de prueba; se mantienen
como evidencia local o de CI, no como imágenes del manual.

## 6. Resultados, limpieza y recuperación

| Archivo o carpeta bajo `front/` | Significado |
| --- | --- |
| `build/test-results/browser.xml` | JUnit del navegador con API simulada. Lo genera `test:e2e`. |
| `build/test-results/system.xml` | JUnit del recorrido de sistema. Lo genera `test:e2e:system`. |
| `build/test-results/system-fixture.json` | Intercambio temporal de fixtures del sistema. Debe desaparecer después de su limpieza normal. |
| `test-results/` | Artefactos de Playwright, incluidas trazas retenidas al fallar. No es código fuente. |
| `../back/generated/prisma/` | Cliente generado por la preparación de migraciones. No se rellena ni edita manualmente. |

Las unitarias muestran su resultado en terminal; la CI puede añadir un reporte
JUnit mediante sus opciones de ejecución. No todos los comandos generan todos
los archivos de la tabla. Los archivos de `build/`, `test-results/`, Prisma y las
variables locales están ignorados y fuera de la imagen final del frontend.

| Situación | Comprobación y siguiente paso |
| --- | --- |
| Falta `DATABASE_TEST_URL` aunque escribió una URL en un archivo. | Definir las variables en la misma terminal del comando, según PowerShell o Bash. Crear un archivo no las carga en Playwright. |
| Se rechaza el aislamiento. | Comprobar nombre, host, puerto y base; no cambiar sólo el usuario o los parámetros para superar la validación. |
| PostgreSQL rechaza la conexión. | Revisar servicio, datos de conexión y permisos PostgreSQL. Cambiar la contraseña del usuario Nexus no resuelve ese error. |
| Falta Chromium. | Instalar el navegador desde `front/` o configurar el ejecutable ya instalado. |
| Puerto ocupado en sistema. | Detener el proceso ajeno; la suite no reutiliza servidores en 3107/5175. |
| La fixture no pudo crearse. | Revisar migraciones y preparación; no rellenar manualmente `system-fixture.json`. |
| La ejecución se interrumpió antes del teardown. | Revisar los IDs de sus fixtures y limpiar sólo sus datos, o desechar la base efímera exclusiva de esa corrida. |

Conserve comando, revisión, resultado y límites de la ejecución como evidencia.
La [guía de sistema](05-system-tests.md) describe los oráculos concretos y la
limpieza; una comprobación documental no demuestra una ejecución real contra PostgreSQL.
