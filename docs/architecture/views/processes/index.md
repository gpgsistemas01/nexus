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

Los participantes se declaran antes de los mensajes. Las llamadas se muestran con
flecha continua y los resultados o errores con flecha discontinua; `autonumber` indica
el orden temporal. Una activación comienza al recibir la llamada y termina al devolver
el control. Si se omiten activaciones, no se infiere concurrencia.

`alt`/`else` separa resultados excluyentes: la respuesta HTTP y su propagación pertenecen
a la rama que los produce. `break` muestra un rechazo que termina la interacción antes
de llamar al siguiente middleware o al controller. La continuación posterior al bloque
sólo ocurre cuando su condición de rechazo no se cumple.

Una transacción se delimita con una llamada `$transaction`, un área `rect` y una nota
sobre el mismo `tx`; no se usa `critical` para afirmar exclusión de otras peticiones.
Los efectos posteriores al commit, como recálculo de costos o publicación, quedan fuera
del área. Un fallo posterior no deshace el commit ya confirmado.

`npm run docs:check` comprueba participantes, fragmentos y activaciones de las secuencias canónicas, además de cobertura, trazabilidad y contrato. El renderizado y la
exportación siguen siendo necesarios para revisar legibilidad; esos controles no
prueban por sí solos todos los flujos de ejecución del código.
