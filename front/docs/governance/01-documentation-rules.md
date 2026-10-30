# 1. Reglas, responsabilidades y mantenimiento

## Propósito y audiencia

La documentación permite preparar, entender, modificar y comprobar la aplicación
Vue sin reconstruir su funcionamiento a partir de enlaces al servidor. La redactan
desarrollo y pruebas; la revisan quienes mantienen el módulo y sus consumidores.
El contenido corresponde al código versionado, no al estado supuesto de un despliegue.

## Responsables y aceptación

| Función | Responsabilidad |
| --- | --- |
| Desarrollo del frontend | Mantener componentes, contratos, comandos, diagramas y documentación junto al cambio. |
| Revisión técnica | Contrastar la descripción con imports, props/eventos, composables, servicios, configuración y pruebas. |
| Pruebas | Identificar riesgo, datos, oráculo, nivel y límites; conservar el resultado de la ejecución fuera de las fichas permanentes. |
| Responsable funcional/técnico | Aceptar requisitos y recorridos cuando exista una designación y evidencia suficientes. Hasta registrarlo, el estado es En revisión. |

Un commit, compilación o prueba aprobada no acredita aceptación funcional ni una
certificación.

## Colecciones y contenido

| Colección | Contenido que debe explicar por sí misma |
| --- | --- |
| `front/README.md` | Propósito del cliente, inicio rápido y enlaces a los procedimientos completos. |
| `requirements` | Alcance del cliente, obligaciones observables, datos, restricciones, actores y fichas de interacción. |
| `architecture` | Responsabilidades, estado, dependencias, transporte, entradas y despliegue; inventario técnico generado separado de las decisiones. |
| `architecture/views/development/design-and-construction-patterns` | Problema, decisión, modelo general, aplicación con nombres reales, límites y evidencia. |
| `architecture/contracts` | Datos, eventos, callbacks y condiciones de aceptación en las fronteras HTTP y de componentes. |
| `architecture/views/logical/components` | Colaboradores propios, responsabilidades y dirección de sus dependencias. |
| `architecture/views/development` | Unidades y organización del código, integración de reglas públicas y mecanismos de construcción. Los patrones conservan su aplicación concreta aunque usen colaboradores de la vista lógica. |
| `architecture/views/processes` | Orden de llamadas, decisiones, rechazo, recuperación y resultado de una operación. |
| `development` | Procedimientos de entorno y flujo de trabajo: instalación, archivos locales, comandos, herramientas, compilación y despliegue. |
| `testing` | Plan propio, condiciones, casos, datos, oráculos, cobertura y preparación de ambientes. |
| `governance` | Reglas editoriales, mantenimiento, generación y publicación. |
| `user-manual` | Procedimientos, campos, resultados, incidencias y capturas de las pantallas Vue. Publicación independiente. |

El [mapa de estándares y fuentes propietarias](09-standards-and-ownership.md)
identifica dónde se mantiene cada regla transversal. Cada documento desarrolla su
contenido y enlaza realización, contrato y evidencia local. Las reglas funcionales y
los flujos se mantienen completos en requisitos; los contratos técnicos y decisiones,
en arquitectura.

## Convenciones editoriales

- Carpetas y nombres de archivos técnicos en inglés; títulos y explicación en español.
- Cada colección tiene `index.md`; las series de capítulos mantienen numeración
  consecutiva. El índice conserva el orden de lectura. La referencia generada también tiene un propietario explícito.
- Un `h1` por archivo y niveles de títulos sin saltos. Una tabla compara elementos;
  una secuencia expresa pasos; la prosa explica propósito, decisiones y límites.
- Escribir para quien conoce el sistema por primera vez: indicar primero qué puede
  hacer o consultar y después sus condiciones. Usar frases directas, explicar las
  siglas al introducirlas y retirar el relato de cambios o pedidos de desarrollo.
- Rutas relativas al documento para enlaces. Los comandos indican si se ejecutan
  en la raíz, en `front/` o en `back/`; la raíz no contiene un manifiesto npm.
