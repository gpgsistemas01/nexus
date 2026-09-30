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

### Resultado de la revisión de actividades

| Actividad conservada | Ubicación propietaria | Por qué se requiere |
| --- | --- | --- |
| Ciclo compartido de catálogos | [Registro de catálogos](../development/design-and-construction-patterns/01-registration-of-catalogs-with-checklist-allowlist.md#diagrama-del-ciclo-crud-compartido) | Expresa una decisión reutilizable entre consulta, alta, edición y estado activo; evita una actividad repetida por catálogo. |
| Cancelación de detalle de entrada | [Diagramas técnicos backend](../development/backend-technical-documentation/02-views-technical-applied.md#actividad-de-cancelación-de-un-detalle-de-entrada) | Hace visibles las guardas de existencia, motivo y reversión de stock que producen rechazo o rollback. |
| Surtimiento de materiales | [Diagramas técnicos backend](../development/backend-technical-documentation/02-views-technical-applied.md#actividad-de-decisión-y-surtimiento-de-materiales) | Separa actualización y surtimiento, y muestra las decisiones que derivan movimiento y estado. |
| Alta de merma desde plantilla | [Diagramas técnicos frontend](../development/frontend-technical-documentation/02-views-technical-applied-by-flow-frontend.md#alta-de-merma-desde-una-plantilla-de-material) | Explica la habilitación y el mapeo dependientes de proveedor y plantilla antes del envío. |

No se requiere otra actividad para autenticación, CRUD directo, reportes, corrección de
entrada o devoluciones: sus decisiones ya quedan cubiertas por la ficha normativa, la
secuencia canónica o la máquina de estados. Crear otra figura repetiría el recorrido sin
aportar una bifurcación independiente.
