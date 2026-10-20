# 3. Respaldo y restauración de Nexus desde Supabase

## Alcance y resultado

Procedimiento operativo para obtener una copia consistente del esquema `public` de
Nexus, conservarla localmente y restaurarla en **una base PostgreSQL nueva y vacía**,
local o remota. Incluye estructura, datos, índices, restricciones, funciones, triggers,
secuencias y `_prisma_migrations`. Se ejecuta por quien administra la base, fuera de
los formularios de inventario.

Una exportación Excel/CSV sirve para consulta o intercambio. No conserva todos los
objetos necesarios para recuperar Nexus. El traslado por Data Transfer de DBeaver
requiere verificar por separado estructura y dependencias; para recuperación se usa
el respaldo nativo. Una copia puntual tampoco mantiene sincronizada otra base.

Este procedimiento cubre Nexus en `public`. No incluye archivos de Supabase Storage,
configuración del proyecto, claves, secretos de despliegue ni una migración completa
de Auth/Realtime/otros esquemas administrados. Si Nexus usa objetos fuera de `public`,
inventariarlos antes y ampliar el alcance. Para trasladar el proyecto Supabase completo,
seguir el [procedimiento de Supabase CLI][supabase-restore] y sus pasos adicionales.

## Preparar las conexiones y herramientas

1. Registrar proyecto origen, fecha/hora, versión del código y destino de recuperación.
   Consultar `SELECT current_database(), current_user, version();` en cada conexión.
2. En Supabase Dashboard abrir **Connect**. Copiar host, puerto, base y usuario del
   modo **Direct connection**. Si la red sólo tiene IPv4 y no llega al endpoint directo,
   usar **Session pooler**, puerto `5432`, con el usuario exacto mostrado por Supabase.
   Reservar el puerto `6543` para el pool transaccional de la aplicación.
3. En DBeaver crear conexión PostgreSQL `Nexus - origen respaldo`; introducir esos datos
   y la contraseña de la base. No usar `anon` ni `service_role` como contraseña SQL.
   Configurar TLS con verificación del servidor y la CA indicada por el proveedor;
   comprobar conexión y certificado. La conexión del asistente nativo debe usar también
   TLS, no sólo el driver JDBC.
4. Instalar las herramientas PostgreSQL, aunque DBeaver ya pueda consultar tablas.
   En **Edit Connection → Local Client → Browse → Add Home**, seleccionar la carpeta
   de instalación que contiene `bin`, por ejemplo `C:\Program Files\PostgreSQL\17`.
   Verificar que dispone de `pg_dump`, `pg_restore` y `psql`.
5. Comprobar `pg_dump --version` y `pg_restore --version`. Usar preferentemente la misma
   versión mayor del origen; `pg_dump` no puede leer un servidor de versión mayor que
   la suya. El destino debe ser compatible con la versión y extensiones del origen;
   no dar por válida una restauración hacia una versión anterior.

Las cuentas de respaldo deben poder leer todas las tablas incluidas. Una cuenta con
RLS o permisos parciales no demuestra un respaldo completo. No desactivar políticas
para conseguir la copia; solicitar la cuenta operativa prevista. El aprovisionamiento
local de `nexus_migrator`/`nexus_app` se describe en el [capítulo 2][roles].

## Crear el archivo desde DBeaver

1. En el navegador de bases, seleccionar la base origen y **Tools → Backup**.
2. Elegir `public` completo. Desmarcar **Complete backup** para restringir el volcado
   al esquema seleccionado; revisar que el comando incluya `--schema=public` o `-n public`.
3. Configurar **Format: Custom**, salida fuera del repositorio y nombre
   `nexus-public-AAAA-MM-DD-HHMM.backup`. Conservar estructura y datos. Excluir
   propietarios y privilegios; no agregar creación ni eliminación de base.
4. Ejecutar y conservar el log. Aceptar sólo finalización sin errores.

DBeaver invoca herramientas nativas; la configuración equivalente para inspeccionar
el comando es:

```sh
pg_dump --host=HOST_ORIGEN --port=5432 --username=USUARIO_ORIGEN --dbname=BASE_ORIGEN --password --format=custom --schema=public --no-owner --no-acl --verbose --file=nexus-public-AAAA-MM-DD-HHMM.backup
pg_restore --list nexus-public-AAAA-MM-DD-HHMM.backup
```

