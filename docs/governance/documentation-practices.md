# Buenas prácticas para organizar la documentación

## Propósito

Este documento complementa las normas aplicadas en Nexus con criterios prácticos para
decidir dónde ubicar, cuándo dividir y cómo mantener cada contenido. Las normas orientan
la calidad y la trazabilidad; estas prácticas gobiernan la experiencia de lectura y el
mantenimiento de las fuentes Markdown. No se declara conformidad formal con los marcos
citados ni se copian sus plantillas completas.

## Marco combinado

Nexus aplica cada referencia únicamente a la pregunta que ayuda a resolver:

| Práctica | Uso en Nexus | No implica |
| --- | --- | --- |
| [Diátaxis](https://diataxis.fr/) | Distinguir aprendizaje, procedimientos, referencia y explicación según la necesidad de quien lee. | Crear cuatro copias de la misma regla ni forzar todos los documentos dentro de una plantilla. |
| [arc42](https://arc42.org/) | Revisar que la descripción arquitectónica cubra contexto, solución, bloques, ejecución, despliegue, decisiones, calidad y riesgos cuando sean pertinentes. | Reemplazar los documentos propietarios actuales ni completar secciones sin evidencia. |
| [Modelo C4](https://c4model.com/) | Aplicar revelado progresivo desde contexto y contenedores hasta componentes y código, con vistas dinámicas o de despliegue cuando respondan otra pregunta. | Afirmar que todo bloque Mermaid es un diagrama C4 formal. |
| Registros de decisiones arquitectónicas (ADR) | Conservar contexto, alternativas, decisión y consecuencias de elecciones transversales costosas de revertir. | Registrar cada cambio editorial, caso de uso o detalle local. |
| [Docs as Code](https://www.writethedocs.org/guide/docs-as-code/) | Versionar Markdown, revisar cambios, validar referencias, generar evidencia y publicar paquetes reproducibles junto con el código. | Convertir decisiones humanas en contenido generado ni publicar artefactos de `build/docs`. |

## Tipos de contenido y fuentes propietarias

La separación se decide por la intención del contenido, no sólo por su extensión:

| Necesidad | Tipo | Familia o artefacto propietario |
| --- | --- | --- |
| Aprender mediante un recorrido acompañado | Tutorial | Se crea sólo si existe una necesidad de aprendizaje distinta de los procedimientos operativos. |
| Completar una tarea | Guía práctica | `user-manual/`; se organiza por recorrido funcional y ofrece entradas por actor sin duplicar los capítulos. |
| Conocer una obligación verificable | Contenido normativo | `requirements/`; la especificación y las fichas conservan la regla, mientras matrices y diagramas aportan trazabilidad. |
| Consultar un contrato o elemento exacto | Referencia | `architecture/api-contract.md`, documentación técnica, secuencias, inventarios, glosarios y catálogos de pruebas. |
| Comprender estructura, motivos o consecuencias | Explicación | Descripción de arquitectura, patrones, estrategia de pruebas y análisis de datos. |
| Comprender por qué se eligió una alternativa | Decisión | `architecture/decisions/` para decisiones arquitectónicas y el documento normativo correspondiente para decisiones de gobierno. |
| Comprobar hechos derivados | Evidencia generada o ejecutable | `generated/` y `tests/`; no sustituye una decisión curada. |

Un documento puede apoyar otra familia, pero conserva una intención dominante y una sola
fuente propietaria. Las demás vistas enlazan esa fuente en lugar de repetir su contenido.

## Criterios para dividir un documento

Un archivo se divide cuando la separación mejora localización o mantenimiento y las
partes conservan límites estables. Se consideran conjuntamente estas señales:

1. las secciones responden preguntas o grupos funcionales diferentes;
2. una persona normalmente necesita una sección y no el archivo completo;
3. cada grupo posee identificadores, propietario o ritmo de cambio reconocible;
4. cambios independientes provocan conflictos frecuentes;
5. existe un orden reproducible para ensamblar la publicación;
6. un índice puede contener las reglas comunes sin duplicarlas en cada capítulo.

No se divide únicamente por alcanzar una cantidad de líneas. Un catálogo cohesivo puede
ser extenso si sus entradas son pequeñas, localizables y cambian bajo la misma regla. No
se crea un archivo por elemento cuando ello multiplica navegación y referencias sin
aportar una responsabilidad distinta.

Toda colección dividida conserva:

- un `index.md` con propósito, alcance, reglas comunes, cobertura y orden de lectura;
- capítulos nombrados por una capacidad o pregunta estable;
- identificadores y anclas canónicas que no dependan del orden físico;
- un manifiesto de publicación explícito;
- validación conjunta de cobertura, referencias y fuentes requeridas.

## Aplicación por familia

| Familia | Organización aplicada | Criterio de crecimiento |
| --- | --- | --- |
| Manual de usuario | Entrada general, procedimientos, capítulos por grupo funcional y entradas por actor. | Agregar una tarea al capítulo propietario; crear otro grupo sólo cuando exista un recorrido independiente. |
| Requisitos | Entrada, especificación normativa, fichas, matrices, diagramas y glosario. | Separar una colección sólo si mantiene identificadores y una fuente normativa única; no dividir por actor si ello duplica requisitos. |
| Arquitectura | Entrada por preguntas, vistas generales, patrones, referencia técnica, secuencias por perspectiva y grupo, decisiones y convenciones. | Comenzar en contexto y abrir detalle por enlace; crear una vista sólo si responde una pregunta distinta. |
| Datos | Entrada, contrato HTTP, análisis de acceso y evidencia generada del esquema. | Mantener contratos y decisiones separados de inventarios derivados; preferir una especificación procesable cuando madure el contrato. |
| Pruebas | Estrategia, plan, catálogos y resultados. | Separar estrategia, diseño y evidencia; un catálogo se divide por nivel o dominio sólo si conserva una cobertura verificable. |
| Gobierno | Decisiones normativas, aplicación, publicación y prácticas de organización. | Agregar una norma sólo con alcance, adopción y exclusiones explícitos; no convertir recomendaciones en conformidad declarada. |

## Revelado progresivo para arquitectura

La entrada de arquitectura orienta por pregunta. La lectura avanza desde contexto,
contenedores y despliegue hacia componentes, referencia técnica y secuencias. Los
catálogos de secuencias conservan primero la perspectiva frontend o backend y después se
dividen por grupo funcional; así no mezclan responsabilidades internas aunque compartan
un `CU-*`.

Las reglas comunes de una colección viven en su índice. Cada capítulo contiene sólo el
alcance del grupo y sus recorridos. La publicación puede ensamblar todos los capítulos,
pero la navegación del repositorio no obliga a abrir un archivo monolítico.

## Cuándo crear un ADR

Se crea un ADR cuando una decisión es transversal, posee alternativas razonables, afecta
más de una vista o automatización y sería costoso redescubrir su justificación. Cada
registro incluye estado, contexto, opciones, decisión y consecuencias. Un ADR aceptado no
se reescribe para ocultar una decisión posterior: se marca reemplazado y enlaza el nuevo
registro.

Las correcciones editoriales, la documentación de un comportamiento ya decidido y los
cambios locales reversibles no requieren ADR.

## Criterios para actualizar documentación y sistema

La necesidad de mantenimiento se decide por la **fuente que dejó de representar la
realidad**, no por el archivo donde se detectó la diferencia. Antes de editar, se debe
clasificar el hallazgo en uno de estos tres resultados:

1. **Sólo documentación:** el sistema vigente ya cumple el comportamiento aprobado y la
   fuente documental está incompleta, ambigua, desactualizada o enlaza evidencia incorrecta.
2. **Sólo sistema:** una corrección interna conserva contratos, reglas, permisos, datos y
   recorrido observable; se actualizan código y pruebas, pero no se reescribe documentación
   funcional para describir una implementación equivalente.
3. **Sistema y documentación:** cambia una obligación, comportamiento observable, contrato,
   modelo persistente, permiso, operación, pantalla, procedimiento o condición operativa.
   Ambos lados se actualizan en la misma solicitud de cambio; no se documenta como vigente
   una capacidad que todavía no está implementada.

### Matriz de disparadores y artefactos afectados

| Condición detectada | Mantener en el sistema | Mantener en documentación | Comprobación mínima |
| --- | --- | --- | --- |
| Error ortográfico, enlace roto, título, ejemplo o explicación que no cambia el significado. | No. | Fuente Markdown propietaria, enlaces o manifiesto afectado. | `npm run docs:check`, `docs:export -- <paquete> --check` y revisión del diff. |
| El manual difiere de controles, mensajes, permisos o estados que el sistema ya presenta correctamente. | No, salvo que la revisión funcional determine que el sistema incumple el requisito. | Procedimiento, captura/inventario, matriz de validación y referencia al `CU-*` correspondiente. | Comparación con vista, ruta, validador y prueba; después validación del paquete del manual. |
| Nueva capacidad, cambio de regla, actor, permiso, validación, estado, cálculo o efecto de inventario. | Ruta/interfaz, controller, servicio, repository, DTO o validator que sean propietarios; pruebas del comportamiento y persistencia. | Requisito y criterios, ficha `CU-*`, matriz de operaciones, diagramas/secuencias, manual y mensajes afectados. | Prueba específica, `test:unit`, integración aislada si hay HTTP o persistencia, y `docs:check`. |
| Cambio de request, response, código HTTP, filtro, descarga o ruta registrada. | Router, validación, DTO/controller/servicio y pruebas contractuales. | OpenAPI como contrato procesable, contexto curado de API y secuencias; manual sólo si cambia el recorrido visible. | Comprobación OpenAPI, prueba HTTP y regeneración arquitectónica al cambiar routers o imports. |
| Cambio de modelo, relación, restricción, precisión, índice o dato persistido. | `prisma/schema.prisma`, migración incremental, acceso a datos y pruebas con `DATABASE_TEST_URL`. | Requisito de datos/regla, mapa curado si cambia la decisión y evidencia generada. | Migración en base aislada, integración/rollback y `npm run docs:architecture`. |
| Cambio visual, selector, modo editable, estado responsivo o texto accionable. | EJS/JavaScript compartido y prueba aplicable. | Procedimiento, matriz de modos, inventario y captura únicamente cuando la pantalla cambió. | Prueba específica, revisión responsiva/permisos y `npm run docs:screenshots` antes de exportar. |
| Refactor interno sin cambio observable ni de contrato. | Código, imports/exports y pruebas que demuestren equivalencia. | Diagramas o referencia técnica sólo si cambian componentes, dependencias, responsabilidades o secuencia real. | Pruebas afectadas; `docs:architecture` si cambian imports y `docs:check`. |
| Corrección de seguridad, dependencia, runtime, despliegue o configuración operativa. | Configuración/código, manejo de secretos y pruebas o comprobaciones de operación. | Requisitos de calidad, arquitectura/despliegue, instalación u operación cuando cambien prerrequisitos, riesgos o comandos. | Análisis de impacto, prueba o escaneo aplicable y verificación de instalación/despliegue. |
| Se cierra o aparece una brecha de pruebas, riesgo o decisión pendiente sin cambiar comportamiento. | Prueba o mitigación si corresponde. | Matriz de trazabilidad, plan/resultados de pruebas o registro de decisión/riesgo propietario. | Ejecución de la evidencia y actualización del estado sin afirmar cobertura no ejecutada. |

### Condiciones de revisión periódica

Aunque no exista una funcionalidad nueva, se revisan los documentos propietarios y el
sistema cuando ocurra cualquiera de estas condiciones:

- una dependencia, versión de Node.js, motor de base de datos o herramienta de publicación
  deja de estar soportada;
- una vulnerabilidad, incidente, fallo repetitivo o dato de soporte contradice una garantía
  de seguridad, fiabilidad o recuperación;
- una auditoría, contrato o regulación introduce una obligación o cambia su edición aplicable;
- una prueba deja de representar el flujo, aparece una brecha de cobertura o una captura ya no
  coincide con la interfaz;
- cambian actores, permisos, volumen de datos, rendimiento esperado, infraestructura o proceso
  operativo;
- un enlace, comando, ruta, diagrama, ejemplo o versión publicada deja de poder reproducirse.

Una revisión periódica no obliga a modificar archivos si la evidencia sigue vigente. El
resultado puede ser **sin cambio**, pero debe quedar registrado en la incidencia o solicitud
que originó la revisión cuando exista una aprobación, excepción, riesgo aceptado o criterio no
aplicable.

## Lista de revisión

Antes de integrar una modificación documental:

1. identificar audiencia, pregunta y tipo de contenido;
2. localizar la fuente propietaria y enlazarla desde las vistas complementarias;
3. comprobar que la división no duplica reglas ni altera identificadores;
4. actualizar índices, manifiestos, inventarios y automatización relacionados;
5. ejecutar `npm run docs:check` y el `docs:export -- <paquete> --check` aplicable;
6. revisar el diff para detectar movimientos accidentales o enlaces obsoletos.
