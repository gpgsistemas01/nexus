# Arquitectura de Nexus

## Datos generales del documento

| Versión documental | Versión del sistema | Estado | Fecha | Responsable |
| --- | --- | --- | --- | --- |
| 1.13 | 1.0.0 | En revisión | 2026-11-16 | Equipo Nexus |

Nexus se organiza como un monolito modular por dominio y capas. La API HTTP, la
interfaz Vue y PostgreSQL son partes del mismo sistema; los componentes y contratos
describen sus límites.

## Encuentra una respuesta

| Pregunta | Fuente | Qué muestra |
| --- | --- | --- |
| ¿Cómo se despliega y qué procesos se comunican? | [Vista física](views/physical/index.md) | Contexto, runtime, contenedores, configuración y despliegue. |
| ¿Qué responsabilidades tienen los módulos y dónde comparten código? | [Vista lógica](views/logical/index.md) | Componentes, dominios, persistencia e identidad. |
| ¿Cómo colaboran navegador, API y base en una operación? | [Procesos](views/processes/index.md) | Secuencias, validaciones, transacciones y resultados técnicos. |
| ¿Qué pantallas y objetivos recorre una persona? | [Escenarios](views/scenarios/index.md) | Navegación y relación entre vistas y capacidades. |
| ¿Qué rutas, permisos y datos expone HTTP? | [Contrato OpenAPI](openapi/index.md) | Endpoints, esquemas, respuestas y códigos de error. |
| ¿Qué módulos y archivos implementan cada responsabilidad? | [Vista de desarrollo](views/development/index.md) | Estructura, patrones, referencias de módulos e inventario de código. |
| ¿Cómo se relaciona el modelo persistente? | [Datos y persistencia](views/logical/data-and-persistence/index.md) | Esquema Prisma, relaciones y diccionario de datos. |
| ¿Qué reglas de implementación comparten los paquetes? | [Estándares de código](coding-standards/index.md) | Convenciones del backend y límites de integración con Vue. |

## Relación con requisitos y pruebas

Los [requisitos](../requirements/index.md) describen los resultados que debe ofrecer
Nexus; esta arquitectura describe su realización técnica. Los identificadores `CU-*`
conectan casos de uso con [componentes](views/logical/01-components-and-reuse.md),
secuencias y [pruebas](../testing/use-case-test-types.md).

## Desarrollo

Para preparar el entorno, ejecutar la API o validar cambios, consulta
[Desarrollo backend](../development/index.md). Para recorrer el código por dominio,
consulta la [guía de incorporación](views/development/developer-onboarding.md).
