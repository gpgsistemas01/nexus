# Diagramas de secuencia del código backend

Esta colección **no es un catálogo de diagramas de casos de uso**. Es la lectura técnica
complementaria del catálogo funcional: cada `CU-*` sirve como vínculo de trazabilidad,
pero el bloque Mermaid describe cómo se ejecuta el código mediante endpoint, controller,
servicios y efectos. Para comprender el objetivo con lenguaje de
negocio se consulta primero el [modelo y los diagramas funcionales de casos de uso](../../requirements/domain-and-use-cases/03-cases-of-use-current.md).

La [matriz técnica de backend](../backend-technical-documentation/04-application-of-all-the-cases-to-the-code-backend.md)
es el índice único de trazabilidad: relaciona caso, entrada HTTP, implementación y
diagrama. Esta colección no vuelve a copiar esa relación en cada sección. Los
participantes identifican su archivo concreto; los métodos y la URL HTTP se indican
en los mensajes que ejecutan cada proceso para no repetirlos en las entidades.
La figura `control` marca el adaptador HTTP sin repetir el estereotipo textual de
controlador. Los módulos de servicio, rutas y utilidades no se presentan como objetos:
los DTO JSON que el controller construye se distinguen mediante un participante con
línea de vida y nombre de instancia subrayado, junto con la función y el archivo
`src/dtos/` que los originan. En el recorrido
común se separan cliente,
ruta, controller y servicio de dominio; sólo las coordinaciones atómicas
despliegan módulos colaboradores, persistencia o publicación como participantes
adicionales. De este modo se conservan pocas entidades sin ocultar el controller ni el
módulo responsable. Los mensajes conservan las llamadas y sus parámetros relevantes en
orden (`req.params`, `req.body`/DTO, parámetros de consulta y `tx`) para hacer visible el
contrato entre participantes. Esos parámetros no se declaran como participantes ni se
enumeran en una nota separada. El pipeline completo y reutilizado de middleware se
explica una sola vez en `DIA-PAT-FRO-001`. El recorrido de un caso incorpora como
participante un middleware sólo cuando su alternativa cambia la interpretación de ese
caso; entonces identifica el archivo, el validador y el símbolo ejecutado, nunca una
etiqueta genérica como «ejecutar middleware». La ruta enlazada sigue siendo la fuente de
verdad del orden completo. En particular, la validación de entrada del backend ocurre en
los arreglos de `src/validators/forms` y en
`validatorMiddleware.validate(req, res, next)` **antes** del controller; el DTO
normaliza datos aceptados y no sustituye esa validación. Todos explicitan activación de responsabilidades,
resultado HTTP y propagación de error; las coordinaciones complejas agregan sus
colaboradores y límites transaccionales.
Las variables
locales mecánicas permanecen en el código para no convertir el diagrama en una
transcripción ilegible. Cada caso mantiene una secuencia específica aunque reutilice un
patrón, porque cambian módulos, firmas, rutas, datos o efectos.
La frontera que origina una petición se rotula siempre **Navegador** o
**Cliente HTTP / web**; el rol humano pertenece a la ficha funcional y no sustituye al
cliente técnico en una secuencia backend. Incluso las vistas que amplían una coordinación
atómica conservan esa entidad y muestran la petición de entrada y su resultado.

### Relación con la documentación técnica

