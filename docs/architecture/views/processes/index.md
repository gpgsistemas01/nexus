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

Cada caso mantiene nombres visuales breves y una tabla **Participantes y trazabilidad**
con alias, rol y archivos. La tabla permite mostrar helpers y configuradores agrupados
sin convertir las rutas del repositorio en cabeceras demasiado anchas. `docs:check`
comprueba que esos archivos existen y siguen asociados al participante utilizado.

| Elemento visual | Aplicación en el código |
| --- | --- |
| Actor | Persona que inicia el caso en frontend; backend empieza en la frontera HTTP. |
| Frontera (`boundary`) | Pantalla, formulario o adaptador de entrada/salida. |
| Control (`control`) | Controller, application, servicio o colaborador que coordina comportamiento. |
| Entidad (`entity`) | Objeto de datos identificado; no representa por sí solo una tabla Prisma ni un servicio. |
| Persistencia (`database`) | Frontera Prisma/PostgreSQL agrupada; no afirma que Prisma sea un servidor separado. |
| Barra de activación | Intervalo representado de ejecución/espera de una llamada; no un hilo independiente. |
| Flecha continua / discontinua | Invocación / resultado o error propagado. |

Los casos con muchas líneas de vida separan entrada/coordinación y colaboración de
dominio. El segundo nivel amplía la llamada identificada del primero; no es otro caso
ni repite su pipeline HTTP. Ambos niveles comparten la tabla de fuentes y conservan sus propios fragmentos,
y reinicia la numeración para permitir lectura independiente.

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
activaciones y contrato. El renderizado y la exportación verifican legibilidad; estos
controles no equivalen a ejecutar todos los caminos del código.
