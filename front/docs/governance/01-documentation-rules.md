# 1. Reglas, responsabilidades y mantenimiento

## Propósito y audiencia

Estas reglas organizan la documentación del cliente Vue para desarrollo y pruebas.
Las descripciones corresponden al código versionado; la disponibilidad de un
despliegue se comprueba en ese entorno.

## Responsables y aceptación

| Función | Responsabilidad |
| --- | --- |
| Desarrollo | Actualizar las guías y figuras afectadas junto al código. |
| Revisión técnica | Contrastar contenido, contratos y comandos con sus fuentes. |
| Pruebas | Mantener diseños y casos; guardar resultados de ejecución fuera de las fichas permanentes. |
| Responsable funcional/técnico designado | Aceptar requisitos y recorridos con su evidencia. Hasta registrarlo, el estado es En revisión. |

Una compilación o prueba aprobada no sustituye la aceptación funcional.

## Convenciones editoriales

- El producto se llama **Nexus**. Usar ese nombre para sus acciones y resultados
  en requisitos, casos de uso y manuales.
- Conservar términos generales como sistema operativo, pruebas de sistema y límite
  del sistema en UML; también los nombres visibles, como Administrador del sistema,
  y el campo documental Versión del sistema.
- Archivos técnicos en inglés; títulos y explicación en español. Cada colección
  tiene `index.md` y sus capítulos numerados conservan el orden de lectura.
- Un `h1` por archivo y niveles sin saltos. Usar tablas para comparar, listas
  numeradas para pasos y párrafos breves para condiciones o límites.
- Explicar primero la tarea o el comportamiento y después sus condiciones.
  Definir siglas al introducirlas; retirar relatos de cambios y pedidos de desarrollo.
- Usar enlaces relativos, nombres exactos y ejemplos ficticios identificados.
  Indicar la carpeta de ejecución de los comandos: raíz, `front/` o `back/`.
  La raíz no tiene manifiesto npm.
- Documentar lo disponible. No mantener secciones vacías ni presentar herramientas
  pendientes como instaladas. No incluir secretos ni datos personales reales.

Ejemplo: «Para editar, abra el menú del registro y seleccione Editar» indica una
acción concreta. «La edición se cambió según lo solicitado» no explica cómo usarla.

Los identificadores y estados se definen en las
[convenciones de requisitos](../requirements/requirements-specification/02-conventions.md)
y los formatos DP/CP/EP en el [plan de pruebas](../testing/01-test-plan.md).
Se conservan al reubicar contenido.

## Referencias al backend

Describir la integración que observa el cliente. La implementación interna del
servidor permanece en su documentación.

| Contexto | Forma de documentarlo |
| --- | --- |
| Requisitos y contratos HTTP | Solicitudes, respuestas, permisos y errores; usar API o servidor. |
| Patrones y componentes | Colaboraciones del cliente y frontera HTTP. |
| Clases y secuencias | Archivos, funciones y contratos propios, incluidos `ApiError`, `InteractiveForm` y props. Excluir clases y objetos internos de bibliotecas; mencionar la tecnología en texto. Conservar tipos externos necesarios dentro de las firmas. |
| Arranque, despliegue y pruebas de sistema | Nombrar Express cuando identifica el proceso o contenedor ejecutado. |
| Módulos compartidos | Rutas y dependencias exactas que distinguen código público de adaptadores privados. |

## Ubicación, navegación y publicación

Al agregar o reubicar una guía, actualizar su índice, el
[catálogo de publicaciones](../publications.json) y los enlaces consumidores.
El [mapa de estándares](09-standards-and-ownership.md) identifica dónde definir cada
regla y cuándo conservar información contextual en una ficha.

## Unidad documental y granularidad

Cada archivo cubre un objetivo, contrato o tarea completa. Reunir fragmentos que repiten
preparación o separan un mismo recorrido. La división depende del contenido, no de un
límite de líneas o páginas.

| Artefacto | Unidad de división | Contenido que permanece unido |
| --- | --- | --- |
| Caso de uso | Objetivo observable. | Actor, preparación, flujos, excepciones y postcondiciones. |
| Caso de prueba | Condición reproducible. | Datos, pasos, resultado esperado y limpieza; no una ficha por aserción. |
| Diseño de prueba | Dominio o contrato. | Riesgos, técnicas, casos y límites. |
| Modelo de casos de uso | Capacidad funcional. | Actores y objetivos relacionados. |
| Modelo de dominio | Conceptos de negocio. | Significado, relaciones, multiplicidades y restricciones. |
| Clases y tipos | Familia de contratos propios. | Extensiones, colecciones, variantes y transformaciones. |
| Proceso técnico | Operación o colaboración. | Participantes, mensajes, decisiones y recuperación. |
| Componente o patrón | Responsabilidad o mecanismo. | Modelo, aplicación, contratos y pruebas. |
| Estándar | Ámbito con controles propios. | Reglas y ejemplos del ámbito. |
| Referencia generada | Catálogo de la herramienta. | Fuentes e interpretación de tablas; publicación separada. |
| Manual | Página o familia de tareas. | Preparación, campos, pasos, resultado e incidencias. |

