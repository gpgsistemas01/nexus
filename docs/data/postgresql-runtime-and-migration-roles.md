# Separación de cuentas PostgreSQL para migraciones y aplicación

## ¿Ya está resuelto?

Está resuelto **el enrutamiento de las conexiones**, pero no la creación ni los
privilegios de las cuentas:

- La aplicación obtiene su conexión de `DATABASE_URL`.
- Prisma CLI obtiene su conexión de `DIRECT_URL` al ejecutar migraciones.
- El entrypoint exige `DIRECT_URL`, ejecuta `prisma migrate deploy` y después inicia la
  aplicación, que vuelve a usar `DATABASE_URL`.

Esto permite colocar credenciales distintas en ambas URLs, pero PostgreSQL o el
proveedor administrado todavía debe crear esas cuentas y conceder sus privilegios.
Cambiar solamente el nombre de la variable no cambia permisos. Tampoco debe asumirse
que `DIRECT_URL` significa “cuenta de migraciones”: normalmente “direct” describe una
conexión sin pooler; son sus credenciales las que determinan los privilegios.

## Cuentas recomendadas

| Cuenta | URL | Uso | Privilegios |
| --- | --- | --- | --- |
| `nexus_migrator` | `DIRECT_URL` | `prisma migrate deploy` | Propiedad/control DDL del esquema de Nexus, sin superusuario. |
| `nexus_app` | `DATABASE_URL` | Proceso Node/Prisma | `CONNECT`, `USAGE` del esquema y DML sobre tablas/secuencias; sin DDL. |

No se necesita una cuenta PostgreSQL por cada `User` de Nexus. Todos los usuarios
finales pasan por la autorización de la aplicación y las escrituras llegan a
PostgreSQL mediante `nexus_app`.

## Aprovisionamiento inicial

Los siguientes comandos son una **plantilla para PostgreSQL autoadministrado**. Deben
ejecutarse una sola vez con el propietario actual de la base, sustituyendo nombres de
base, esquema y secretos. No deben incorporarse contraseñas reales al repositorio.

### No debe ser una migración Prisma

Esta plantilla es un paso de **bootstrap de infraestructura** y no debe guardarse como
una migración dentro de `prisma/migrations`:

1. `nexus_migrator` debe existir y poder conectarse **antes** de que Prisma ejecute la
   primera migración; una migración no puede crear de forma segura la misma identidad
   que necesita para arrancar.
2. `CREATE ROLE`, contraseñas, membresías y `GRANT CONNECT` pertenecen al clúster/base,
   no al modelo de datos de la aplicación. Prisma administra tablas, relaciones,
   índices y tipos del esquema.
3. Una migración versionada expondría nombres o secretos operativos y se intentaría
   repetir en desarrollo, pruebas y producción, donde los roles y las capacidades del
   proveedor pueden ser diferentes.
4. La cuenta que normalmente ejecuta migraciones no debe tener `CREATEROLE`; permitirlo
   ampliaría innecesariamente el impacto de una credencial de despliegue comprometida.

Debe ejecutarla un administrador mediante la consola SQL del proveedor, `psql` o una
herramienta de infraestructura como código. Después se almacenan las dos URLs en el
gestor de secretos y recién entonces se ejecuta `prisma migrate deploy` con
`DIRECT_URL`.

El orden correcto para una instalación nueva es:

1. Crear la base y los roles con una identidad administrativa temporal.
2. Configurar propiedad del esquema, permisos actuales y privilegios predeterminados.
3. Guardar `DIRECT_URL` con `nexus_migrator` y `DATABASE_URL` con `nexus_app`.
4. Ejecutar `npm run db:migrate`.
5. Iniciar la aplicación y comprobar que `nexus_app` puede hacer DML pero no DDL.

```sql
-- Conectado a la base nexus como su propietario actual.
CREATE ROLE nexus_migrator
  LOGIN
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION
  PASSWORD '<secret-migrator>';

CREATE ROLE nexus_app
  LOGIN
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION
  PASSWORD '<secret-app>';

GRANT CONNECT ON DATABASE nexus TO nexus_migrator, nexus_app;

-- Evita que cualquier usuario de la base cree objetos en public.
REVOKE CREATE ON SCHEMA public FROM PUBLIC;

-- La cuenta de migración controla el esquema, pero no es superusuario.
ALTER SCHEMA public OWNER TO nexus_migrator;
GRANT USAGE, CREATE ON SCHEMA public TO nexus_migrator;

-- La aplicación puede resolver objetos, pero no crearlos o alterarlos.
GRANT USAGE ON SCHEMA public TO nexus_app;
REVOKE CREATE ON SCHEMA public FROM nexus_app;

-- Permisos para objetos que ya existen.
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO nexus_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO nexus_app;

-- Permisos automáticos para objetos que nexus_migrator cree en migraciones futuras.
ALTER DEFAULT PRIVILEGES FOR ROLE nexus_migrator IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO nexus_app;
ALTER DEFAULT PRIVILEGES FOR ROLE nexus_migrator IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO nexus_app;
```