- Nombres de archivos, campos y comandos exactos. Ejemplos identificados como tales,
  con valores de demostración y sin secretos o datos personales reales.
- No se mantienen secciones vacías para imitar una norma. Tampoco se describen
  herramientas aplazadas como si ya estuvieran instaladas.
- Los requisitos locales `RF-VUE-*`, `RC-VUE-*`, `RD-VUE-*` y `RN-VUE-*` describen
  el cliente. `CU-*` identifica su ficha de interacción; los IDs de producto
  existentes se conservan como correspondencia, sin renombrarlos.
- `DP-*` expresa diseño de prueba; `CP-*`, un caso; `EP-*`, una ejecución. No se
  copian conteos de una corrida a un requisito como aprobación permanente.

## Referencias al backend

La documentación del frontend explica sus responsabilidades y los contratos que
consume. Se identifica la tecnología del servidor cuando ayuda a preparar o
entender una integración concreta.

| Contexto | Forma de documentarlo |
| --- | --- |
| Requisitos, pantallas, permisos y contratos HTTP | Usar «API», «servidor» o «backend» y explicar solicitudes, respuestas y errores que afectan al cliente. |
| Patrones y componentes Vue | Explicar la colaboración del cliente y su frontera HTTP; evitar comparaciones con controladores o patrones del servidor. |
| Diagramas de clases y tipos | Conservar contratos del negocio y de infraestructura creados para el sistema, como `ApiError`, `InteractiveForm` y los contratos de props que explican sus patrones. Los tipos externos se conservan en firmas o metadatos cuando son necesarios, sin desarrollar clases de bibliotecas. |
| Secuencias | Mostrar archivos y funciones propios con sus callbacks, eventos, guardas y retornos del código. Las bibliotecas se identifican en texto; sus objetos internos no reciben líneas de vida. La API permanece como frontera externa. La [guía de roles](../architecture/views/processes/00-reading-and-roles.md) define agrupación y alcance. |
| Arranque, despliegue y pruebas de sistema | Nombrar Express cuando identifica el proceso, contenedor o dependencia que se ejecuta realmente. |
| Módulos compartidos | Conservar nombres, rutas y dependencias exactos para distinguir código público compilable de adaptadores privados del servidor. |

Los servicios, repositorios y transacciones del servidor tienen su documentación
propia. Aquí se describen sus garantías observables y los límites del cliente.

## Ubicación, navegación y publicación

Las colecciones separan requisitos, arquitectura, procedimientos de desarrollo,
pruebas, gobierno y manual de usuario. Las vistas 4+1 describen la arquitectura; los
estándares y contratos son referencias transversales. La guía de incorporación introduce los
conceptos y un recorrido del código; la referencia generada permite localizar símbolos.
El manual de usuario es una colección independiente orientada a las tareas del
operador, con procedimientos y capturas propios; no se incorpora al libro técnico.

Cada índice enlaza sus capítulos en orden de lectura. El [catálogo de publicaciones](../publications.json)
refleja ese orden en los documentos exportados y conserva todas las fuentes. Al agregar
o reubicar una guía, actualizar índice, catálogo y enlaces consumidores. No renumerar
identificadores CU/DP/CP/DIA por mover archivos. El formato de las fichas funcionales
y de pruebas se mantiene al reorganizar la colección.

## Unidad documental y granularidad

La unidad de división es un tema que pueda entenderse y mantenerse completo.
Compartir plantilla y nivel de detalle no obliga a usar el mismo número de archivos
para requisitos, diagramas, procesos y referencias de código.

