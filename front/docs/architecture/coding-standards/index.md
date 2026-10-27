# Estándar de codificación Vue y TypeScript

| Versión documental | Estado | Fecha | Responsable |
| --- | --- | --- | --- |
| 1.0 | En revisión | 2026-10-27 | Equipo Nexus |

El estándar regula formato, nombres, dependencias, responsabilidades, datos, interacción, seguridad, pruebas y revisión de `front/`. Los comandos se ejecutan desde esa carpeta. Cada capítulo contiene reglas verificables y sus límites.

## Capítulos

1. [Propósito, alcance y prioridad](01-purpose-scope-and-priority.md).
2. [Formato del archivo y separación visual](02-format-of-the-file.md).
3. [Nombres y ubicación](03-naming.md).
4. [Imports, exports y dependencias](04-imports-exports-and-dependencies.md).
5. [Componentes, rutas y propietario del estado](05-components-routes-and-state.md).
6. [Funciones, flujo y asincronía](06-functions-and-control-of-flow.md).
7. [Objetos, colecciones y payloads](07-objects-collections-and-payloads.md).
8. [Formularios, estilos y accesibilidad](08-forms-styles-and-accessibility.md).
9. [Errores, seguridad y avisos](09-errors-security-and-feedback.md).
10. [Comentarios y documentación](10-comments-and-documentation.md).
11. [Pruebas](11-tests.md).
12. [Lista de revisión](12-review-checklist.md).

## Configuración operativa

Las fuentes son [EditorConfig](../../../.editorconfig), [Prettier](../../../prettier.config.js), [ESLint](../../../eslint.config.js), [TypeScript](../../../tsconfig.app.json) y [Vite](../../../vite.config.ts). El [gobierno documental](../../governance/index.md) regula estas guías; el estándar regula el código.

Las [reglas y recomendaciones](../../governance/04-conventions-and-criteria.md) distinguen contratos obligatorios, formato automatizado y decisiones que admiten juicio técnico.
