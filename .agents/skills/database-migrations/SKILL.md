---
name: database-migrations
description: Diseña o revisa cambios de esquema, datos y migraciones Prisma en Nexus.
---

# Migraciones de base de datos

1. Revisa `back/prisma/schema.prisma`, el historial de migraciones y las guías de desarrollo y persistencia enlazadas desde `back/docs/README.md`.
2. Diseña una migración incremental. Evalúa datos históricos, restricciones, índices, bloqueos, roles, transacciones y compatibilidad entre versiones de la aplicación.
3. Ensaya sobre una base aislada con datos representativos. Verifica la integridad tras migrar y define recuperación o restauración según el impacto.
4. Registra comandos, resultados, riesgos y documentación afectada. Aplica las reglas de autorización de `AGENTS.md` para cualquier acceso a producción.