Esta colección es la **fuente canónica del recorrido secuencial por caso**: si cambia el
orden ruta → controller → servicio → persistencia o efecto, se actualiza en el capítulo funcional correspondiente. La
[documentación técnica del backend](../backend-technical-documentation/06-views-technical-applied.md#relación-entre-la-colección-canónica-y-las-vistas-adicionales)
explica responsabilidades, mantiene la matriz de trazabilidad y sólo conserva otra vista
cuando responde una pregunta distinta, por ejemplo una actividad centrada en decisiones,
un ciclo transaccional o una coordinación transversal. Esas vistas complementarias
enlazan el `DIA-BE-CU-*` correspondiente; no lo sustituyen ni autorizan mantener una
segunda secuencia del mismo recorrido.

### Regla de identificación y lectura

El encabezado `CU-<grupo>-<número> — <nombre>` conserva el identificador y el nombre
normativos de la ficha funcional. El identificador enlaza la trazabilidad; el nombre permite
reconocer el objetivo sin interpretar solamente el código. El diagrama de esa sección se identifica de forma determinista como
`DIA-BE-CU-<grupo>-<número>`; por ejemplo, la sección `CU-ENT-02` contiene
`DIA-BE-CU-ENT-02`. La matriz técnica mantiene el enlace navegable y la evidencia de
código. Aquí se conserva solamente la información propia de la vista: patrones,
participantes, llamadas, datos de frontera, decisiones y efectos. El objetivo, actor y
flujo de negocio no se repiten porque pertenecen a la ficha del caso de uso.

## Índice rápido de patrones por caso

Cada caso conserva una línea **Patrones** con códigos de este índice y enlaza el
[catálogo canónico](../design-and-construction-patterns/03-summary-of-patterns-confirmed.md#3-resumen-de-patrones-confirmados).
La referencia identifica las soluciones aplicadas sin repetirlas dentro de Mermaid. La
implementación se reconoce directamente por las rutas `src/...`, símbolos y llamadas
del recorrido concreto.

| Código | Patrón aplicado | Vista canónica | Elementos que permiten reconocerlo |
| --- | --- | --- | --- |
| `BE-P01` | Capas, pipeline y DTO funcional | [`DIA-PAT-FRO-001`](../design-and-construction-patterns/04-catalog-visual-of-patterns-applied.md#pipeline-dto-y-políticas-declarativas) | Ruta/middleware → controller/DTO → servicio → Prisma; el DTO sólo aparece cuando hay entrada. |
| `BE-P02` | Factory de catálogo | [`DIA-PAT-CON-001`](../design-and-construction-patterns/04-catalog-visual-of-patterns-applied.md#factories-y-composición-sobre-herencia) | `createDataTableListController` parametriza consulta, columnas y orden. |
| `BE-P03` | Transaction Script y `tx` explícito | [`DIA-PAT-DIN-001`](../design-and-construction-patterns/04-catalog-visual-of-patterns-applied.md#transacción-eventos-y-auditoría) | El servicio propietario abre `$transaction` y propaga `tx` a las escrituras relacionadas. |
| `BE-P04` | Composición de servicios | [`DIA-PAT-DIN-001`](../design-and-construction-patterns/04-catalog-visual-of-patterns-applied.md#transacción-eventos-y-auditoría) | El servicio del caso coordina reglas, referencias, inventario o cumplimiento reutilizados. |
| `BE-P05` | Publicación posterior al commit | [`DIA-PAT-DIN-001`](../design-and-construction-patterns/04-catalog-visual-of-patterns-applied.md#transacción-eventos-y-auditoría) | El controller llama `emitInventoryUpdated` después del resultado del servicio. |
| `BE-P06` | Query Service | [`DIA-PAT-EST-001`](../design-and-construction-patterns/04-catalog-visual-of-patterns-applied.md#estructura-por-dominio-capas-y-fronteras) | Controller de listado + consulta contextual de sólo lectura. |
| `BE-P07` | Composición de reporte | [`DIA-PAT-CON-001`](../design-and-construction-patterns/04-catalog-visual-of-patterns-applied.md#factories-y-composición-sobre-herencia) | Consulta de dominio + `sendExcelReport`, sin modificar inventario. |
| `BE-P08` | Sesión web | [`DIA-PAT-FRO-001`](../design-and-construction-patterns/04-catalog-visual-of-patterns-applied.md#pipeline-dto-y-políticas-declarativas) | Autenticación, JWT/cookies, cierre o redirección en la frontera web. |

### Cobertura de casos backend

La comparación con el catálogo y la matriz técnica confirma que cada identificador
aparece una vez, conserva su referencia de patrones y contiene un bloque Mermaid.

| Grupo propietario | Rango cubierto | Diagramas | Estado |
| --- | --- | ---: | --- |
| Autenticación | `CU-AUT-01..02` | 2 | Completo |
| Identidad y acceso | `CU-IDA-01..09` | 9 | Completo |
| Almacén | `CU-ALM-01..15` | 15 | Completo |
| Catálogos | `CU-CAT-01..26` | 26 | Completo |
| Entradas | `CU-ENT-01..06` | 6 | Completo |
| Salidas | `CU-SAL-01..14` | 14 | Completo |
| **Total** | Seis grupos propietarios | **72** | **72 de 72** |

Los casos `CU-AUT-01` y `CU-AUT-02` se conservan aquí porque iniciar y cerrar sesión son
objetivos funcionales con código propio, no para repetir la autenticación dentro de cada
caso. La obligación transversal de autenticar y autorizar pertenece a requisitos
(`RN-001` y `RN-009`); las demás secuencias sólo muestran el middleware concreto cuando
afecta la lectura técnica de su entrada.

### Capítulos técnicos

- [Autenticación](authentication/index.md): casos `CU-AUT-*`.
- [Identidad y acceso](identity-access/index.md): casos `CU-IDA-*`.
- [Almacén y catálogos](catalogs/index.md): casos `CU-ALM-*` y `CU-CAT-*`.
- [Compras y entradas](purchases/index.md): casos `CU-ENT-*`.
- [Salidas](issues/index.md): casos `CU-SAL-*`.
- [Nota histórica sobre infraestructura de consultas y exportaciones](reports/index.md): los casos y diagramas están dentro de su grupo propietario.
