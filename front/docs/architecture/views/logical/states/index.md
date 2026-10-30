# Estado y ciclo de vida

Estas máquinas representan una proyección del estado reactivo de coordinadores
Vue; no son enums persistidos ni una biblioteca de máquinas de estado instalada.
Las [reglas del negocio](../../../../requirements/domain-model/06-document-lifecycles.md)
definen los ciclos definitivos de los documentos; aquí se representa su interacción.

| Lectura | Propietario y figuras |
| --- | --- |
| [Compras](01-purchases.md) | Apertura: `DIA-VUE-EST-001`; corrección/cancelación y relectura: `DIA-VUE-EST-004`. |
| [Salidas](02-issues.md) | Apertura/reintento: `DIA-VUE-EST-002`; modos de edición y operación: `005/006` del mismo prefijo. |
| [Merma](03-waste-capture.md) | Captura local, incertidumbre y confirmación: `DIA-VUE-EST-003`. |
| [Propiedad y guardado compartido](04-state-ownership-and-save.md) | Propietarios y vida útil; `useRecordSave`: `DIA-VUE-ARQ-003`. |

## Convenciones de estas máquinas

La [leyenda de estados](../../diagram-reading.md#estados) define símbolos y la forma
`evento [guarda] / efecto`. Los eventos pueden ser llamadas, eventos de componentes
o la resolución/rechazo de una promesa. Las guardas abreviadas se desarrollan junto
a su figura; no son métodos añadidos al código. `[else]` es el complemento de las
otras salidas de la misma decisión.

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
