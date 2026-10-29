# Estados de interacción y captura

Las máquinas describen modos y transiciones observables de coordinadores Vue. Un estado
persistente recibido de la API no equivale al estado de la interfaz. Abrir un editor
no cambia inventario ni aprueba una operación.

Los [ciclos normativos de Compras y Salidas](../../../../requirements/domain-model/06-document-lifecycles.md)
describen estados del negocio, condiciones de transición y efectos de inventario.
Esta vista explica cómo el cliente presenta y coordina las operaciones permitidas.

1. [Compras: lectura, edición y detalle](01-purchases.md): `DIA-VUE-EST-001`.
2. [Salidas: resolución y rechazo del modo](02-issues.md): `DIA-VUE-EST-002`.
3. [Merma: captura pendiente](03-waste-capture.md): `DIA-VUE-EST-003`.

La [leyenda visual](../../diagram-reading.md#estados) explica inicio, final, estados,
transiciones y guardas. Los [tipos](../class-and-type-models/index.md) describen los datos;
las [secuencias](../../processes/index.md), sus colaboraciones.
