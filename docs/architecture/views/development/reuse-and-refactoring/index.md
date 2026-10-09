# Reutilización y refactorización

Esta colección demuestra qué implementación comparten consumidores concretos, qué
configura cada uno y qué comportamiento permanece local. El índice separa las fronteras
que antes se mezclaban en «CRUD e interfaz».

## Capítulos

1. [Backend: handlers y servicios compartidos](01-backend-handlers-and-services.md).
2. [Navegador: aplicaciones CRUD y requests configurables](02-browser-applications-and-requests.md).
3. [Interfaz: composición y ciclo de vida de tablas](03-interface-and-table-lifecycle.md).
4. [Refactorización y extensión](04-refactoring-and-extension.md).

| Frontera compartida | Implementación y consumidores | Figuras |
| --- | --- | --- |
| HTTP backend | Handlers de compras/salidas y controllers material/consumable; listado tabular y sus controllers. | `DIA-COD-REU-002` |
| Reglas backend | Encabezados y cumplimiento utilizados por salidas de materiales/consumibles y merma. | `DIA-COD-REU-005` |
| Application del navegador | CRUD, composición de salidas y reportes; configuradores por recurso. | `DIA-COD-REU-001` |
| Requests del navegador | Factories de compras/salidas configuradas con URL API y reporte para material/consumable. | `DIA-COD-REU-003` |
| Presentación | EJS, formularios, modales y tablas con contratos distintos. | `DIA-COD-REU-004`, `DIA-PAT-UI-001` |
| Extracción y mantenimiento | Núcleo común, variación local y revisión de contratos/consumidores. | `DIA-PAT-REF-001..002` |

Cada capítulo incluye configuración, comportamiento y límites comprobados en el código.
Las figuras de dependencias muestran la implementación vigente. La refactorización
histórica requiere commits que acrediten un antes/después; el procedimiento de revisión
se rotula como criterio de mantenimiento y no como flujo ejecutado por la aplicación.
