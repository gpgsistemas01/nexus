# Inventario de notación UML

La revisión de las vistas vigentes evita llamar UML a cualquier bloque Mermaid. No
faltan diagramas para describir el alcance actual, pero sí es necesario distinguir los
que usan notación UML de los que sólo adoptan una semántica parecida:

| Vista | Clasificación vigente | ¿Falta notación UML? |
| --- | --- | --- |
| Modelo conceptual del dominio | UML de clases (`classDiagram`), con multiplicidades, asociaciones y composiciones. | No. |
| Componentes de la aplicación | Aproximación UML de componentes mediante clases con el estereotipo `<<component>>`; Mermaid no ofrece un diagrama de componentes nativo. | Parcial; migrar a una herramienta UML sólo si se necesitan puertos e interfaces formales. |
| Recorrido de una interacción | UML de secuencia (`sequenceDiagram`), con actor, participantes y mensajes. | No. |
| Estados de acceso y estados de las salidas | UML de máquina de estados (`stateDiagram-v2`). | No. |
| Casos de uso | Aproximación UML mediante `flowchart`: clasificadores externos con estereotipo `«actor»`, grupos funcionales dentro del límite de Nexus, objetivos y asociaciones. Los grupos son ayudas visuales, no paquetes UML. | Parcial; Mermaid no ofrece casos de uso UML nativos. |
| Despliegue actual y objetivo | Grafo inspirado en despliegue UML; sus subgrafos representan entornos y nodos, pero no artefactos UML formales. | Parcial; la semántica actual es suficiente mientras no se documenten artefactos instalados. |
| Contexto, contenedores, capas, navegación, requisitos, trazabilidad y ciclo CRUD | C4 inspirado o grafos dirigidos con semántica local. | No aplica: convertirlos a UML cambiaría la pregunta que responden. |
| Esquema persistente | Entidad-relación (`erDiagram`), no UML. | No aplica: Prisma y las migraciones son la fuente técnica adecuada. |

Por tanto, las únicas brechas de notación son **componentes, casos de uso y
despliegue**, y están declaradas como aproximaciones deliberadas. No se agrega otro
diagrama que duplique su contenido sólo para obtener una etiqueta UML. Si una entrega
contractual exige UML estricto, esas tres vistas deben migrarse juntas a una herramienta
que soporte la notación y conservar los mismos límites y fuentes de verdad.

### Decisión sobre los diagramas de componentes

Se conserva `DIA-ARQ-CMP-001` porque responde la pregunta estructural de arquitectura:
qué componentes principales existen y de cuáles dependen. Las vistas de patrones y las
vistas técnicas aplicadas de backend y frontend descienden después a los elementos que
participan en cada recorrido sin duplicar ese diagrama estructural.

No se necesita un diagrama de componentes por `CU-*`. Cada caso referencia los patrones
aplicados y utiliza su diagrama canónico frontend o backend para mostrar la ruta concreta
hacia la implementación. Se añadirá otra vista de componentes únicamente si aparece
una frontera estable que ninguna vista vigente pueda localizar; agregar
otra por cantidad de casos o por repetir imports produciría documentación duplicada.

### Enlaces entre diagramas y patrones

UML permite expresar dependencias, notas y estereotipos entre elementos de una misma
vista, pero no define que un diagrama se incruste dentro de otro. En Nexus tampoco se
usan enlaces `click` dentro de Mermaid: no funcionan de manera uniforme en GitHub, en
los paquetes exportados ni en todos los renderizadores. Por ello, la relación entre una
vista aplicada y su patrón se documenta como metadato Markdown inmediatamente antes del
bloque, mediante **Identificador**, **Pregunta** y **Patrones**.

Los códigos `DIA-PAT-*` de **Patrones** apuntan conceptualmente al
[catálogo visual de patrones aplicados](../design-and-construction-patterns/04-catalogo-visual-de-patrones-aplicados.md#catálogo-visual-de-patrones-aplicados),
y la matriz técnica enlaza el `DIA-FE-CU-*` o `DIA-BE-CU-*` concreto. Dentro del bloque
se muestran únicamente los participantes, relaciones o mensajes que prueban la
aplicación del patrón; no se agrega un nodo que represente a otro diagrama. Esta forma
conserva navegación, legibilidad y compatibilidad sin confundir una referencia
documental con una relación del modelo.

La relación se resuelve en dos saltos verificables: la línea **Patrones** del caso usa
un código local `FE-P*` o `BE-P*`; el índice rápido de su colección traduce ese código
a una vista estable `DIA-PAT-*` y enlaza su ubicación canónica. El código local expresa
cómo se manifiesta el patrón en esa perspectiva, mientras `DIA-PAT-*` conserva una sola
explicación y representación del patrón compartido. Si un patrón no tiene evidencia
suficiente para una vista canónica, no se incorpora al índice aplicado.

Esta es una convención documental de Nexus, no una sintaxis exigida por UML o por una
norma ISO. La aplicación selectiva de ISO/IEC/IEEE 42010 justifica declarar relaciones
entre vistas y mantener correspondencias trazables; ISO/IEC/IEEE 1016 ayuda a relacionar
elementos, interfaces, vistas y justificación del diseño. Ninguna de las dos prescribe
Mermaid, el campo **Patrones**, los códigos `DIA-PAT-*` ni enlaces entre bloques. Esos
mecanismos locales implementan la trazabilidad sin afirmar conformidad formal.

### Simetría de detalle entre secuencias frontend y backend

Las dos colecciones tienen el mismo **nivel de evidencia**, pero no necesitan el mismo
número de participantes ni mensajes. Ambas deben identificar archivos reales, variables
de frontera, al menos dos firmas comprobables y un recorrido ordenado con un mínimo de
siete mensajes. `npm run docs:check` aplica ese piso común a frontend y backend.

Esto no significa que el frontend deba copiar el detalle interno del backend. La revisión
busca una profundidad equivalente dentro de los límites de cada perspectiva:

| Evidencia revisada | Frontend | Backend |
| --- | --- | --- |
| Inicio del recorrido | Evento de navegador, vista o módulo UI. | Petición HTTP y ruta registrada. |
| Coordinación propia | Validación visual, aplicación, servicio de request y cliente HTTP, cada uno con su archivo. | Middleware, controller/DTO y servicio de dominio. |
| Frontera compartida | Método, endpoint, payload o parámetros enviados. | Método, endpoint y datos recibidos desde `req`. |
| Resultado | Respuesta normalizada, error y efecto visible. | Persistencia o efecto, respuesta HTTP y propagación de error. |

Una fila ausente indica una brecha de detalle en su perspectiva; que sólo aparezca en la
otra colección no obliga a duplicarla. Por ejemplo, una transacción pertenece al backend
y el cambio de modo de un formulario pertenece al frontend.

El contenido se detiene en la responsabilidad de cada perspectiva:

- frontend muestra interacción, recolección o validación, aplicación, servicio HTTP,
  respuesta o error normalizado y efecto visible;
- backend muestra ruta y middleware, controller/DTO, servicio, persistencia o efecto,
  respuesta HTTP y propagación del error;
- una coordinación especializada se agrega sólo donde realmente ocurre. El frontend no
  reproduce transacciones o consultas internas del servidor, y el backend no simula
  estados visuales del navegador para igualar artificialmente el tamaño del diagrama.

Por tanto, la paridad se evalúa por trazabilidad y resultado observable, no por igualdad
gráfica. Si un flujo frontend contiene una factory, un adaptador, validación especializada
o coordinación de UI relevante, esos participantes sí se muestran; los temporales
mecánicos permanecen en el código igual que en backend.
