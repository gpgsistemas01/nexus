# Inventario de diagramas

## Criterio de identificación

Este inventario es el catálogo equivalente al inventario de capturas del manual. Cada
fuente Mermaid tiene un identificador estable y se localiza por documento y encabezado,
no por número de línea. `DIA-REQ-CU-<CU>` reutiliza el identificador normativo del caso;
los demás siguen `DIA-<familia>-<tipo>-<número>`. Los rangos de la tabla son inclusivos:
cada `CU-*` dentro del rango identifica un diagrama individual.

El **tipo semántico** prevalece sobre la directiva Mermaid. Un `flowchart` puede
representar contexto, actividad, dependencia, navegación o trazabilidad; no se etiqueta
como “diagrama de flujo” genérico si las flechas tienen otra semántica. El inventario
registra **272 diagramas vigentes**: 266 curados y 6 generados.

## Catálogo por familia y tipo

| ID o rango | Tipo semántico | Ubicación canónica | Cantidad | Fuente / mantenimiento |
| --- | --- | --- | ---: | --- |
| `DIA-ARQ-CTX-001` | Contexto inspirado en C4 | `architecture-and-web-views.md#diagrama-de-contexto-del-sistema` | 1 | Actores, sistema y dependencias externas; curado. |
| `DIA-ARQ-CON-001` | Contenedores y capas | `architecture-and-web-views.md#contenedores-y-capas` | 1 | Entornos y responsabilidades; curado. |
| `DIA-ARQ-DEP-001..002` | Despliegue actual y objetivo | Secciones “Despliegue” de `architecture-and-web-views.md` | 2 | Infraestructura y configuración; curado. |
| `DIA-ARQ-CMP-001` | Componentes | `architecture-and-web-views.md#componentes-de-aplicación` | 1 | Diseño por capas; curado. |
| `DIA-ARQ-SEQ-001` | Secuencia extremo a extremo | `architecture-and-web-views.md#recorrido-de-una-interacción` | 1 | Interacción representativa; curado. |
| `DIA-ARQ-EST-001` | Estados de acceso | `web-navigation-and-screen-catalog.md#estados-de-acceso-y-sesión` | 1 | Sesión y rutas; curado. |
| `DIA-ARQ-NAV-001..002` | Navegación y redirecciones | Mapa de sitio y redirecciones de `web-navigation-and-screen-catalog.md` | 2 | Rutas web y menú; curado. |
| `DIA-BE-CMP-001..002` | Capas y registro de rutas | “Relación entre ambas capas” y “Registro de rutas” del backend | 2 | Código backend; curado. |
| `DIA-BE-SEQ-006` | Secuencia transversal de auditoría de escrituras | Backend, “Vistas técnicas aplicadas” | 1 | Ejecución posterior a la respuesta y garantía *best effort*; complementa todos los casos de escritura sin duplicar su recorrido. |
| `DIA-BE-ACT-001..002` | Actividades de surtimiento y cancelación | Backend, “Vistas técnicas aplicadas” | 2 | Decisiones y errores de servicios; curado. |
| `DIA-FE-ACT-001` | Actividad de alta de merma desde plantilla | Frontend, “Alta de merma…” | 1 | Dependencias y validación del navegador; curado. |
| `DIA-FE-CU-AUT-01..REP-15` | Secuencia de ejecución frontend por caso | `frontend-code-sequence-diagrams.md` | 63 | Página/interacción, aplicación, request y resultado concretos; curado desde la matriz frontend. |
| `DIA-BE-CU-AUT-01..REP-15` | Secuencia de ejecución backend por caso | `backend-code-sequence-diagrams.md` | 63 | Ruta/controller, servicio, persistencia o efecto concretos; curado desde la matriz backend. |
| `DIA-BE-TEC-EST-CU-ENT-04`, `DIA-FE-TEC-EST-CU-IDA-07`, `DIA-FE-TEC-EST-CU-CAT-05` | Estados técnicos complementarios | Secciones técnicas del caso correspondiente | 3 | Transacción backend y modos de formulario frontend; no duplican estados normativos. |
| `DIA-COD-ORG-001`, `DIA-COD-EST-001..002`, `DIA-COD-DIN-001`, `DIA-COD-REU-001` | Organización, estructura, dinámica y reutilización | `code-diagrams.md`, secciones 1 a 5 | 5 | Código e imports; curado. |
| `DIA-PAT-DAT-001`, `DIA-PAT-RES-001` | Contrato de detalle y resumen de patrones | `design-and-construction-patterns.md` y `diagram-conventions.md` | 2 | Patrones confirmados; curado. |
| `DIA-PAT-EST-001`, `DIA-PAT-FRO-001`, `DIA-PAT-CON-001`, `DIA-PAT-DIN-001`, `DIA-PAT-TST-001` | Estructura, frontera, construcción, dinámica y pruebas de patrones aplicados | `design-and-construction-patterns.md#catálogo-visual-de-patrones-aplicados` | 5 | Símbolos y consumidores comprobables; sus códigos se referencian desde cada caso frontend/backend. |
| `DIA-DOC-FLU-001` | Actividad documental | `technical-code-documentation.md#recorrido-para-incorporar-documentación` | 1 | Gobierno técnico; curado. |
| `DIA-API-SEQ-001` | Secuencia de middleware | `api-contract.md#prefijo-montaje-y-orden-de-middleware` | 1 | Registro Express; curado. |
| `DIA-GEN-COD-001` | Dependencias generadas | `generated/code-map.md#dependencias-entre-áreas` | 1 | `src`; regenerar. |
| `DIA-GEN-ER-001..005` | Entidad–relación | Cuatro áreas y relaciones transversales de `generated/database-schema.md` | 5 | Prisma; regenerar. |
| `DIA-REQ-DOM-001` | Clases de dominio conceptual | `domain-and-use-cases.md#modelo-de-dominio-conceptual` | 1 | Requisitos y glosario; curado. |
| `DIA-REQ-CU-GRP-AUT..REP` | Casos de uso por seis grupos | `domain-and-use-cases.md#casos-de-uso-vigentes` | 6 | Catálogo `CU-*`; curado. |
| `DIA-REQ-EST-001` | Estados/datos por acción | `domain-and-use-cases.md#estados-y-datos-modificados-por-acción` | 1 | Reglas de dominio; curado. |
| `DIA-REQ-TRA-001`, `DIA-REQ-CRUD-001` | Dependencias y ciclo CRUD | Primeras dos vistas de `requirements-diagrams.md` | 2 | Requisitos; curado. |
| `DIA-REQ-CU-AUT-01..CU-REP-15` | Flujo individual de cada caso vigente | `requirements-diagrams.md#flujos-de-cada-caso-de-uso` | 63 | Una vista curada por cada `CU-*`. |
| `DIA-REQ-ESP-001..017` | Vistas adicionales agrupadas | `requirements-diagrams.md#casos-con-vistas-adicionales-y-nivel-de-coordinación` | 17 | Casos con coordinación o patrón común; curado. |
| `DIA-REQ-SEQ-ATM-001` | Secuencia atómica de corrección/cancelación | `requirements-diagrams.md#coordinación-atómica-de-correcciones-de-entrada` | 1 | Servicios transaccionales; curado. |
| `DIA-REQ-EST-002` | Estados de surtimiento/devolución | `requirements-diagrams.md#estados-de-surtimiento-y-devolución` | 1 | Reglas normativas; curado. |
| `DIA-REQ-CAL-001` | Requisitos de calidad | `requirements-diagrams.md#requisitos-de-calidad-y-restricciones` | 1 | Requisitos `RC-*`; curado. |
| `DIA-REQ-TRA-002` | Trazabilidad a evidencia | `requirements-diagrams.md#trazabilidad-del-requisito-a-la-evidencia` | 1 | Requisitos e implementación; curado. |

## Control de completitud y coherencia

El total se obtiene de cada bloque Mermaid de `docs`: arquitectura (176), datos
(1), generados (5) y requisitos (94). Al agregar, retirar o mover un bloque se actualiza
su fila, cantidad y enlace en el mismo cambio. Los diagramas generados nunca se editan a
mano. Los de caso individual conservan el `CU-*`; una vista agrupada enumera los casos a
los que aplica y no suplanta sus fichas.

Antes de crear otra vista se consulta la matriz de decisión de frontend/backend y las
convenciones. Una secuencia muestra orden y participantes; una actividad, decisiones;
una máquina de estados, transiciones persistentes; componentes/containers, estructura;
ER, relaciones persistentes. Esta separación evita representar el mismo hecho con tipos
incompatibles.
