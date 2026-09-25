# Descripciones de casos de uso

## Propósito y alcance

Este catálogo desarrolla los objetivos representados en el
[diagrama de casos de uso](../domain-and-use-cases/03-cases-of-use-current.md). Agrupa los
casos que comparten tema, actor, ciclo CRUD o efectos de inventario para revisar sus
semejanzas sin crear un documento por módulo.

Las descripciones expresan comportamiento de negocio, no endpoints ni permisos. La
[matriz de operaciones](../requirements-operations-matrix.md) detalla operaciones y
permisos; la [especificación de requisitos](../requirements-specification/index.md) contiene
criterios verificables, reglas y evidencia técnica. Una capacidad parcial, modelada o
fuera de alcance no se incorpora como caso vigente.

Las descripciones **sí nombran el objeto de negocio** cuando permite distinguir el
objetivo —material, proveedor, compra, salida, detalle o reporte— y nombran el control
visible sólo cuando el actor debe reconocerlo para actuar —botón, formulario, tabla o
diálogo—. No enumeran DTO, controller, servicio, tabla, variable ni objeto interno con
el que el actor no interactúa directamente. Así, “selecciona la compra y confirma
Cancelar detalle” es verificable; “envía `goodsReceiptDTO` al controller” pertenece a la
secuencia técnica. Todos los casos usan la misma plantilla y el nivel de detalle se mide
por las interacciones y decisiones aplicables, no por exigir el mismo número de pasos a
objetivos de distinta complejidad.

## Semántica de actores y generalización UML

Las asociaciones directas del diagrama indican qué actor inicia cada objetivo. Cuando un
caso tiene una asociación directa con un actor, su ficha nombra ese actor y, si ese actor
es una generalización no abstracta, también su especialización mediante “o”.
Cuando un caso sólo está conectado con otro caso de uso, hereda el actor de ese caso
relacionado. La generalización `Administrador del sistema --generaliza--> Personal de
almacén` se conserva en el diagrama, pero no se añade como segundo actor en una ficha que
ya tiene una asociación directa.
Las asociaciones entre casos de uso sólo representan objetivos relacionados o
continuaciones visibles; no sustituyen la asociación del actor ni conceden permisos.

## Estructura de las fichas

Cada caso emplea la misma tabla de dos columnas y conserva dentro de ella toda la
información que permite recorrer su objetivo sin consultar una segunda descripción:

- **Identificador y nombre:** identidad estable y objetivo observable.
- **Actor:** responsable que inicia el caso.
- **Disparador:** necesidad o evento observable que activa el caso. Estas dos secciones permanecen separadas para no confundir quién participa con el motivo de inicio.
- **Precondiciones:** lista numerada de estados que deben existir antes del primer paso;
  cada condición se registra por separado y no se confunde con una acción de validación
  ni con un resultado obtenido durante el flujo.
- **Flujo principal:** interacción numerada paso a paso; cada paso identifica un solo
  participante y una acción observable. Los turnos alternan entre actor y Nexus; cuando varias acciones consecutivas corresponden al mismo participante, se integran en un solo paso. Capturar filas de una tabla describe además la acción **Agregar** y la revisión de cada renglón, no sólo la captura genérica. Toda consulta o escritura identifica la interacción con la base de datos y remite a su excepción técnica. Se nombran el botón, enlace o acción que dispara cada transición; el formulario,
  diálogo o tabla que abre Nexus; los mensajes de confirmación o error; y la validación
  y conservación del resultado cuando forman parte del caso. Expresiones pasivas como
  «revisa» o «verifica el resultado» no sustituyen una interacción observable. El paso
  desde el que se desprende una variante o un rechazo incluye entre paréntesis
  **(ver A1)** o **(ver E1)**, según el identificador correspondiente.
- **Flujos alternativos:** título breve seguido de una secuencia propia por variante,
  con numeración reiniciada, la interacción actor–Nexus y un destino explícito. Además
  de las decisiones que cambian el recorrido, incluyen la captura de información
  inválida cuando Nexus permite corregirla y volver al flujo principal. La secuencia
  comienza con el participante que debe actuar después del paso referenciado: si ese
  paso corresponde a Nexus, comienza el actor; si corresponde al actor, comienza Nexus.
  En los casos de consulta que preceden a operaciones de mantenimiento, el flujo
  principal termina con la acción de alta por ser la continuación prioritaria y esa
  selección constituye el disparador del caso siguiente. Permanecer en la consulta y
  elegir cada una de las demás acciones se documenta como un flujo alternativo independiente y no ambiguo; no se agrupan destinos distintos bajo «Elegir otra acción» ni se crea una sección de continuaciones asociadas.
