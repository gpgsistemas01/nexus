# Casos de uso del cliente Vue

## Propósito y alcance

Este catálogo contiene 94 fichas independientes de los objetivos disponibles en la aplicación: acceso, inventario, catálogos, directorio, identidad, compras y salidas. Los identificadores de negocio `CU-AUT`, `CU-ALM`, `CU-CAT`, `CU-IDA`, `CU-ENT` y `CU-SAL` se conservan para trazar el mismo objetivo. Cada ficha se mantiene íntegra en su familia funcional. Inventario, Movimientos, Directorio y Catálogos tienen entradas independientes.

Los pasos describen acciones del actor y respuestas observables de Nexus. Los componentes, endpoints y callbacks pertenecen a las [vistas de arquitectura](../../architecture/views/index.md). Los efectos persistentes son resultados esperados del sistema completo; su evidencia requiere una prueba con API y base reales. La suite con API simulada comprueba interacción y contrato del cliente.

El [modelo visual de casos de uso](../../architecture/views/scenarios/use-case-model/index.md) representa actores, límites y objetivos por recurso.

## Semántica de actores y generalización UML

En los diagramas, las asociaciones compartidas enlazan al actor general con la consulta
del recurso. Las asociaciones directas con otras operaciones corresponden a los casos
particulares justificados en las fichas. Estas nombran a los actores autorizados para
iniciar el objetivo; una relación entre casos no hereda actores ni concede permisos. Personal de almacén especializa a
Usuario registrado; Administrador del sistema especializa a Personal de almacén y
hereda todas sus asociaciones. Los casos exclusivos del administrador conservan
asociaciones directas adicionales; no se duplican las funciones heredadas.

La notación, dirección y límites de la representación Mermaid se explican en el
modelo de escenarios. Las
asociaciones son líneas continuas sin punta; la generalización tiene un triángulo hueco
hacia el general; `«include»` y `«extend»` son dependencias discontinuas con el estereotipo
correspondiente. La generalización no lleva texto adicional. Los enlaces desde Consulta
a otras operaciones se dibujan sin etiqueta como convención visual del documento;
no constituyen inclusión, extensión ni herencia de actores.

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
  participante y una acción observable. Los turnos alternan entre actor y Nexus; cuando
  varias acciones consecutivas corresponden al mismo participante, se integran en un
  solo paso. La captura de filas incluye la acción **Agregar** y la revisión de cada
  renglón. La consulta describe la información que obtiene el actor; una modificación describe
  los datos y efectos de negocio que quedan confirmados. El paso remite a una excepción
  de operación cuando ésta no puede completarse, sin explicar bases de datos,
  transacciones ni componentes internos. Se nombran los controles que disparan cada acción, el formulario,
  diálogo o tabla que abre Nexus y los mensajes de confirmación o error. La validación
  y la conservación del resultado se describen cuando forman parte del caso. Una
  expresión como «verifica el resultado» debe indicar qué se muestra o qué cambia.
  El paso que origina una variante o un rechazo incluye la referencia **(ver A1)** o
  **(ver E1)**, según corresponda.
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

La excepción **EOP — Operación no completada** describe el aviso al actor y los
efectos de negocio que se conservan ante un fallo; no prescribe cómo se resuelve
la persistencia o la comunicación interna.

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

- Una asociación simple conecta al actor con el caso en el que participa; se dibuja
  como línea continua sin punta ni frase. Los enlaces sin texto entre consultas y
  operaciones conservan la organización visual por recurso y no transmiten actores
  ni permisos. Cuando una consulta presenta operaciones de mantenimiento,
  la selección termina la consulta y dispara un caso independiente, que comprueba de
  nuevo sus precondiciones y autorización; esa navegación se describe en las fichas.
- `«include»` identifica un caso requerido que el caso base incorpora siempre; al
  concluir, la interacción continúa en el paso siguiente a la inclusión.
- `«extend»` identifica comportamiento opcional que se inserta en un punto de extensión
  del caso base; al concluir, retorna a ese punto.
- La **generalización** identifica un caso especializado que sustituye el comportamiento
  heredado aplicable; no representa una llamada entre casos.

Las inclusiones, extensiones o generalizaciones entre casos deben aparecer también en
el diagrama y nombrar ambos identificadores `CU-*`; una extensión documenta su condición,
punto de inserción y retorno. Las continuaciones de navegación no son relaciones UML
entre casos; compartir servicios de inventario, persistencia o consulta tampoco crea
por sí solo una relación UML.

El actor principal inicia el objetivo, pero no obtiene autorización por aparecer aquí.
En cada ficha, **Nexus** identifica al sistema como participante interno; no se modela
como actor externo ni inicia el caso por sí mismo.
El **Administrador del sistema** hereda las funciones del Personal de almacén
mediante generalización y tiene asociaciones adicionales con sus casos exclusivos. **Dirección** no se atribuye como
actor mientras no se definan y autoricen sus objetivos concretos.
Los casos de catálogos siguen listar-crear-actualizar y sólo incluyen eliminar, activar,
desactivar o ajustar cuando el contexto lo permite. Los documentos comparten encabezado
y detalles, pero surtir, devolver y corregir mantienen reglas y efectos propios.
Las lecturas de roles, áreas, presentaciones, unidades de medida, motivos de ajuste y
estados de cumplimiento que sólo alimentan selectores son soporte técnico de esos
objetivos: conservan autorización y trazabilidad arquitectónica, pero no reciben un
identificador de caso de uso independiente.


## Catálogo por familia

- [Acceso y sesión](authentication/index.md).
- [Personas y usuarios](identity-access/index.md).
- [Inventario](warehouse/index.md).
- [Movimientos](movements/index.md).
- [Clientes y proveedores](directory/index.md).
- [Catálogos administrables](catalogs/index.md).
- [Compras](purchases/index.md).
- [Salidas](issues/index.md).

## Reglas y evidencia

La [especificación](../requirements-specification/index.md) reúne los criterios de negocio y del cliente. La [matriz de cobertura](../../testing/04-use-case-coverage.md) enlaza cada objetivo con sus pruebas, condiciones representadas y brechas. Registrar una ficha no equivale a ejecutarla ni a aprobarla.
