# Diagramas de secuencia del código frontend

Cada `CU-*` muestra la ejecución frontend desde la interacción hasta el resultado visible. El
objetivo y el flujo de negocio permanecen en los [casos de uso](../../../../requirements/domain-and-use-cases/03-cases-of-use-current.md),
y la [matriz técnica](../../development/frontend-technical-documentation/02-application-of-all-the-cases-to-the-code-frontend.md)
relaciona cada caso con su implementación y diagrama.

| Aspecto | Contenido de la secuencia frontend |
| --- | --- |
| Inicio | Actor canónico, navegador y evento de la interfaz. |
| Recorrido | Vista/UI → aplicación → servicio de request → cliente HTTP → endpoint. |
| Datos | Métodos, payload, filtros y parámetros relevantes. |
| Validación | Función frontend real y alternativa que conserva el formulario; no sustituye la validación del servidor. |
| Respuesta | Tipo real, respuesta normalizada o `Blob`, error y efecto visible. |
| Participantes | Archivo concreto de cada módulo que recibe mensajes; se omiten temporales mecánicos. |

Las factories y componentes compartidos conservan una secuencia por caso cuando cambian módulos,
firmas, rutas, datos o efectos.

### Relación con la documentación técnica

Esta colección es la fuente canónica del recorrido interacción → UI → aplicación → request →
endpoint → resultado. Las [vistas técnicas adicionales](../../development/frontend-technical-documentation/03-views-technical-applied-by-flow-frontend.md#relación-entre-la-colección-canónica-y-las-vistas-adicionales)
sólo complementan decisiones o modos que requieren otra representación.

### Regla de identificación y lectura

| Elemento | Convención |
| --- | --- |
| Encabezado | `CU-<grupo>-<número> — <nombre>` |
| Diagrama | `DIA-FE-CU-<grupo>-<número>` |
| Contenido propio | Patrones, participantes, eventos, payload, requests y resultado visible. |
| Contenido referenciado | Objetivo, actor, reglas y flujo normativo del caso de uso. |

## Índice rápido de patrones por caso

Cada caso conserva una línea **Patrones** con códigos de este índice y enlaza el
[catálogo canónico](../../development/design-and-construction-patterns/03-summary-of-patterns-confirmed.md#3-resumen-de-patrones-confirmados).
La referencia identifica las soluciones aplicadas sin repetirlas dentro de Mermaid. La
implementación se reconoce directamente por las rutas `src/...`, símbolos y llamadas
del recorrido concreto.

| Código | Patrón aplicado | Vista canónica | Elementos que permiten reconocerlo |
| --- | --- | --- | --- |
| `FE-P01` | Capas del navegador | [`DIA-PAT-EST-001`](../../development/design-and-construction-patterns/04-catalog-visual-of-patterns-applied.md#estructura-por-dominio-capas-y-fronteras) | Página/UI → aplicación → servicio HTTP → endpoint. |
| `FE-P02` | Factory CRUD | [`DIA-PAT-CON-001`](../../development/design-and-construction-patterns/04-catalog-visual-of-patterns-applied.md#factories-y-composición-sobre-herencia) | `createCrudApplication` configurada con requests y claves del recurso. |
| `FE-P03` | Factory/adaptador de catálogo | [`DIA-PAT-CON-001`](../../development/design-and-construction-patterns/04-catalog-visual-of-patterns-applied.md#factories-y-composición-sobre-herencia) | `createApplicationList` + request y transformación de opciones. |
| `FE-P04` | Mutación por composición | [`DIA-PAT-CON-001`](../../development/design-and-construction-patterns/04-catalog-visual-of-patterns-applied.md#factories-y-composición-sobre-herencia) | Operación adicional incorporada al CRUD sin herencia. |
| `FE-P05` | Composición de salidas | [`DIA-PAT-CON-001`](../../development/design-and-construction-patterns/04-catalog-visual-of-patterns-applied.md#factories-y-composición-sobre-herencia) | `createIssueApplication` configurada para material o merma. |
| `FE-P06` | UI de devolución compartida | [`DIA-PAT-EST-001`](../../development/design-and-construction-patterns/04-catalog-visual-of-patterns-applied.md#estructura-por-dominio-capas-y-fronteras) | `issueReturnUI` parametrizada por el contexto de la salida. |
| `FE-P07` | Consulta tabular | [`DIA-PAT-EST-001`](../../development/design-and-construction-patterns/04-catalog-visual-of-patterns-applied.md#estructura-por-dominio-capas-y-fronteras) | DataTable + filtros + aplicación de lectura contextual. |
| `FE-P08` | Factory de reporte | [`DIA-PAT-CON-001`](../../development/design-and-construction-patterns/04-catalog-visual-of-patterns-applied.md#factories-y-composición-sobre-herencia) | `createReportApplication` + `buildExcelButton` y request de descarga. |
| `FE-P09` | Navegación compuesta | [`DIA-PAT-EST-001`](../../development/design-and-construction-patterns/04-catalog-visual-of-patterns-applied.md#estructura-por-dominio-capas-y-fronteras) | Formulario o layout común coordina navegación/sesión sin duplicar el endpoint. |

### Cobertura de casos frontend

La comparación con el catálogo y la matriz técnica confirma que cada identificador
aparece una vez, conserva su referencia de patrones y contiene un bloque Mermaid.

| Grupo propietario | Rango cubierto | Diagramas | Estado |
| --- | --- | ---: | --- |
| Autenticación | `CU-AUT-01..02` | 2 | Completo |
| Identidad y acceso | `CU-IDA-01..09` | 9 | Completo |
| Almacén | `CU-ALM-01..16` | 16 | Completo |
| Catálogos | `CU-CAT-01..26` | 26 | Completo |
| Entradas | `CU-ENT-01..06` | 6 | Completo |
| Salidas | `CU-SAL-01..14` | 14 | Completo |
| **Total** | Seis grupos propietarios | **73** | **73 de 73** |

Los casos de inicio y cierre de sesión permanecen en esta colección sólo como
realización técnica de `CU-AUT-01` y `CU-AUT-02`. La autenticación como condición
transversal se especifica en requisitos y no se repite como participante ni mediante
pasos genéricos dentro de los demás recorridos frontend.

### Capítulos técnicos

- [Autenticación](authentication/index.md): casos `CU-AUT-*`.
- [Identidad y acceso](identity-access/index.md): casos `CU-IDA-*`.
- [Almacén y catálogos](catalogs/index.md): casos `CU-ALM-*` y `CU-CAT-*`.
- [Compras y entradas](purchases/index.md): casos `CU-ENT-*`.
- [Salidas](issues/index.md): casos `CU-SAL-*`.
