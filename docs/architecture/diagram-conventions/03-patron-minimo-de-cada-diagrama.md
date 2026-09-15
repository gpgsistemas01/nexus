# 3. Patrón mínimo de cada diagrama

Antes de crear otro diagrama se reutiliza una vista existente si responde la misma
pregunta. Si se necesita uno nuevo, debe quedar claro —en el título o texto inmediato—:

1. **pregunta y lector:** qué decisión ayuda a revisar y para quién;
2. **alcance:** sistema, contenedor, dominio, flujo, estado, datos o implementación;
3. **fuente de verdad:** decisión curada, router/import, esquema Prisma o requisito;
4. **semántica:** significado de nodos, flechas, estilos, estados y relaciones;
5. **nivel de detalle:** no mezclar contexto de negocio con clases, tablas o funciones;
6. **mantenimiento:** evento que obliga a editarlo o regenerarlo y comprobación
   aplicable.

Todo diagrama curado tiene un identificador estable registrado en el
[inventario de diagramas](../diagram-inventory.md). Los diagramas de un caso de uso usan
`DIA-REQ-CU-<identificador CU>`; las demás vistas usan
`DIA-<familia>-<tipo>-<número>`. El título indica su semántica (contexto, contenedores,
componentes, secuencia, actividad, estados, ER, navegación o flujo), porque `flowchart`
es sólo la sintaxis Mermaid y no convierte todas esas vistas en el mismo tipo.
Las colecciones canónicas que aplican código a todos los casos usan
`DIA-FE-CU-<grupo>-<secuencia>` o `DIA-BE-CU-<grupo>-<secuencia>`. La documentación
técnica enlaza esas vistas en vez de mantener una segunda secuencia por caso. El
segmento `TEC` se reserva para una vista complementaria que responda otra pregunta,
como un ciclo de estados, y no para duplicar el mismo recorrido por capas.
Cada recorrido contextual usa una secuencia para hacer visible el orden del código. Una
actividad `flowchart` se conserva sólo cuando existen decisiones que cambian el camino;
una vista de estados se agrega cuando el caso tiene un ciclo técnico relevante. No se
mantiene un `flowchart` lineal si comunica menos que la secuencia equivalente.
El detalle de una secuencia se incorpora de forma progresiva: primero se identifican
los participantes y el camino exitoso, después se añaden únicamente las validaciones,
alternativas, transacciones o efectos que cambian la interpretación del caso. Los
nombres de archivos van en participantes y los símbolos ejecutados en mensajes, no
en párrafos dentro de una sola etiqueta. Si para explicar una colaboración reutilizada hiciera falta
repetirla en varios casos, se enlaza su vista `DIA-PAT-*` y la secuencia del caso conserva
sólo la invocación y el resultado observable.
En cada colección, los diagramas asociados con `CU-*` siguen el orden secuencial del
catálogo dentro de cada grupo propietario. Cada consulta o reporte se coloca junto al
recurso funcional que lo origina tanto en requisitos como en las colecciones técnicas.
Si un caso necesita más de una vista, permanecen juntas, y las vistas transversales sin
caso se ubican después. En mensajes y etiquetas de
`sequenceDiagram` se evita el punto y coma, porque GitHub puede interpretarlo como un
separador de sentencias; se usa una coma o una oración nueva.

Las secuencias y actividades técnicas de frontend o backend que implementan casos de
uso se asocian con **un único `CU-*`**. No se permiten participantes alternativos con
“o”, comodines, URLs elípticas ni rangos de casos para convertir un flujo en plantilla.
Los elementos reutilizados se documentan como dependencias o componentes compartidos;
cuando dos casos necesitan vista dinámica, cada diagrama conserva nombres y decisiones
específicos de su implementación.

Cada colección de aplicación al código incluye un índice breve de patrones. El diagrama
de cada caso declara los códigos que aplica, pero esa línea funciona sólo como índice y
no como explicación de la construcción. La secuencia conserva el recorrido concreto:
participantes con archivos o símbolos ejecutables, mensajes con llamadas ordenadas y
datos de frontera, y notas sólo para límites que no caben en un mensaje. La explicación
reutilizable y su secuencia canónica permanecen en el catálogo de patrones. Así una
refactorización se revisa primero en `DIA-PAT-*` y sus implementaciones, y los casos
afectados se localizan por su línea **Patrones**, sin insertar participantes ficticios
ni presentar el resumen del patrón como evidencia suficiente.

