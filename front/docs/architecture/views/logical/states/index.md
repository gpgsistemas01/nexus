# Estado y ciclo de vida

Estas máquinas muestran el estado reactivo de los coordinadores Vue. Los estados
definitivos del negocio están en los [ciclos de
documentos](../../../../requirements/domain-model/06-document-lifecycles.md); aquí se
describe la interacción del cliente.

| Lectura | Propietario y figuras |
| --- | --- |
| [Compras](01-purchases.md) | Apertura: `DIA-VUE-EST-001`; corrección/cancelación y relectura: `DIA-VUE-EST-004`. |
| [Salidas](02-issues.md) | Apertura/reintento: `DIA-VUE-EST-002`; modos de edición y operación: `005/006` del mismo prefijo. |
| [Merma](03-waste-capture.md) | Captura local, incertidumbre y confirmación: `DIA-VUE-EST-003`. |
| [Propiedad y guardado compartido](04-state-ownership-and-save.md) | Propietarios y vida útil; `useRecordSave`: `DIA-VUE-ARQ-003`. |

## Convenciones de estas máquinas

La [leyenda](../../diagram-reading.md#estados) define `evento [guarda] / efecto`. Los
eventos son llamadas, eventos de componentes o resultados de promesas. Las guardas se
aclaran junto a la figura; `[else]` reúne las demás salidas de la decisión.

| Dato que podría parecer omitido | Lectura correcta |
| --- | --- |
| No hay estado final | El coordinador sigue vivo y permite otro recorrido; volver a Lista no termina la aplicación. |
| No hay guarda o efecto en una etiqueta | La transición no añade una condición o efecto relevante al corte. No se suponen permisos ni escrituras implícitos. |
| Una llamada rechazada por una guarda no tiene flecha | El código retorna sin cambiar el modo; no es una transición hacia otro estado. |
| No aparecen todos los flags como estados | Carga, modo y bloqueo pueden coexistir. Cada figura indica el estado observado y las condiciones que no se pueden omitir. |
| No hay `entry`, `exit` o `do` | No se atribuyen actividades de entrada/salida a estados que el código no define. Los efectos relevantes acompañan su transición. |
| No hay regiones paralelas o historial UML | Las promesas asíncronas y la recuperación en Storage no implican estados concurrentes ni un pseudoestado de historial UML. |

Los [tipos](../class-and-type-models/index.md) describen los valores. Las
[secuencias](../../processes/index.md) conservan llamadas, ramas y callbacks completos.
