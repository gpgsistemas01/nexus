# 2. Contexto organizacional y usuarios

## Partes interesadas y necesidades

| Grupo | Necesidad o participación |
| --- | --- |
| Personal de Almacén | Controlar recepciones y existencias, atender solicitudes, documentar entregas y devoluciones y explicar diferencias de inventario. |
| Áreas operativas | Conocer la disponibilidad y solicitar los artículos que necesitan para sus actividades. |
| Sistemas | Mantener personas, cuentas, accesos y catálogos; supervisar las operaciones protegidas del sistema. |
| Dirección | Disponer de información para supervisar resultados y tomar decisiones. |
| Áreas solicitantes futuras | Plantear necesidades de suministro y responsabilidades de solicitud. |
| Clientes y proveedores | Identificar el destino comercial de las salidas y el origen de las recepciones. |
| Desarrollo y pruebas | Mantener las funciones y comprobar reglas, autorizaciones e integridad. |

Los permisos vigentes se definen en
[Actores y responsabilidades](../requirements-specification/03-actors-and-system-responsibilities.md).
La autoridad de aceptación y los nuevos accesos se tratan en
[Decisiones pendientes](04-open-decisions.md).

## Áreas operativas

Los perfiles operativos corresponden a Impresión, Taller/Herrería, Acabados,
Router, PT/Tráfico e Instalaciones. Los roles son Coordinador y Operador;
Instalaciones utiliza Instalador en lugar de Operador. En Almacén se utilizan
Auxiliar y Coordinador. Taller/Herrería y Taller 3D identifican la misma área.

## Contexto organizacional

El catálogo de áreas relaciona responsabilidades de personas, asignaciones de
acceso y destinos de salidas. Su presencia en el catálogo no define los permisos.

| Área | Participación en la operación |
| --- | --- |
| Dirección | Supervisión de resultados. |
| Acabados | Referencia operativa de solicitudes y responsabilidades de personas. |
| Administrativo | Referencia organizacional y de catálogos autorizados. |
| Almacén y proveduría | Recepciones, existencias, mermas, salidas, surtidos y devoluciones. |
| Diseño | Responsabilidades de personas y destino de salidas. |
| Instalaciones | Referencia operativa de solicitudes y responsabilidades de personas. |
| Impresión | Referencia operativa de solicitudes y responsabilidades de personas. |
| Router | Referencia operativa de solicitudes y responsabilidades de personas. |
| PT/Tráfico | Referencia operativa de solicitudes y responsabilidades de personas. |
| Servicios y vigilancia | Referencia organizacional y destino de salidas. |
| Sistemas | Cuentas, accesos, catálogos y operaciones protegidas. |
| Taller 3D (Taller/Herrería) | Referencia operativa de solicitudes y responsabilidades de personas. |
| Ventas y proyectos especiales | Referencia para personas y registros comerciales relacionados. |

## Características de uso

La operación utiliza listados, formularios con varios detalles, selectores y
cantidades expresadas en distintas unidades. Quien captura necesita distinguir
existencia disponible, cantidad solicitada, surtida y devuelta. El
[manual](../../user-manual/index.md) introduce ese vocabulario y explica las tareas
paso a paso.

La experiencia previa, la formación necesaria, los dispositivos habituales y las
necesidades de asistencia deben confirmarse con los usuarios. Sus acuerdos se
registran en [Decisiones pendientes](04-open-decisions.md).