- **Excepciones:** título breve, punto de rechazo o fallo y serie numerada de pasos que
  describe el efecto protegido y la terminación del caso. Su secuencia respeta la misma
  alternancia de participantes definida para los flujos alternativos.
- **Postcondiciones (éxito y fallo):** lista numerada de estados finales observables;
  separa los efectos garantizados al terminar correctamente de las garantías que se
  conservan si el caso se rechaza o falla.
- **Reglas y requisitos relacionados:** referencias a criterios normativos que no se
  duplican dentro de la ficha.

Cada flujo alternativo y cada excepción comienza con un título que permite reconocer
rápidamente la situación. El flujo alternativo indica el paso del flujo principal
después del cual se inicia y cada excepción identifica el paso o flujo alternativo
después del cual puede ocurrir.
El primer paso de esa secuencia no repite la acción referenciada, sino que continúa con
el otro participante. Así, la variante o el rechazo puede localizarse sin inferir su
punto de extensión a partir de otra sección. Los párrafos de grupo sólo declaran
contexto realmente compartido y no mantienen una segunda versión de los flujos.

El último paso de cada alternativa declara su destino: **continúa en el paso N del flujo
principal** cuando retorna dentro del mismo caso, o **termina el caso de uso** cuando no
quedan más interacciones. No se usa «volver» o «continuar» sin indicar el paso. Si el
destino fuera otro caso de uso, no se redactaría como un salto de control informal:

- Una asociación simple enlaza objetivos relacionados y se dibuja sin texto; no implica
  por sí misma inclusión, extensión ni una llamada entre casos. Cuando una consulta
  presenta operaciones de mantenimiento, su acción prioritaria cierra el flujo principal
  y dispara el caso siguiente; las demás acciones se documentan como alternativas. El
  actor ejecuta el **disparador documentado en la ficha del caso siguiente** y termina
  la consulta; después, **Nexus inicia** el caso seleccionado. Ambos objetivos permanecen
  independientes y el segundo vuelve a comprobar sus precondiciones y autorización.
- `«include»` identifica un caso requerido que el caso base incorpora siempre; al
  concluir, la interacción continúa en el paso siguiente a la inclusión.
- `«extend»` identifica comportamiento opcional que se inserta en un punto de extensión
  del caso base; al concluir, retorna a ese punto.
- La **generalización** identifica un caso especializado que sustituye el comportamiento
  heredado aplicable; no representa una llamada entre casos.

La relación debe aparecer también en el diagrama y nombrar ambos identificadores `CU-*`.
Estas continuaciones son asociaciones entre objetivos independientes, no saltos de
control, `«include»` ni `«extend»`; compartir servicios de inventario, persistencia o
consulta tampoco crea por sí solo una relación UML.

El actor principal inicia el objetivo, pero no obtiene autorización por aparecer aquí.
En cada ficha, **Nexus** identifica al sistema como participante interno; no se modela
como actor externo ni inicia el caso por sí mismo.
El **Administrador del sistema** puede iniciar todos los casos vigentes mediante la
generalización mostrada en el diagrama; las fichas conservan al actor operativo primario
para explicar el objetivo sin repetir esa herencia. **Dirección** no se atribuye como
actor mientras no se definan y autoricen sus objetivos concretos.
Los casos de catálogos siguen listar-crear-actualizar y sólo incluyen eliminar, activar,
desactivar o ajustar cuando el contexto lo permite. Los documentos comparten encabezado
y detalles, pero surtir, devolver y corregir mantienen reglas y efectos propios.
Las lecturas de roles, áreas, presentaciones, unidades de medida, motivos de ajuste y
estados de cumplimiento que sólo alimentan selectores son soporte técnico de esos
objetivos: conservan autorización y trazabilidad arquitectónica, pero no reciben un
identificador de caso de uso independiente.

## Catálogo operativo y granularidad

Un caso de uso expresa **un objetivo observable iniciado por un actor**. Verbos amplios
como «administrar» o «mantener» se conservan únicamente como títulos de familia para
compartir participantes, precondiciones y reglas; no reciben identificador `CU-*`. Los
identificadores se asignan a operaciones concretas que pueden autorizarse, probarse y
trazarse por separado.

