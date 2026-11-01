# 5. Preparar y ejecutar pruebas de sistema

## Alcance y propietarios

`tests/e2e` usa API simulada; `tests/system`, Vue, Express y PostgreSQL reales, sin
interceptar la API ni simular autenticación. Prisma y ExcelJS se ejecutan sólo en Node de
pruebas; no entran en `front/src` ni en el bundle.

| Archivo | Responsabilidad |
| --- | --- |
| [playwright.system.config.ts](../../playwright.system.config.ts) | Rechaza configuración insegura y arranca procesos propios: Express en 3107, Vite en 5175 y un worker Chromium. No reutiliza servidores ya abiertos. |
| [environment.ts](../../tests/system/environment.ts) | Exige `DATABASE_TEST_URL`, nombre con segmento `test` y destino distinto de `DATABASE_URL`; compara host/puerto/base sin depender de usuario, contraseña o query. `DIRECT_TEST_URL`, si existe, debe identificar la misma base de prueba. |
| [setup.ts](../../tests/system/setup.ts) | Crea cuentas, accesos, proveedores y cliente excluido con sufijo único. Genera credenciales sólo de fixture y limpia sus registros al terminar o fallar la preparación. |
| [fixture.ts](../../tests/system/fixture.ts) | Contrato de datos y captura del login de prueba. |
| [application.spec.ts](../../tests/system/application.spec.ts) | Ejecuta el recorrido, consulta la persistencia con Prisma y abre los XLSX descargados con ExcelJS. |

## Preparación desde la raíz

[Archivos, credenciales y ejecución](06-test-files-and-credentials.md) explica la
preparación inicial y los archivos generados. Aquí se detallan variables y condiciones del
entorno.

Instalar las dependencias de ambas aplicaciones y Chromium conforme al
[procedimiento de pruebas](06-test-files-and-credentials.md). Preparar una base PostgreSQL vacía
dedicada, por ejemplo `nexus_vue_test`, con un usuario que pueda aplicar sus migraciones.
No usar la base de desarrollo ni una URL de producción. Este comando no crea
la base ni reinicia el esquema: aplica las migraciones existentes al destino declarado.

Ejemplo PowerShell; sustituir usuario y contraseña de la base aislada:

```powershell
$env:DATABASE_URL = 'postgresql://usuario:clave@127.0.0.1:5432/nexus_dev'
$env:DATABASE_TEST_URL = 'postgresql://usuario:clave@127.0.0.1:5432/nexus_vue_test'
$env:DIRECT_TEST_URL = $env:DATABASE_TEST_URL
npm --prefix back run test:db:migrate
npm --prefix front run test:e2e:system
```

En Bash, también desde la raíz:

```bash
export DATABASE_URL='postgresql://usuario:clave@127.0.0.1:5432/nexus_dev'
export DATABASE_TEST_URL='postgresql://usuario:clave@127.0.0.1:5432/nexus_vue_test'
export DIRECT_TEST_URL="$DATABASE_TEST_URL"
npm --prefix back run test:db:migrate
npm --prefix front run test:e2e:system
```

Sustituya host, puerto, bases y credenciales por los de su entorno.
`DATABASE_URL` identifica el destino habitual que debe quedar excluido; bajo
`NODE_ENV=test` no se consulta como base de aplicación. Los valores de este ejemplo
son conexiones PostgreSQL, no cuentas de Nexus. La configuración fija
`NODE_ENV=test` y genera claves JWT efímeras cuando
no están definidas. Las variables de prueba pertenecen al proceso de ejecución;
no se copian a los `.env` normales ni a `VITE_*`. Al terminar, retirar esas variables
de la terminal o usar otra para el desarrollo habitual.

## Oráculos, limpieza y límites

El caso `CP-VUE-SYS-001-01` captura login, crea un cliente desde Vue y verifica
una sola fila activa con Prisma y una lectura posterior del navegador. Descarga
los reportes de usuarios, clientes y proveedores con búsqueda; ExcelJS comprueba
que el archivo real contiene el representante y excluye otra fixture. Eliminar
la cookie de acceso conserva la de renovación y provoca un refresh real. Cerrar
sesión borra ambas cookies; `/me`, refresh y el acceso protegido vuelven a rechazarse.

El teardown borra sólo clientes, proveedores, auditoría, cuentas, asignaciones y catálogos
creados por la prueba. Elimina `front/build/test-results/system-fixture.json`, que
contiene la contraseña temporal; no completarlo ni distribuirlo. JUnit `system.xml` y
trazas quedan ignorados; las trazas pueden contener datos de sesión. Tras una
interrupción, retirar sólo los IDs propios o desechar la base efímera.

La [CI](../../../.github/workflows/ci.yml) queda configurada para ejecutar este recorrido en Node 24,
con PostgreSQL local aislado, además de conservar las suites unitarias y de navegador
simulado en ambas versiones de Node. Publica el JUnit junto a los otros resultados.
Esto añade evidencia de la unión cliente/servidor; no acredita por sí solo todos
los roles, reportes, cálculos ni rollbacks de inventario. Esas integraciones
permanecen en `back/tests`.
