# Desarrollo y verificación del frontend

Esta colección permite preparar una copia local y conocer qué comprueban las
herramientas. Se dirige a desarrollo y revisión técnica. Los pasos de inicio y
las decisiones de pruebas tienen propietarios distintos para que una explicación
de pruebas no sustituya un procedimiento ejecutable.

## Capítulos

1. [Preparar e iniciar el proyecto Vue](01-getting-started.md).
2. [Herramientas del frontend](02-tooling.md).
3. [Estándar de codificación Vue y TypeScript](03-coding-standards.md).
4. [Compilación y despliegue](04-build-and-deployment.md).

## Contratos de estas guías

El inicio declara requisitos, directorios, variables locales, comandos y resultados
esperados; no ejecuta migraciones ni configura cuentas al leerlo. El
[diseño y las fichas](../testing/index.md) aplican el [plan local](../testing/05-test-plan.md)
para separar diseño, caso y resultado. Las fuentes ejecutables permanecen en
[tests](../../tests), los resultados de ejecución en CI o en la revisión del cambio.
Los manifiestos y configuraciones conservan versiones y comandos reales.

La [entrada documental](../index.md) gobierna mantenimiento, propiedad y aceptación;
[Arquitectura](../architecture/index.md) y [Módulos](../modules/index.md)
explican la solución que se prepara y comprueba. La documentación permanece en Git,
fuera de `public`, `dist` y el contenedor de producción.
