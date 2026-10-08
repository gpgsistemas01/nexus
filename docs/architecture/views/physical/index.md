# Vista física

## Contenido

La vista física describe los entornos donde se ejecuta Nexus y sus dependencias de
infraestructura. Distingue la topología vigente documentada, el arranque verificable
en el repositorio y la propuesta de traslado a un VPS.

1. [Contexto, contenedores y despliegue](01-system-runtime-and-deployment.md): límite del
   sistema, distribución entre navegador, aplicación y base de datos, despliegue actual, fases de arranque, alternativa Compose y objetivo VPS.
2. [Separación de cuentas PostgreSQL para migraciones y aplicación](02-postgresql-runtime-and-migration-roles.md):
   aprovisionamiento, privilegios y recuperación operativa de migraciones.

El primer capítulo describe las unidades y conexiones; el segundo detalla el
aprovisionamiento y la recuperación de migraciones. Las identidades de PostgreSQL
no sustituyen los permisos de los actores de Nexus.
