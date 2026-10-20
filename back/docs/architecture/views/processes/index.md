# Vista de procesos

Esta vista es propietaria del orden de ejecución, decisiones, estados y límites de
transacciones. Desarrollo muestra módulos, imports y contratos; requisitos mantiene
los objetivos del actor y los estados/reglas de negocio.

## Contenido

1. [Recorrido extremo a extremo](01-end-to-end-interaction.md): colaboración general.
2. [Secuencias backend](backend-code-sequences/index.md): realización de cada operación.
3. [Secuencias frontend](frontend-code-sequences/index.md): interacción implementada por cada operación.
4. [Comportamiento transversal](shared-runtime-behavior/index.md): auditoría, sesión HTTP
   y estados técnicos de formularios, mantenidos una vez.

## Criterio para evitar duplicación

Consulta, creación, edición, corrección, cancelación, surtimiento y devolución tienen
sus recorridos canónicos en `DIA-BE-CU-*` y `DIA-FE-CU-*`. No se conserva además una
actividad o una secuencia genérica que describa las mismas acciones con otras etiquetas.
Las alternativas y errores se consultan en esos recorridos y en requisitos.

Los diagramas de estados técnicos conservados modelan formularios, no entidades de
negocio. Las secuencias transversales tienen consumidores compartidos y no sustituyen
el recorrido de una operación. Si una representación adicional responde la misma
pregunta, se elimina; si describe otro objeto o garantía, se mantiene junto a su fuente.

## Notación dinámica

Las secuencias muestran llamadas numeradas, retornos y fragmentos de alternativa.
Las máquinas de estados identifican el objeto, estados y eventos. Si una futura decisión
requiere una actividad, Mermaid puede representarla como aproximación a UML mediante
`flowchart`: nodo inicial `f-circ`, acciones, decisiones con guardas, merge y final
`fr-circ`. Esa notación se mantiene en procesos, sin convertir un mapa de imports en
un flujo de control ni inventar paralelismo.

## Lectura y estructura de secuencias

Cada línea de vida técnica identifica un único archivo, enlazado en la tabla
**Participantes y trazabilidad**. Dentro de una figura, el mismo archivo no puede
aparecer en dos líneas distintas. Los nombres visibles muestran el archivo que ejecuta la llamada;
el rol visual expresa su responsabilidad y el enlace conserva su ruta completa. Los actores, el navegador, el runtime Express
y la frontera de persistencia no son archivos del repositorio.
`docs:check` verifica estas excepciones explícitas y la correspondencia única por figura.

Si una fábrica define el cuerpo de un handler, application o request, su archivo es
el participante de ejecución. Los módulos que la configuran o reexportan aparecen
como componentes separados en la composición de archivos, con sus imports reales y el
nombre público de la función construida. La composición representa dependencias del
caso y complementa las secuencias; los mapas generales de módulos siguen en desarrollo. Un reexport o la selección de una
función no añade una llamada de delegación durante la petición. En cambio, helpers,
validadores, middleware y callbacks de archivos diferentes tienen participantes propios.
La plantilla EJS y el JavaScript de la pantalla tampoco comparten una línea de vida.

| Elemento visual | Aplicación en el código |
| --- | --- |
| Actor | Persona que inicia el caso en frontend; backend empieza en la frontera HTTP. |
| Frontera (`boundary`) | Pantalla, formulario o adaptador de entrada/salida. |
| Control (`control`) | Controller, application, servicio o colaborador que coordina comportamiento. |
| Entidad (`entity`) | Objeto de datos identificado; no representa por sí solo una tabla Prisma ni un servicio. |
| Persistencia (`database`) | Límite externo del cliente Prisma y la base de datos; no representa un archivo de servicio ni un servidor Prisma separado. |
| Barra de activación | Intervalo representado de ejecución/espera de una llamada; no un hilo independiente. |
| Flecha continua / discontinua | Invocación / resultado o error propagado. |

Los casos con muchas líneas de vida se dividen en colaboraciones complementarias.
En backend se separan entrada/coordinación y dominio; en frontend se separan interfaz
y aplicación/transporte. Los formularios extensos dividen también validación y envío. Las altas de proveedor y cliente añaden un nivel de preparación
del modal para distinguir las dos entradas posibles. Cada nivel conserva el archivo del
caller y del callee que delimitan la llamada ampliada, sin añadir otra operación.
Las colaboraciones internas extensas se amplían en secciones de detalle, conservando
el caller y el archivo que ejecuta cada función. No se traslada a un helper importado
una función local, ni se atribuyen llamadas JavaScript al navegador.
Las figuras comparten una tabla de fuentes, conservan sus propios fragmentos y reinician
la numeración para facilitar su lectura. La llamada de frontera y su resultado reaparecen
para identificar la ampliación; las acciones internas sólo se desarrollan en su nivel.

`autonumber` permite seguir mensajes sin confundir proximidad con dependencia. Los
retornos tipados explican el resultado de funciones async; el resultado que consume el
caller se obtiene al resolver la promesa. Los pares de llamada/retorno muestran su
activación cuando esa frontera es explícita; no se inventa concurrencia para rellenar
la figura. Las declaraciones `box` agrupan responsabilidades y `rect` destaca un ámbito,
sin añadir semántica de transacción por el color.

`alt`/`else` separa resultados excluyentes: la respuesta HTTP y su propagación pertenecen
a la rama que los produce. `break` identifica rechazo y fin de la interacción en esa
condición. Los mensajes posteriores corresponden al recorrido que superó el rechazo.
`opt` y `loop` sólo se usan cuando el código ejecuta una condición o iteración relevante.

Una transacción se delimita con `$transaction`, un área `rect` y una nota sobre el mismo
`tx`; no se usa `critical` para afirmar exclusión de otras peticiones. Se distingue fallo
previo, rollback del callback y fallo posterior al commit: un error al actualizar costos
después de confirmar el documento no revierte esas escrituras. Las respuestas y efectos
posteriores se contrastan con el controller/servicio del caso.

Los formularios distinguen normalización, validación local, prevención de doble envío,
request, adaptación de respuesta y tratamiento de error. Los listados y reportes tienen
contratos diferentes: una colección paginada no se rotula como una mutación genérica.
Sesión y auditoría conservan sus colaboraciones transversales en esta vista.

`npm run docs:check` comprueba cobertura, trazabilidad, participantes, fragmentos,
activaciones, un archivo por línea de vida, ausencia de archivos duplicados y contrato.
También comprueba que todos los archivos de la tabla aparezcan en una figura y que
las flechas de composición correspondan a imports/reexports existentes en el código. El renderizado y la exportación verifican legibilidad; estos
controles no equivalen a ejecutar todos los caminos del código.
