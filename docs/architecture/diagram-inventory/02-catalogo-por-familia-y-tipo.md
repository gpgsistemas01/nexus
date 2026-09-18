# 2. Catálogo por familia y tipo

| ID o rango | Tipo semántico | Ubicación canónica | Cantidad | Fuente / mantenimiento |
| --- | --- | --- | ---: | --- |
| `DIA-ARQ-CTX-001` | Contexto inspirado en C4 | `architecture-and-web-views/index.md#diagrama-de-contexto-del-sistema` | 1 | Actores, sistema y dependencias externas; curado. |
| `DIA-ARQ-CON-001` | Contenedores y capas | `architecture-and-web-views/index.md#contenedores-y-capas` | 1 | Entornos y responsabilidades; curado. |
| `DIA-ARQ-DEP-001..002` | Despliegue actual y objetivo | Secciones “Despliegue” de `architecture-and-web-views/index.md` | 2 | Infraestructura y configuración; curado. |
| `DIA-ARQ-CMP-001` | Componentes | `architecture-and-web-views/index.md#componentes-de-aplicación` | 1 | Diseño por capas; curado. |
| `DIA-ARQ-SEQ-001` | Secuencia extremo a extremo | `architecture-and-web-views/index.md#recorrido-de-una-interacción` | 1 | Interacción representativa; curado. |
| `DIA-ARQ-EST-001` | Estados de acceso | `web-navigation-and-screen-catalog/index.md#estados-de-acceso-y-sesión` | 1 | Sesión y rutas; curado. |
| `DIA-ARQ-NAV-001..002` | Navegación y redirecciones | Mapa de sitio y redirecciones de `web-navigation-and-screen-catalog/index.md` | 2 | Rutas web y menú; curado. |
| `DIA-ARQ-CAT-001..004` | Registro y ciclo CRUD de catálogos | `design-and-construction-patterns/01-registro-de-catalogos-con-lista-blanca.md` | 4 | Estructura Registry/Strategy, actividad funcional y secuencias técnicas separadas de frontend y backend de consulta, alta, edición y estado activo; curado. |
| `DIA-BE-CMP-001..002` | Capas y registro de rutas | “Relación entre ambas capas” y “Registro de rutas” del backend | 2 | Código backend; curado. |
| `DIA-BE-SEQ-006` | Secuencia transversal de auditoría de escrituras | Backend, “Vistas técnicas aplicadas” | 1 | Ejecución posterior a la respuesta y garantía *best effort*; complementa todos los casos de escritura sin duplicar su recorrido. |
| `DIA-BE-ACT-001..002` | Actividades de surtimiento y cancelación | Backend, “Vistas técnicas aplicadas” | 2 | Decisiones y errores de servicios; curado. |
| `DIA-REQ-ACT-001` | Impacto del estado activo | `requirements/diagrams/index.md#impacto-del-estado-activo-en-los-procesos-de-almacén` | 1 | Actividad funcional que separa `isActive`, filtros de inventario y estados documentales; curado desde servicios y reportes vigentes. |
| `DIA-FE-ACT-001` | Actividad de alta de merma desde plantilla | Frontend, “Alta de merma…” | 1 | Dependencias y validación del navegador; curado. |
| `DIA-FE-CU-AUT-01..SAL-14` | Secuencia de ejecución frontend por caso | `frontend-code-sequences/`, con índice y capítulos por grupo | 81 | Página/interacción, aplicación, request y resultado concretos; curado desde la matriz frontend. |
| `DIA-BE-CU-AUT-01..SAL-14` | Secuencia de ejecución backend por caso | `backend-code-sequences/`, con índice y capítulos por grupo | 81 | Ruta/controller, servicio, persistencia o efecto concretos; curado desde la matriz backend. |
| `DIA-BE-TEC-EST-AUT-01`, `DIA-BE-TEC-EST-CU-ENT-04`, `DIA-FE-TEC-EST-CU-IDA-08`, `DIA-FE-TEC-EST-CU-ALM-05` | Estados técnicos complementarios | Secciones técnicas del caso correspondiente | 4 | Elegibilidad de acceso y transacción backend, más modos de formulario frontend; no duplican estados normativos. |
| `DIA-COD-ORG-001`, `DIA-COD-EST-001..002`, `DIA-COD-DIN-001`, `DIA-COD-REU-001` | Organización, estructura, dinámica y reutilización | `code-diagrams/index.md`, secciones 1 a 5 | 5 | Código e imports; curado. |
| `DIA-PAT-DAT-001`, `DIA-PAT-RES-001` | Contrato de detalle y resumen de patrones | `design-and-construction-patterns/` y `diagram-conventions/` | 2 | Patrones confirmados; curado. |
| `DIA-PAT-EST-001`, `DIA-PAT-FRO-001`, `DIA-PAT-CON-001`, `DIA-PAT-DIN-001`, `DIA-PAT-TST-001` | Estructura, frontera, construcción, dinámica y pruebas de patrones aplicados | `design-and-construction-patterns/04-catalogo-visual-de-patrones-aplicados.md` | 5 | Símbolos y consumidores comprobables; sus códigos se referencian desde cada caso frontend/backend. |
| `DIA-DOC-FLU-001` | Actividad documental | `technical-code-documentation/index.md#recorrido-para-incorporar-documentación` | 1 | Gobierno técnico; curado. |
| `DIA-API-SEQ-001` | Secuencia de middleware | `api-contract/01-como-documentar-una-ruta-api.md#prefijo-montaje-y-orden-de-middleware` | 1 | Registro Express; curado. |
| `DIA-GEN-COD-001` | Dependencias generadas | `generated/code-map.md#dependencias-entre-áreas` | 1 | `src`; regenerar. |
| `DIA-GEN-ER-001..005` | Entidad–relación | Cuatro áreas y relaciones transversales de `generated/database-schema.md` | 5 | Prisma; regenerar. |
| `DIA-REQ-DOM-001` | Clases de dominio conceptual | `domain-and-use-cases/02-modelo-de-dominio-conceptual.md` | 1 | Requisitos y glosario; curado. |
| `DIA-REQ-CU-GRP-AUT..SAL` | Casos de uso por cinco grupos propietarios | `domain-and-use-cases/03-casos-de-uso-vigentes.md` | 5 | Los reportes se integran con el grupo del recurso que los inicia; curado. |
| `DIA-REQ-EST-001` | Estados/datos por acción | `domain-and-use-cases/04-estados-y-datos-modificados-por-accion.md` | 1 | Reglas de dominio; curado. |
| `DIA-REQ-TRA-001`, `DIA-REQ-CRUD-001` | Dependencias y ciclo CRUD | Primeras dos vistas de `requirements/diagrams/index.md` | 2 | Requisitos; curado. |
| `DIA-REQ-CU-AUT-01..CU-SAL-14` | Flujo individual de cada caso vigente | `requirements/diagrams/` | 81 | Una vista curada por cada `CU-*`. |
| `DIA-REQ-ESP-001..017` | Vistas adicionales agrupadas | `requirements/diagrams/cross-cutting/index.md` | 17 | Casos con coordinación o patrón común; curado. |
| `DIA-REQ-SEQ-ATM-001` | Secuencia atómica de corrección/cancelación | `requirements/diagrams/cross-cutting/18-coordinacion-atomica-de-correcciones-de-entrada.md` | 1 | Servicios transaccionales; curado. |
| `DIA-REQ-EST-002` | Estados de surtimiento/devolución | `requirements/diagrams/cross-cutting/index.md#estados-de-surtimiento-y-devolución` | 1 | Reglas normativas; curado. |
| `DIA-REQ-CAL-001` | Requisitos de calidad | `requirements/diagrams/cross-cutting/20-requisitos-de-calidad-y-restricciones.md` | 1 | Requisitos `RC-*`; curado. |
| `DIA-REQ-TRA-002` | Trazabilidad a evidencia | `requirements/diagrams/cross-cutting/21-trazabilidad-del-requisito-a-la-evidencia.md` | 1 | Requisitos e implementación; curado. |
