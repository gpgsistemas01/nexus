# Diagramas de secuencia del código backend

Cada `CU-*` muestra la ejecución del servidor desde la interacción de entrada hasta la
respuesta y sus efectos. El objetivo y el flujo de negocio permanecen en los
[casos de uso](../../../../requirements/domain-and-use-cases/03-current-use-cases.md).
Esta colección es la evidencia detallada caso–código; la documentación técnica conserva
responsabilidades y decisiones reutilizables sin mantener una segunda matriz equivalente.

| Aspecto | Contenido de la secuencia backend |
| --- | --- |
| Inicio | Navegador o cliente HTTP, método, ruta registrada y parámetros. |
| Recorrido | Ruta → middleware relevante → controller/DTO → servicio → persistencia o efecto. |
| Validación | Validator y middleware cuando modifican una alternativa del caso; el DTO sólo normaliza datos aceptados. |
| Transacción | Límites y propagación de `tx` únicamente cuando participan en el flujo. |
| Respuesta | Tipo real, resultado HTTP y propagación del error. |
| Participantes | Archivo concreto de cada responsabilidad; se omiten variables y temporales mecánicos. |

El pipeline común se explica en `DIA-PAT-FRO-001`. Cada secuencia incorpora sólo los middleware y
colaboradores que cambian o prueban el recorrido del caso.

### Relación con la documentación técnica

Esta colección es la fuente canónica del recorrido ruta → controller → servicio → persistencia o
efecto. Los [diagramas técnicos complementarios](../../development/backend-technical-documentation/02-views-technical-applied.md#relación-con-la-colección-canónica)
sólo complementan decisiones, transacciones o coordinaciones que requieren otra representación.

### Regla de identificación y lectura

| Elemento | Convención |
| --- | --- |
| Encabezado | `CU-<grupo>-<número> — <nombre>` |
| Diagrama | `DIA-BE-CU-<grupo>-<número>` |
| Contenido propio | Patrones, participantes, llamadas, datos de frontera, decisiones y efectos. |
| Contenido referenciado | Objetivo, actor, reglas y flujo normativo del caso de uso. |

## Índice rápido de patrones por caso

Cada caso conserva una línea **Patrones** con códigos de este índice y enlaza el
[catálogo canónico](../../development/design-and-construction-patterns/03-summary-of-patterns-confirmed.md#3-resumen-de-patrones-confirmados).
La referencia identifica las soluciones aplicadas sin repetirlas dentro de Mermaid. La
implementación se reconoce directamente por las rutas `src/...`, símbolos y llamadas
del recorrido concreto.

| Código | Patrón aplicado | Vista canónica | Elementos que permiten reconocerlo |
| --- | --- | --- | --- |
| `BE-P01` | Capas, pipeline y DTO funcional | [`DIA-PAT-FRO-001`](../../development/design-and-construction-patterns/04-catalog-visual-of-patterns-applied.md#pipeline-dto-y-políticas-declarativas) | Ruta/middleware → controller/DTO → servicio → Prisma; el DTO sólo aparece cuando hay entrada. |
| `BE-P02` | Factory de catálogo | [`DIA-PAT-CON-001`](../../development/design-and-construction-patterns/04-catalog-visual-of-patterns-applied.md#factories-y-composición-sobre-herencia) | `createDataTableListController` parametriza consulta, columnas y orden. |
| `BE-P03` | Transaction Script y `tx` explícito | [`DIA-PAT-DIN-001`](../../development/design-and-construction-patterns/04-catalog-visual-of-patterns-applied.md#transacción-eventos-y-auditoría) | El servicio propietario abre `$transaction` y propaga `tx` a las escrituras relacionadas. |
| `BE-P04` | Composición de servicios | [`DIA-PAT-DIN-001`](../../development/design-and-construction-patterns/04-catalog-visual-of-patterns-applied.md#transacción-eventos-y-auditoría) | El servicio del caso coordina reglas, referencias, inventario o cumplimiento reutilizados. |
| `BE-P05` | Publicación posterior al commit | [`DIA-PAT-DIN-001`](../../development/design-and-construction-patterns/04-catalog-visual-of-patterns-applied.md#transacción-eventos-y-auditoría) | El controller llama `emitInventoryUpdated` después del resultado del servicio. |
| `BE-P06` | Query Service | [`DIA-PAT-EST-001`](../../development/design-and-construction-patterns/04-catalog-visual-of-patterns-applied.md#estructura-por-dominio-capas-y-fronteras) | Controller de listado + consulta contextual de sólo lectura. |
| `BE-P07` | Composición de reporte | [`DIA-PAT-CON-001`](../../development/design-and-construction-patterns/04-catalog-visual-of-patterns-applied.md#factories-y-composición-sobre-herencia) | Consulta de dominio + `sendExcelReport`, sin modificar inventario. |
| `BE-P08` | Sesión web | [`DIA-PAT-FRO-001`](../../development/design-and-construction-patterns/04-catalog-visual-of-patterns-applied.md#pipeline-dto-y-políticas-declarativas) | Autenticación, JWT/cookies, cierre o redirección en la frontera web. |

### Cobertura de casos backend

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
