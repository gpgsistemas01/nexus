# 11. Brechas conocidas y decisiones pendientes

1. **Proyectos sin CRUD.** `Project` participa en salidas, pero no tiene
   rutas ni servicio de administración. Debe definirse su fuente de datos y responsable.
2. **Catálogos parcialmente administrables.** Estados, roles, departamentos,
   presentaciones, unidades, motivos y estados de surtido se consultan, pero no todos
   tienen mantenimiento desde la aplicación. Debe decidirse cuáles son datos maestros
   administrados y cuáles pertenecen exclusivamente al seed.
3. **Auditoría incompleta.** Algunos hechos registran `User` creador/aprobador, mientras
   otros solo conservan una `Person` participante o marcas de tiempo. La ampliación de
   auditoría está detallada en `docs/data/database-users-and-permissions-analysis.md`.
4. **Criterios de producto.** Faltan propietarios de negocio, metas cuantificables,
   SLA, política de retención y recuperación, clasificación de datos y criterios de
   aceptación acordados con usuarios. Este documento no inventa esos compromisos.
5. **Cobertura.** Persisten servicios sin cobertura CRUD completa; el inventario
   actualizado se mantiene en `docs/testing/service-test-coverage.md`.
