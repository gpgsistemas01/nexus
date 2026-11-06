# 3. Aplicación de estándares a la documentación Vue

Estas referencias orientan el contenido y la revisión de los documentos. La aplicación
local descrita aquí no constituye una declaración de conformidad integral.

## Alcance de las referencias

| Referencia | Aplicación en Nexus |
| --- | --- |
| [ISO/IEC/IEEE 15289:2019](https://www.iso.org/standard/74909.html) | Guías identificables por propósito, audiencia, responsable y relaciones. |
| [ISO/IEC/IEEE 29148:2018](https://www.iso.org/standard/72089.html) | Obligaciones observables, identificadores, criterios y trazabilidad de requisitos. Los IDs y las plantillas son locales. |
| [ISO/IEC/IEEE 42010:2022](https://www.iso.org/standard/74393.html) | Descripción por preocupaciones, vistas y decisiones. La organización 4+1, Mermaid, C4 y Markdown son elecciones del proyecto. |
| [IEEE 1016-2009](https://standards.ieee.org/ieee/1016/4502/) | Referencia histórica para interfaces, responsabilidades y relaciones. Estado Inactive-Reserved; no es una plantilla obligatoria por función. |
| [ISO/IEC/IEEE 29119-3:2021](https://www.iso.org/standard/79429.html) | Plan, diseño, datos, resultados esperados y ejecuciones diferenciados; formatos locales DP/CP/EP. |
| [ISO/IEC/IEEE 26514:2022](https://www.iso.org/standard/77451.html) | Manual por audiencia y tareas, con pasos, campos, conceptos y recuperación. |
| [ISO/IEC/IEEE 29119-4:2021](https://www.iso.org/standard/79430.html) | Particiones, fronteras, decisiones y transiciones según el riesgo. Vitest y Playwright ejecutan las pruebas. |
| [ISO/IEC 25010:2023](https://www.iso.org/standard/78176.html) | Criterios verificables de mantenibilidad, interacción, seguridad y desempeño. |
| [Guía de Vue 3](https://vuejs.org/guide/introduction.html) | SFC, composables, props/eventos, slots, reactividad e inyección. El estándar y la configuración locales concretan el estilo del código. |

Cambiar una referencia requiere revisar su alcance e impacto. Una nueva edición
o un cambio de tecnología no sustituye automáticamente las referencias adoptadas.

Las plantillas y comprobaciones se consultan en el
[mapa de estándares](09-standards-and-ownership.md); la exportación, en la
[guía de publicación](02-generation-and-publication.md).

## Organización de la información de requisitos

ISO/IEC/IEEE 29148 orienta la separación entre descripción general, requisitos
específicos, verificación e información de apoyo. Nexus distribuye ese contenido
en las fuentes siguientes y lo reúne mediante el catálogo de publicación.

| Contenido de referencia | Fuente en Nexus |
| --- | --- |
| Identificación, definiciones y referencias — 9.2 | [Datos documentales](../index.md), [glosario](../requirements/business-glossary.md) y referencias de esta guía. |
| Propósito y alcance — 9.6.2–9.6.3 | [Propósito del producto](../requirements/vision-scope-and-requirements/01-product-overview.md#propósito) y [alcance](../requirements/vision-scope-and-requirements/03-current-scope.md). |
| Perspectiva y funciones — 9.6.4–9.6.5 | [Descripción del producto](../requirements/vision-scope-and-requirements/01-product-overview.md#perspectiva-del-producto). |
| Características de usuarios — 9.6.6 | [Contexto y características de uso](../requirements/vision-scope-and-requirements/02-users-and-areas.md#características-de-uso). |
| Limitaciones, supuestos, dependencias y requisitos aplazados — 9.6.7–9.6.9 | [Condiciones de uso](../requirements/vision-scope-and-requirements/03-current-scope.md), [decisiones pendientes](../requirements/vision-scope-and-requirements/04-open-decisions.md) y [capacidades no vigentes](../requirements/requirements-specification/catalog/04-queries-reports-and-modeled-functions.md#capacidades-no-vigentes). |
| Requisitos específicos, interfaces, datos, calidad y restricciones — 9.6.10–9.6.18 | [Catálogo](../requirements/requirements-specification/catalog/index.md), [cliente Vue](../requirements/requirements-specification/client-specification.md) y [condiciones de operación](../requirements/requirements-specification/07-interfaces-and-operating-conditions.md). |
| Verificación — 9.6.19 | [Criterios de aceptación](../requirements/requirements-specification/08-verification-and-acceptance.md) y [cobertura de pruebas](../testing/04-use-case-coverage.md). |
| Información de apoyo — 9.6.20 | [Glosario y dominio](../requirements/domain-model/index.md), [casos](../requirements/use-cases/index.md) y [mapa por capacidad](../requirements/01-applicability-and-traceability.md). |
| Construcción, redacción y atributos de requisitos — 5.2.4–5.2.8 | [Identificadores, estados y redacción](../requirements/requirements-specification/02-conventions.md) y [trazabilidad](../requirements/requirements-specification/05-requirement-traceability-rules.md). |

La descripción del producto presenta finalidad, entorno y funciones a nivel general.
Los permisos se definen en Actores; los campos y efectos, en Operaciones; las reglas
y condiciones verificables, en el Catálogo; los recorridos, en las fichas de casos.

ISO/IEC/IEEE 15289 orienta la identificación y responsabilidad de estos elementos
de información. Las [reglas documentales](01-documentation-rules.md) y el
[mapa de fuentes propietarias](09-standards-and-ownership.md) regulan su mantenimiento.

La correspondencia utiliza la [ficha oficial de 29148](https://www.iso.org/standard/72089.html),
el [índice de su vista previa](https://cdn.standards.iteh.ai/samples/72089/d67a2360308046938cad282e229a39ca/ISO-IEC-IEEE-29148-2018.pdf)
y el [alcance de 15289](https://www.iso.org/standard/74909.html). Los títulos y
archivos de Nexus son una organización local de ese contenido.
