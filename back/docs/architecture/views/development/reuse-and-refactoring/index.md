# Reutilización y refactorización

Esta colección demuestra qué implementación comparten consumidores concretos, qué
configura cada uno y qué comportamiento permanece local. Las referencias técnicas localizan los consumidores por módulo; aquí se documenta
el contrato de la pieza compartida, sus configuradores y límites.

## Capítulos

1. [Backend: handlers y servicios compartidos](01-backend-handlers-and-services.md).
2. [Navegador: aplicaciones CRUD y requests configurables](02-browser-applications-and-requests.md).
3. [Interfaz: composición y ciclo de vida de tablas](03-interface-and-table-lifecycle.md).
4. [Refactorización y extensión](04-refactoring-and-extension.md).

| Frontera compartida | Implementación y consumidores | Figuras |
| --- | --- | --- |
| HTTP backend | Handlers de compras/salidas y controllers material/consumable; listado tabular y sus controllers. | `DIA-COD-REU-002` |
| Reglas backend | Encabezados y cumplimiento utilizados por salidas de materiales/consumibles y merma. | `DIA-COD-REU-005` |
| Cliente Vue | Servicios por dominio y composables de estado. | Guía propia de Vue. |
| Transporte Vue | `apiClient` y rutas HTTP centralizadas. | Guía propia de Vue. |
| Presentación | Componentes y composables Vue. | Guía propia de Vue. |
| Extracción y mantenimiento | Núcleo común, variación local y revisión de contratos/consumidores. | Criterios del capítulo 4. |

Cada capítulo incluye configuración, comportamiento y límites comprobados en el código.
Las figuras de dependencias muestran la implementación vigente. La refactorización
histórica requiere commits que acrediten un antes/después; el procedimiento de revisión
se rotula como criterio de mantenimiento y no como flujo ejecutado por la aplicación.
