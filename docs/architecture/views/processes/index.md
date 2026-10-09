# Vista de procesos

## Contenido

La vista de procesos describe orden, decisiones, estados y límites transaccionales. Se
organiza desde el recorrido general hacia la realización concreta de cada caso:

1. [Recorrido extremo a extremo](01-end-to-end-interaction.md): colaboración común desde
   la persona usuaria hasta la persistencia.
2. [Secuencias backend](backend-code-sequences/index.md): ejecución en el servidor para
   cada `CU-*`.
3. [Secuencias frontend](frontend-code-sequences/index.md): ejecución en el navegador
   para cada `CU-*`.
4. Diagramas técnicos complementarios de [backend](../development/backend-technical-documentation/02-views-technical-applied.md)
   y [frontend](../development/frontend-technical-documentation/02-views-technical-applied-by-flow-frontend.md):
   actividades o estados que responden una pregunta distinta de la secuencia canónica.

Los diagramas de actividad se conservan sólo cuando hacen visibles decisiones, guardas,
errores o rollback que una secuencia lineal no expresa con claridad. Pertenecen a esta
vista de procesos —o a la referencia técnica enlazada desde ella— porque describen la
realización dinámica. Requisitos mantiene el flujo normativo en cada ficha `CU-*` y no
duplica una actividad por caso. Si una actividad deja de agregar una pregunta distinta,
se elimina en lugar de trasladarla o actualizar dos representaciones equivalentes.

## Notación de actividades

Los diagramas de actividad siguen vigentes en [UML 2.5.1](https://www.omg.org/spec/UML/2.5.1).
Se usan para explicar flujo de control, alternativas y concurrencia; una secuencia
explica mensajes entre participantes y una máquina de estados explica cambios de estado.
Son perspectivas complementarias, no reemplazos entre sí.

Mermaid no dispone de un tipo nativo `activityDiagram`. Las cinco actividades de Nexus
se representan mediante `flowchart` con una convención común, como aproximaciones a UML:

| Elemento de actividad UML | Representación en estas vistas |
| --- | --- |
| Nodo inicial | Círculo sólido pequeño, sin nombre de acción (`f-circ`). |
| Acción | Rectángulo con esquinas redondeadas y verbo que describe el trabajo. |
| Flujo de control | Línea continua con flecha; no usa `«include»` ni `«extend»`. |
| Decisión | Rombo con salidas alternativas y guardas entre corchetes, como `[sí]` y `[no]`. |
| Reunión de alternativas (merge) | Rombo que reúne caminos excluyentes; no sincroniza tareas. |
| Final de actividad | Círculo con centro sólido (`fr-circ`), sin etiqueta ni tamaño dependiente del texto. |

Las guardas de una decisión deben ser excluyentes y cubrir las alternativas relevantes.
No se emplean varias entradas directas a una acción para sugerir una reunión de caminos:
se muestra el rombo de merge. Ninguna de estas cinco actividades requiere concurrencia;
por eso no se añaden barras fork/join. Si se modela trabajo paralelo, UML requiere una
barra de bifurcación y otra de sincronización cuando corresponda, no rombos. Las
particiones o carriles se agregan sólo cuando hace falta distinguir responsabilidades;
el alcance de estas vistas ya identifica navegador, servidor o ciclo compartido.

`flowchart` conserva esta semántica, pero no constituye conformidad gráfica UML estricta.
Una entrega que exija todos los símbolos UML nativos requiere un editor o renderizador
que soporte actividades UML, por ejemplo PlantUML. No se elimina una actividad útil por
la limitación del renderizador ni se presenta una máquina de estados como sustituto.

### Resultado de la revisión de actividades

| Actividad conservada | Ubicación propietaria | Por qué se requiere |
| --- | --- | --- |
| Ciclo compartido de catálogos | [Registro de catálogos](../development/design-and-construction-patterns/08-catalog-registry-and-allowlist.md#diagrama-del-ciclo-crud-compartido) | Expresa una decisión reutilizable entre consulta, alta, edición y estado activo; evita una actividad repetida por catálogo. |
| Cancelación de detalle de entrada | [Diagramas técnicos backend](../development/backend-technical-documentation/02-views-technical-applied.md#actividad-de-cancelación-de-un-detalle-de-entrada) | Hace visibles las guardas de existencia, motivo y reversión de stock que producen rechazo o rollback. |
| Surtimiento de materiales | [Diagramas técnicos backend](../development/backend-technical-documentation/02-views-technical-applied.md#actividad-de-decisión-y-surtimiento-de-materiales) | Separa actualización y surtimiento, y muestra las decisiones que derivan movimiento y estado. |
| Autenticación y autorización API | [Diagramas técnicos backend](../development/backend-technical-documentation/02-views-technical-applied.md#decisiones-de-autenticación-y-autorización-api) | Distingue rechazos de token, identidad y permiso antes de continuar la petición. |
| Alta de merma desde plantilla | [Diagramas técnicos frontend](../development/frontend-technical-documentation/02-views-technical-applied-by-flow-frontend.md#alta-de-merma-desde-una-plantilla-de-material) | Explica la habilitación y el mapeo dependientes de proveedor y plantilla antes del envío. |

No se requiere otra actividad por caso para CRUD directo, reportes, corrección de
entrada o devoluciones: sus decisiones ya quedan cubiertas por la ficha normativa, la
secuencia canónica o la máquina de estados. Crear otra figura repetiría el recorrido sin
aportar una bifurcación independiente.

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

`npm run docs:check` comprueba participantes, fragmentos y activaciones de las 170
secuencias canónicas, además de cobertura, trazabilidad y contrato. El renderizado y la
exportación siguen siendo necesarios para revisar legibilidad; esos controles no
prueban por sí solos todos los flujos de ejecución del código.