Agregar un renglón a la tabla de detalles de un formulario no constituye por sí solo otro
caso de uso cuando el renglón es una preparación transitoria del documento: no deja una
postcondición de negocio independiente, no se autoriza por separado y sólo se persiste al
confirmar el objetivo principal. En esos casos, la ficha de creación o edición debe
explicitar la selección de los datos, la acción **Agregar**, la respuesta de Nexus en la
tabla, la posible repetición y la confirmación final. Se separa un caso únicamente cuando
la operación sobre el detalle tiene disparador, autorización, reglas y resultado
persistido propios —por ejemplo corregir, cancelar, surtir o devolver un detalle ya
registrado—; compartir la misma tabla o formulario no decide la granularidad.

ISO/IEC/IEEE 29148 orienta la ingeniería y calidad de requisitos, pero no se usa como
fuente de una plantilla obligatoria, de nombres gramaticales para actores ni del formato
paso a paso de los flujos de casos de uso. La tabla de dos columnas, las secciones
enumeradas arriba y la alternancia explícita **actor → Nexus** forman la plantilla
definida por el proyecto para mejorar claridad y verificabilidad. Por ello este catálogo
no declara una conformidad formal con esa norma: adopta criterios compatibles de
identificación única, necesidad, claridad, consistencia, factibilidad y verificabilidad.
Cada ficha
contesta, con vocabulario de negocio, **quién inicia**, **qué lo dispara**, **qué debe
existir antes**, **qué recorrido exitoso sigue**, **qué resultado deja** y **cómo termina
si una regla falla**. Los detalles técnicos se conservan como evidencia, no como pasos que
el actor deba comprender.

La plantilla conserva en la ficha el recorrido completo del objetivo y omite secciones
vacías cuando no existe una alternativa o excepción. La descripción exhaustiva de la
interfaz, el contrato HTTP y la implementación permanecen en sus artefactos propietarios
y sólo se enlazan como evidencia.

### Convención de grupos funcionales e identificadores

Los grupos funcionales reúnen objetivos por capacidad de negocio y reducen el tamaño de
cada vista; no representan paquetes UML, paquetes documentales, permisos, capas de código
ni unidades de despliegue. El catálogo conserva identificadores estables
`CU-<FAMILIA>-<SECUENCIA>`: el código de familia y su secuencia permanecen estables
aunque cambie la ubicación de lectura. Si una reorganización exigiera renumerar, el
cambio se realizaría de forma coordinada en el catálogo, las fichas, los diagramas y la
trazabilidad técnica; un identificador retirado no se reasigna a un objetivo distinto.

| Código | Grupo funcional | Alcance |
| --- | --- | --- |
| `AUT` | Autenticación | Inicio y cierre observable de la sesión del usuario. |
| `IDA` | Identidad y acceso | Personas, cuentas, credenciales y asignaciones de acceso. |
| `ALM` | Almacén | Materiales, mermas, existencias, movimientos y reportes operativos del almacén. |
| `CAT` | Catálogos | Recursos comerciales y contextuales reutilizados por documentos. |
| `ENT` | Compras de material | Consulta, registro, edición, corrección y cancelación de compras recibidas. |
| `SAL` | Salidas de material y de merma | Consulta, creación, edición, surtimiento y devolución de materiales o mermas. |

#### Criterio de agrupación vigente

Se mantienen seis grupos funcionales propietarios porque expresan capacidades de
negocio estables. Cada consulta o reporte se ubica en el grupo del recurso desde el que
se inicia; no existe un grupo independiente para reportes. Dentro de ellos, los casos se ordenan
por la entidad o el documento sobre el que actúan. Cada secuencia comienza con la
consulta y continúa con las operaciones CRUD disponibles sobre el mismo recurso. Las
operaciones específicas —por ejemplo retirar, ajustar existencia, cambiar estado,
corregir, cancelar, surtir o devolver— se colocan inmediatamente después del CRUD al que
pertenecen. La acción permanece en cada caso de uso y nunca se usa como criterio para
fusionar entidades. Esta organización evita tanto un grupo distinto por cada recurso
como listas planas difíciles de revisar.

| Grupo | Familias internas de lectura | Casos |
| --- | --- | --- |
| `AUT` | Sesión. | `CU-AUT-01` a `CU-AUT-02` |
| `IDA` | Personas; usuarios y credenciales; sus consultas y reportes. | `CU-IDA-01` a `CU-IDA-09` |
| `ALM` | Materiales; mermas; inventarios y movimientos del almacén. | `CU-ALM-01` a `CU-ALM-16` |
| `CAT` | Proveedores; clientes; catálogos auxiliares y reportes complementarios. | `CU-CAT-01` a `CU-CAT-26` |
| `ENT` | Compras de material y su reporte. | `CU-ENT-01` a `CU-ENT-06` |
| `SAL` | Salidas de material y merma con sus reportes. | `CU-SAL-01` a `CU-SAL-14` |

