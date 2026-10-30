# 9. Estándares y fuentes propietarias

## Dónde consultar cada regla

| Ámbito | Fuente propietaria | Contenido |
| --- | --- | --- |
| Codificación | [Estándar Vue y TypeScript](../architecture/coding-standards/index.md) | Sintaxis, formato, nombres, imports, responsabilidades, asincronía, transformación de datos, errores y comentarios del código. |
| Interfaz y accesibilidad | [Estándar de interfaz](../architecture/interface-standards.md) | Formularios, estilos, controles, foco, teclado, tablas, menú y distribución. |
| Seguridad | [Estándar del cliente](../architecture/security-standards.md) | Tratamiento de captura, salida segura, sesión, secretos y límites del navegador. |
| Construcción de pruebas | [Estándar de pruebas](../testing/07-test-standards.md) | Organización, nombres, aislamiento, aserciones, dobles y mantenimiento del código de prueba. |
| Estrategia y registros de pruebas | [Plan de pruebas](../testing/01-test-plan.md) | Niveles, riesgos, técnicas, criterios y plantillas DP/CP/EP. |
| Especificación funcional | [Convenciones de requisitos](../requirements/requirements-specification/02-conventions.md) y [plantilla CU](../requirements/use-cases/index.md) | Obligaciones, identificadores, estados y descripción completa de objetivos. |
| Documentación | [Reglas editoriales](01-documentation-rules.md) | Redacción, estructura, granularidad, mantenimiento y propiedad del contenido. |
| Diagramación | [Reglas de figuras](01-documentation-rules.md#figuras-y-fuentes) y [guía visual](../architecture/views/diagram-reading.md) | Elaboración y lectura de modelos por familia. |
| Referencias ISO/IEEE y Vue | [Aplicabilidad](03-standard-applicability.md) | Referencias seleccionadas y adaptación al proyecto, sin declaración de conformidad integral. |

La [clasificación de enunciados](04-conventions-and-criteria.md) distingue una regla,
una recomendación, una decisión y un resultado. El
[procedimiento de revisión](../development/04-change-review.md) relaciona los controles
que corresponden a cada cambio.

## Mantener una sola definición

Definir cada regla transversal una vez en la fuente de la tabla. Los consumidores
la enlazan y describen sólo su aplicación; los índices facilitan la búsqueda.

Los casos de uso y prueba conservan su preparación, pasos y resultados para poder
ejecutarse. El manual conserva las advertencias junto a la acción. Esa información
contextual permite consultar una tarea completa sin copiar normas generales.

Instalación, ejecución y publicación pertenecen a sus guías operativas; las
decisiones arquitectónicas explican la solución y sus motivos.