En secuencias, `actor` se reserva para una persona, rol o sistema externo autónomo que
inicia o recibe una interacción. Navegador, EJS, router, controller, servicio y base de
datos son `participant`. Una secuencia técnica puede omitir al actor humano cuando su
límite empieza en HTTP y enlaza el `CU-*` que ya lo identifica; una secuencia de
experiencia completa sí debe mostrar el actor canónico del caso. No se cambia el actor
por «Usuario» si el requisito distingue Almacén de Administración.

Los participantes de las secuencias técnicas combinan la figura de Mermaid con una
etiqueta sólo cuando hace falta aportar semántica que la figura no posee. La figura
`control` identifica por sí sola el adaptador que recibe la interacción (controller HTTP
o frontera API que lo contiene), por lo que **no** repite el estereotipo
`«controller»`. `«object»` se reserva para un objeto JSON o una instancia de clase que
forme parte del modelo de dominio; no identifica archivos, módulos, servicios, vistas,
helpers ni funciones. Cuando un controller crea un DTO JSON que interviene en el
recorrido, la secuencia lo incorpora como participante `«object»`, nombra la variable
concreta y mantiene el archivo `src/dtos/` que prueba su construcción. Los demás
participantes ejecutables se identifican sólo por sus archivos y el símbolo exacto se
muestra en el mensaje que representa su ejecución.

La distinción visual combina los tipos de participante de Mermaid con la notación UML de
estereotipos. Un controller se declara como
`participant Controller@{ "type": "control" }` y su nombre de archivo basta en la
cabecera. Un objeto conserva la figura rectangular estándar de `participant` y muestra
`«object»`: en UML de secuencia el rectángulo con línea de vida representa una instancia,
y `object` no es un tipo nativo de Mermaid. No debe sustituirse por `entity`, que expresa
una entidad de dominio y no cualquier objeto o DTO. Tampoco se usa `actor` para simular
otra figura, pues representa una persona, rol o sistema externo autónomo. Así, la forma
aporta la diferencia visible cuando la notación la ofrece y el estereotipo se conserva
sólo para la clasificación que Mermaid no puede expresar directamente.

### Cómo leer las figuras y fragmentos de una secuencia

| Elemento | Representación | Significado en Nexus |
| --- | --- | --- |
| Actor | Figura humana declarada con `actor` | Persona, rol o sistema externo autónomo que inicia o recibe una interacción. |
| Controlador o frontera | Figura de control declarada con `@{ "type": "control" }` | Adaptador HTTP o frontera API. La figura reemplaza el estereotipo textual `«controller»`. |
| Objeto/DTO | Rectángulo de `participant`, etiqueta `«object»`, variable y archivo | Instancia concreta que transporta datos; el rectángulo es la figura UML de objeto en una secuencia. |
| Participante | Rectángulo de `participant` y ruta de archivo | Módulo, vista, servicio o helper propietario de las acciones enviadas a su línea de vida; no implica un objeto de dominio. |
| Base de datos | Figura `database` cuando se necesita distinguir persistencia | Almacén persistente externo al proceso. Si agrupa Prisma/PostgreSQL, los mensajes aclaran la operación. |
| Línea de vida | Línea vertical discontinua bajo cada cabecera | Existencia del participante en el intervalo representado, leído de arriba hacia abajo. |
| Activación | Barra vertical entre `activate` y `deactivate` | Periodo en que un participante controla la colaboración; no expresa duración real. |
| Mensaje síncrono | Flecha continua `->>` | Llamada o interacción cuyo orden importa. El texto nombra la acción, firma o datos de frontera. |
| Respuesta | Flecha discontinua `-->>` | Resultado, estado HTTP, payload o error observable. |
| Auto-mensaje | Flecha que vuelve al mismo participante | Validación o regla dentro del mismo archivo, sin inventar otro componente. |
| `alt` / `else` | Fragmento combinado con ramas | Caminos mutuamente excluyentes elegidos por una condición. |
| `opt` | Fragmento combinado de una rama | Comportamiento opcional que sólo ocurre si se cumple su guarda. |
| `loop` | Fragmento combinado repetitivo | Repetición cuya condición o colección debe aparecer en la guarda. |
| `par` | Fragmento combinado paralelo | Interacciones independientes; no se usa para acciones esperadas en serie. |
| `break` / `critical` | Interrupción o región crítica | Terminación anticipada o sección que no debe intercalarse; sólo si el código posee esa semántica. |
| `rect` | Fondo que agrupa mensajes | Límite visual, por ejemplo una transacción; solo no crea participante, fragmento UML ni atomicidad. |
| `Note` | Nota anclada a participantes | Aclaración de variables, guardas o límites; no representa ejecución. |