Los valores en mayúsculas son marcadores, no credenciales. Configurar `sslmode=verify-full`
y `sslrootcert` en un servicio libpq/archivo de conexión para los comandos nativos.
La contraseña se introduce cuando la herramienta la solicita; no incluirla en comandos,
logs, capturas ni archivos versionados. `--password` solicita contraseña, no recibe su valor.

El esquema seleccionado puede depender de extensiones instaladas en otro esquema.
Guardar el inventario del origen:

```sql
SELECT extname, extversion, n.nspname AS schema
FROM pg_extension e JOIN pg_namespace n ON n.oid = e.extnamespace
ORDER BY extname;
```

La migración de búsquedas usa `pg_trgm`. Un dump restringido a `public` puede incluir
índices que usan sus clases de operadores sin incluir `CREATE EXTENSION`. Preparar
la extensión en el **mismo esquema que indica el inventario del origen** antes de
restaurar. Por ejemplo, sólo si el origen la tiene en `public` y el destino no la tiene:

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;
```

`IF NOT EXISTS` no mueve una extensión ya instalada. Si el destino la tiene en
`extensions`, no ejecutar un traslado a ciegas ni omitir los índices fallidos: coordinar
con su administrador una restauración compatible con esas dependencias. Las extensiones
administradas por Supabase pueden tener restricciones de propiedad/esquema. El mismo
criterio aplica a otras dependencias externas. `gen_random_uuid()` está disponible de
forma nativa en las versiones PostgreSQL admitidas por el despliegue actual.

## Conservar el respaldo local

Guardar archivo, log, listado del archivo, versiones y revisión del sistema en una
carpeta con acceso restringido y cifrado. El archivo contiene datos de usuarios y hashes
de contraseñas. Mantener además una copia cifrada fuera del equipo. No subirla a Git.

Calcular una huella para detectar archivos incompletos o alterados, por ejemplo en PowerShell:

```powershell
Get-FileHash -Algorithm SHA256 .\nexus-public-AAAA-MM-DD-HHMM.backup
```

Registrar responsable, destino de la copia y política de retención acordada con la
organización. Repetir la copia antes de una migración y practicar la restauración;
que el archivo exista no demuestra que sea recuperable.

## Restaurar en una base local u otra remota

1. Crear una base vacía dedicada, por ejemplo `nexus_restore_20261016`. En otro Supabase,
   crear un proyecto destino y comprobar que no contiene tablas de Nexus en `public`.
   Mantener la aplicación desconectada del destino durante la recuperación.
2. Preparar extensiones/dependencias y las cuentas del capítulo 2. Crear una conexión
   DBeaver distinta, `Nexus - destino restauración`. Confirmar servidor/base/usuario
   ejecutando la consulta inicial; en remoto usar TLS y conexión directa o de sesión.
3. Preparar la lista de restauración con el cliente nativo:

   ```sh
   pg_restore --list --file=nexus.restore.list nexus-public-AAAA-MM-DD-HHMM.backup
   ```

   Abrir `nexus.restore.list` en un editor de texto. Si el destino ya tiene `public`,
   localizar la entrada **`SCHEMA - public`** y anteponer `;` a esa línea. Conservar
   las entradas de tablas, datos, secuencias, índices, restricciones, funciones y
   triggers. No excluir el esquema completo ni borrar `public` del destino. Guardar
   en UTF-8; `--file` evita depender de la codificación de redirección de PowerShell.
4. Seleccionar el **destino**, **Tools → Restore**, elegir el archivo Custom y el cliente
   nativo compatible. Omitir propietarios y privilegios. En Extra command args agregar
   `--exit-on-error --single-transaction --use-list="RUTA_ABSOLUTA/nexus.restore.list"`.
   No activar **Clean**, eliminación ni creación de base.
5. Ejecutar con la cuenta propietaria de los objetos de Nexus. Detenerse ante errores
   de permisos, extensiones o nombres existentes y corregir el destino antes de repetir.
   La transacción única revierte el intento fallido. No combinarla con restauración paralela.

Comando equivalente, con la conexión TLS configurada según el destino:

```sh
pg_restore --host=HOST_DESTINO --port=5432 --username=USUARIO_DESTINO --dbname=BASE_DESTINO --password --no-owner --no-acl --exit-on-error --single-transaction --use-list=nexus.restore.list --verbose nexus-public-AAAA-MM-DD-HHMM.backup
```

No ejecutar migraciones ni seed para crear las tablas antes de esta restauración completa:
el archivo ya contiene el esquema y `_prisma_migrations`. Después, con el mismo checkout,
consultar `prisma migrate status`; sólo desplegar migraciones adicionales previstas para
la versión que se va a ejecutar. Conservar los privilegios DML de `nexus_app` descritos
en el capítulo 2, ya que se omitieron los ACL del origen.

## Comprobar antes de usar el destino

Consultar en DBeaver el resultado de la restauración y conservar estas verificaciones:

```sql
SELECT migration_name, finished_at, rolled_back_at
FROM public._prisma_migrations ORDER BY started_at;

