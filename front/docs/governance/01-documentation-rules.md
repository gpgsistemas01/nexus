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
| `requirements` | Alcance del cliente, obligaciones observables, datos, restricciones, actores y fichas de interacción. |
| `architecture` | Responsabilidades, estado, dependencias, transporte, entradas y despliegue; inventario técnico generado separado de las decisiones. |
| `architecture/views/development/design-and-construction-patterns` | Problema, decisión, modelo general, aplicación con nombres reales, límites y evidencia. |
| `architecture/views/development/frontend-technical-documentation` | Rutas, campos, modos, permisos, efectos, errores y propietarios de cada capacidad Vue. |
| `development` | Instalación, archivos locales, comandos, herramientas, compilación y publicación. |
| `testing` | Plan propio, condiciones, casos, datos, oráculos, cobertura y preparación de ambientes. |
| `governance` | Reglas editoriales, mantenimiento, generación y publicación. |
| `user-manual` | Procedimientos, campos, resultados, incidencias y capturas de las pantallas Vue. Publicación independiente. |

Cada documento desarrolla el contenido que le corresponde y enlaza su realización,
contrato y evidencia local. Las reglas funcionales y los flujos se mantienen completos
en requisitos; los contratos técnicos y decisiones, en arquitectura.

## Convenciones editoriales

- Carpetas y nombres de archivos técnicos en inglés; títulos y explicación en español.
- Cada colección tiene `index.md`; las series de capítulos mantienen numeración
  consecutiva. El índice conserva el orden de lectura. La referencia generada también tiene un propietario explícito.
- Un `h1` por archivo y niveles de títulos sin saltos. Una tabla compara elementos;
  una secuencia expresa pasos; la prosa explica propósito, decisiones y límites.
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
| Secuencias y composición visual | Mostrar una dependencia cuando participa en las llamadas o la composición explicadas, como `useForm` de VeeValidate o `VDataTableServer` de Vuetify. Identificar su procedencia sin detallar sus tipos internos. |
| Arranque, despliegue y pruebas de sistema | Nombrar Express cuando identifica el proceso, contenedor o dependencia que se ejecuta realmente. |
| Módulos compartidos | Conservar nombres, rutas y dependencias exactos para distinguir código público compilable de adaptadores privados del servidor. |

Los servicios, repositorios y transacciones del servidor tienen su documentación
propia. Aquí se describen sus garantías observables y los límites del cliente.

## Ubicación, navegación y publicación

Las cinco colecciones separan requisitos, arquitectura, procedimientos de desarrollo,
pruebas y gobierno. Las vistas 4+1 describen la arquitectura; el estándar de código y
los contratos son referencias transversales. La guía de incorporación introduce los
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
| Estándar | Preocupación de construcción. | Reglas relacionadas de formato, nombres, dependencias o errores, con ejemplos. |
| Referencia generada | Catálogo técnico mantenido por la herramienta. | Fuentes e interpretación de sus tablas; se publica separada de la introducción. |
| Manual de usuario | Una página o familia de tareas operativas. | Preparación, campos, pasos, resultado e incidencias, con capturas de Vue. |

Separar cuando cambian de forma independiente el dominio, el contrato o la tarea del
lector y la sección puede conservar su explicación completa. Reunir cuando la división
obliga a saltar entre fragmentos para comprender un único objetivo, repite la misma
preparación o sólo crea encabezados sin información propia. El número de líneas o
páginas sirve para detectar un documento que conviene revisar; no fija por sí solo un
límite obligatorio. Los índices orientan y enlazan, sin repetir las fichas completas.

## Figuras y fuentes

Se usa Mermaid. Cada figura indica identificador, pregunta, alcance, fuente y
significado de sus flechas. El modelo general explica el mecanismo; la aplicación
nombra componentes, composables, servicios o contratos que existen en Vue.
Los diagramas de flujo no se presentan como UML de clases. Actores, mensajes y
límites se usan cuando corresponde, sin inventar relaciones ni concurrencia.
Los diagramas curados explican decisiones; el generador sólo inventaría elementos
declarados en las fuentes. Ninguno demuestra por sí mismo calidad o SOLID.