### Propiedad de objetos existentes

Para ejecutar `ALTER TABLE`, Prisma necesita que `nexus_migrator` sea propietario de
los objetos. Los `GRANT` por sí solos no conceden propiedad. En una instalación nueva,
conviene asignar el esquema a `nexus_migrator` antes de la primera migración, como en
la plantilla anterior; así, los objetos creados por Prisma también le pertenecen.

Si las tablas existentes pertenecen a otra cuenta, el administrador debe transferir
de forma controlada al menos las tablas, secuencias, tipos y demás objetos que Prisma
deba modificar. Antes de hacerlo se pueden listar los propietarios actuales en
`pg_class`, `pg_type` y `pg_proc` y generar las instrucciones `ALTER ... OWNER TO
nexus_migrator` correspondientes.

En una instalación existente no se recomienda ejecutar `REASSIGN OWNED` sin revisar
su alcance: afecta todos los objetos que la cuenta posea en la base actual. Debe
prepararse y respaldarse la base antes de transferir propiedad. En servicios como
Supabase, RDS, Cloud SQL, Neon u otros PostgreSQL administrados, la sintaxis disponible
y el propietario reservado varían; se debe usar el mecanismo de roles del proveedor.

## Variables de entorno

Las URLs deben contener usuarios diferentes:

```env
# Runtime, posiblemente mediante pooler.
DATABASE_URL="postgresql://nexus_app:<secret-app>@pooler.example.com:6543/nexus"

# Migraciones, conexión directa y cuenta con DDL sobre el esquema de Nexus.
DIRECT_URL="postgresql://nexus_migrator:<secret-migrator>@db.example.com:5432/nexus"
```

La imagen actual puede seguir ejecutando migraciones y aplicación en el mismo
contenedor porque cada fase resuelve una variable distinta. Para una separación más
estricta, el pipeline de despliegue puede ejecutar `npm run db:migrate` como un job con
solo `DIRECT_URL`, y arrancar el contenedor de aplicación con:

```env
RUN_MIGRATIONS=false
DATABASE_URL="postgresql://nexus_app:<secret-app>@pooler.example.com:6543/nexus"
```

En ese modo el proceso de aplicación nunca recibe el secreto de migración. El job debe
terminar correctamente antes de desplegar la nueva versión.

## Verificación

Probar primero en staging con ambas cuentas. Como administrador se pueden revisar los
privilegios efectivos:

```sql
SELECT
  has_schema_privilege('nexus_app', 'public', 'USAGE') AS schema_usage,
  has_schema_privilege('nexus_app', 'public', 'CREATE') AS schema_create,
  has_table_privilege('nexus_app', 'public."User"', 'SELECT') AS user_select,
  has_table_privilege('nexus_app', 'public."User"', 'INSERT') AS user_insert;
```

El resultado esperado es `true`, `false`, `true`, `true`. También deben comprobarse
los comportamientos completos:

1. Con `DIRECT_URL`, `npm run db:migrate` puede aplicar una migración pendiente.
2. Con `DATABASE_URL`, la aplicación puede leer y escribir datos.
3. Con la cuenta `nexus_app`, `CREATE TABLE`, `ALTER TABLE` y `DROP TABLE` fallan.
4. Una tabla creada por una migración posterior recibe automáticamente DML para
   `nexus_app`; esto confirma que `ALTER DEFAULT PRIVILEGES` se configuró para el rol
   que realmente crea los objetos.

## Recuperación de una migración fallida por una tabla legada ausente

La migración `20260805232000_merge_duplicate_materials` todavía consolida referencias
históricas de `PurchaseRequisitionDetail`. Por eso, la tabla legada debe existir cuando
esa migración se ejecuta, aunque el módulo de requisiciones ya no forme parte del
esquema Prisma ni de la aplicación. La eliminación está fechada como
`20260827000000_remove_purchase_requisitions`, después de las migraciones
`20260805232000_merge_duplicate_materials`,
`20260810183000_index_material_operational_relations`,
`20260811000000_add_foreign_key_indexes` y
`20260820000000_preserve_decimal_precision`, que todavía utilizan esas tablas.

