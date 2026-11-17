# Organización del código de la API

Esta colección documenta cómo la API registra rutas, distribuye controladores y
servicios por dominio y accede a PostgreSQL mediante Prisma. Vue está fuera de esta
frontera; sólo se considera consumidor del contrato HTTP y de los tipos compartidos.

Los archivos y dependencias por recurso pertenecen a las referencias técnicas de
[módulos API](../backend-technical-documentation/index.md#módulos). Las decisiones
repetidas se explican en [patrones](../design-and-construction-patterns/index.md),
y los contratos de los núcleos en [reutilización](../reuse-and-refactoring/index.md).

## Capítulos

1. [Repositorio y distribución de fuentes](01-repository-and-source-layout.md).
2. [Entradas HTTP y registro de routers](02-http-entry-points.md).
3. [Dominios y dependencias de la API](03-backend-domains-and-dependencies.md).
4. [Contratos compartidos consumidos por Vue](04-shared-contracts-consumed-by-vue.md).
5. [Contratos entre capas de la API](05-cross-layer-contracts.md).
6. [Prisma: cliente, consultas, transacciones y migraciones](06-prisma-and-persistence.md).
7. [Revisión de cambios de código y diagramas](07-review-checklist.md).

Las flechas de los mapas declaran import, uso, agrupación o configuración; no indican
orden temporal ni implican unidades de despliegue separadas. Las secuencias de una
solicitud pertenecen a [procesos](../../processes/index.md).

El [mapa generado](../code-map.md) conserva el inventario de rutas e imports. Las
figuras curadas se revisan cuando cambian las fuentes que representan.
