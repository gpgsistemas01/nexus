# Diagramas de secuencia del código backend

Esta colección **no es un catálogo de diagramas de casos de uso**. Es la lectura técnica
complementaria del catálogo funcional: cada `CU-*` sirve como vínculo de trazabilidad,
pero el bloque Mermaid describe cómo se ejecuta el código mediante endpoint, controller,
servicios, efectos y variables de frontera. Para comprender el objetivo con lenguaje de
negocio se consulta primero el [modelo y los diagramas funcionales de casos de uso](../../requirements/domain-and-use-cases.md#casos-de-uso-vigentes).

La [matriz técnica de backend](../backend-technical-documentation.md#aplicación-de-todos-los-casos-al-código-backend)
es el índice único de trazabilidad: relaciona caso, entrada HTTP, implementación y
diagrama. Esta colección no vuelve a copiar esa relación en cada sección. Los
participantes identifican su archivo concreto; los métodos y la URL HTTP se indican
en los mensajes que ejecutan cada proceso para no repetirlos en las entidades.
La figura `control` marca el adaptador HTTP sin repetir el estereotipo textual de
controlador. Los módulos de servicio, rutas y utilidades no reciben `«object»`: el estereotipo identifica los DTO JSON que el controller construye
realmente, junto con la función y el archivo `src/dtos/` que los originan. En el recorrido
común se separan cliente,
ruta, controller y servicio de dominio; sólo las coordinaciones atómicas
despliegan módulos colaboradores, persistencia o publicación como participantes
adicionales. De este modo se conservan pocas entidades sin ocultar el controller ni el
módulo responsable. Los mensajes conservan las llamadas en orden y las notas nombran datos que cruzan la
frontera (`req.params`, `req.body`/DTO, parámetros de consulta y `tx`). Todos los recorridos
explicitan middleware, activación de responsabilidades, resultado HTTP y propagación de
error; las coordinaciones complejas agregan sus colaboradores y límites transaccionales.
Las variables
locales mecánicas permanecen en el código para no convertir el diagrama en una
transcripción ilegible. Cada caso mantiene una secuencia específica aunque reutilice un
patrón, porque cambian módulos, firmas, rutas, datos o efectos.

### Relación con la documentación técnica

Esta colección es la **fuente canónica del recorrido secuencial por caso**: si cambia el
orden ruta → controller → servicio → persistencia o efecto, se actualiza en el capítulo funcional correspondiente. La
[documentación técnica del backend](../backend-technical-documentation.md#relación-entre-la-colección-canónica-y-las-vistas-adicionales)
explica responsabilidades, mantiene la matriz de trazabilidad y sólo conserva otra vista
cuando responde una pregunta distinta, por ejemplo una actividad centrada en decisiones,
un ciclo transaccional o una coordinación transversal. Esas vistas complementarias
enlazan el `DIA-BE-CU-*` correspondiente; no lo sustituyen ni autorizan mantener una
segunda secuencia del mismo recorrido.

### Regla de identificación y lectura

El encabezado `CU-<grupo>-<número>` enlaza directamente la ficha funcional del mismo
identificador. El diagrama de esa sección se identifica de forma determinista como
`DIA-BE-CU-<grupo>-<número>`; por ejemplo, la sección `CU-ENT-02` contiene
`DIA-BE-CU-ENT-02`. La matriz técnica mantiene el enlace navegable y la evidencia de
código. Aquí se conserva solamente la información propia de la vista: patrones,
participantes, llamadas, datos de frontera, decisiones y efectos. El objetivo, actor y
flujo de negocio no se repiten porque pertenecen a la ficha del caso de uso.

## Índice rápido de patrones por caso

Cada caso conserva una línea **Patrones** con códigos de este índice y enlaza el
[catálogo canónico](../design-and-construction-patterns.md#resumen-de-patrones-confirmados).
La referencia identifica las soluciones aplicadas sin repetirlas dentro de Mermaid. La
implementación se reconoce directamente por las rutas `src/...`, símbolos y llamadas
del recorrido concreto.

| Código | Patrón aplicado | Vista canónica | Elementos que permiten reconocerlo |
| --- | --- | --- | --- |
| `BE-P01` | Capas, pipeline y DTO funcional | [`DIA-PAT-FRO-001`](../design-and-construction-patterns.md#pipeline-dto-y-políticas-declarativas) | Ruta/middleware → controller/DTO → servicio → Prisma; el DTO sólo aparece cuando hay entrada. |
| `BE-P02` | Factory de catálogo | [`DIA-PAT-CON-001`](../design-and-construction-patterns.md#factories-y-composición-sobre-herencia) | `createDataTableListController` parametriza consulta, columnas y orden. |
| `BE-P03` | Transaction Script y `tx` explícito | [`DIA-PAT-DIN-001`](../design-and-construction-patterns.md#transacción-eventos-y-auditoría) | El servicio propietario abre `$transaction` y propaga `tx` a las escrituras relacionadas. |
| `BE-P04` | Composición de servicios | [`DIA-PAT-DIN-001`](../design-and-construction-patterns.md#transacción-eventos-y-auditoría) | El servicio del caso coordina reglas, referencias, inventario o cumplimiento reutilizados. |
| `BE-P05` | Publicación posterior al commit | [`DIA-PAT-DIN-001`](../design-and-construction-patterns.md#transacción-eventos-y-auditoría) | El controller llama `emitInventoryUpdated` después del resultado del servicio. |
| `BE-P06` | Query Service | [`DIA-PAT-EST-001`](../design-and-construction-patterns.md#estructura-por-dominio-capas-y-fronteras) | Controller de listado + consulta contextual de sólo lectura. |
| `BE-P07` | Composición de reporte | [`DIA-PAT-CON-001`](../design-and-construction-patterns.md#factories-y-composición-sobre-herencia) | Consulta de dominio + `sendExcelReport`, sin modificar inventario. |
| `BE-P08` | Sesión web | [`DIA-PAT-FRO-001`](../design-and-construction-patterns.md#pipeline-dto-y-políticas-declarativas) | Autenticación, JWT/cookies, cierre o redirección en la frontera web. |

### Cobertura de casos backend

La comparación con el catálogo y la matriz técnica confirma que cada identificador
aparece una vez, conserva su referencia de patrones y contiene un bloque Mermaid.

| Grupo | Rango cubierto | Diagramas | Estado |
| --- | --- | ---: | --- |
| Autenticación | `CU-AUT-01..02` | 2 | Completo |
| Identidad y acceso | `CU-IDA-01..09` | 9 | Completo |
| Catálogos | `CU-CAT-01..20` | 20 | Completo |
| Entradas | `CU-ENT-01..05` | 5 | Completo |
| Salidas | `CU-SAL-01..12` | 12 | Completo |
| Consultas y reportes | `CU-REP-01..15` | 15 | Completo |
| **Total** | `CU-AUT-01..CU-REP-15` | **63** | **63 de 63** |

### Capítulos por grupo funcional

- [Autenticación](authentication.md): casos `CU-AUT-*`.
- [Identidad y acceso](identity-access.md): casos `CU-IDA-*`.
- [Catálogos e inventario](catalogs.md): casos `CU-CAT-*`.
- [Compras y entradas](purchases.md): casos `CU-ENT-*`.
- [Salidas](issues.md): casos `CU-SAL-*`.
- [Consultas y reportes](reports.md): casos `CU-REP-*`.
