# 3. Aplicación por tipo de documento

| Referencia | Uso recomendado en Nexus | Alcance actual |
| --- | --- | --- |
| [ISO/IEC/IEEE 29148:2018](https://www.iso.org/standard/72089.html) | Mantener requisitos identificables, necesarios, verificables, trazables y separados de su evidencia de implementación. | Aplica a necesidades, interesados y límites de `vision-scope-and-requirements/`, a `requirements-specification/`, `use-cases/` y las vistas normativas de `domain-and-use-cases/`. Es la guía principal, no una declaración de conformidad. |
| [IEEE 1016-2009](https://standards.ieee.org/ieee/1016/4502/) | Estructurar una descripción de diseño mediante interesados, preocupaciones, puntos de vista, vistas, elementos de diseño, relaciones y justificación. | Referencia histórica en estado Inactive-Reserved según IEEE, complementaria a 42010. Se aplica selectivamente a las referencias separadas de backend y frontend; no prescribe JSDoc, nombres de funciones, bloques de código ni una plantilla por endpoint. |
| [ISO/IEC/IEEE 42010:2022](https://www.iso.org/standard/74393.html) | Estructurar la descripción arquitectónica y relacionar preocupaciones con puntos de vista, vistas, modelos y decisiones. | Aplica selectivamente a los índices y modelos de `architecture/`. El sistema, las vistas y su notación están descritos; falta una matriz central de interesados y preocupaciones. No se declara conformidad. |
| [ISO/IEC 25010:2023](https://www.iso.org/standard/78176.html) | Usar un vocabulario consistente para características de calidad y convertir sólo objetivos acordados en requisitos medibles. | Sirve para revisar la sección de calidad; no autoriza inventar umbrales de rendimiento, disponibilidad o seguridad. |
| [ISO/IEC/IEEE 15289:2019](https://www.iso.org/standard/74909.html) | Orientar el contenido y ciclo de vida de los elementos de información sin imponer un formato único. | Se usa para revisar propósito, contenido, referencias y mantenimiento de visión y alcance y de los paquetes documentales, sin afirmar conformidad completa. |
| [ISO/IEC/IEEE 29119-3:2021](https://www.iso.org/standard/79429.html) y [29119-4:2021](https://www.iso.org/standard/79430.html) | Separar diseño, especificación del caso y resultado real; elegir técnicas según condiciones y riesgos. | El [plan de pruebas](../../testing/test-plan.md) adapta formatos `DP-*`, `CP-*` y `EP-*` de forma selectiva. No se atribuyen tablas literales a ISO ni se declara conformidad; los resultados permanecen en CI o en la revisión del cambio. |
| OpenAPI 3.1 | Versionar el contrato HTTP de rutas, parámetros, cuerpos, respuestas, errores y autenticación. | Es una especificación técnica complementaria, no una norma ISO ni un sustituto de requisitos o arquitectura. Su mantenimiento se describe en la [guía API](../../architecture/openapi/02-maintenance.md). |

### API HTTP

No se adopta una norma ISO para describir esta API REST. [OpenAPI 3.1](https://spec.openapis.org/oas/v3.1.html)
define el contrato procesable y [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html)
define la semántica HTTP. El proyecto ISO/IEC DIS 19518 para modelar APIs y servicios
sigue en desarrollo y no se usa como requisito del repositorio.

Las referencias de [backend](../../architecture/views/development/backend-technical-documentation/index.md)
y [Vue](../../../../front/docs/architecture/views/development/code-structure.md) describen
la implementación; el [contrato OpenAPI](../../architecture/openapi/openapi.json) describe
la interfaz HTTP. Los requisitos conservan el comportamiento que esa interfaz debe cumplir.