Un **componente** de la secuencia es uno de sus participantes ejecutables; su cabecera
identifica la responsabilidad y su línea de vida recibe mensajes. Un **fragmento**
organiza mensajes (`alt`, `opt`, `loop`, `par`, `break` o `critical`) y no es un
componente. El marco completo fija el intervalo y el alcance del caso. Los tipos
`boundary`, `entity`, `collections` y `queue` de Mermaid sólo se usan si el elemento real
tiene, respectivamente, semántica de frontera, entidad, colección o cola; no decoran
módulos ordinarios.

### Cómo leer las figuras de los demás diagramas

| Tipo de vista | Figuras y componentes | Relaciones y fragmentos |
| --- | --- | --- |
| Contexto/contenedores | Rectángulos para personas, Nexus, procesos o contenedores; subgrafos para límites de ejecución. | Flecha continua: comunicación. Línea discontinua: dependencia propuesta, indirecta o de configuración según la leyenda local. |
| Componentes | Rectángulo `class` con `<<component>>` para una unidad sustituible y subgrafo para una capa o dominio. | Flecha: dependencia dirigida, no secuencia temporal. Mermaid aproxima UML y no expresa puertos o interfaces formales. |
| Casos de uso | Nodo externo `«actor»`, nodo de objetivo y subgrafo como límite de Nexus o agrupación funcional. | Línea sin texto: asociación; `«include»`/`«extend»`: relaciones UML; generalización: herencia de participación. |
| Actividad/flujo | Rectángulo: acción; rombo: decisión; círculo: inicio/fin cuando esté declarado; subgrafo: fase o responsable. | Flecha: orden y guarda; toda rama debe rotular su condición. |
| Estados | Estado inicial/final y rectángulos redondeados para estados observables; estado compuesto si agrupa un ciclo real. | Flecha: transición causada por evento o condición, no llamada de código. |
| Clases/dominio | Clase o concepto con compartimentos; rombo lleno para composición. | Línea: asociación; punta: dirección; multiplicidades: cantidad de instancias relacionadas. |
| Entidad-relación | Rectángulo: entidad/tabla con atributos; `PK`, `FK` y `UK` califican columnas. | Pata de cuervo y barra/círculo: cardinalidad y obligatoriedad; no representan flujo. |
| Despliegue | Subgrafo: entorno o nodo; rectángulo: proceso, servicio o artefacto; cilindro: almacén. | Flecha: canal de comunicación; línea discontinua: topología objetivo si la leyenda lo declara. |
| Navegación | Rectángulo: pantalla/destino; estado: condición de sesión en `stateDiagram-v2`. | Flecha: navegación permitida o transición de acceso, no import ni invocación interna. |
| Dependencias/trazabilidad | Rectángulo: artefacto, área o evidencia; otra forma sólo si la leyenda le asigna semántica. | Flecha: import, dependencia o evidencia exactamente según el título y la leyenda local. |

Esta tabla define el vocabulario común, pero cada vista conserva una explicación inmediata
de su alcance y de cualquier color, línea o figura adicional. No se intercambian figuras
entre tipos sólo por semejanza visual: un cilindro no representa un servicio, un rombo no
es una actividad y una flecha de estados no equivale a una llamada.

Para que una secuencia sea detallada sin mezclar niveles, se aplican estas reglas:

- cada alias de participante representa una responsabilidad estable y su etiqueta nombra
  el archivo u objeto concreto del caso, no una función, endpoint ni oración sobre el
  resultado;
- los mensajes nombran una acción concreta y mantienen el orden comprobable;
- las llamadas se escriben como `objeto.metodo(variable)` o `funcion(variable)`, no como
  una descripción sin firma; cuando un participante agrupa ruta y controller, su etiqueta
  nombra ambos archivos y el mensaje nombra el símbolo del controller;
