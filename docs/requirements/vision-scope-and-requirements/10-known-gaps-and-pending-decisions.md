# 10. Brechas conocidas y decisiones pendientes

1. **Proyectos sin CRUD.** `Project` participa en salidas, pero no tiene
   rutas ni servicio de administración. Debe definirse su fuente de datos y responsable.
2. **Brecha de administración de catálogos resuelta.** Áreas, roles,
   presentaciones, unidades de medida, motivos de ajuste y estados de cumplimiento
   permiten consulta, alta, edición y cambio de estado desde la administración
   compartida, protegida por `catalogs:manage`. El alcance está definido en
   [la SRS de catálogos](../requirements-specification/04-unified-catalog-by-scope/02-catalogs-operational-and-commercial.md)
   (`RF-CAT-019` a `RF-CAT-024`); la lista de recursos administrables permanece
   restringida en `src/constants/catalogs.js`. Los demás estados técnicos no se
   consideran catálogos administrables dentro del alcance vigente.
3. **Auditoría incompleta.** Algunos hechos registran `User` creador/aprobador, mientras
   otros solo conservan una `Person` participante o marcas de tiempo. La ampliación de
   auditoría está detallada en `docs/architecture/views/logical/02-identity-access-and-audit.md`.
4. **Criterios de producto.** Faltan propietarios de negocio, metas cuantificables,
   SLA, política de retención y recuperación, clasificación de datos y criterios de
   aceptación acordados con usuarios. Este documento no inventa esos compromisos.
5. **Cobertura.** Persisten servicios sin cobertura CRUD completa; el inventario
   actualizado se mantiene en `docs/testing/test-plan.md`.
