# Estándar de codificación Vue y TypeScript

| Versión documental | Estado | Fecha | Responsable |
| --- | --- | --- | --- |
| 1.1 | En revisión | 2026-10-29 | Equipo Nexus |

Este estándar regula la escritura y organización del código de `front/`.
Las reglas de interfaz, seguridad, pruebas y documentación tienen fuentes propias
en el [mapa de estándares](../../governance/09-standards-and-ownership.md).

## Capítulos

1. [Propósito, alcance y prioridad](01-purpose-scope-and-priority.md).
2. [Formato del archivo y separación visual](02-format-of-the-file.md).
3. [Nombres y ubicación](03-naming.md).
4. [Imports, exports y dependencias](04-imports-exports-and-dependencies.md).
5. [Componentes, rutas y propietario del estado](05-components-routes-and-state.md).
6. [Funciones, flujo y asincronía](06-functions-and-control-of-flow.md).
7. [Objetos, colecciones y payloads](07-objects-collections-and-payloads.md).
8. [Errores y confirmación de resultados](08-errors-and-feedback.md).
9. [Comentarios del código](09-code-comments.md).

Los ejemplos de cada capítulo enlazan su fuente y destacan la regla aplicada.
Las rutas de importación se interpretan desde el archivo de código indicado.

## Configuración operativa

[EditorConfig](../../../.editorconfig), [Prettier](../../../prettier.config.js),
[ESLint](../../../eslint.config.js), [TypeScript](../../../tsconfig.app.json) y
[Vite](../../../vite.config.ts) concretan las convenciones automatizadas.
La [guía de herramientas](../../development/02-tooling.md) reúne los comandos;
la [revisión de cambios](../../development/04-change-review.md), los controles de entrega.