Las familias internas son ayudas visuales, no nuevos grupos funcionales, permisos ni
módulos de código. Un caso conserva un único identificador y una única entidad aunque su
implementación reutilice validaciones, formularios, servicios o exportadores.

El orden anterior determina la lectura dentro de cada grupo. La numeración sigue el
orden de lectura del catálogo dentro de cada grupo propietario. El catálogo y las fichas
se presentan después en esa misma secuencia. No se conserva al final del grupo una
operación especial que pertenece a una familia anterior. Las asociaciones simples se
dibujan sin etiqueta; sólo una relación `«include»` o `«extend»` debe indicar su
semántica explícitamente.

Los prefijos anteriores sustituyen `IAM`, `REC` e `ISS`, que mezclaban abreviaturas en
inglés con nombres de grupos en español. Las referencias normativas se actualizan en
conjunto; el cambio de identificador no modifica el alcance funcional del caso.


## Catálogo por grupo funcional

- [AUT — Autenticación](authentication/index.md)
- [IDA — Identidad y acceso](identity-access/index.md)
- [ALM — Almacén](../use-cases/catalogs/index.md)
- [CAT — Catálogos](catalogs/index.md)
- [ENT — Compras de material](purchases/index.md)
- [SAL — Salidas de material y de merma](issues/index.md)

## Relación entre familias y reutilización

| Tema compartido | Casos | Elementos reutilizables que deben evaluarse primero | Diferencia que debe conservarse |
| --- | --- | --- | --- |
| CRUD de identidades y catálogos | `CU-IDA-01` a `CU-IDA-09`; `CU-ALM-01` a `CU-ALM-06`; `CU-ALM-09` a `CU-ALM-13`; `CU-CAT-01` a `CU-CAT-26` | Fábricas CRUD, listados, formularios, validación y refresco de tabla. | Permisos, identidad del recurso, relaciones y política de eliminación. |
| Documentos con detalles | `CU-ENT-02`, `CU-ENT-03`, `CU-SAL-02` a `CU-SAL-04` y `CU-SAL-09` a `CU-SAL-11` | Encabezado, modal/formulario, tabla de detalles, DTO y transacción coordinadora. | La entrada incrementa stock al confirmarse; la salida no lo descuenta hasta surtir. |
| Operación de salidas | `CU-SAL-02` a `CU-SAL-06` y `CU-SAL-09` a `CU-SAL-13` | Proceso de material replicable para merma, componentes informativos y coordinación de movimientos. | Inventario, conversión, permisos, estados y cantidades acumuladas del contexto. |
| Consulta y exportación | `CU-IDA-04`, `CU-IDA-09`, `CU-ALM-06`, `CU-ALM-08`, `CU-ALM-14`, `CU-ALM-16`, `CU-CAT-04`, `CU-CAT-08`, `CU-ENT-06`, `CU-SAL-07` y `CU-SAL-14` y casos de consulta de cada familia | Filtros, paginación, dependencias entre selects y utilidades Excel. | Columnas, agrupaciones, fórmulas y permiso de cada reporte. |

Reutilizar no significa fusionar reglas de negocio. Antes de crear otro flujo se revisan
los [patrones de diseño y construcción](../../architecture/design-and-construction-patterns/index.md), se replica
el proceso existente sólo cuando cambia el contexto, y se mantienen explícitas sus
validaciones, transacciones y pruebas CRUD.

## Trazabilidad y mantenimiento

1. Al agregar, retirar o cambiar un objetivo de actor, se actualizan este catálogo y el
   diagrama de casos de uso en el mismo cambio.
2. Si cambia una operación, se revisan también la especificación, la matriz de
   operaciones y el plan de pruebas.
3. Las pruebas unitarias conservan la ruta paralela al código; las integraciones CRUD
   atraviesan HTTP y Prisma en `tests/integration/controllers/*DbTest.js`, conforme a
   la [estrategia de pruebas](../../testing/service-test-coverage.md).
4. Un caso nuevo debe completar identificador, nombre, actor y disparador,
   participación de actores y sistema, precondiciones, pasos granulares del flujo
   principal, secuencias actor–Nexus y destino para cada alternativa, excepciones,
   resultado y reglas o requisitos relacionados antes de considerarse documentado.
5. Proyectos, requisiciones y ajustes sin flujo HTTP completo permanecen en la
   especificación con su estado correspondiente; se incorporarán aquí sólo al pasar a
   alcance vigente.