Si Prisma reporta `P3009` para esa migración porque `PurchaseRequisitionDetail` no
existe, la base objetivo recibió una eliminación anticipada desde otra rama. La
migración `20260805231500_restore_purchase_requisitions_for_pending_migrations`,
ubicada inmediatamente antes del intento fallido, vuelve a crear de forma idempotente
la estructura requerida. No recupera registros eliminados: esos datos sólo pueden
volver desde un respaldo. Tampoco elimina por sí sola el registro fallido de
`_prisma_migrations`.

1. Respaldar la base y marcar exclusivamente el intento fallido como revertido para
   desbloquear la cadena:

   ```bash
   npx prisma migrate resolve --rolled-back 20260805232000_merge_duplicate_materials
   ```

2. Aplicar nuevamente la cadena versionada. Prisma ejecutará primero la restauración
   `20260805231500`, reintentará `20260805232000` con las tablas disponibles y sólo las
   eliminará al llegar a `20260827000000`:

   ```bash
   npm run db:migrate
   ```

`migrate resolve --applied` no corresponde en este caso: omitiría la consolidación de
materiales. Si se necesitan los registros de requisiciones que fueron borrados, deben
restaurarse desde un respaldo antes del segundo paso; la migración correctiva sólo
recupera la estructura necesaria para completar la cadena.

## Recuperación de los índices de relaciones operativas

La migración `20260810183000_index_material_operational_relations` puede encontrarse
con dos estados válidos producidos por despliegues de ramas anteriores: índices que ya
existen o la tabla legada `PurchaseRequisitionDetail` ya eliminada. Por eso, todos sus
índices se crean de forma idempotente y el índice de requisiciones se omite únicamente
cuando esa tabla ya no existe. Las tablas operativas vigentes no son opcionales: su
ausencia continúa provocando un error para no ocultar una base incompleta.

Si Prisma reporta `P3009` para esta migración, primero se debe respaldar la base y
consultar `logs` en `_prisma_migrations` para confirmar la causa del intento fallido.
Con `DIRECT_URL` apuntando a esa misma base, se marca exclusivamente ese intento como
revertido:

```bash
npx prisma migrate resolve --rolled-back 20260810183000_index_material_operational_relations
```

Después se reintenta la cadena versionada:

```bash
npm run db:migrate
```

No se debe usar `migrate resolve --applied`: hacerlo podría registrar la migración sin
haber creado todos los índices operativos. Si el nuevo intento informa que falta una
tabla distinta de `PurchaseRequisitionDetail`, se debe corregir ese desvío del esquema
en vez de omitir el objeto.

## Recuperación de la migración de facturas de entradas de compra

La migración `20260806000000_unique_goods_receipt_invoice_per_supplier` normaliza las
facturas con el mismo criterio de la aplicación y crea la unicidad por proveedor. Al
normalizar datos legados, valores que antes sólo se diferenciaban por mayúsculas,
minúsculas o espacios pueden convertirse en el mismo valor. La migración conserva
todas las entradas: mantiene la primera factura y marca cada conflicto posterior con
el sufijo determinista `[DUPLICADO:<uuid>]` para que pueda revisarse manualmente. No
elimina entradas, detalles ni movimientos de inventario.

Si un despliegue anterior dejó esta migración en estado fallido (`P3009`), primero se
debe respaldar la base. Después, con `DIRECT_URL` apuntando a la misma base y usando la
cuenta de migraciones, se revierte **sólo el registro fallido**:

```bash
npx prisma migrate resolve --rolled-back 20260806000000_unique_goods_receipt_invoice_per_supplier
```

A continuación se vuelve a desplegar la cadena. El `UPDATE` de normalización es
idempotente, la conciliación preserva los registros en conflicto y el índice único se
crea cuando ya no quedan claves duplicadas:

```bash
npm run db:migrate
```

No se debe usar `migrate resolve --applied`: el índice no fue creado cuando falló el
intento original y marcarlo como aplicado dejaría la base sin la garantía declarada
en el esquema Prisma. Tras el despliegue, las facturas que incluyan el marcador
`[DUPLICADO:` deben compararse con sus documentos fuente y corregirse mediante el
flujo normal del CRUD de entradas de compra.

## ¿Es obligatorio hacerlo ahora?

No requiere cambios al esquema Prisma y no bloquea el funcionamiento actual. Es una
medida de defensa en profundidad que limita el impacto de una inyección SQL, una
dependencia comprometida o credenciales de runtime filtradas. Se recomienda aplicarla
antes de producción o durante la siguiente ventana de infraestructura.

Si el proveedor solo entrega una cuenta, el sistema puede continuar temporalmente con
la configuración actual. En ese caso se debe registrar la excepción, restringir la
red, rotar el secreto y evitar exponer `DIRECT_URL` fuera del proceso de despliegue.
