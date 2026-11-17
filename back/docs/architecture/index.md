# Arquitectura del backend

## Datos generales del documento

| Versión documental | Versión del sistema | Estado | Fecha | Responsable |
| --- | --- | --- | --- | --- |
| 1.14 | 1.0.0 | En revisión | 2026-11-17 | Equipo Nexus |

La API es un monolito modular por dominio. Express recibe las solicitudes;
los controladores delegan en servicios que aplican las reglas de negocio y coordinan
transacciones. Los repositories acceden a PostgreSQL mediante el cliente Prisma compartido.

| Pregunta | Documento |
| --- | --- |
| ¿Qué capas y módulos colaboran? | [Vista lógica](views/logical/index.md) |
| ¿Cómo se procesa una solicitud y dónde se confirma la transacción? | [Procesos](views/processes/index.md) |
| ¿Cómo se organizan los archivos y las dependencias? | [Vista de desarrollo](views/development/index.md) |
| ¿Qué procesos se ejecutan y cómo se conectan con PostgreSQL? | [Vista física](views/physical/index.md) |
| ¿Cómo se relacionan los datos? | [Modelo persistente](views/logical/data-and-persistence/index.md) |
| ¿Qué expone el servidor por HTTP? | [OpenAPI](openapi/index.md) |
| ¿Qué convenciones sigue el código? | [Estándares de código](coding-standards/index.md) |

La composición de pantallas y la navegación se describen en la
[arquitectura Vue](../../../front/docs/architecture/index.md).
Los comandos y la preparación del entorno están en [Desarrollo backend](../development/index.md).