## Fichas de casos de uso

Cada ficha usa una tabla de dos columnas:

| Sección | Qué describe |
| --- | --- |
| Identificador y nombre | ID estable y tarea del usuario. |
| Actor | Quién inicia o participa como apoyo. Una persona registrada como dato no es por ello un actor. |
| Disparador | Qué acción o evento inicia la tarea. |
| Precondiciones | Qué debe cumplirse antes de empezar; enumerar cada condición. |
| Flujo principal | Empieza con el Actor; numera sus acciones y las respuestas de Nexus. Nombrar controles reales y agrupar acciones sin respuesta intermedia. |
| Flujos alternativos | Variantes `A1`, `A2`… y errores corregibles: título, paso de origen, pasos desde 1 y retorno numerado o fin. |
| Excepciones | Rechazos `E1`, `E2`… o fallos `EOP`: origen, pasos desde 1, aviso, efecto en los datos y recuperación o fin. |
| Acciones de la pantalla | Otros objetivos disponibles, con sus propios permisos. La consulta termina al revisar resultados; navegar no establece una inclusión o extensión. |
| Puntos de extensión y relaciones entre casos | Casos relacionados, condición, punto y retorno cuando corresponda; deben coincidir con el diagrama. |
| Postcondiciones (éxito y fallo) | Qué queda al terminar: éxito, rechazo o resultado incierto. Enumerar cada resultado. |
| Requisitos relacionados | IDs de las reglas y obligaciones aplicables. |

Marcar cada variante desde su paso de origen con **(ver A1)** o **(ver E1)**;
indicar si ocurre durante ese paso o después de él.

Ejemplo: **Nexus señala el error → Actor corrige y pulsa Guardar → Nexus vuelve a
validar**. El retorno conserva las confirmaciones existentes y no repite el envío.

Describir sólo la recuperación disponible. Una respuesta perdida no prueba que el
guardado falló. La recuperación de merma reenvía la misma operación; los demás
guardados requieren comprobar el resultado antes de repetirlos.

Los componentes, llamadas HTTP y transacciones se explican en Arquitectura.

## Figuras y fuentes

Usar Mermaid. Cada figura indica identificador DIA, pregunta, alcance, fuente y
significado de las flechas. Los participantes y relaciones corresponden al código
o al modelo representado; no se inventan enlaces ni concurrencia.

| Familia | Comprobación visual y semántica |
| --- | --- |
| Secuencia | Actor humano; participantes `boundary`, `control` o simples según responsabilidad; mensajes numerados y extremos declarados. El callback conserva su propietario de código. Consultar [roles y agrupación](../architecture/views/processes/00-reading-and-roles.md). |
| Clases/dominio | Estereotipos, atributos, asociaciones, multiplicidades y generalizaciones del modelo. Los eventos tipados son contratos de datos. Un flujo no se presenta como UML de clases. |
| Casos de uso | Actor fuera del límite, objetivos en óvalos, participación y relaciones funcionales justificadas. |
| Estados/actividad | Inicio, estados/acciones, transiciones y decisiones del ciclo representado; los finales y alternativas conservan su significado. |
| Mapas/ejecución | Consumidor hacia colaborador y leyenda de relaciones; construcción, artefactos y procesos en ejecución tienen alcance explícito. |

La [guía visual](../architecture/views/diagram-reading.md) explica los símbolos.
El texto junto a la figura aclara guardas abreviadas, excepciones o límites que
esta no muestra; no repite sus participantes ni mensajes.

## Fichas de patrones Vue

Cada ficha describe una colaboración implementada, con estos elementos:

| Parte de la ficha | Contenido |
| --- | --- |
| Propósito | Problema que resuelve y responsabilidades separadas. |
| Modelo general | Roles, inicio, intercambio y resultado. Secuencia para props/eventos, callbacks, adaptación e inyección; actividad para seleccionar reglas; mapa de regiones para composición de slots. |
| Aplicación | Mismo recorrido y notación, con archivos, símbolos y guardas reales. |
| Contrato y límites | Props/eventos; argumentos, retorno, efectos y limpieza de composables; nombres y props de slots; clave, valor y actualización de la inyección. |
| Pruebas relacionadas | Enlaces a pruebas del contrato y consumidores; diseños y resultados permanecen en Pruebas. |

Un mapa de estructura puede acompañarse de una secuencia para la interacción.
Los imports pertenecen a la vista de componentes.

## Cambio y versionado

Al cambiar un contrato, actualizar su documento y consumidores. Registrar motivo,
comprobaciones y pendientes en la revisión. Al publicar, actualizar versión documental,
fecha y estado del índice general; una corrección editorial no cambia la versión de Nexus.

Los controles y la revisión de Word/PDF están en
[publicación](02-generation-and-publication.md).
