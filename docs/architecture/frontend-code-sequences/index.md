# Diagramas de secuencia del código frontend

Esta colección **no es un catálogo de diagramas de casos de uso**. Es la lectura técnica
complementaria del catálogo funcional: cada `CU-*` aporta trazabilidad, mientras Mermaid
muestra la ejecución entre vista/UI, aplicación, request y endpoint. Para entender el
objetivo y la interacción con lenguaje de negocio se consulta primero el [modelo y los
diagramas funcionales de casos de uso](../../requirements/domain-and-use-cases/03-casos-de-uso-vigentes.md).

La [matriz técnica de frontend](../frontend-technical-documentation/05-aplicacion-de-todos-los-casos-al-codigo-frontend.md)
es el índice único de trazabilidad: relaciona caso, interacción, implementación y
diagrama. Esta colección no vuelve a copiar esa relación en cada sección. Los
participantes identifican su archivo concreto. Los métodos, requests y endpoints se
indican en los mensajes que ejecutan cada proceso para no repetirlos en las entidades.
La figura `control` marca la frontera API y el controller backend que recibe cada request,
sin repetir el estereotipo textual de controlador ni abrir otra línea de vida. Los módulos UI, de aplicación y request no reciben
`«object»`: ese estereotipo se reserva para un objeto JSON o una instancia de clase
representada como parte del dominio. Así, la vista mantiene separadas las
responsabilidades de navegador, UI, aplicación, servicio de request, cliente HTTP y
frontera API/controller. Cada archivo frontend que interviene en el recorrido aparece en
su participante correspondiente; sólo se omiten auxiliares que no reciben mensajes en la
secuencia. Los mensajes conservan métodos y requests en orden y
las notas nombran los datos de frontera
(`id`, `detailId`, `formData`/payload, parámetros y filtros). Todos los recorridos
explicitan recolección/validación de entrada, request, respuesta exitosa, error normalizado
y efecto visible; las coordinaciones complejas añaden sus módulos especializados.
Los temporales mecánicos
permanecen en el código. Cada caso mantiene una secuencia específica aunque reutilice
una factory o componente, porque cambian módulos, firmas, rutas, datos o efectos.
Su detalle se evalúa con la
[regla de simetría entre frontend y backend](../diagram-conventions/06-inventario-de-notacion-uml.md#simetría-de-detalle-entre-secuencias-frontend-y-backend):
debe aportar el mismo nivel de evidencia, sin copiar middleware, transacciones ni
persistencia que pertenecen a la perspectiva del servidor.

### Relación con la documentación técnica

Esta colección es la **fuente canónica del recorrido secuencial por caso**: si cambia la
cadena interacción → UI → aplicación → request → endpoint → resultado visible, se
actualiza en el capítulo funcional correspondiente. La [documentación técnica del frontend](../frontend-technical-documentation/07-vistas-tecnicas-aplicadas-por-flujo-frontend.md#relación-entre-la-colección-canónica-y-las-vistas-adicionales)
explica las responsabilidades del navegador, mantiene la matriz de trazabilidad y sólo
conserva otra vista cuando responde una pregunta distinta, como decisiones de una
actividad o modos de un formulario. La vista adicional enlaza el `DIA-FE-CU-*`
correspondiente y no repite su secuencia.

### Regla de identificación y lectura

El encabezado `CU-<grupo>-<número> — <nombre>` conserva el identificador y el nombre
normativos de la ficha funcional. El identificador enlaza la trazabilidad; el nombre permite
reconocer el objetivo sin interpretar solamente el código. El diagrama de esa sección se identifica de forma determinista como
`DIA-FE-CU-<grupo>-<número>`; por ejemplo, la sección `CU-ENT-02` contiene
`DIA-FE-CU-ENT-02`. La matriz técnica mantiene el enlace navegable y la evidencia de
código. Aquí se conserva solamente la información propia de la vista: patrones,
participantes, eventos, payload, requests y resultado visible. El objetivo, actor y
flujo de negocio no se repiten porque pertenecen a la ficha del caso de uso.

## Índice rápido de patrones por caso

Cada caso conserva una línea **Patrones** con códigos de este índice y enlaza el
[catálogo canónico](../design-and-construction-patterns/03-resumen-de-patrones-confirmados.md#3-resumen-de-patrones-confirmados).
La referencia identifica las soluciones aplicadas sin repetirlas dentro de Mermaid. La
implementación se reconoce directamente por las rutas `src/...`, símbolos y llamadas
del recorrido concreto.

| Código | Patrón aplicado | Vista canónica | Elementos que permiten reconocerlo |
| --- | --- | --- | --- |
| `FE-P01` | Capas del navegador | [`DIA-PAT-EST-001`](../design-and-construction-patterns/04-catalogo-visual-de-patrones-aplicados.md#estructura-por-dominio-capas-y-fronteras) | Página/UI → aplicación → servicio HTTP → endpoint. |
| `FE-P02` | Factory CRUD | [`DIA-PAT-CON-001`](../design-and-construction-patterns/04-catalogo-visual-de-patrones-aplicados.md#factories-y-composición-sobre-herencia) | `createCrudApplication` configurada con requests y claves del recurso. |
| `FE-P03` | Factory/adaptador de catálogo | [`DIA-PAT-CON-001`](../design-and-construction-patterns/04-catalogo-visual-de-patrones-aplicados.md#factories-y-composición-sobre-herencia) | `createApplicationList` + request y transformación de opciones. |
| `FE-P04` | Mutación por composición | [`DIA-PAT-CON-001`](../design-and-construction-patterns/04-catalogo-visual-de-patrones-aplicados.md#factories-y-composición-sobre-herencia) | Operación adicional incorporada al CRUD sin herencia. |
| `FE-P05` | Composición de salidas | [`DIA-PAT-CON-001`](../design-and-construction-patterns/04-catalogo-visual-de-patrones-aplicados.md#factories-y-composición-sobre-herencia) | `createIssueApplication` configurada para material o merma. |
| `FE-P06` | UI de devolución compartida | [`DIA-PAT-EST-001`](../design-and-construction-patterns/04-catalogo-visual-de-patrones-aplicados.md#estructura-por-dominio-capas-y-fronteras) | `issueReturnUI` parametrizada por el contexto de la salida. |
| `FE-P07` | Consulta tabular | [`DIA-PAT-EST-001`](../design-and-construction-patterns/04-catalogo-visual-de-patrones-aplicados.md#estructura-por-dominio-capas-y-fronteras) | DataTable + filtros + aplicación de lectura contextual. |
| `FE-P08` | Factory de reporte | [`DIA-PAT-CON-001`](../design-and-construction-patterns/04-catalogo-visual-de-patrones-aplicados.md#factories-y-composición-sobre-herencia) | `createReportApplication` + `buildExcelButton` y request de descarga. |
| `FE-P09` | Navegación compuesta | [`DIA-PAT-EST-001`](../design-and-construction-patterns/04-catalogo-visual-de-patrones-aplicados.md#estructura-por-dominio-capas-y-fronteras) | Formulario o layout común coordina navegación/sesión sin duplicar el endpoint. |

### Cobertura de casos frontend

La comparación con el catálogo y la matriz técnica confirma que cada identificador
aparece una vez, conserva su referencia de patrones y contiene un bloque Mermaid.

| Grupo propietario | Rango cubierto | Diagramas | Estado |
| --- | --- | ---: | --- |
| Autenticación | `CU-AUT-01..02` | 2 | Completo |
| Identidad y acceso | `CU-IDA-01..11` | 11 | Completo |
| Catálogos | `CU-CAT-01..48` | 48 | Completo |
| Entradas | `CU-ENT-01..06` | 6 | Completo |
| Salidas | `CU-SAL-01..14` | 14 | Completo |
| **Total** | Cinco grupos propietarios | **81** | **81 de 81** |

### Capítulos técnicos

- [Autenticación](authentication/index.md): casos `CU-AUT-*`.
- [Identidad y acceso](identity-access/index.md): casos `CU-IDA-*`.
- [Catálogos e inventario](catalogs/index.md): casos `CU-CAT-*`.
- [Compras y entradas](purchases/index.md): casos `CU-ENT-*`.
- [Salidas](issues/index.md): casos `CU-SAL-*`.
- [Nota histórica sobre infraestructura de consultas y exportaciones](reports/index.md): los casos y diagramas están dentro de su grupo propietario.