| Artefacto | Unidad de división | Contenido que permanece unido |
| --- | --- | --- |
| Caso de uso | Un objetivo observable, con su ID estable. | Actor, precondiciones, flujo, alternativas, excepciones y postcondiciones. |
| Caso de prueba seleccionado | Una condición con preparación, datos y oráculo reproducibles. | Entrada, pasos, resultado esperado y limpieza. No una ficha por cada aserción o `it`. |
| Diseño de prueba | Dominio o contrato con riesgos y evidencia relacionados. | Condiciones DP, técnicas, casos y límites de ese ámbito. |
| Modelo de casos de uso | Capacidad funcional del cliente. | Figuras de sus recursos y actores; no un archivo por óvalo o enlace. |
| Modelo de dominio | Corte coherente de conceptos de negocio. | Significado, relaciones, multiplicidades y restricciones; sin componentes Vue ni tablas SQL. |
| Clases/interfaces/tipos | Familia de contratos del cliente. | Extensiones reales, colecciones, aliases, variantes y transformación de escritura. |
| Proceso técnico | Operación o colaboración con decisiones propias. | Participantes, mensajes, errores y recuperación; sus fases se explican juntas cuando forman el mismo recorrido. |
| Componente/patrón | Responsabilidad o mecanismo con consumidores concretos. | Modelo, contrato, aplicación, límites y evidencia; una figura puede ser el contenido principal. |
| Estándar | Ámbito con reglas y controles propios. | Codificación, interfaz, seguridad, pruebas o documentación según el mapa de estándares. |
| Referencia generada | Catálogo técnico mantenido por la herramienta. | Fuentes e interpretación de sus tablas; se publica separada de la introducción. |
| Manual de usuario | Una página o familia de tareas operativas. | Preparación, campos, pasos, resultado e incidencias, con capturas de Vue. |

Separar cuando cambian de forma independiente el dominio, el contrato o la tarea del
lector y la sección puede conservar su explicación completa. Reunir cuando la división
obliga a saltar entre fragmentos para comprender un único objetivo, repite la misma
preparación o sólo crea encabezados sin información propia. El número de líneas o
páginas sirve para detectar un documento que conviene revisar; no fija por sí solo un
límite obligatorio. Los índices orientan y enlazan, sin repetir las fichas completas.

## Figuras y fuentes

La [guía de diagramación](../architecture/views/diagram-reading.md#reglas-de-elaboración)
define metadatos, notación y comprobaciones por familia. Los modelos específicos
conservan fuentes, identificadores y restricciones locales.

## Síntesis y lectura visual

| Información que se explica | Forma de resumirla | Detalle que debe conservarse |
| --- | --- | --- |
| Responsabilidades y dependencias | Diagrama de componentes/mapa. | Propietarios, frontera y significado de cada tipo de flecha. |
| Diferencias entre modos, campos o herramientas | Tabla comparativa. | Condiciones, datos admitidos y excepciones que cambian el resultado. |
| Orden, rechazo y recuperación | Secuencia. | Participantes, mensajes relevantes y alternativas. |
| Ciclo de una interacción | Estados. | Evento, guarda y resultado de cada transición relevante. |
| Justificación o restricción delicada | Párrafo breve junto al modelo. | Motivo y límite que la figura no expresa. |
| Caso de uso o prueba seleccionado | Ficha establecida. | Preparación, pasos, alternativas y resultado verificable. |

El texto explica motivos, restricciones y recuperación; las tablas comparan y los
diagramas representan relaciones o recorridos. Evitar repetir la misma explicación
en los tres formatos.

## Referencias adoptadas

La [aplicabilidad de estándares](03-standard-applicability.md) concentra las
referencias ISO/IEEE y Vue, su alcance y la adaptación local.

## Cambio y versionado

Una modificación identifica motivo, código afectado, documentos, requisitos/casos,
comprobaciones y pendientes. Desarrollo actualiza la guía propietaria y los
consumidores que describan el mismo contrato. Una corrección editorial cambia la
versión documental cuando se publique la revisión, no la versión de Nexus.
El índice general conserva ambos números, fecha, responsable y estado.
Git conserva el historial; no se duplica en una tabla por commit.

Para cerrar la revisión se contrasta contenido con código, se revisan enlaces,
fuentes generadas, diagramas modificados y la exportación representativa. Los
comandos y resultados esperados están en [publicación](02-generation-and-publication.md).