- las variables de frontera que condicionan la llamada (`id`, `detailId`, payload,
  filtros, DTO o `tx`) se nombran en el diagrama; los temporales internos que no cambian
  la colaboración se consultan en el código enlazado;
- `alt`/`opt` se usa sólo para una decisión que cambia el recorrido y `rect` sólo para
  señalar un límite relevante, como una transacción;
- las respuestas discontinuas muestran resultados o errores observables, no repiten la
  llamada anterior;
- una vista que exceda aproximadamente siete participantes se divide por responsabilidad
  o se complementa con una vista estructural, en lugar de reducir su legibilidad;
- el detalle mecánico que no altera coordinación permanece en texto, tablas o código.

Los identificadores Mermaid deben ser estables y descriptivos (`apiRoutes`,
`goodsIssues`), mientras la etiqueta puede estar en español.

#### Nomenclatura verificable de participantes

En las colecciones `DIA-BE-CU-*` y `DIA-FE-CU-*`, cada `participant` que representa
código del repositorio muestra la ruta completa `src/.../<archivo>.js` o `.ejs`. La ruta
conserva exactamente el `camelCase`, directorio y sufijo de capa presentes en el código
(`ApiRoute`, `Controller`, `Service`, `DTO`, `UI`, etc.); no se reemplaza con traducciones
como “Servicio de inventario” o con el nombre aislado de una función. Si una
responsabilidad requiere dos archivos, ambos se enumeran en la misma etiqueta sólo
cuando actúan como un único participante y el mensaje permite reconocer qué símbolo se
ejecuta.

Los alias Mermaid usan `PascalCase` descriptivo (`Controller`, `Inventory`, `Request`) y
son identificadores locales del diagrama, no nombres nuevos del código. `actor` conserva
el rol humano canónico. Los límites externos que no corresponden a un archivo del
repositorio —`Navegador`, `Cliente HTTP / web`, `Prisma / PostgreSQL` y la respuesta de
Express— pueden mostrarse sin ruta; no deben usarse para ocultar un módulo interno.
`npm run docs:check` valida que cada ruta declarada exista y que ningún otro participante
interno quede identificado sólo por una etiqueta genérica.

Los mensajes entre participantes internos nombran el símbolo ejecutado con su firma
observable y las variables que cruzan la llamada, por ejemplo
`loginUser({ name, password })` o `editMaterialStockRequest({ data: formData, id })`.
Las escrituras muestran `tx` cuando se propaga y las respuestas nombran el resultado o
error observable. No se inventa una función para describir una regla interna: si la regla
no tiene símbolo propio, se expresa como una auto-llamada del archivo propietario con los
datos que evalúa. Los mensajes iniciados por un actor o dirigidos a un límite externo
pueden conservar lenguaje de interacción, pero no sustituyen las llamadas ejecutables.
Cada secuencia contiene al menos dos firmas de código comprobables; `npm run docs:check`
rechaza recorridos compuestos únicamente por descripciones genéricas.

La orientación se conserva por tipo: `LR` para recorridos y dependencias, `TB` para capas
o descomposición. Los subgrafos representan un límite real y no se usan sólo como
decoración.

### Organización por Viewpoint/View y revelado progresivo

La familia de arquitectura aplica un patrón documental **Viewpoint/View**: cada punto de
vista fija pregunta, lectores y reglas de representación; cada vista responde esa
pregunta para Nexus. Se combina con revelado progresivo para navegar de lo general a lo
particular sin producir un diagrama único e ilegible:

1. **contexto:** actores, Nexus y sistemas externos;
2. **contenedores y despliegue:** lugares de ejecución y comunicación;
3. **estructura interna:** superficie HTTP, dominios, capas y componentes;
4. **dinámica:** petición representativa y coordinaciones complejas;
5. **reutilización:** fábricas, composición y componentes compartidos;
6. **detalle mecánico:** rutas, imports y modelos en artefactos generados.

No es un patrón GoF ni altera el código. Organiza vistas y hace visibles patrones que sí
existen en la implementación: monolito modular, capas, pipeline de middleware, DTO,
Transaction Script, fábricas configurables, composición y publicación de eventos. La
vista canónica de cada nivel se enlaza en vez de copiarse, aplicando una única fuente de
verdad documental.
