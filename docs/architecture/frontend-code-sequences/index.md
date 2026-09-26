# Diagramas de secuencia del código frontend

Esta colección **no es un catálogo de diagramas de casos de uso**. Es la lectura técnica
complementaria del catálogo funcional: cada `CU-*` aporta trazabilidad, mientras Mermaid
muestra la ejecución entre vista/UI, aplicación, request y endpoint. Para entender el
objetivo y la interacción con lenguaje de negocio se consulta primero el [modelo y los
diagramas funcionales de casos de uso](../../requirements/domain-and-use-cases/03-cases-of-use-current.md).

La [matriz técnica de frontend](../frontend-technical-documentation/05-application-of-all-the-cases-to-the-code-frontend.md)
es el índice único de trazabilidad: relaciona caso, interacción, implementación y
diagrama. Esta colección no vuelve a copiar esa relación en cada sección. Los
participantes identifican su archivo concreto. Los métodos, requests y endpoints se
indican en los mensajes que ejecutan cada proceso para no repetirlos en las entidades.
La figura `control` marca la frontera API y el controller backend que recibe cada request,
sin repetir el estereotipo textual de controlador ni abrir otra línea de vida. Los
módulos UI, de aplicación y request no se presentan como objetos: cuando una instancia
necesita línea de vida se usa la figura de participante y el nombre subrayado
`instancia: Tipo`, no un estereotipo aislado. Así, la vista mantiene separadas las
responsabilidades de navegador, UI, aplicación, servicio de request, cliente HTTP y
frontera API/controller. Cada archivo frontend que interviene en el recorrido aparece en
su participante correspondiente; sólo se omiten auxiliares que no reciben mensajes en la
secuencia. Los mensajes conservan métodos, requests y parámetros relevantes en orden
(`id`, `detailId`, `formData`/payload, parámetros y filtros) para hacer visible el
contrato entre participantes. Esos parámetros no se convierten en líneas de vida ni se
enumeran en una nota separada. Todos los recorridos explicitan recolección y validación
de entrada en el módulo frontend que realmente la ejecuta, request, respuesta exitosa, error normalizado
y efecto visible; las coordinaciones complejas añaden sus módulos especializados.
Cada secuencia comienza además con la figura visual `actor` del iniciador canónico del
caso y conserva **Navegador** como participante técnico separado. Cuando el Administrador
hereda una capacidad del Personal de almacén, se muestra el actor operativo primario y
no una etiqueta compuesta con “o”; los casos exclusivos de Sistemas muestran al
Administrador. Esta figura enlaza el objetivo funcional con su realización sin repetir
las precondiciones ni el flujo narrativo de la ficha.
Los temporales mecánicos
permanecen en el código. Cada caso mantiene una secuencia específica aunque reutilice
una factory o componente, porque cambian módulos, firmas, rutas, datos o efectos.
Su detalle se evalúa con la
[regla de simetría entre frontend y backend](../diagram-conventions/06-inventory-of-notation-uml.md#simetría-de-detalle-entre-secuencias-frontend-y-backend):
debe aportar el mismo nivel de evidencia, sin copiar middleware, transacciones ni
persistencia que pertenecen a la perspectiva del servidor.

La validación frontend representa retroalimentación inmediata y evita requests
innecesarios, pero no es un control de seguridad. Cuando cambia el recorrido se muestra
como auto-mensaje (`validateFields`, `checkValidity` u otra función real) y una rama que
conserva el formulario ante el error. La validación autoritativa se vuelve a ejecutar en
el backend mediante middleware; no se atribuye al controller ni al DTO.

### Relación con la documentación técnica

Esta colección es la **fuente canónica del recorrido secuencial por caso**: si cambia la
cadena interacción → UI → aplicación → request → endpoint → resultado visible, se
actualiza en el capítulo funcional correspondiente. La [documentación técnica del frontend](../frontend-technical-documentation/07-views-technical-applied-by-flow-frontend.md#relación-entre-la-colección-canónica-y-las-vistas-adicionales)
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
participantes, eventos, payload, requests y resultado visible. La figura del actor y el
mensaje de inicio identifican quién dispara el objetivo; sus responsabilidades, reglas y
flujo de negocio no se repiten porque pertenecen a la ficha del caso de uso.

## Índice rápido de patrones por caso

Cada caso conserva una línea **Patrones** con códigos de este índice y enlaza el
[catálogo canónico](../design-and-construction-patterns/03-summary-of-patterns-confirmed.md#3-resumen-de-patrones-confirmados).
La referencia identifica las soluciones aplicadas sin repetirlas dentro de Mermaid. La
implementación se reconoce directamente por las rutas `src/...`, símbolos y llamadas
del recorrido concreto.

| Código | Patrón aplicado | Vista canónica | Elementos que permiten reconocerlo |
| --- | --- | --- | --- |
| `FE-P01` | Capas del navegador | [`DIA-PAT-EST-001`](../design-and-construction-patterns/04-catalog-visual-of-patterns-applied.md#estructura-por-dominio-capas-y-fronteras) | Página/UI → aplicación → servicio HTTP → endpoint. |
| `FE-P02` | Factory CRUD | [`DIA-PAT-CON-001`](../design-and-construction-patterns/04-catalog-visual-of-patterns-applied.md#factories-y-composición-sobre-herencia) | `createCrudApplication` configurada con requests y claves del recurso. |
| `FE-P03` | Factory/adaptador de catálogo | [`DIA-PAT-CON-001`](../design-and-construction-patterns/04-catalog-visual-of-patterns-applied.md#factories-y-composición-sobre-herencia) | `createApplicationList` + request y transformación de opciones. |
| `FE-P04` | Mutación por composición | [`DIA-PAT-CON-001`](../design-and-construction-patterns/04-catalog-visual-of-patterns-applied.md#factories-y-composición-sobre-herencia) | Operación adicional incorporada al CRUD sin herencia. |
| `FE-P05` | Composición de salidas | [`DIA-PAT-CON-001`](../design-and-construction-patterns/04-catalog-visual-of-patterns-applied.md#factories-y-composición-sobre-herencia) | `createIssueApplication` configurada para material o merma. |
| `FE-P06` | UI de devolución compartida | [`DIA-PAT-EST-001`](../design-and-construction-patterns/04-catalog-visual-of-patterns-applied.md#estructura-por-dominio-capas-y-fronteras) | `issueReturnUI` parametrizada por el contexto de la salida. |
| `FE-P07` | Consulta tabular | [`DIA-PAT-EST-001`](../design-and-construction-patterns/04-catalog-visual-of-patterns-applied.md#estructura-por-dominio-capas-y-fronteras) | DataTable + filtros + aplicación de lectura contextual. |
| `FE-P08` | Factory de reporte | [`DIA-PAT-CON-001`](../design-and-construction-patterns/04-catalog-visual-of-patterns-applied.md#factories-y-composición-sobre-herencia) | `createReportApplication` + `buildExcelButton` y request de descarga. |
| `FE-P09` | Navegación compuesta | [`DIA-PAT-EST-001`](../design-and-construction-patterns/04-catalog-visual-of-patterns-applied.md#estructura-por-dominio-capas-y-fronteras) | Formulario o layout común coordina navegación/sesión sin duplicar el endpoint. |

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
- [Nota histórica sobre infraestructura de consultas y exportaciones](reports/index.md): los casos y diagramas están dentro de su grupo propietario.