SELECT 'Material' AS tabla, count(*) FROM public."Material"
UNION ALL SELECT 'SupplierMaterial', count(*) FROM public."SupplierMaterial"
UNION ALL SELECT 'Waste', count(*) FROM public."Waste"
UNION ALL SELECT 'WasteStockEntry', count(*) FROM public."WasteStockEntry"
UNION ALL SELECT 'WasteOperation', count(*) FROM public."WasteOperation"
UNION ALL SELECT 'GoodsReceipt', count(*) FROM public."GoodsReceipt"
UNION ALL SELECT 'GoodsIssue', count(*) FROM public."GoodsIssue";

SELECT table_name, column_name, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND column_default LIKE 'nextval(%';

SELECT tgrelid::regclass AS tabla, tgname, tgenabled
FROM pg_trigger WHERE NOT tgisinternal ORDER BY 1, 2;
```

Comparar recuentos y saldos representativos con el origen **en el momento del respaldo**.
Si el origen siguió recibiendo movimientos, un recuento posterior puede variar: para una
comparación exacta, acordar una pausa de escrituras o comparar con una instantánea del
mismo punto. Verificar también claves foráneas, índices únicos, folios históricos,
`ReferenceNumberCounter`, secuencias, usuarios, permisos y contadores `version`. No reiniciar
secuencias o folios manualmente: el respaldo nativo conserva sus estados.

Arrancar una instancia aislada de Nexus apuntando al destino, comprobar acceso,
inventario, documentos y exportación. Probar una escritura sólo sobre una copia de
ensayo, incluyendo que un reintento recupere su recibo sin duplicar stock. Los recibos
`WasteOperation` se respaldan para conservar esa protección tras recuperar la base.
Sólo después se puede planear un cambio de conexión de producción, con respaldo final
y una ventana de corte que evite escrituras en ambos destinos. Este manual no ejecuta
ni autoriza ese corte.

## Incidencias frecuentes

| Síntoma | Comprobación / acción |
| --- | --- |
| DBeaver consulta, pero Backup falla por cliente ausente | Configurar Local Client y comprobar herramientas nativas. |
| `server version mismatch` | Instalar herramientas de versión compatible con el origen. |
| No conecta al host directo | Revisar IPv6, puerto y reglas de red; usar Session pooler si corresponde. |
| Error TLS en Backup/Restore | Revisar configuración libpq y CA; la configuración JDBC puede ser independiente. |
| `role does not exist` | Restaurar sin owners/ACL y aprovisionar las cuentas propias del destino. |
| `schema "public" already exists` | Omitir sólo la entrada `SCHEMA - public` en la lista de restauración; no borrar el esquema. |
| Una tabla de Nexus ya existe | Usar destino vacío; no activar Clean sobre una base con datos. |
| Falta `gin_trgm_ops` | Preparar `pg_trgm` en el esquema del origen antes de restaurar. |
| Falta una función/extensión/esquema | Revisar dependencias y permisos; no continuar una restauración parcial. |
| Archivo `.sql` en lugar de Custom | Se ejecuta con `psql`, no con `pg_restore`; conservar el formato indicado. |

## Referencias oficiales

Consultadas el 16 de octubre de 2026; los nombres del asistente pueden variar por versión.

- [DBeaver: Backup and restore][dbeaver-backup].
- [DBeaver: Local client configuration][dbeaver-client].
- [Supabase: Connecting to Postgres][supabase-connect].
- [Supabase: Backup and Restore using the CLI][supabase-restore].
- [PostgreSQL: pg_dump][pg-dump] y [pg_restore][pg-restore].

[dbeaver-backup]: https://dbeaver.com/docs/dbeaver/Backup-Restore/
[dbeaver-client]: https://dbeaver.com/docs/dbeaver/Local-Client-Configuration/
[supabase-connect]: https://supabase.com/docs/guides/database/connecting-to-postgres
[supabase-restore]: https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore
[pg-dump]: https://www.postgresql.org/docs/current/app-pgdump.html
[pg-restore]: https://www.postgresql.org/docs/current/app-pgrestore.html
[roles]: 02-postgresql-runtime-and-migration-roles.md
