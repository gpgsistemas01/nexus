# Ejecución y despliegue de la API

## Contenido

Esta vista describe el proceso API, sus conexiones a PostgreSQL, el ciclo de vida y
las topologías de despliegue documentadas. El cliente Vue aparece como consumidor;
su construcción y alojamiento se mantienen en la documentación del frontend.

1. [Ejecución y despliegue de la API](01-system-runtime-and-deployment.md): frontera HTTP,
   proceso Node, conexión a PostgreSQL, despliegue, arranque y objetivo VPS.
2. [Separación de cuentas PostgreSQL para migraciones y aplicación](02-postgresql-runtime-and-migration-roles.md):
   aprovisionamiento, privilegios y recuperación operativa de migraciones.

3. [Respaldo y restauración de Nexus desde Supabase](03-supabase-backup-and-restore.md):
   DBeaver, copia local, restauración PostgreSQL local/remota y comprobación de recuperación.

El primer capítulo describe el proceso que atiende las rutas; el segundo detalla el
aprovisionamiento y la recuperación de migraciones. Las identidades PostgreSQL no
sustituyen las reglas de autenticación y autorización de la API.
