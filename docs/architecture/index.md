# Arquitectura y construcción de Nexus

## Datos generales del documento

| Versión documental | Versión del sistema | Estado | Fecha | Responsable |
| --- | --- | --- | --- | --- |
| 1.1 | 1.0.0 | En revisión | 2026-09-17 | Equipo Nexus |

## Propósito

Este índice presenta la documentación arquitectónica por pregunta y nivel de detalle.
Es la portada y entrada del **documento de arquitectura** exportable; no repite decisiones
ni diagramas que tienen un capítulo propietario. Nexus se describe como un **monolito
modular por dominio con arquitectura por capas** y una correspondencia de **MVC web
extendido**.

## Relación con visión, SRS y casos de uso

Arquitectura responde **cómo** está organizada la solución y cómo satisface las
obligaciones del sistema. No es propietaria del propósito y alcance de negocio ni de la
conducta normativa de los actores:

| Fuente | Responsabilidad | Uso desde arquitectura |
| --- | --- | --- |
| [Visión y alcance](../requirements/vision-scope-and-requirements/index.md) | Define por qué existe el producto, sus interesados y sus límites. | Alimenta el contexto y las preocupaciones arquitectónicas. |
| [SRS](../requirements/requirements-specification/index.md) y [casos de uso](../requirements/use-cases/index.md) | Definen qué debe hacer el sistema, sus reglas y los flujos actor–Nexus. | Aportan los `CU-*` y requisitos que la solución debe realizar. |
| Este documento de arquitectura | Define estructura, responsabilidades, decisiones, contratos, despliegue y realización técnica. | Traza cada obligación hacia vistas, secuencias, código y pruebas sin copiar su definición funcional. |

Que los servicios ejecuten un “caso de uso” o que las secuencias técnicas se organicen
por `CU-*` no cambia la propiedad documental. La ficha funcional permanece en la SRS;
backend y frontend muestran colaboraciones internas, errores técnicos y persistencia.
Ambas vistas se conectan mediante la
[matriz de trazabilidad](traceability-matrix/index.md).

## Forma arquitectónica y criterios normativos

El [modelo de vistas aplicado](architecture-and-web-views/05-model-of-views-of-architecture-applied.md)
es la fuente propietaria del enfoque Viewpoint/View, su adaptación de 4+1 y el apoyo de
los niveles de C4. Los [criterios documentales](../governance/documentation-standards/03-application-by-type-of-document.md)
determinan qué orientan ISO/IEC/IEEE 42010, 29148, 1016 y 15289, qué entrega conserva cada
contenido y los límites de la adopción. Este índice sólo dirige a esas decisiones: no
mantiene otra versión de las normas ni del modelo de vistas.

## Orden de lectura recomendado

1. [Descripción de arquitectura y construcción](architecture-and-web-views/index.md): contexto,
   contenedores, despliegue, componentes, recorrido extremo a extremo y organización de
   las capas.
2. [Patrones de diseño y construcción](design-and-construction-patterns/index.md): definición,
   evidencia y reglas de aplicación de los patrones confirmados.
3. [Contrato de la API](api-contract/index.md) y [OpenAPI 3.1](openapi/openapi.json): transporte JSON,
   rutas, esquemas de solicitud y respuesta, errores y validaciones observables.
4. [Diagramas vigentes del código](code-diagrams/index.md): superficie HTTP, dominios,
   colaboraciones y reutilización observada.
5. [Navegación y catálogo de pantallas web](web-navigation-and-screen-catalog/index.md): estados
   de acceso, mapa del menú, pantallas y redirecciones.
6. [Mapa generado del código](../generated/code-map.md): rutas, dependencias reales entre
   áreas y exportaciones detectadas automáticamente.

## Vistas y responsabilidades

| Pregunta | Vista propietaria | Mantenimiento |
| --- | --- | --- |
| ¿Quién usa Nexus y de qué sistemas externos depende? | Contexto en la descripción de arquitectura. | Curado cuando cambia el límite del sistema. |
| ¿Dónde se ejecutan cliente, servidor y persistencia? | Contenedores y despliegue en la descripción de arquitectura. | Curado cuando cambia la topología. |
| ¿Cuál es el patrón arquitectónico y cómo se dividen las responsabilidades? | Componentes y organización por capas en la descripción; catálogo de patrones para la justificación. | Curado cuando cambia una decisión de diseño. |
| ¿Qué datos recibe y devuelve una ruta HTTP? | [Contrato de la API](api-contract/index.md). | Curado junto con rutas, validadores, DTO, controladores y pruebas HTTP. |
| ¿Qué dependencias existen realmente en el código? | Mapa generado y diagramas vigentes del código. | `npm run docs:architecture` y revisión manual, respectivamente. |
| ¿Cómo se ejecuta un caso de uso concreto? | Secuencias de código de [backend](backend-code-sequences/index.md) y [frontend](frontend-code-sequences/index.md), divididas por grupo funcional. | Curado junto con el caso afectado. |
| ¿Por qué se eligió una alternativa arquitectónica transversal? | [Registros de decisiones](decisions/index.md). | Crear o reemplazar un ADR cuando cambie una decisión relevante. |
| ¿Cómo navega una persona por las pantallas? | Navegación y catálogo de pantallas web. | Curado junto con rutas, permisos y vistas. |
| ¿Qué diagramas existen y qué notación usan? | [Inventario](diagram-inventory/index.md) y [convenciones](diagram-conventions/index.md). | Actualizar al agregar, retirar o cambiar una vista. |

## Regla de división

Cada documento responde una clase de pregunta. Los diagramas de contexto, contenedores,
componentes y despliegue presentan arquitectura; las secuencias y actividades presentan
comportamiento; la navegación presenta experiencia web; el mapa generado presenta
hechos mecánicos del código. Cuando una vista existente responde la pregunta, se enlaza
en lugar de duplicarla.

La documentación curada explica intención y decisiones. Los inventarios generados sólo
presentan información inferible desde `src` o Prisma y se validan mediante
`npm run docs:check`.