| Familia | Comprobación visual y semántica |
| --- | --- |
| Secuencia | Actor humano y participantes `boundary`/`control` según responsabilidad; mensajes numerados y extremos declarados. El callback conserva su propietario de código. |
| Clases/dominio | Estereotipos, atributos, asociaciones, multiplicidades y generalizaciones correspondientes al modelo. Los eventos tipados se describen como datos/contratos, no métodos inventados. |
| Casos de uso | Actor fuera del límite, objetivos en óvalos, participación y relaciones funcionales justificadas. |
| Estados/actividad | Inicio, estados/acciones, transiciones y decisiones del ciclo representado; los finales y alternativas conservan su significado. |
| Mapas/ejecución | Consumidor hacia colaborador y leyenda de relaciones; construcción, artefactos y procesos en ejecución tienen alcance explícito. |

El dominio se mantiene en `requirements/domain-model`; los contratos estáticos en
`architecture/views/logical/class-and-type-models`; los estados en `logical/states`.
Los procesos se agrupan por responsabilidad y conservan un índice por sección. Un
diagrama de dominio no reemplaza el de tipos y una secuencia no reemplaza el ciclo de
estados. El [índice de vistas](../architecture/views/index.md) relaciona esos niveles.

## Síntesis y lectura visual

| Información que se explica | Forma de resumirla | Detalle que debe conservarse |
| --- | --- | --- |
| Responsabilidades y dependencias | Diagrama de componentes/mapa. | Propietarios, frontera y significado de cada tipo de flecha. |
| Diferencias entre modos, campos o herramientas | Tabla comparativa. | Condiciones, datos admitidos y excepciones que cambian el resultado. |
| Orden, rechazo y recuperación | Secuencia. | Participantes, mensajes relevantes y alternativas. |
| Ciclo de una interacción | Estados. | Evento, guarda y resultado de cada transición relevante. |
| Justificación o restricción delicada | Párrafo breve junto al modelo. | Motivo y límite que la figura no expresa. |
| Caso de uso o prueba seleccionado | Ficha establecida. | Preparación, pasos, alternativas y resultado verificable. |

La [guía de lectura](../architecture/views/diagram-reading.md) concentra símbolos,
multiplicidades, líneas, numeración, marcos y color. Cada documento con figuras enlaza
su familia; una convención particular se explica junto al diagrama. El texto desarrolla
motivos, restricciones y recuperación; las comparaciones pertenecen a la tabla y las
relaciones al gráfico. La revisión elimina la repetición de esa misma información en
varios formatos y conserva una fuente propietaria por detalle.

La guía de un módulo identifica objetivo/CU, ruta y permiso, estado y operaciones,
entradas/salidas/errores, mecanismos reutilizados y evidencia. Router y contratos HTTP
conservan sus fuentes técnicas; el módulo explica las decisiones y condiciones que
cambian el comportamiento visible.

## Referencias adoptadas

| Referencia | Uso selectivo en esta colección |
| --- | --- |
| Documentación oficial de Vue | SFC, Composition API, props/eventos, composables, slots, provide/inject y ciclo de vida. |
| ISO/IEC/IEEE 42010:2022 | Preocupaciones, interesados, vistas, decisiones y relaciones de arquitectura. |
| IEEE 1016-2009 | Vocabulario histórico de descripción de diseño; no prescribe carpetas ni una ficha por método. |
| ISO/IEC/IEEE 15289:2019 | Propósito, audiencia, mantenimiento y relaciones entre documentos. |
| ISO/IEC/IEEE 29148:2018 | Obligaciones identificables, verificables y trazables. |
| ISO/IEC/IEEE 29119-2/-3/-4 | Proceso, artefactos y técnicas de diseño de pruebas. |
| ISO/IEC 25010:2023 | Criterios de interacción, seguridad, mantenibilidad y desempeño; sin inventar umbrales o resultados. |

Esta es una adaptación local, sin declaración de conformidad integral. La norma
no prescribe estas tablas, Markdown o un patrón Vue particular.

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
