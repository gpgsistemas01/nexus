# 4. Preparar y ejecutar pruebas de sistema

## Alcance y propietarios

`tests/e2e` conserva recorridos rápidos con API simulada. `tests/system` añade
un representante contra Vue, los routers/middleware reales de Express y PostgreSQL.
No intercepta la API ni sustituye la autenticación. Prisma y ExcelJS sólo se importan
en el proceso Node de pruebas; no forman parte de `front/src` ni del bundle público.
Las dependencias siguen en cada aplicación y no se agregan paquetes al cliente.

| Archivo | Responsabilidad |
| --- | --- |
| [playwright.system.config.ts](../../playwright.system.config.ts) | Rechaza configuración insegura y arranca procesos propios: Express en 3107, Vite en 5175 y un worker Chromium. No reutiliza servidores ya abiertos. |
| [environment.ts](../../tests/system/environment.ts) | Exige `DATABASE_TEST_URL`, nombre con segmento `test` y destino distinto de `DATABASE_URL`; compara host/puerto/base sin depender de usuario, contraseña o query. `DIRECT_TEST_URL`, si existe, debe identificar la misma base de prueba. |
| [setup.ts](../../tests/system/setup.ts) | Crea cuentas, accesos, proveedores y cliente excluido con sufijo único. Genera credenciales sólo de fixture y limpia sus registros al terminar o fallar la preparación. |
| [fixture.ts](../../tests/system/fixture.ts) | Contrato de datos y captura del login de prueba. |
| [application.spec.ts](../../tests/system/application.spec.ts) | Ejecuta el recorrido, consulta la persistencia con Prisma y abre los XLSX descargados con ExcelJS. No crea un servidor alternativo sin autorización. |

## Preparación desde la raíz

Instalar las dependencias de ambas aplicaciones y Chromium conforme al
[README](../../README.md#pruebas-de-navegador). Preparar una base PostgreSQL vacía
dedicada, por ejemplo `nexus_vue_test`, con un usuario que pueda aplicar sus migraciones.
No usar la base de desarrollo ni una URL de producción. Este comando no crea
la base ni reinicia el esquema: aplica las migraciones existentes al destino declarado.

Ejemplo PowerShell; sustituir usuario y contraseña de la base aislada:

```powershell
$env:DATABASE_URL = 'postgresql://usuario:clave@127.0.0.1:5432/nexus_unused'
$env:DATABASE_TEST_URL = 'postgresql://usuario:clave@127.0.0.1:5432/nexus_vue_test'
$env:DIRECT_TEST_URL = $env:DATABASE_TEST_URL
npm --prefix back run test:db:migrate
npm --prefix front run test:e2e:system
```

En Bash se declaran las mismas variables con `export`. `nexus_unused` representa
un destino diferente que no se consulta. Los valores de este ejemplo no son cuentas
de Nexus. La configuración fija `NODE_ENV=test` y genera claves JWT efímeras cuando
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

El teardown borra clientes, proveedores, auditoría y cuentas de esas fixtures,
sus asignaciones y los catálogos de acceso que haya creado. No borra todos los datos
de la base. El manifiesto temporal `front/build/test-results/system-fixture.json`
se elimina; el JUnit `system.xml` y las trazas de fallo permanecen ignorados por Git.
Ante una interrupción forzada puede quedar una fixture: retirar únicamente sus IDs
o desechar la base efímera preparada para esa corrida.

La [CI](../../../.github/workflows/ci.yml) queda configurada para ejecutar este recorrido en Node 24,
con PostgreSQL local aislado, además de conservar las suites unitarias y de navegador
simulado en ambas versiones de Node. Publica el JUnit junto a los otros resultados.
Esto añade evidencia de la unión cliente/servidor; no acredita por sí solo todos
los roles, reportes, cálculos ni rollbacks de inventario. Esas integraciones
permanecen en `back/tests`.
