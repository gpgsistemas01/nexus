# Descripciones de casos de uso

## Propósito y alcance

Este catálogo desarrolla los objetivos representados en el
[diagrama de casos de uso](domain-and-use-cases.md#casos-de-uso-vigentes). Agrupa los
casos que comparten tema, actor, ciclo CRUD o efectos de inventario para revisar sus
semejanzas sin crear un documento por módulo.

Las descripciones expresan comportamiento de negocio, no endpoints ni permisos. La
[matriz de operaciones](requirements-operations-matrix.md) detalla operaciones y
permisos; la [especificación de requisitos](requirements-specification.md) contiene
criterios verificables, reglas y evidencia técnica. Una capacidad parcial, modelada o
fuera de alcance no se incorpora como caso vigente.

## Estructura de las fichas

Cada caso emplea la misma tabla de dos columnas y conserva dentro de ella toda la
información que permite recorrer su objetivo sin consultar una segunda descripción:

- **Identificador y nombre:** identidad estable y objetivo observable.
- **Actor y disparador:** responsable que inicia el caso y necesidad que lo activa.
- **Participación de actores y sistema:** acciones que realiza el actor y respuestas,
  validaciones o escrituras que Nexus ejecuta durante la interacción.
- **Precondiciones:** lista numerada de estados que deben existir antes del primer paso;
  cada condición se registra por separado y no se confunde con una acción de validación
  ni con un resultado obtenido durante el flujo.
- **Flujo principal:** interacción numerada paso a paso; cada paso identifica un solo
  participante y una acción observable. Capturar, confirmar, validar, persistir y
  presentar el resultado se separan cuando ocurren en momentos distintos. Se nombran el botón, enlace o acción que dispara cada transición; el formulario,
  diálogo o tabla que abre Nexus; los mensajes de confirmación o error; y la validación
  y escritura en base de datos cuando forman parte del caso. Expresiones pasivas como
  «revisa» o «verifica el resultado» no sustituyen una interacción observable. El paso
  desde el que se desprende una variante o un rechazo incluye entre paréntesis
  **(ver A1)** o **(ver E1)**, según el identificador correspondiente.
- **Flujos alternativos:** secuencia propia por variante, con numeración reiniciada, la
  interacción actor–Nexus y un destino explícito. La secuencia comienza con el
  participante que debe actuar después del paso referenciado: si ese paso corresponde
  a Nexus, comienza el actor; si corresponde al actor, comienza Nexus.
- **Excepciones:** punto de rechazo o fallo y efecto protegido. Su secuencia respeta la
  misma alternancia de participantes definida para los flujos alternativos.
- **Postcondiciones (éxito y fallo):** lista numerada de estados finales observables;
  separa los efectos garantizados al terminar correctamente de las garantías que se
  conservan si el caso se rechaza o falla.
- **Reglas y requisitos relacionados:** referencias a criterios normativos que no se
  duplican dentro de la ficha.

Cada flujo alternativo indica el paso del flujo principal después del cual se inicia y
cada excepción identifica el paso o flujo alternativo después del cual puede ocurrir.
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
  presenta una acción asociada, su ficha puede indicar que el actor **termina la
  consulta** y luego **inicia** el caso seleccionado; esa continuación conserva dos
  objetivos independientes y vuelve a comprobar sus precondiciones y autorización.
- `«include»` identifica un caso requerido que el caso base incorpora siempre; al
  concluir, la interacción continúa en el paso siguiente a la inclusión.
- `«extend»` identifica comportamiento opcional que se inserta en un punto de extensión
  del caso base; al concluir, retorna a ese punto.
- La **generalización** identifica un caso especializado que sustituye el comportamiento
  heredado aplicable; no representa una llamada entre casos.

La relación debe aparecer también en el diagrama y nombrar ambos identificadores `CU-*`.
En el catálogo vigente no hay saltos entre casos de uso: compartir servicios de
inventario, persistencia o consulta no crea por sí solo una relación UML.

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

## Catálogo operativo y granularidad

Un caso de uso expresa **un objetivo observable iniciado por un actor**. Verbos amplios
como «administrar» o «mantener» se conservan únicamente como títulos de familia para
compartir participantes, precondiciones y reglas; no reciben identificador `CU-*`. Los
identificadores se asignan a operaciones concretas que pueden autorizarse, probarse y
trazarse por separado.

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
ni unidades de despliegue. El catálogo usa `CU-<GRUPO>-<SECUENCIA>`: el código de grupo
es estable y la secuencia comienza en `01` dentro de cada grupo. La numeración sigue el
orden funcional del catálogo para que el identificador permita localizar la familia y
su posición de lectura. Si una reorganización exige renumerar, el cambio se realiza de
forma coordinada en el catálogo, las fichas, los diagramas y la trazabilidad técnica; un
identificador retirado no se reasigna a un objetivo distinto.

| Código | Grupo funcional | Alcance |
| --- | --- | --- |
| `AUT` | Autenticación | Inicio y cierre observable de la sesión del usuario. |
| `IDA` | Identidad y acceso | Personas, cuentas, credenciales y asignaciones de acceso. |
| `CAT` | Catálogos | Recursos operativos y contextuales reutilizados por documentos. |
| `ENT` | Compras de material | Consulta, registro, edición, corrección y cancelación de compras recibidas. |
| `SAL` | Salidas de material y de merma | Consulta, creación, edición, surtimiento y devolución de materiales o mermas. |
| `REP` | Consultas y reportes | Movimientos, inventario, vistas consolidadas y archivos. |

#### Criterio de agrupación vigente

Se mantienen los grupos funcionales porque expresan capacidades de negocio estables y
conservan la trazabilidad de los identificadores. Dentro de ellos, los casos se ordenan
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
| `IDA` | Personas; usuarios y credenciales; catálogos de acceso. | `CU-IDA-01` a `CU-IDA-09` |
| `CAT` | Materiales; proveedores; clientes; mermas; catálogos auxiliares de sólo lectura. | `CU-CAT-01` a `CU-CAT-20` |
| `ENT` | Compras de material. | `CU-ENT-01` a `CU-ENT-05` |
| `SAL` | Salidas de material; salidas de merma. | `CU-SAL-01` a `CU-SAL-12` |
| `REP` | Materiales; mermas; compras; proveedores; clientes; identidad. | `CU-REP-01` a `CU-REP-15` |

Las familias internas son ayudas visuales, no nuevos grupos funcionales, permisos ni
módulos de código. Un caso conserva un único identificador y una única entidad aunque su
implementación reutilice validaciones, formularios, servicios o exportadores.

El orden anterior también determina la secuencia numérica: no se conserva al final del
grupo una operación especial que pertenece a un CRUD anterior. Las asociaciones simples
se dibujan sin etiqueta; sólo una relación `«include»` o `«extend»` debe indicar su
semántica explícitamente.

Los prefijos anteriores sustituyen `IAM`, `REC` e `ISS`, que mezclaban abreviaturas en
inglés con nombres de grupos en español. Las referencias normativas se actualizan en
conjunto; el cambio de identificador no modifica el alcance funcional del caso.

### Grupo funcional AUT — Autenticación

| Identificador | Caso de uso específico | Evidencia funcional |
| --- | --- | --- |
| `CU-AUT-01` | Iniciar sesión | Creación de una sesión para una cuenta activa con credenciales válidas. |
| `CU-AUT-02` | Cerrar sesión | Invalidación de las credenciales de la sesión en el navegador. |

### Grupo funcional IDA — Identidad y acceso

| Identificador | Caso de uso específico | Evidencia funcional |
| --- | --- | --- |
| `CU-IDA-01` | Consultar personas | Listado de personas y asignaciones. |
| `CU-IDA-02` | Crear persona | Alta de persona sin crear cuenta. |
| `CU-IDA-03` | Editar persona | Actualización de datos y asignaciones de persona. |
| `CU-IDA-04` | Consultar usuarios | Listado de cuentas y accesos. |
| `CU-IDA-05` | Crear usuario y asignar acceso | Alta transaccional de cuenta y asignación. |
| `CU-IDA-06` | Editar usuario y acceso | Actualización transaccional de cuenta y asignación. |
| `CU-IDA-07` | Cambiar contraseña de usuario | Actualización cifrada de la credencial. |
| `CU-IDA-08` | Consultar roles | Catálogo de acceso de sólo lectura. |
| `CU-IDA-09` | Consultar departamentos | Catálogo de acceso de sólo lectura. |

### Grupo funcional CAT — Catálogos

| Identificador | Caso de uso específico | Evidencia funcional |
| --- | --- | --- |
| `CU-CAT-01` | Consultar materiales | Listado de materiales y ofertas de proveedor. |
| `CU-CAT-02` | Crear material | Alta con presentación, unidad y relaciones válidas. |
| `CU-CAT-03` | Editar material | Actualización de datos generales admitidos. |
| `CU-CAT-04` | Retirar material | Retiro condicionado por la historia operativa. |
| `CU-CAT-05` | Ajustar existencia de material | Ajuste trazable de inventario. |
| `CU-CAT-06` | Consultar proveedores | Listado de proveedores autorizados. |
| `CU-CAT-07` | Crear proveedor | Alta con código e identidad válidos. |
| `CU-CAT-08` | Editar proveedor | Actualización de datos admitidos. |
| `CU-CAT-09` | Cambiar estado de proveedor | Activación o desactivación del proveedor. |
| `CU-CAT-10` | Consultar clientes | Listado de clientes autorizados. |
| `CU-CAT-11` | Crear cliente | Alta con asesor opcional válido. |
| `CU-CAT-12` | Editar cliente | Actualización de datos y asesor opcional. |
| `CU-CAT-13` | Consultar mermas | Listado de existencias de merma. |
| `CU-CAT-14` | Registrar merma | Alta desde una plantilla material-proveedor. |
| `CU-CAT-15` | Editar merma | Actualización sin alterar su identidad física. |
| `CU-CAT-16` | Ajustar existencia de merma | Ajuste trazable de inventario de merma. |
| `CU-CAT-17` | Consultar presentaciones | Catálogo auxiliar de sólo lectura. |
| `CU-CAT-18` | Consultar unidades de medida | Catálogo auxiliar de sólo lectura. |
| `CU-CAT-19` | Consultar motivos de ajuste | Catálogo auxiliar de sólo lectura. |
| `CU-CAT-20` | Consultar estados de cumplimiento | Catálogo auxiliar de sólo lectura. |

### Grupo funcional ENT — Compras de material

| Identificador | Caso de uso específico | Evidencia funcional |
| --- | --- | --- |
| `CU-ENT-01` | Consultar compras de material | Listado y detalle sin modificar inventario. |
| `CU-ENT-02` | Crear compra de material | Compra, detalles, existencias y movimientos transaccionales. |
| `CU-ENT-03` | Editar compra de material | Edición de encabezado y detalles admitidos. |
| `CU-ENT-04` | Corregir material de una compra | Corrección de cantidad o costo con historial. |
| `CU-ENT-05` | Cancelar material de una compra | Cancelación del detalle y reversión de inventario. |

### Grupo funcional SAL — Salidas de material y de merma

| Identificador | Caso de uso específico | Evidencia funcional |
| --- | --- | --- |
| `CU-SAL-01` | Consultar salidas de material | Consulta sin modificar existencias. |
| `CU-SAL-02` | Crear salida de material | Creación pendiente sin descontar existencias. |
| `CU-SAL-03` | Editar encabezado de salida de material | Edición de los campos admitidos. |
| `CU-SAL-04` | Ajustar materiales de una salida | Actualización de detalles todavía modificables. |
| `CU-SAL-05` | Surtir material | Descuento de existencia y registro de movimiento. |
| `CU-SAL-06` | Devolver material surtido | Reintegro de existencia y movimiento inverso. |
| `CU-SAL-07` | Consultar salidas de merma | Consulta sin modificar existencias. |
| `CU-SAL-08` | Crear salida de merma | Creación pendiente sin descontar existencias. |
| `CU-SAL-09` | Editar encabezado de salida de merma | Edición de los campos admitidos. |
| `CU-SAL-10` | Ajustar mermas de una salida | Actualización de detalles todavía modificables. |
| `CU-SAL-11` | Surtir merma | Descuento de existencia y registro de movimiento. |
| `CU-SAL-12` | Devolver merma surtida | Reintegro de existencia y movimiento inverso. |

### Grupo funcional REP — Consultas y reportes

| Identificador | Caso de uso específico | Evidencia funcional |
| --- | --- | --- |
| `CU-REP-01` | Consultar inventario de materiales | Consulta autorizada sin modificar datos. |
| `CU-REP-02` | Consultar inventario de mermas | Consulta autorizada sin modificar datos. |
| `CU-REP-03` | Consultar movimientos de materiales | Consulta autorizada sin modificar datos. |
| `CU-REP-04` | Consultar movimientos de mermas | Consulta autorizada sin modificar datos. |
| `CU-REP-05` | Generar reporte de inventario de materiales | Archivo Excel con filtros, columnas y cálculos propios del reporte. |
| `CU-REP-06` | Generar reporte de salidas de material | Archivo Excel con filtros, columnas y cálculos propios del reporte. |
| `CU-REP-07` | Generar reporte de salidas de merma | Archivo Excel con filtros, columnas y cálculos propios del reporte. |
| `CU-REP-08` | Generar reporte de compras de material | Archivo Excel con filtros, columnas y cálculos propios del reporte. |
| `CU-REP-09` | Generar reporte de mermas | Archivo Excel con filtros, columnas y cálculos propios del reporte. |
| `CU-REP-10` | Generar reporte de proveedores | Archivo Excel con filtros, columnas y cálculos propios del reporte. |
| `CU-REP-11` | Generar reporte de clientes | Archivo Excel con filtros, columnas y cálculos propios del reporte. |
| `CU-REP-12` | Generar reporte de personas | Archivo Excel con filtros, columnas y cálculos propios del reporte. |
| `CU-REP-13` | Generar reporte de usuarios | Archivo Excel con filtros, columnas y cálculos propios del reporte. |
| `CU-REP-14` | Generar reporte de movimientos de materiales | Archivo Excel con filtros, columnas y cálculos propios del reporte. |
| `CU-REP-15` | Generar reporte de movimientos de mermas | Archivo Excel con filtros, columnas y cálculos propios del reporte. |

La evidencia orienta la búsqueda, pero no impone una organización por casos de uso
dentro de `src`: la aplicación está organizada por capas y dominio. Las pruebas
unitarias siguen la ubicación paralela al artefacto y las integraciones CRUD permanecen
bajo `tests/integration/controllers`.

## Inferencia de pasos desde la implementación

Los pasos siguientes se contrastaron en cuatro niveles: el JavaScript de la vista revela
el disparador y las acciones que ejecuta el actor; el router fija autenticación, permiso,
validación y operación HTTP; el controller normaliza filtros o construye el DTO; y el
servicio determina reglas, transacciones, existencias, movimientos y estados. Esa
evidencia técnica se traduce a comportamiento observable y no se copia como si el actor
invocara controllers, DTO o servicios.

| Evidencia observada | Se asigna a | Descripción a nivel de negocio |
| --- | --- | --- |
| Clic, selección, captura o confirmación en la vista | Actor | Abre una opción, proporciona datos, elige una acción o confirma. |
| Renderizado, carga de opciones, mensaje o descarga | Nexus | Presenta información y comunica el resultado. |
| Autenticación, permiso y validación de router | Nexus | Comprueba que la operación y los datos estén permitidos. |
| Normalización, consulta, DTO o respuesta del controller | Nexus | Interpreta la solicitud y prepara o presenta el resultado. |
| Regla, transacción, existencia, movimiento o estado del servicio | Nexus | Ejecuta la regla de negocio y conserva la consistencia. |
| Necesidad externa que no aparece en el código | Actor y requisitos | Explica el disparador, pero no se atribuye al sistema. |

La evidencia se clasifica como **Directa** cuando existe una entrada HTTP propia,
**Compuesta** cuando varias escrituras forman una operación, **Compartida** cuando dos
objetivos reutilizan la misma consulta o mutación, y **Subflujo** cuando la intención se
resuelve dentro de una ruta más general. En estos dos últimos casos el código permite
inferir la ejecución, pero no demuestra por sí solo que exista una opción de interfaz o
un permiso independiente. En particular:

- consultar inventario de materiales o mermas reutiliza los listados de esos recursos;
- cambiar el estado de un proveedor forma parte de su edición;
- surtir material o merma se confirma mediante la actualización de detalles y no mediante
  una ruta `/supply`;
- los reportes sí tienen rutas de exportación independientes por entidad.

Esta distinción evita inventar pasos: el código prueba el recorrido ejecutable, mientras
la intención, el actor y el resultado esperado se conservan en los requisitos. El
**disparador** se documenta por separado y el primer paso del flujo materializa esa
iniciativa del actor; Nexus sólo continúa después de la solicitud, salvo que un caso
declare expresamente un inicio automático.


## Fichas específicas de los casos de uso

Las fichas siguientes son la descripción normativa completa de cada `CU-*`. Cada ficha
usa dos columnas: **Sección** identifica el dato descrito e **Información relevante**
contiene su valor para ese caso. El contexto compartido se declara una sola vez al inicio
del grupo; flujos, excepciones y reglas permanecen dentro del caso al que aplican.

### Grupo funcional AUT — Autenticación

Estos casos muestran el control de acceso observable. La renovación de credenciales y
la consulta de la sesión actual permanecen como responsabilidades internas de Nexus.

#### `CU-AUT-01` — Iniciar sesión

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-AUT-01` |
| Nombre | Iniciar sesión. |
| Actor y disparador | **Actor:** Usuario registrado. **Disparador:** necesita acceder a las capacidades de Nexus para realizar su trabajo autorizado. |
| Participación de actor y sistema | **Actor:** abre el acceso, captura sus credenciales y confirma.<br>**Nexus:** valida la cuenta, crea la sesión y dirige al usuario al alcance disponible. |
| Precondiciones | 1. La cuenta existe y está activa.<br>2. El actor no dispone de una sesión autenticada vigente. |
| Inferencia desde código | **Directa.** `authApiRoute.js` POST `/login` → `loginValidation` → `login` → `loginUser`. |
| Flujo principal | 1. **Actor:** abre la página de acceso.<br>2. **Nexus:** muestra el formulario de credenciales.<br>3. **Actor:** captura usuario y contraseña y selecciona «Iniciar sesión» **(ver E1)**.<br>4. **Nexus:** valida los datos y comprueba que correspondan a una cuenta activa.<br>5. **Nexus:** establece las credenciales de sesión y presenta la página inicial con las opciones autorizadas. |
| Excepciones | **E1, después del paso 3:** **Nexus** determina que las credenciales son inválidas o que la cuenta no admite acceso, rechaza la solicitud, no crea la sesión y comunica el error; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Existe una sesión autenticada atribuida a la cuenta y el usuario puede acceder únicamente a las capacidades autorizadas.<br>2. **Fallo:** No se crean credenciales de sesión ni se expone información protegida. |
| Requisitos relacionados | `RF-AUT-001`, `RN-001`. |

#### `CU-AUT-02` — Cerrar sesión

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-AUT-02` |
| Nombre | Cerrar sesión. |
| Actor y disparador | **Actor:** Usuario registrado con sesión autenticada. **Disparador:** decide terminar su acceso a Nexus. |
| Participación de actor y sistema | **Actor:** selecciona la opción de cierre.<br>**Nexus:** elimina las credenciales del navegador y confirma la terminación de la sesión. |
| Precondiciones | 1. El actor dispone de una sesión autenticada. |
| Inferencia desde código | **Directa.** `logoutWebRoute.js` POST `/` → `logout` → `clearAuthCookies`. |
| Flujo principal | 1. **Actor:** selecciona «Cerrar sesión» **(ver E1)**.<br>2. **Nexus:** elimina las credenciales y el destino de retorno conservados en el navegador.<br>3. **Nexus:** dirige al actor fuera del área protegida y confirma el cierre. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** El navegador deja de conservar las credenciales de acceso de la sesión.<br>2. **Fallo:** El sistema no debe presentar contenido protegido sin volver a comprobar una sesión válida. |
| Requisitos relacionados | `RF-AUT-003`, `RN-001`. |

### Grupo funcional IDA — Identidad y acceso

Cada ficha representa una sola acción sobre una sola entidad. Los elementos compartidos se reutilizan en la implementación, pero no fusionan objetivos del actor.

#### `CU-IDA-01` — Consultar personas

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-01` |
| Nombre | Consultar personas. |
| Actor y disparador | **Actor:** Administrador del sistema. **Disparador:** necesita localizar o revisar personas y abre la opción de consulta correspondiente. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Inferencia desde código | **Directa.** `personApiRoute.js` GET → `getAllPersons` → `personService`. |
| Flujo principal | 1. **Actor:** abre la opción para consultar personas **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra la tabla con búsqueda, filtros y paginación disponibles.<br>3. **Actor:** captura los criterios que necesita y solicita aplicarlos.<br>4. **Nexus:** actualiza la tabla y el total con la información autorizada, sin modificar datos.<br>5. **Actor:** selecciona un registro cuando necesita revisar su información.<br>6. **Nexus:** muestra el detalle y las acciones que el actor puede ejecutar. |
| Continuaciones asociadas | Después de presentar las acciones disponibles, el actor puede terminar `CU-IDA-01` e iniciar, si cuenta con autorización, `CU-IDA-02` Crear persona o, después de seleccionar una persona, `CU-IDA-03` Editar persona. La selección no constituye `«include»` ni `«extend»`; el caso elegido comprueba nuevamente sus precondiciones. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Listado de personas y asignaciones.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-IAM-002`. |

#### `CU-IDA-02` — Crear persona

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-02` |
| Nombre | Crear persona. |
| Actor y disparador | **Actor:** Administrador del sistema. **Disparador:** necesita incorporar una persona y selecciona la acción de alta. |
| Participación de actor y sistema | **Actor:** abre el alta, captura datos y confirma.<br>**Nexus:** carga opciones, valida, registra y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de alta.<br>3. Existen los datos relacionados requeridos para completar el registro. |
| Inferencia desde código | **Directa.** `personApiRoute.js` POST → `personValidation` → `registerPerson` → `personService`. |
| Flujo principal | 1. **Actor:** abre la opción para crear persona **(ver E1)**.<br>2. **Nexus:** muestra el formulario y carga las opciones relacionadas que puede utilizar.<br>3. **Actor:** captura los datos y relaciones requeridos y confirma.<br>4. **Nexus:** valida autorización, obligatoriedad, formato, identidad y relaciones.<br>5. **Nexus:** registra persona, actualiza el listado y muestra la confirmación. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Alta de persona sin crear cuenta.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-IAM-007`. |

#### `CU-IDA-03` — Editar persona

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-03` |
| Nombre | Editar persona. |
| Actor y disparador | **Actor:** Administrador del sistema. **Disparador:** detecta datos que debe corregir en una persona y selecciona su acción de edición. |
| Participación de actor y sistema | **Actor:** selecciona el registro, modifica datos y confirma.<br>**Nexus:** presenta valores vigentes, valida, actualiza y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de edición.<br>3. El registro objetivo existe.<br>4. El registro se encuentra en un estado que admite los cambios solicitados. |
| Inferencia desde código | **Directa.** `personApiRoute.js` PUT `/:id` → `personValidation` → `editPerson` → `personService`. |
| Flujo principal | 1. **Actor:** selecciona persona y abre la edición **(ver E1)**.<br>2. **Nexus:** muestra los valores actuales y habilita sólo los campos permitidos.<br>3. **Actor:** modifica los datos admitidos y confirma.<br>4. **Nexus:** valida autorización, formato, identidad y relaciones.<br>5. **Nexus:** guarda los cambios, actualiza el listado y muestra la confirmación. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Actualización de datos y asignaciones de persona.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-IAM-008`. |

#### `CU-IDA-04` — Consultar usuarios

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-04` |
| Nombre | Consultar usuarios. |
| Actor y disparador | **Actor:** Administrador del sistema. **Disparador:** necesita localizar o revisar usuarios y abre la opción de consulta correspondiente. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Inferencia desde código | **Directa.** `userApiRoute.js` GET → `getAllUsers` → `userService`. |
| Flujo principal | 1. **Actor:** abre la opción para consultar usuarios **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra la tabla con búsqueda, filtros y paginación disponibles.<br>3. **Actor:** captura los criterios que necesita y solicita aplicarlos.<br>4. **Nexus:** actualiza la tabla y el total con la información autorizada, sin modificar datos.<br>5. **Actor:** selecciona un registro cuando necesita revisar su información.<br>6. **Nexus:** muestra el detalle y las acciones que el actor puede ejecutar. |
| Continuaciones asociadas | Después de presentar las acciones disponibles, el actor puede terminar `CU-IDA-04` e iniciar, si cuenta con autorización, `CU-IDA-05` Crear usuario y asignar acceso o, después de seleccionar una cuenta, `CU-IDA-06` Editar usuario y acceso o `CU-IDA-07` Cambiar contraseña de usuario. La selección no constituye `«include»` ni `«extend»`; el caso elegido comprueba nuevamente sus precondiciones. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Listado de cuentas y accesos.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-IAM-001`. |

#### `CU-IDA-05` — Crear usuario y asignar acceso

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-05` |
| Nombre | Crear usuario y asignar acceso. |
| Actor y disparador | **Actor:** Administrador del sistema. **Disparador:** necesita crear una cuenta y asignarle acceso, por lo que selecciona la acción de alta. |
| Participación de actor y sistema | **Actor:** abre el alta, captura datos y confirma.<br>**Nexus:** carga opciones, valida, registra y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de alta.<br>3. Existen los datos relacionados requeridos para completar el registro. |
| Inferencia desde código | **Directa.** `userApiRoute.js` POST → `userValidation` → `registerUser` → `userService`. |
| Flujo principal | 1. **Actor:** abre la opción para crear usuario y asignar acceso **(ver E1)**.<br>2. **Nexus:** muestra el formulario y carga las opciones relacionadas que puede utilizar.<br>3. **Actor:** captura los datos y relaciones requeridos y confirma.<br>4. **Nexus:** valida autorización, obligatoriedad, formato, identidad y relaciones.<br>5. **Nexus:** registra usuario y asignar acceso, actualiza el listado y muestra la confirmación. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Alta transaccional de cuenta y asignación.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-IAM-004`. |

#### `CU-IDA-06` — Editar usuario y acceso

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-06` |
| Nombre | Editar usuario y acceso. |
| Actor y disparador | **Actor:** Administrador del sistema. **Disparador:** detecta datos que debe corregir en una cuenta o su acceso y selecciona su acción de edición. |
| Participación de actor y sistema | **Actor:** selecciona el registro, modifica datos y confirma.<br>**Nexus:** presenta valores vigentes, valida, actualiza y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de edición.<br>3. El registro objetivo existe.<br>4. El registro se encuentra en un estado que admite los cambios solicitados. |
| Inferencia desde código | **Directa.** `userApiRoute.js` PATCH `/:id` → `userEditValidation` → `editUser` → `userService`. |
| Flujo principal | 1. **Actor:** selecciona usuario y acceso y abre la edición **(ver E1)**.<br>2. **Nexus:** muestra los valores actuales y habilita sólo los campos permitidos.<br>3. **Actor:** modifica los datos admitidos y confirma.<br>4. **Nexus:** valida autorización, formato, identidad y relaciones.<br>5. **Nexus:** guarda los cambios, actualiza el listado y muestra la confirmación. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Actualización transaccional de cuenta y asignación.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-IAM-005`. |

#### `CU-IDA-07` — Cambiar contraseña de usuario

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-07` |
| Nombre | Cambiar contraseña de usuario. |
| Actor y disparador | **Actor:** Administrador del sistema. **Disparador:** necesita renovar la credencial de una cuenta y abre la edición de contraseña. |
| Participación de actor y sistema | **Actor:** selecciona el registro, modifica datos y confirma.<br>**Nexus:** presenta valores vigentes, valida, actualiza y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de cambio de credencial.<br>3. La cuenta objetivo existe. |
| Inferencia desde código | **Directa.** `userApiRoute.js` PATCH `/:id/password` → `userPasswordValidation` → `editUserPassword` → `userService`. |
| Flujo principal | 1. **Actor:** selecciona un usuario y abre «Editar contraseña» **(ver E1)**.<br>2. **Nexus:** muestra el formulario de nueva contraseña sin exponer la credencial actual.<br>3. **Actor:** captura y confirma la nueva contraseña.<br>4. **Nexus:** valida la credencial, la cifra y reemplaza el valor anterior.<br>5. **Nexus:** cierra el formulario y confirma la actualización. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Actualización cifrada de la credencial.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-IAM-006`. |

#### `CU-IDA-08` — Consultar roles

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-08` |
| Nombre | Consultar roles. |
| Actor y disparador | **Actor:** Administrador del sistema. **Disparador:** abre un formulario cuyo selector requiere roles. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Inferencia desde código | **Directa.** `roleApiRoute.js` GET → `getAllRoles`. |
| Flujo principal | 1. **Actor:** abre el formulario del proceso que requiere roles **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y carga roles vigentes.<br>3. **Actor:** consulta o selecciona una opción de roles.<br>4. **Nexus:** conserva la selección para continuar el proceso principal sin modificar el catálogo. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Catálogo de acceso de sólo lectura.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-IAM-003`. |

#### `CU-IDA-09` — Consultar departamentos

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-09` |
| Nombre | Consultar departamentos. |
| Actor y disparador | **Actor:** Administrador del sistema. **Disparador:** abre un formulario cuyo selector requiere departamentos. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Inferencia desde código | **Directa.** `departmentApiRoute.js` GET → `getAllDepartments`. |
| Flujo principal | 1. **Actor:** abre el formulario del proceso que requiere departamentos **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y carga departamentos vigentes.<br>3. **Actor:** consulta o selecciona una opción de departamentos.<br>4. **Nexus:** conserva la selección para continuar el proceso principal sin modificar el catálogo. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Catálogo de acceso de sólo lectura.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-IAM-003`. |

### Grupo funcional CAT — Catálogos

Cada ficha representa una sola acción sobre una sola entidad. Los elementos compartidos se reutilizan en la implementación, pero no fusionan objetivos del actor.

#### `CU-CAT-01` — Consultar materiales

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-01` |
| Nombre | Consultar materiales. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** necesita localizar o revisar materiales y abre la opción de consulta correspondiente. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Inferencia desde código | **Directa.** `materialApiRoute.js` GET → `getAllMaterials` → `findAllMaterials`. |
| Flujo principal | 1. **Actor:** abre la opción para consultar materiales **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra la tabla con búsqueda, filtros y paginación disponibles.<br>3. **Actor:** captura los criterios que necesita y solicita aplicarlos.<br>4. **Nexus:** actualiza la tabla y el total con la información autorizada, sin modificar datos.<br>5. **Actor:** selecciona un registro cuando necesita revisar su información.<br>6. **Nexus:** muestra el detalle y las acciones que el actor puede ejecutar. |
| Continuaciones asociadas | Después de presentar las acciones disponibles, el actor puede terminar `CU-CAT-01` e iniciar, si cuenta con autorización, `CU-CAT-02` Crear material o, después de seleccionar un material, `CU-CAT-03` Editar material, `CU-CAT-04` Retirar material o `CU-CAT-05` Ajustar existencia de material. La selección no constituye `«include»` ni `«extend»`; el caso elegido comprueba nuevamente sus precondiciones. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Listado de materiales y ofertas de proveedor.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-001`. |

#### `CU-CAT-02` — Crear material

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-02` |
| Nombre | Crear material. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** necesita incorporar un material y selecciona la acción de alta. |
| Participación de actor y sistema | **Actor:** abre el alta, captura datos y confirma.<br>**Nexus:** carga opciones, valida, registra y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de alta.<br>3. Existen los datos relacionados requeridos para completar el registro. |
| Inferencia desde código | **Directa.** `materialApiRoute.js` POST → validación → DTO → `createMaterial`. |
| Flujo principal | 1. **Actor:** abre la opción para crear material **(ver E1)**.<br>2. **Nexus:** muestra el formulario y carga las opciones relacionadas que puede utilizar.<br>3. **Actor:** captura los datos y relaciones requeridos y confirma.<br>4. **Nexus:** valida autorización, obligatoriedad, formato, identidad y relaciones.<br>5. **Nexus:** registra material, actualiza el listado y muestra la confirmación. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Alta con presentación, unidad y relaciones válidas.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-006`. |

#### `CU-CAT-03` — Editar material

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-03` |
| Nombre | Editar material. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** detecta datos que debe corregir en un material y selecciona su acción de edición. |
| Participación de actor y sistema | **Actor:** selecciona el registro, modifica datos y confirma.<br>**Nexus:** presenta valores vigentes, valida, actualiza y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de edición.<br>3. El registro objetivo existe.<br>4. El registro se encuentra en un estado que admite los cambios solicitados. |
| Inferencia desde código | **Directa.** `materialApiRoute.js` PATCH `/:id` → validación → DTO → `updateMaterial`. |
| Flujo principal | 1. **Actor:** selecciona material y abre la edición **(ver E1)**.<br>2. **Nexus:** muestra los valores actuales y habilita sólo los campos permitidos.<br>3. **Actor:** modifica los datos admitidos y confirma.<br>4. **Nexus:** valida autorización, formato, identidad y relaciones.<br>5. **Nexus:** guarda los cambios, actualiza el listado y muestra la confirmación. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Actualización de datos generales admitidos.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-007`. |

#### `CU-CAT-04` — Retirar material

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-04` |
| Nombre | Retirar material. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** determina que debe retirar material y solicita la eliminación. |
| Participación de actor y sistema | **Actor:** solicita y confirma el retiro.<br>**Nexus:** comprueba historia y relaciones, ejecuta sólo el retiro permitido e informa el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de retiro.<br>3. El recurso objetivo existe.<br>4. El recurso se encuentra en un estado que permite retirarlo. |
| Inferencia desde código | **Directa.** `materialApiRoute.js` DELETE `/:id` → `removeMaterial` → `deleteMaterial`. |
| Flujo principal | 1. **Actor:** selecciona un material y solicita retirarlo **(ver E1)**.<br>2. **Nexus:** identifica el material y solicita confirmar la eliminación.<br>3. **Actor:** confirma que desea retirarlo.<br>4. **Nexus:** comprueba si el material tiene historia protegida o relaciones con proveedores.<br>5. **Nexus:** retira la relación o el material cuando está permitido; en otro caso conserva los datos e informa el conflicto. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Retiro condicionado por la historia operativa.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-008`. |

#### `CU-CAT-05` — Ajustar existencia de material

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-05` |
| Nombre | Ajustar existencia de material. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** detecta o autoriza una diferencia de existencia de material y abre el ajuste de stock. |
| Participación de actor y sistema | **Actor:** selecciona el inventario, captura el ajuste y confirma.<br>**Nexus:** muestra la existencia, valida, registra el ajuste y actualiza inventario. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de ajuste.<br>3. El recurso cuya existencia se ajustará existe. |
| Inferencia desde código | **Directa.** `materialApiRoute.js` PATCH `/:id/stock` → `updateMaterialStock` → evento de inventario. |
| Flujo principal | 1. **Actor:** selecciona el material y abre «Ajustar existencia» **(ver E1)**.<br>2. **Nexus:** muestra la existencia actual y los campos de tipo, cantidad y motivo.<br>3. **Actor:** captura el ajuste y lo confirma.<br>4. **Nexus:** valida la autorización, el motivo y la cantidad y registra el ajuste junto con la nueva existencia.<br>5. **Nexus:** actualiza las vistas de inventario y confirma el resultado. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La existencia del material refleja el ajuste autorizado.<br>2. **Éxito:** El ajuste queda registrado con su motivo y trazabilidad.<br>3. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-009`. |

#### `CU-CAT-06` — Consultar proveedores

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-06` |
| Nombre | Consultar proveedores. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** necesita localizar o revisar proveedores y abre la opción de consulta correspondiente. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Inferencia desde código | **Directa.** `supplierApiRoute.js` GET → `getAllSuppliers`. |
| Flujo principal | 1. **Actor:** abre la opción para consultar proveedores **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra la tabla con búsqueda, filtros y paginación disponibles.<br>3. **Actor:** captura los criterios que necesita y solicita aplicarlos.<br>4. **Nexus:** actualiza la tabla y el total con la información autorizada, sin modificar datos.<br>5. **Actor:** selecciona un registro cuando necesita revisar su información.<br>6. **Nexus:** muestra el detalle y las acciones que el actor puede ejecutar. |
| Continuaciones asociadas | Después de presentar las acciones disponibles, el actor puede terminar `CU-CAT-06` e iniciar, si cuenta con autorización, `CU-CAT-07` Crear proveedor o, después de seleccionar un proveedor, `CU-CAT-08` Editar proveedor o `CU-CAT-09` Cambiar estado de proveedor. La selección no constituye `«include»` ni `«extend»`; el caso elegido comprueba nuevamente sus precondiciones. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Listado de proveedores autorizados.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-002`. |

#### `CU-CAT-07` — Crear proveedor

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-07` |
| Nombre | Crear proveedor. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** necesita incorporar un proveedor y selecciona la acción de alta. |
| Participación de actor y sistema | **Actor:** abre el alta, captura datos y confirma.<br>**Nexus:** carga opciones, valida, registra y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de alta.<br>3. Existen los datos relacionados requeridos para completar el registro. |
| Inferencia desde código | **Directa.** `supplierApiRoute.js` POST → `supplierValidation` → `registerSupplier`. |
| Flujo principal | 1. **Actor:** abre la opción para crear proveedor **(ver E1)**.<br>2. **Nexus:** muestra el formulario y carga las opciones relacionadas que puede utilizar.<br>3. **Actor:** captura los datos y relaciones requeridos y confirma.<br>4. **Nexus:** valida autorización, obligatoriedad, formato, identidad y relaciones.<br>5. **Nexus:** registra proveedor, actualiza el listado y muestra la confirmación. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Alta con código e identidad válidos.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-010`. |

#### `CU-CAT-08` — Editar proveedor

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-08` |
| Nombre | Editar proveedor. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** detecta datos que debe corregir en un proveedor y selecciona su acción de edición. |
| Participación de actor y sistema | **Actor:** selecciona el registro, modifica datos y confirma.<br>**Nexus:** presenta valores vigentes, valida, actualiza y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de edición.<br>3. El registro objetivo existe.<br>4. El registro se encuentra en un estado que admite los cambios solicitados. |
| Inferencia desde código | **Directa.** `supplierApiRoute.js` PUT `/:id` → `supplierValidation` → `editSupplier`. |
| Flujo principal | 1. **Actor:** selecciona proveedor y abre la edición **(ver E1)**.<br>2. **Nexus:** muestra los valores actuales y habilita sólo los campos permitidos.<br>3. **Actor:** modifica los datos admitidos y confirma.<br>4. **Nexus:** valida autorización, formato, identidad y relaciones.<br>5. **Nexus:** guarda los cambios, actualiza el listado y muestra la confirmación. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Actualización de datos admitidos.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-011`. |

#### `CU-CAT-09` — Cambiar estado de proveedor

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-09` |
| Nombre | Cambiar estado de proveedor. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** necesita activar o desactivar un proveedor y abre su edición. |
| Participación de actor y sistema | **Actor:** selecciona el registro, modifica datos y confirma.<br>**Nexus:** presenta valores vigentes, valida, actualiza y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de edición.<br>3. El proveedor objetivo existe. |
| Inferencia desde código | **Subflujo.** el estado viaja por `supplierApiRoute.js` PUT `/:id`; no existe una ruta independiente de estado. |
| Flujo principal | 1. **Actor:** selecciona un proveedor y abre su edición **(ver E1)**.<br>2. **Nexus:** muestra los datos actuales, incluido el estado.<br>3. **Actor:** elige el nuevo estado y confirma.<br>4. **Nexus:** valida los datos y actualiza el proveedor como parte de la edición.<br>5. **Nexus:** refresca el listado y confirma el cambio de estado. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Activación o desactivación del proveedor.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-011`. |

#### `CU-CAT-10` — Consultar clientes

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-10` |
| Nombre | Consultar clientes. |
| Actor y disparador | **Actor:** Administrador del sistema. **Disparador:** necesita localizar o revisar clientes y abre la opción de consulta correspondiente. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Inferencia desde código | **Directa.** `clientApiRoute.js` GET → `getAllClients`. |
| Flujo principal | 1. **Actor:** abre la opción para consultar clientes **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra la tabla con búsqueda, filtros y paginación disponibles.<br>3. **Actor:** captura los criterios que necesita y solicita aplicarlos.<br>4. **Nexus:** actualiza la tabla y el total con la información autorizada, sin modificar datos.<br>5. **Actor:** selecciona un registro cuando necesita revisar su información.<br>6. **Nexus:** muestra el detalle y las acciones que el actor puede ejecutar. |
| Continuaciones asociadas | Después de presentar las acciones disponibles, el actor puede terminar `CU-CAT-10` e iniciar, si cuenta con autorización, `CU-CAT-11` Crear cliente o, después de seleccionar un cliente, `CU-CAT-12` Editar cliente. La selección no constituye `«include»` ni `«extend»`; el caso elegido comprueba nuevamente sus precondiciones. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Listado de clientes autorizados.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-003`. |

#### `CU-CAT-11` — Crear cliente

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-11` |
| Nombre | Crear cliente. |
| Actor y disparador | **Actor:** Administrador del sistema. **Disparador:** necesita incorporar un cliente y selecciona la acción de alta. |
| Participación de actor y sistema | **Actor:** abre el alta, captura datos y confirma.<br>**Nexus:** carga opciones, valida, registra y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de alta.<br>3. Existen los datos relacionados requeridos para completar el registro. |
| Inferencia desde código | **Directa.** `clientApiRoute.js` POST → `registerClient`. |
| Flujo principal | 1. **Actor:** abre la opción para crear cliente **(ver E1)**.<br>2. **Nexus:** muestra el formulario y carga las opciones relacionadas que puede utilizar.<br>3. **Actor:** captura los datos y relaciones requeridos y confirma.<br>4. **Nexus:** valida autorización, obligatoriedad, formato, identidad y relaciones.<br>5. **Nexus:** registra cliente, actualiza el listado y muestra la confirmación. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Alta con asesor opcional válido.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-013`. |

#### `CU-CAT-12` — Editar cliente

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-12` |
| Nombre | Editar cliente. |
| Actor y disparador | **Actor:** Administrador del sistema. **Disparador:** detecta datos que debe corregir en un cliente y selecciona su acción de edición. |
| Participación de actor y sistema | **Actor:** selecciona el registro, modifica datos y confirma.<br>**Nexus:** presenta valores vigentes, valida, actualiza y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de edición.<br>3. El registro objetivo existe.<br>4. El registro se encuentra en un estado que admite los cambios solicitados. |
| Inferencia desde código | **Directa.** `clientApiRoute.js` PUT `/:id` → `editClient`. |
| Flujo principal | 1. **Actor:** selecciona cliente y abre la edición **(ver E1)**.<br>2. **Nexus:** muestra los valores actuales y habilita sólo los campos permitidos.<br>3. **Actor:** modifica los datos admitidos y confirma.<br>4. **Nexus:** valida autorización, formato, identidad y relaciones.<br>5. **Nexus:** guarda los cambios, actualiza el listado y muestra la confirmación. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Actualización de datos y asesor opcional.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-014`. |

#### `CU-CAT-13` — Consultar mermas

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-13` |
| Nombre | Consultar mermas. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** necesita localizar o revisar mermas y abre la opción de consulta correspondiente. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Inferencia desde código | **Directa.** `wasteApiRoute.js` GET → `getAllWastes` → `findAllWastes`. |
| Flujo principal | 1. **Actor:** abre la opción para consultar mermas **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra la tabla con búsqueda, filtros y paginación disponibles.<br>3. **Actor:** captura los criterios que necesita y solicita aplicarlos.<br>4. **Nexus:** actualiza la tabla y el total con la información autorizada, sin modificar datos.<br>5. **Actor:** selecciona un registro cuando necesita revisar su información.<br>6. **Nexus:** muestra el detalle y las acciones que el actor puede ejecutar. |
| Continuaciones asociadas | Después de presentar las acciones disponibles, el actor puede terminar `CU-CAT-13` e iniciar, si cuenta con autorización, `CU-CAT-14` Registrar merma o, después de seleccionar una merma, `CU-CAT-15` Editar merma o `CU-CAT-16` Ajustar existencia de merma. La selección no constituye `«include»` ni `«extend»`; el caso elegido comprueba nuevamente sus precondiciones. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Listado de existencias de merma.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-004`. |

#### `CU-CAT-14` — Registrar merma

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-14` |
| Nombre | Registrar merma. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** necesita registrar una merma y abre su formulario de registro. |
| Participación de actor y sistema | **Actor:** abre el alta, captura datos y confirma.<br>**Nexus:** carga opciones, valida, registra y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de alta.<br>3. Existen los datos relacionados requeridos para completar el registro. |
| Inferencia desde código | **Compuesta.** GET `/material-templates` → POST de merma → DTO → alta con ajuste inicial → evento de inventario. |
| Flujo principal | 1. **Actor:** abre «Agregar merma» y selecciona primero un proveedor **(ver E1)**.<br>2. **Nexus:** carga los materiales de ese proveedor que pueden utilizarse como plantilla.<br>3. **Actor:** elige el material, completa los datos propios de la merma y confirma.<br>4. **Nexus:** valida identidad, dimensiones, existencia y datos relacionados.<br>5. **Nexus:** crea la merma con sus propios datos históricos, registra su existencia inicial y confirma el alta. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Alta desde una plantilla material-proveedor.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-015`. |

#### `CU-CAT-15` — Editar merma

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-15` |
| Nombre | Editar merma. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** detecta datos que debe corregir en una merma y selecciona su acción de edición. |
| Participación de actor y sistema | **Actor:** selecciona el registro, modifica datos y confirma.<br>**Nexus:** presenta valores vigentes, valida, actualiza y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de edición.<br>3. El registro objetivo existe.<br>4. El registro se encuentra en un estado que admite los cambios solicitados. |
| Inferencia desde código | **Directa.** `wasteApiRoute.js` PATCH `/:id` → validación → DTO → `updateWaste`. |
| Flujo principal | 1. **Actor:** selecciona merma y abre la edición **(ver E1)**.<br>2. **Nexus:** muestra los valores actuales y habilita sólo los campos permitidos.<br>3. **Actor:** modifica los datos admitidos y confirma.<br>4. **Nexus:** valida autorización, formato, identidad y relaciones.<br>5. **Nexus:** guarda los cambios, actualiza el listado y muestra la confirmación. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Actualización sin alterar su identidad física.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-016`, `RF-CAT-017`. |

#### `CU-CAT-16` — Ajustar existencia de merma

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-16` |
| Nombre | Ajustar existencia de merma. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** detecta o autoriza una diferencia de existencia de merma y abre el ajuste de stock. |
| Participación de actor y sistema | **Actor:** selecciona el inventario, captura el ajuste y confirma.<br>**Nexus:** muestra la existencia, valida, registra el ajuste y actualiza inventario. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de ajuste.<br>3. El recurso cuya existencia se ajustará existe. |
| Inferencia desde código | **Directa.** `wasteApiRoute.js` PATCH `/:id/stock` → `updateWasteStock` → evento de inventario. |
| Flujo principal | 1. **Actor:** selecciona el registro de merma y abre «Ajustar existencia» **(ver E1)**.<br>2. **Nexus:** muestra la existencia actual y los campos de tipo, cantidad y motivo.<br>3. **Actor:** captura el ajuste y lo confirma.<br>4. **Nexus:** valida la autorización, el motivo y la cantidad y registra el ajuste junto con la nueva existencia.<br>5. **Nexus:** actualiza las vistas de inventario y confirma el resultado. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La existencia de la merma refleja el ajuste autorizado.<br>2. **Éxito:** El ajuste queda registrado con su motivo y trazabilidad.<br>3. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-018`. |

#### `CU-CAT-17` — Consultar presentaciones

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-17` |
| Nombre | Consultar presentaciones. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** abre un formulario cuyo selector requiere presentaciones. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Inferencia desde código | **Directa.** `presentationApiRoute.js` GET → `getAllPresentations`. |
| Flujo principal | 1. **Actor:** abre el formulario del proceso que requiere presentaciones **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y carga presentaciones vigentes.<br>3. **Actor:** consulta o selecciona una opción de presentaciones.<br>4. **Nexus:** conserva la selección para continuar el proceso principal sin modificar el catálogo. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Catálogo auxiliar de sólo lectura.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-005`. |

#### `CU-CAT-18` — Consultar unidades de medida

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-18` |
| Nombre | Consultar unidades de medida. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** abre un formulario cuyo selector requiere unidades de medida. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Inferencia desde código | **Directa.** `unitMeasureApiRoute.js` GET → `getAllUnitMeasures`. |
| Flujo principal | 1. **Actor:** abre el formulario del proceso que requiere unidades de medida **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y carga unidades de medida vigentes.<br>3. **Actor:** consulta o selecciona una opción de unidades de medida.<br>4. **Nexus:** conserva la selección para continuar el proceso principal sin modificar el catálogo. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Catálogo auxiliar de sólo lectura.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-005`. |

#### `CU-CAT-19` — Consultar motivos de ajuste

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-19` |
| Nombre | Consultar motivos de ajuste. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** abre un formulario cuyo selector requiere motivos de ajuste. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Inferencia desde código | **Directa.** `reasonApiRoute.js` GET → `getAllReasons`. |
| Flujo principal | 1. **Actor:** abre el formulario del proceso que requiere motivos de ajuste **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y carga motivos de ajuste vigentes.<br>3. **Actor:** consulta o selecciona una opción de motivos de ajuste.<br>4. **Nexus:** conserva la selección para continuar el proceso principal sin modificar el catálogo. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Catálogo auxiliar de sólo lectura.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-005`. |

#### `CU-CAT-20` — Consultar estados de cumplimiento

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-20` |
| Nombre | Consultar estados de cumplimiento. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** abre un formulario cuyo selector requiere estados de cumplimiento. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Inferencia desde código | **Directa.** `fulfillmentStatusApiRoute.js` GET → `getAllFulfillmentStatuses`. |
| Flujo principal | 1. **Actor:** abre el formulario del proceso que requiere estados de cumplimiento **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y carga estados de cumplimiento vigentes.<br>3. **Actor:** consulta o selecciona una opción de estados de cumplimiento.<br>4. **Nexus:** conserva la selección para continuar el proceso principal sin modificar el catálogo. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Catálogo auxiliar de sólo lectura.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-005`. |

### Grupo funcional ENT — Compras de material

Cada ficha representa una sola acción sobre una sola entidad. Los elementos compartidos se reutilizan en la implementación, pero no fusionan objetivos del actor.

#### `CU-ENT-01` — Consultar compras de material

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ENT-01` |
| Nombre | Consultar compras de material. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** necesita localizar o revisar compras de material y abre la opción de consulta correspondiente. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Inferencia desde código | **Directa.** `goodsReceiptApiRoute.js` GET → normalización de filtros/paginación → `findAllGoodsReceipts`. |
| Flujo principal | 1. **Actor:** abre la opción para consultar compras de material **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra la tabla con búsqueda, filtros y paginación disponibles.<br>3. **Actor:** captura los criterios que necesita y solicita aplicarlos.<br>4. **Nexus:** actualiza la tabla y el total con la información autorizada, sin modificar datos.<br>5. **Actor:** selecciona un registro cuando necesita revisar su información.<br>6. **Nexus:** muestra el detalle y las acciones que el actor puede ejecutar. |
| Continuaciones asociadas | Después de presentar las acciones disponibles, el actor puede terminar `CU-ENT-01` e iniciar, si cuenta con autorización, `CU-ENT-02` Crear compra de material o, después de seleccionar una compra o detalle, `CU-ENT-03` Editar compra de material, `CU-ENT-04` Corregir material de una compra o `CU-ENT-05` Cancelar material de una compra. La selección no constituye `«include»` ni `«extend»`; el caso elegido comprueba nuevamente sus precondiciones. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Listado y detalle sin modificar inventario.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REC-001`. |

#### `CU-ENT-02` — Crear compra de material

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ENT-02` |
| Nombre | Crear compra de material. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** recibe materiales de un proveedor y abre la acción de alta de compra. |
| Participación de actor y sistema | **Actor:** abre el alta, captura datos y confirma.<br>**Nexus:** carga opciones, valida, registra y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de alta.<br>3. Existen los datos relacionados requeridos para completar el registro. |
| Inferencia desde código | **Compuesta.** POST → validación → DTO → `createGoodsReceipt` → evento de inventario. |
| Flujo principal | 1. **Actor:** abre «Agregar compra» **(ver E1)**.<br>2. **Nexus:** muestra el formulario y carga proveedores, receptores y materiales disponibles.<br>3. **Actor:** captura factura y encabezado, agrega materiales con cantidad y precio y confirma.<br>4. **Nexus:** valida factura, relaciones, cantidades y precios y muestra los totales calculados.<br>5. **Nexus:** registra compra y detalles, incrementa existencias y conserva los movimientos como una sola operación.<br>6. **Nexus:** actualiza la tabla y confirma el registro. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La compra y sus detalles quedan registrados.<br>2. **Éxito:** Las existencias incorporan las cantidades recibidas.<br>3. **Éxito:** Los movimientos de entrada quedan registrados.<br>4. **Éxito:** La compra, las existencias y los movimientos se conservan como una sola operación transaccional.<br>5. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REC-003`, `RF-REC-004`, `RF-REC-007`. |

#### `CU-ENT-03` — Editar compra de material

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ENT-03` |
| Nombre | Editar compra de material. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** detecta datos que debe corregir en una compra de material y selecciona su acción de edición. |
| Participación de actor y sistema | **Actor:** selecciona el registro, modifica datos y confirma.<br>**Nexus:** presenta valores vigentes, valida, actualiza y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de edición.<br>3. El registro objetivo existe.<br>4. El registro se encuentra en un estado que admite los cambios solicitados. |
| Inferencia desde código | **Directa.** PATCH `/:id` → validación de encabezado → `updateGoodsReceipt` → evento de inventario. |
| Flujo principal | 1. **Actor:** selecciona una compra y abre su edición **(ver E1)**.<br>2. **Nexus:** muestra el encabezado y los detalles actuales y habilita sólo los campos permitidos.<br>3. **Actor:** modifica el encabezado o agrega detalles admitidos y confirma.<br>4. **Nexus:** valida el estado, la factura y los cambios solicitados.<br>5. **Nexus:** guarda los cambios sin volver a aplicar la existencia de detalles anteriores y confirma la actualización. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** El encabezado y los detalles admitidos reflejan los cambios confirmados.<br>2. **Éxito:** Las existencias de los detalles anteriores no vuelven a aplicarse.<br>3. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REC-005`. |

#### `CU-ENT-04` — Corregir material de una compra

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ENT-04` |
| Nombre | Corregir material de una compra. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** detecta una diferencia en un material de una compra y abre la corrección del detalle. |
| Participación de actor y sistema | **Actor:** selecciona el detalle, captura la corrección y confirma.<br>**Nexus:** valida y coordina detalle, existencia, movimiento, totales e historial. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso operativo.<br>3. La compra y el detalle existen.<br>4. El detalle se encuentra en un estado que admite corrección. |
| Inferencia desde código | **Compuesta.** PATCH `/:id/details/:detailId/corrections` → DTO → `correctGoodsReceiptDetailLine` → evento. |
| Flujo principal | 1. **Actor:** selecciona un material de la compra y abre «Corregir detalle» **(ver E1)**.<br>2. **Nexus:** muestra los valores actuales y solicita cantidad o costo corregido y motivo.<br>3. **Actor:** captura la corrección y la confirma.<br>4. **Nexus:** valida el estado, el motivo, la diferencia y la existencia disponible.<br>5. **Nexus:** actualiza detalle, existencia, movimiento, totales e historial como una sola operación y confirma. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** El detalle conserva la cantidad o el costo corregido.<br>2. **Éxito:** La existencia refleja la diferencia autorizada.<br>3. **Éxito:** El movimiento y los totales reflejan la corrección.<br>4. **Éxito:** El historial conserva el motivo y el actor de la corrección.<br>5. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REC-002`. |

#### `CU-ENT-05` — Cancelar material de una compra

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ENT-05` |
| Nombre | Cancelar material de una compra. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** determina que debe anular material de una compra y solicita la cancelación. |
| Participación de actor y sistema | **Actor:** selecciona el detalle y confirma la cancelación.<br>**Nexus:** valida y coordina la cancelación, la existencia, el movimiento y los totales. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso operativo.<br>3. La compra y el detalle activo existen.<br>4. El detalle se encuentra en un estado que admite cancelación. |
| Inferencia desde código | **Compuesta.** PATCH `/:id/details/:detailId/cancel` → `cancelGoodsReceiptDetailLine` → evento. |
| Flujo principal | 1. **Actor:** selecciona un detalle activo y solicita cancelarlo **(ver E1)**.<br>2. **Nexus:** identifica el detalle y solicita confirmación.<br>3. **Actor:** confirma la cancelación.<br>4. **Nexus:** valida que el detalle pueda cancelarse y que la existencia pueda revertirse.<br>5. **Nexus:** cancela el detalle, revierte existencia, movimiento y totales y confirma el resultado. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** El detalle queda cancelado.<br>2. **Éxito:** La existencia recibida por el detalle queda revertida.<br>3. **Éxito:** El movimiento y los totales reflejan la cancelación.<br>4. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REC-008`. |

### Grupo funcional SAL — Salidas de material y de merma

Cada ficha representa una sola acción sobre una sola entidad. Los elementos compartidos se reutilizan en la implementación, pero no fusionan objetivos del actor.

#### `CU-SAL-01` — Consultar salidas de material

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-01` |
| Nombre | Consultar salidas de material. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** necesita localizar o revisar salidas de material y abre la opción de consulta correspondiente. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Inferencia desde código | **Directa.** `goodsIssueApiRoute.js` GET → filtros/paginación → `findAllGoodsIssues`. |
| Flujo principal | 1. **Actor:** abre la opción para consultar salidas de material **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra la tabla con búsqueda, filtros y paginación disponibles.<br>3. **Actor:** captura los criterios que necesita y solicita aplicarlos.<br>4. **Nexus:** actualiza la tabla y el total con la información autorizada, sin modificar datos.<br>5. **Actor:** selecciona un registro cuando necesita revisar su información.<br>6. **Nexus:** muestra el detalle y las acciones que el actor puede ejecutar. |
| Continuaciones asociadas | Después de presentar las acciones disponibles, el actor puede terminar `CU-SAL-01` e iniciar, si cuenta con autorización, `CU-SAL-02` Crear salida de material o, después de seleccionar una salida o detalle, `CU-SAL-03` Editar encabezado, `CU-SAL-04` Ajustar materiales, `CU-SAL-05` Surtir material o `CU-SAL-06` Devolver material surtido. La selección no constituye `«include»` ni `«extend»`; el caso elegido comprueba nuevamente sus precondiciones. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Consulta sin modificar existencias.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-ISS-001`. |

#### `CU-SAL-02` — Crear salida de material

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-02` |
| Nombre | Crear salida de material. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** recibe una solicitud de material y abre la acción de alta de salida. |
| Participación de actor y sistema | **Actor:** abre el alta, captura datos y confirma.<br>**Nexus:** carga opciones, valida, registra y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de alta.<br>3. Existen los datos relacionados requeridos para completar el registro. |
| Inferencia desde código | **Directa.** POST → validación → DTO → `createGoodsIssue`. |
| Flujo principal | 1. **Actor:** abre «Agregar salida de material» **(ver E1)**.<br>2. **Nexus:** muestra el formulario y carga clientes, proyectos, solicitantes y recursos autorizados.<br>3. **Actor:** captura el encabezado, agrega materiales y cantidades y confirma.<br>4. **Nexus:** valida participantes, relaciones, recursos y cantidades.<br>5. **Nexus:** crea la salida pendiente sin descontar existencias, actualiza la tabla y confirma. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La salida de material queda registrada en estado pendiente.<br>2. **Éxito:** Las existencias permanecen sin cambios hasta el surtimiento.<br>3. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-ISS-004`. |

#### `CU-SAL-03` — Editar encabezado de salida de material

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-03` |
| Nombre | Editar encabezado de salida de material. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** detecta datos que debe corregir en el encabezado de una salida de material y selecciona su acción de edición. |
| Participación de actor y sistema | **Actor:** selecciona el registro, modifica datos y confirma.<br>**Nexus:** presenta valores vigentes, valida, actualiza y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de edición.<br>3. El registro objetivo existe.<br>4. El registro se encuentra en un estado que admite los cambios solicitados. |
| Inferencia desde código | **Directa.** PATCH `/:id/header` → validación → DTO → `updateGoodsIssueHeader`. |
| Flujo principal | 1. **Actor:** selecciona una salida de material y abre la edición de encabezado **(ver E1)**.<br>2. **Nexus:** muestra los datos actuales y habilita sólo los campos permitidos por su estado.<br>3. **Actor:** modifica los datos contextuales y confirma.<br>4. **Nexus:** valida el estado, los participantes y las relaciones y actualiza el encabezado.<br>5. **Nexus:** conserva intactas las cantidades y existencias y confirma la actualización. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** El encabezado conserva los cambios admitidos.<br>2. **Éxito:** Los detalles, las cantidades y las existencias permanecen sin cambios.<br>3. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-ISS-005`. |

#### `CU-SAL-04` — Ajustar materiales de una salida

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-04` |
| Nombre | Ajustar materiales de una salida. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** necesita agregar o corregir materiales de una salida todavía modificables y abre los detalles. |
| Participación de actor y sistema | **Actor:** selecciona la salida o detalle, captura la acción y confirma.<br>**Nexus:** presenta cantidades y acciones permitidas, valida y actualiza documento, inventario y movimientos cuando corresponde. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de edición.<br>3. La salida existe.<br>4. La salida se encuentra en un estado que admite modificar sus detalles. |
| Inferencia desde código | **Compartida.** PATCH `/:id/details` → validación → DTO → `updateGoodsIssueDetails`. |
| Flujo principal | 1. **Actor:** abre los detalles de una salida todavía modificable **(ver E1)**.<br>2. **Nexus:** muestra los materiales actuales, cantidades y acciones permitidas.<br>3. **Actor:** agrega o modifica materiales y confirma los cambios.<br>4. **Nexus:** valida estado, recursos, cantidades pendientes y acumulados.<br>5. **Nexus:** actualiza los detalles sin descontar existencias y confirma el resultado. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Los detalles conservan los materiales y cantidades confirmados.<br>2. **Éxito:** Las existencias permanecen sin cambios hasta el surtimiento.<br>3. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-ISS-006`. |

#### `CU-SAL-05` — Surtir material

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-05` |
| Nombre | Surtir material. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** va a entregar material de una solicitud pendiente y abre sus detalles. |
| Participación de actor y sistema | **Actor:** selecciona la salida o detalle, captura la acción y confirma.<br>**Nexus:** presenta cantidades y acciones permitidas, valida y actualiza documento, inventario y movimientos cuando corresponde. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso operativo.<br>3. La salida y el detalle existen.<br>4. El detalle conserva cantidad pendiente.<br>5. Hay existencia suficiente para surtir la cantidad solicitada. |
| Inferencia desde código | **Subflujo.** la confirmación de surtido usa PATCH `/:id/details` y `updateGoodsIssueDetails`; no hay ruta `/supply`. |
| Flujo principal | 1. **Actor:** abre los detalles de la salida de material y selecciona un renglón pendiente **(ver E1)**.<br>2. **Nexus:** muestra la cantidad pendiente y la existencia disponible.<br>3. **Actor:** captura la cantidad que va a surtir y confirma.<br>4. **Nexus:** valida estado, cantidad pendiente y existencia suficiente.<br>5. **Nexus:** descuenta existencia, acumula lo surtido, actualiza estados, registra el movimiento y confirma. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La existencia disminuye en la cantidad surtida.<br>2. **Éxito:** El detalle acumula la cantidad surtida.<br>3. **Éxito:** Los estados de cumplimiento quedan actualizados.<br>4. **Éxito:** El movimiento de salida queda registrado.<br>5. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-ISS-002`. |

#### `CU-SAL-06` — Devolver material surtido

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-06` |
| Nombre | Devolver material surtido. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** recibe de vuelta material surtido y abre la devolución del detalle. |
| Participación de actor y sistema | **Actor:** selecciona la salida o detalle, captura la acción y confirma.<br>**Nexus:** presenta cantidades y acciones permitidas, valida y actualiza documento, inventario y movimientos cuando corresponde. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso operativo.<br>3. La salida y el detalle existen.<br>4. El detalle conserva una cantidad surtida todavía retornable. |
| Inferencia desde código | **Directa.** PATCH `/:id/details/:detailId/returns` → DTO → `returnGoodsIssueDetail` → evento. |
| Flujo principal | 1. **Actor:** abre una salida de material y selecciona un detalle surtido para devolverlo **(ver E1)**.<br>2. **Nexus:** muestra la cantidad que todavía puede devolverse.<br>3. **Actor:** captura la cantidad recibida de vuelta y confirma.<br>4. **Nexus:** valida la cantidad retornable.<br>5. **Nexus:** reintegra existencia, acumula la devolución, actualiza estados, registra el movimiento inverso y confirma. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La existencia aumenta en la cantidad devuelta.<br>2. **Éxito:** El detalle acumula la devolución.<br>3. **Éxito:** Los estados de cumplimiento quedan actualizados.<br>4. **Éxito:** El movimiento inverso queda registrado.<br>5. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-ISS-003`. |

#### `CU-SAL-07` — Consultar salidas de merma

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-07` |
| Nombre | Consultar salidas de merma. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** necesita localizar o revisar salidas de merma y abre la opción de consulta correspondiente. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Inferencia desde código | **Directa.** `wasteIssueApiRoute.js` GET → filtros/paginación → `findAllWasteIssues`. |
| Flujo principal | 1. **Actor:** abre la opción para consultar salidas de merma **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra la tabla con búsqueda, filtros y paginación disponibles.<br>3. **Actor:** captura los criterios que necesita y solicita aplicarlos.<br>4. **Nexus:** actualiza la tabla y el total con la información autorizada, sin modificar datos.<br>5. **Actor:** selecciona un registro cuando necesita revisar su información.<br>6. **Nexus:** muestra el detalle y las acciones que el actor puede ejecutar. |
| Continuaciones asociadas | Después de presentar las acciones disponibles, el actor puede terminar `CU-SAL-07` e iniciar, si cuenta con autorización, `CU-SAL-08` Crear salida de merma o, después de seleccionar una salida o detalle, `CU-SAL-09` Editar encabezado, `CU-SAL-10` Ajustar mermas, `CU-SAL-11` Surtir merma o `CU-SAL-12` Devolver merma surtida. La selección no constituye `«include»` ni `«extend»`; el caso elegido comprueba nuevamente sus precondiciones. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Consulta sin modificar existencias.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-WST-001`. |

#### `CU-SAL-08` — Crear salida de merma

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-08` |
| Nombre | Crear salida de merma. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** recibe una solicitud de merma y abre la acción de alta de salida. |
| Participación de actor y sistema | **Actor:** abre el alta, captura datos y confirma.<br>**Nexus:** carga opciones, valida, registra y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de alta.<br>3. Existen los datos relacionados requeridos para completar el registro. |
| Inferencia desde código | **Directa.** POST → validación → DTO → `createWasteIssue`. |
| Flujo principal | 1. **Actor:** abre «Agregar salida de merma» **(ver E1)**.<br>2. **Nexus:** muestra el formulario y carga clientes, proyectos, solicitantes y recursos autorizados.<br>3. **Actor:** captura el encabezado, agrega mermas con sus cantidades y confirma.<br>4. **Nexus:** valida participantes, relaciones, recursos y cantidades.<br>5. **Nexus:** crea la salida pendiente sin descontar existencias, actualiza la tabla y confirma. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La salida de merma queda registrada en estado pendiente.<br>2. **Éxito:** Las existencias permanecen sin cambios hasta el surtimiento.<br>3. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-WST-004`. |

#### `CU-SAL-09` — Editar encabezado de salida de merma

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-09` |
| Nombre | Editar encabezado de salida de merma. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** detecta datos que debe corregir en el encabezado de una salida de merma y selecciona su acción de edición. |
| Participación de actor y sistema | **Actor:** selecciona el registro, modifica datos y confirma.<br>**Nexus:** presenta valores vigentes, valida, actualiza y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de edición.<br>3. El registro objetivo existe.<br>4. El registro se encuentra en un estado que admite los cambios solicitados. |
| Inferencia desde código | **Directa.** PATCH `/:id/header` → validación → DTO → `updateWasteIssueHeader`. |
| Flujo principal | 1. **Actor:** selecciona una salida de merma y abre la edición de encabezado **(ver E1)**.<br>2. **Nexus:** muestra los datos actuales y habilita sólo los campos permitidos por su estado.<br>3. **Actor:** modifica los datos contextuales y confirma.<br>4. **Nexus:** valida el estado, los participantes y las relaciones y actualiza el encabezado.<br>5. **Nexus:** conserva intactas las cantidades y existencias y confirma la actualización. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** El encabezado conserva los cambios admitidos.<br>2. **Éxito:** Los detalles, las cantidades y las existencias permanecen sin cambios.<br>3. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-WST-005`. |

#### `CU-SAL-10` — Ajustar mermas de una salida

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-10` |
| Nombre | Ajustar mermas de una salida. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** necesita agregar o corregir mermas de una salida todavía modificables y abre los detalles. |
| Participación de actor y sistema | **Actor:** selecciona la salida o detalle, captura la acción y confirma.<br>**Nexus:** presenta cantidades y acciones permitidas, valida y actualiza documento, inventario y movimientos cuando corresponde. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de edición.<br>3. La salida existe.<br>4. La salida se encuentra en un estado que admite modificar sus detalles. |
| Inferencia desde código | **Compartida.** PATCH `/:id/details` → validación → DTO → `updateWasteIssueDetails`. |
| Flujo principal | 1. **Actor:** abre los detalles de una salida todavía modificable **(ver E1)**.<br>2. **Nexus:** muestra las mermas actuales, cantidades y acciones permitidas.<br>3. **Actor:** agrega o modifica mermas y confirma los cambios.<br>4. **Nexus:** valida estado, recursos, cantidades pendientes y acumulados.<br>5. **Nexus:** actualiza los detalles sin descontar existencias y confirma el resultado. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Los detalles conservan las mermas y cantidades confirmadas.<br>2. **Éxito:** Las existencias permanecen sin cambios hasta el surtimiento.<br>3. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-WST-006`. |

#### `CU-SAL-11` — Surtir merma

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-11` |
| Nombre | Surtir merma. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** va a entregar merma de una solicitud pendiente y abre sus detalles. |
| Participación de actor y sistema | **Actor:** selecciona la salida o detalle, captura la acción y confirma.<br>**Nexus:** presenta cantidades y acciones permitidas, valida y actualiza documento, inventario y movimientos cuando corresponde. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso operativo.<br>3. La salida y el detalle existen.<br>4. El detalle conserva cantidad pendiente.<br>5. Hay existencia suficiente para surtir la cantidad solicitada. |
| Inferencia desde código | **Subflujo.** la confirmación de surtido usa PATCH `/:id/details` y `updateWasteIssueDetails`; no hay ruta `/supply`. |
| Flujo principal | 1. **Actor:** abre los detalles de la salida de merma y selecciona un renglón pendiente **(ver E1)**.<br>2. **Nexus:** muestra la cantidad pendiente y la existencia disponible.<br>3. **Actor:** captura la cantidad que va a surtir y confirma.<br>4. **Nexus:** valida estado, cantidad pendiente y existencia suficiente.<br>5. **Nexus:** descuenta existencia, acumula lo surtido, actualiza estados, registra el movimiento y confirma. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La existencia disminuye en la cantidad surtida.<br>2. **Éxito:** El detalle acumula la cantidad surtida.<br>3. **Éxito:** Los estados de cumplimiento quedan actualizados.<br>4. **Éxito:** El movimiento de salida queda registrado.<br>5. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-WST-002`. |

#### `CU-SAL-12` — Devolver merma surtida

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-12` |
| Nombre | Devolver merma surtida. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** recibe de vuelta merma surtida y abre la devolución del detalle. |
| Participación de actor y sistema | **Actor:** selecciona la salida o detalle, captura la acción y confirma.<br>**Nexus:** presenta cantidades y acciones permitidas, valida y actualiza documento, inventario y movimientos cuando corresponde. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso operativo.<br>3. La salida y el detalle existen.<br>4. El detalle conserva una cantidad surtida todavía retornable. |
| Inferencia desde código | **Directa.** PATCH `/:id/details/:detailId/returns` → DTO → `returnWasteIssueDetail` → evento. |
| Flujo principal | 1. **Actor:** abre una salida de merma y selecciona un detalle surtido para devolverlo **(ver E1)**.<br>2. **Nexus:** muestra la cantidad que todavía puede devolverse.<br>3. **Actor:** captura la cantidad recibida de vuelta y confirma.<br>4. **Nexus:** valida la cantidad retornable.<br>5. **Nexus:** reintegra existencia, acumula la devolución, actualiza estados, registra el movimiento inverso y confirma. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La existencia aumenta en la cantidad devuelta.<br>2. **Éxito:** El detalle acumula la devolución.<br>3. **Éxito:** Los estados de cumplimiento quedan actualizados.<br>4. **Éxito:** El movimiento inverso queda registrado.<br>5. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-WST-003`. |

### Grupo funcional REP — Consultas y reportes

Cada ficha representa una sola acción sobre una sola entidad. Los elementos compartidos se reutilizan en la implementación, pero no fusionan objetivos del actor.

#### `CU-REP-01` — Consultar inventario de materiales

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-REP-01` |
| Nombre | Consultar inventario de materiales. |
| Actor y disparador | **Actor:** Usuario con permiso sobre el reporte o consulta. **Disparador:** necesita localizar o revisar inventario de materiales y abre la opción de consulta correspondiente. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Inferencia desde código | **Compartida.** reutiliza GET de `materialApiRoute.js`; el código no expone otra consulta de inventario. |
| Flujo principal | 1. **Actor:** abre la opción para consultar inventario de materiales **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra la tabla con búsqueda, filtros y paginación disponibles.<br>3. **Actor:** captura los criterios que necesita y solicita aplicarlos.<br>4. **Nexus:** actualiza la tabla y el total con la información autorizada, sin modificar datos.<br>5. **Actor:** selecciona un registro cuando necesita revisar su información.<br>6. **Nexus:** muestra el detalle y las acciones que el actor puede ejecutar. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Consulta autorizada sin modificar datos.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-001`. |

#### `CU-REP-02` — Consultar inventario de mermas

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-REP-02` |
| Nombre | Consultar inventario de mermas. |
| Actor y disparador | **Actor:** Usuario con permiso sobre el reporte o consulta. **Disparador:** necesita localizar o revisar inventario de mermas y abre la opción de consulta correspondiente. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Inferencia desde código | **Compartida.** reutiliza GET de `wasteApiRoute.js`; el código no expone otra consulta de inventario. |
| Flujo principal | 1. **Actor:** abre la opción para consultar inventario de mermas **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra la tabla con búsqueda, filtros y paginación disponibles.<br>3. **Actor:** captura los criterios que necesita y solicita aplicarlos.<br>4. **Nexus:** actualiza la tabla y el total con la información autorizada, sin modificar datos.<br>5. **Actor:** selecciona un registro cuando necesita revisar su información.<br>6. **Nexus:** muestra el detalle y las acciones que el actor puede ejecutar. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Consulta autorizada sin modificar datos.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-001`. |

#### `CU-REP-03` — Consultar movimientos de materiales

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-REP-03` |
| Nombre | Consultar movimientos de materiales. |
| Actor y disparador | **Actor:** Usuario con permiso sobre el reporte o consulta. **Disparador:** necesita localizar o revisar movimientos de materiales y abre la opción de consulta correspondiente. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Inferencia desde código | **Directa.** `movementApiRoute.js` GET `/materials` → `getAllMaterialMovements`. |
| Flujo principal | 1. **Actor:** abre la opción para consultar movimientos de materiales **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra la tabla con búsqueda, filtros y paginación disponibles.<br>3. **Actor:** captura los criterios que necesita y solicita aplicarlos.<br>4. **Nexus:** actualiza la tabla y el total con la información autorizada, sin modificar datos.<br>5. **Actor:** selecciona un registro cuando necesita revisar su información.<br>6. **Nexus:** muestra el detalle y las acciones que el actor puede ejecutar. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Consulta autorizada sin modificar datos.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-001`. |

#### `CU-REP-04` — Consultar movimientos de mermas

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-REP-04` |
| Nombre | Consultar movimientos de mermas. |
| Actor y disparador | **Actor:** Usuario con permiso sobre el reporte o consulta. **Disparador:** necesita localizar o revisar movimientos de mermas y abre la opción de consulta correspondiente. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Inferencia desde código | **Directa.** `movementApiRoute.js` GET `/wastes` → `getAllWasteMovements`. |
| Flujo principal | 1. **Actor:** abre la opción para consultar movimientos de mermas **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra la tabla con búsqueda, filtros y paginación disponibles.<br>3. **Actor:** captura los criterios que necesita y solicita aplicarlos.<br>4. **Nexus:** actualiza la tabla y el total con la información autorizada, sin modificar datos.<br>5. **Actor:** selecciona un registro cuando necesita revisar su información.<br>6. **Nexus:** muestra el detalle y las acciones que el actor puede ejecutar. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Consulta autorizada sin modificar datos.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-001`. |

#### `CU-REP-05` — Generar reporte de inventario de materiales

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-REP-05` |
| Nombre | Generar reporte de inventario de materiales. |
| Actor y disparador | **Actor:** Usuario con permiso sobre el reporte o consulta. **Disparador:** necesita analizar o entregar información de inventario de materiales y solicita su exportación. |
| Participación de actor y sistema | **Actor:** define filtros y solicita la exportación.<br>**Nexus:** autoriza, consolida la información y entrega el archivo. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Inferencia desde código | **Directa.** `reportApiRoute.js` GET `/inventory/excel` → `exportWarehouseReportExcel` → `sendExcelReport`. |
| Flujo principal | 1. **Actor:** abre la consulta de inventario de materiales y define los filtros del reporte **(ver E1)**.<br>2. **Nexus:** muestra la información autorizada que corresponde a esos filtros.<br>3. **Actor:** selecciona «Exportar Excel», elige las opciones disponibles y confirma.<br>4. **Nexus:** vuelve a comprobar autorización y parámetros y prepara las filas, agrupaciones y totales.<br>5. **Nexus:** genera el archivo de Excel e inicia su descarga; si no hay datos, informa que el resultado está vacío. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Archivo Excel con filtros, columnas y cálculos propios del reporte.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-002` a `RF-REP-005`. |

#### `CU-REP-06` — Generar reporte de salidas de material

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-REP-06` |
| Nombre | Generar reporte de salidas de material. |
| Actor y disparador | **Actor:** Usuario con permiso sobre el reporte o consulta. **Disparador:** necesita analizar o entregar información de salidas de material y solicita su exportación. |
| Participación de actor y sistema | **Actor:** define filtros y solicita la exportación.<br>**Nexus:** autoriza, consolida la información y entrega el archivo. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Inferencia desde código | **Directa.** `reportApiRoute.js` GET `/goods-issues/excel` → `exportGoodsIssueReportExcel` → `sendExcelReport`. |
| Flujo principal | 1. **Actor:** abre la consulta de salidas de material y define los filtros del reporte **(ver E1)**.<br>2. **Nexus:** muestra la información autorizada que corresponde a esos filtros.<br>3. **Actor:** selecciona «Exportar Excel», elige las opciones disponibles y confirma.<br>4. **Nexus:** vuelve a comprobar autorización y parámetros y prepara las filas, agrupaciones y totales.<br>5. **Nexus:** genera el archivo de Excel e inicia su descarga; si no hay datos, informa que el resultado está vacío. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Archivo Excel con filtros, columnas y cálculos propios del reporte.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-002` a `RF-REP-005`. |

#### `CU-REP-07` — Generar reporte de salidas de merma

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-REP-07` |
| Nombre | Generar reporte de salidas de merma. |
| Actor y disparador | **Actor:** Usuario con permiso sobre el reporte o consulta. **Disparador:** necesita analizar o entregar información de salidas de merma y solicita su exportación. |
| Participación de actor y sistema | **Actor:** define filtros y solicita la exportación.<br>**Nexus:** autoriza, consolida la información y entrega el archivo. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Inferencia desde código | **Directa.** `reportApiRoute.js` GET `/waste-issues/excel` → `exportWasteIssueReportExcel` → `sendExcelReport`. |
| Flujo principal | 1. **Actor:** abre la consulta de salidas de merma y define los filtros del reporte **(ver E1)**.<br>2. **Nexus:** muestra la información autorizada que corresponde a esos filtros.<br>3. **Actor:** selecciona «Exportar Excel», elige las opciones disponibles y confirma.<br>4. **Nexus:** vuelve a comprobar autorización y parámetros y prepara las filas, agrupaciones y totales.<br>5. **Nexus:** genera el archivo de Excel e inicia su descarga; si no hay datos, informa que el resultado está vacío. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Archivo Excel con filtros, columnas y cálculos propios del reporte.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-002` a `RF-REP-005`. |

#### `CU-REP-08` — Generar reporte de compras de material

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-REP-08` |
| Nombre | Generar reporte de compras de material. |
| Actor y disparador | **Actor:** Usuario con permiso sobre el reporte o consulta. **Disparador:** necesita analizar o entregar información de compras de material y solicita su exportación. |
| Participación de actor y sistema | **Actor:** define filtros y solicita la exportación.<br>**Nexus:** autoriza, consolida la información y entrega el archivo. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Inferencia desde código | **Directa.** `reportApiRoute.js` GET `/goods-receipts/excel` → `exportGoodsReceiptReportExcel` → `sendExcelReport`. |
| Flujo principal | 1. **Actor:** abre la consulta de compras de material y define los filtros del reporte **(ver E1)**.<br>2. **Nexus:** muestra la información autorizada que corresponde a esos filtros.<br>3. **Actor:** selecciona «Exportar Excel», elige las opciones disponibles y confirma.<br>4. **Nexus:** vuelve a comprobar autorización y parámetros y prepara las filas, agrupaciones y totales.<br>5. **Nexus:** genera el archivo de Excel e inicia su descarga; si no hay datos, informa que el resultado está vacío. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Archivo Excel con filtros, columnas y cálculos propios del reporte.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-002` a `RF-REP-005`. |

#### `CU-REP-09` — Generar reporte de mermas

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-REP-09` |
| Nombre | Generar reporte de mermas. |
| Actor y disparador | **Actor:** Usuario con permiso sobre el reporte o consulta. **Disparador:** necesita analizar o entregar información de mermas y solicita su exportación. |
| Participación de actor y sistema | **Actor:** define filtros y solicita la exportación.<br>**Nexus:** autoriza, consolida la información y entrega el archivo. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Inferencia desde código | **Directa.** `reportApiRoute.js` GET `/wastes/excel` → `exportWasteReportExcel` → `sendExcelReport`. |
| Flujo principal | 1. **Actor:** abre la consulta de mermas y define los filtros del reporte **(ver E1)**.<br>2. **Nexus:** muestra la información autorizada que corresponde a esos filtros.<br>3. **Actor:** selecciona «Exportar Excel», elige las opciones disponibles y confirma.<br>4. **Nexus:** vuelve a comprobar autorización y parámetros y prepara las filas, agrupaciones y totales.<br>5. **Nexus:** genera el archivo de Excel e inicia su descarga; si no hay datos, informa que el resultado está vacío. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Archivo Excel con filtros, columnas y cálculos propios del reporte.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-002` a `RF-REP-005`. |

#### `CU-REP-10` — Generar reporte de proveedores

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-REP-10` |
| Nombre | Generar reporte de proveedores. |
| Actor y disparador | **Actor:** Usuario con permiso sobre el reporte o consulta. **Disparador:** necesita analizar o entregar información de proveedores y solicita su exportación. |
| Participación de actor y sistema | **Actor:** define filtros y solicita la exportación.<br>**Nexus:** autoriza, consolida la información y entrega el archivo. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Inferencia desde código | **Directa.** `reportApiRoute.js` GET `/suppliers/excel` → `exportSupplierReportExcel` → `sendExcelReport`. |
| Flujo principal | 1. **Actor:** abre la consulta de proveedores y define los filtros del reporte **(ver E1)**.<br>2. **Nexus:** muestra la información autorizada que corresponde a esos filtros.<br>3. **Actor:** selecciona «Exportar Excel», elige las opciones disponibles y confirma.<br>4. **Nexus:** vuelve a comprobar autorización y parámetros y prepara las filas, agrupaciones y totales.<br>5. **Nexus:** genera el archivo de Excel e inicia su descarga; si no hay datos, informa que el resultado está vacío. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Archivo Excel con filtros, columnas y cálculos propios del reporte.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-002` a `RF-REP-005`. |

#### `CU-REP-11` — Generar reporte de clientes

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-REP-11` |
| Nombre | Generar reporte de clientes. |
| Actor y disparador | **Actor:** Usuario con permiso sobre el reporte o consulta. **Disparador:** necesita analizar o entregar información de clientes y solicita su exportación. |
| Participación de actor y sistema | **Actor:** define filtros y solicita la exportación.<br>**Nexus:** autoriza, consolida la información y entrega el archivo. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Inferencia desde código | **Directa.** `sales/reportApiRoute.js` GET `/clients/excel` → `exportClientReport` → `sendExcelReport`. |
| Flujo principal | 1. **Actor:** abre la consulta de clientes y define los filtros del reporte **(ver E1)**.<br>2. **Nexus:** muestra la información autorizada que corresponde a esos filtros.<br>3. **Actor:** selecciona «Exportar Excel», elige las opciones disponibles y confirma.<br>4. **Nexus:** vuelve a comprobar autorización y parámetros y prepara las filas, agrupaciones y totales.<br>5. **Nexus:** genera el archivo de Excel e inicia su descarga; si no hay datos, informa que el resultado está vacío. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Archivo Excel con filtros, columnas y cálculos propios del reporte.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-002` a `RF-REP-005`. |

#### `CU-REP-12` — Generar reporte de personas

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-REP-12` |
| Nombre | Generar reporte de personas. |
| Actor y disparador | **Actor:** Usuario con permiso sobre el reporte o consulta. **Disparador:** necesita analizar o entregar información de personas y solicita su exportación. |
| Participación de actor y sistema | **Actor:** define filtros y solicita la exportación.<br>**Nexus:** autoriza, consolida la información y entrega el archivo. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Inferencia desde código | **Directa.** `admin/reportApiRoute.js` GET `/persons/excel` → `exportPersonReport` → `sendExcelReport`. |
| Flujo principal | 1. **Actor:** abre la consulta de personas y define los filtros del reporte **(ver E1)**.<br>2. **Nexus:** muestra la información autorizada que corresponde a esos filtros.<br>3. **Actor:** selecciona «Exportar Excel», elige las opciones disponibles y confirma.<br>4. **Nexus:** vuelve a comprobar autorización y parámetros y prepara las filas, agrupaciones y totales.<br>5. **Nexus:** genera el archivo de Excel e inicia su descarga; si no hay datos, informa que el resultado está vacío. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Archivo Excel con filtros, columnas y cálculos propios del reporte.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-002` a `RF-REP-005`. |

#### `CU-REP-13` — Generar reporte de usuarios

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-REP-13` |
| Nombre | Generar reporte de usuarios. |
| Actor y disparador | **Actor:** Usuario con permiso sobre el reporte o consulta. **Disparador:** necesita analizar o entregar información de usuarios y solicita su exportación. |
| Participación de actor y sistema | **Actor:** define filtros y solicita la exportación.<br>**Nexus:** autoriza, consolida la información y entrega el archivo. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Inferencia desde código | **Directa.** `admin/reportApiRoute.js` GET `/users/excel` → `exportUserReport` → `sendExcelReport`. |
| Flujo principal | 1. **Actor:** abre la consulta de usuarios y define los filtros del reporte **(ver E1)**.<br>2. **Nexus:** muestra la información autorizada que corresponde a esos filtros.<br>3. **Actor:** selecciona «Exportar Excel», elige las opciones disponibles y confirma.<br>4. **Nexus:** vuelve a comprobar autorización y parámetros y prepara las filas, agrupaciones y totales.<br>5. **Nexus:** genera el archivo de Excel e inicia su descarga; si no hay datos, informa que el resultado está vacío. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Archivo Excel con filtros, columnas y cálculos propios del reporte.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-002` a `RF-REP-005`. |

#### `CU-REP-14` — Generar reporte de movimientos de materiales

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-REP-14` |
| Nombre | Generar reporte de movimientos de materiales. |
| Actor y disparador | **Actor:** Usuario con permiso sobre el reporte o consulta. **Disparador:** necesita analizar o entregar información de movimientos de materiales y solicita su exportación. |
| Participación de actor y sistema | **Actor:** define filtros y solicita la exportación.<br>**Nexus:** autoriza, consolida la información y entrega el archivo. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Inferencia desde código | **Directa.** `admin/reportApiRoute.js` GET `/movements/materials/excel` → `exportMovementReport` → `sendExcelReport`. |
| Flujo principal | 1. **Actor:** abre la consulta de movimientos de materiales y define los filtros del reporte **(ver E1)**.<br>2. **Nexus:** muestra la información autorizada que corresponde a esos filtros.<br>3. **Actor:** selecciona «Exportar Excel», elige las opciones disponibles y confirma.<br>4. **Nexus:** vuelve a comprobar autorización y parámetros y prepara las filas, agrupaciones y totales.<br>5. **Nexus:** genera el archivo de Excel e inicia su descarga; si no hay datos, informa que el resultado está vacío. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Archivo Excel con filtros, columnas y cálculos propios del reporte.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-002` a `RF-REP-005`. |

#### `CU-REP-15` — Generar reporte de movimientos de mermas

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-REP-15` |
| Nombre | Generar reporte de movimientos de mermas. |
| Actor y disparador | **Actor:** Usuario con permiso sobre el reporte o consulta. **Disparador:** necesita analizar o entregar información de movimientos de mermas y solicita su exportación. |
| Participación de actor y sistema | **Actor:** define filtros y solicita la exportación.<br>**Nexus:** autoriza, consolida la información y entrega el archivo. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Inferencia desde código | **Directa.** `admin/reportApiRoute.js` GET `/movements/wastes/excel` → `exportWasteMovementReport` → `sendExcelReport`. |
| Flujo principal | 1. **Actor:** abre la consulta de movimientos de mermas y define los filtros del reporte **(ver E1)**.<br>2. **Nexus:** muestra la información autorizada que corresponde a esos filtros.<br>3. **Actor:** selecciona «Exportar Excel», elige las opciones disponibles y confirma.<br>4. **Nexus:** vuelve a comprobar autorización y parámetros y prepara las filas, agrupaciones y totales.<br>5. **Nexus:** genera el archivo de Excel e inicia su descarga; si no hay datos, informa que el resultado está vacío. |
| Excepciones | **E1, después del paso 1:** **Nexus** determina que no se cumple alguna precondición o autorización requerida, rechaza la solicitud sin modificar ni exponer información y comunica el motivo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Archivo Excel con filtros, columnas y cálculos propios del reporte.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-002` a `RF-REP-005`. |


## Relación entre familias y reutilización

| Tema compartido | Casos | Elementos reutilizables que deben evaluarse primero | Diferencia que debe conservarse |
| --- | --- | --- | --- |
| CRUD de identidades y catálogos | `CU-IDA-01` a `CU-IDA-09`; `CU-CAT-01` a `CU-CAT-20` | Fábricas CRUD, listados, formularios, validación y refresco de tabla. | Permisos, identidad del recurso, relaciones y política de eliminación. |
| Documentos con detalles | `CU-ENT-02`, `CU-ENT-03`, `CU-SAL-02` a `CU-SAL-04` y `CU-SAL-08` a `CU-SAL-10` | Encabezado, modal/formulario, tabla de detalles, DTO y transacción coordinadora. | La entrada incrementa stock al confirmarse; la salida no lo descuenta hasta surtir. |
| Operación de salidas | `CU-SAL-02` a `CU-SAL-06` y `CU-SAL-08` a `CU-SAL-12` | Proceso de material replicable para merma, componentes informativos y coordinación de movimientos. | Inventario, conversión, permisos, estados y cantidades acumuladas del contexto. |
| Consulta y exportación | `CU-REP-01` a `CU-REP-15` y casos de consulta de cada familia | Filtros, paginación, dependencias entre selects y utilidades Excel. | Columnas, agrupaciones, fórmulas y permiso de cada reporte. |

Reutilizar no significa fusionar reglas de negocio. Antes de crear otro flujo se revisan
los [patrones de diseño y construcción](../architecture/design-and-construction-patterns.md), se replica
el proceso existente sólo cuando cambia el contexto, y se mantienen explícitas sus
validaciones, transacciones y pruebas CRUD.

## Trazabilidad y mantenimiento

1. Al agregar, retirar o cambiar un objetivo de actor, se actualizan este catálogo y el
   diagrama de casos de uso en el mismo cambio.
2. Si cambia una operación, se revisan también la especificación, la matriz de
   operaciones y el plan de pruebas.
3. Las pruebas unitarias conservan la ruta paralela al código; las integraciones CRUD
   atraviesan HTTP y Prisma en `tests/integration/controllers/*DbTest.js`, conforme a
   la [estrategia de pruebas](../testing/service-test-coverage.md).
4. Un caso nuevo debe completar identificador, nombre, actor y disparador,
   participación de actores y sistema, precondiciones, pasos granulares del flujo
   principal, secuencias actor–Nexus y destino para cada alternativa, excepciones,
   resultado y reglas o requisitos relacionados antes de considerarse documentado.
5. Proyectos, requisiciones y ajustes sin flujo HTTP completo permanecen en la
   especificación con su estado correspondiente; se incorporarán aquí sólo al pasar a
   alcance vigente.
