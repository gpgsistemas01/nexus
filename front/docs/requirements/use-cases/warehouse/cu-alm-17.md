# `CU-ALM-17` — Consultar consumibles

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-17` |
| Nombre | Consultar consumibles. |
| Actor | Usuario autorizado de área operativa, Personal de almacén o Administrador del sistema. |
| Disparador | Abre el módulo **Consumibles**. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor tiene autorización para consultar consumibles. |
| Flujo principal | 1. **Actor:** abre **Almacén → Consumibles** **(ver E1)**.<br>2. **Nexus:** comprueba la autorización y muestra las ofertas de consumibles con su proveedor, existencia, stock mínimo, presentación y unidad, sin mezclar materiales **(ver EOP)**.<br>3. **Actor:** captura una búsqueda, elige un proveedor o combina ambos criterios y solicita filtrar.<br>4. **Nexus:** muestra los consumibles que cumplen los criterios, el total y las acciones que el actor está autorizado a realizar **(ver EOP)**. **(ver A1)**<br>5. **Actor:** revisa los resultados y finaliza la consulta sin necesidad de crear, modificar ni exportar registros. |
| Flujos alternativos | **A1 — Cambiar los criterios de consulta (después del paso 4):**<br>1. **Actor:** cambia la búsqueda, los filtros, el orden o la página mediante los controles disponibles.<br>2. **Nexus:** actualiza los resultados autorizados sin modificar registros; continúa en el paso 5 del flujo principal. |
| Acciones de la pantalla | **Editar** en el registro seleccionado: [CU-ALM-19](cu-alm-19.md)<br>**Eliminar** en el registro seleccionado: [CU-ALM-20](cu-alm-20.md)<br>**Ajustar stock** en el registro seleccionado: [CU-ALM-21](cu-alm-21.md)<br>**Descargar Excel**: [CU-ALM-22](cu-alm-22.md)<br>**Nuevo consumible**: [CU-ALM-18](cu-alm-18.md) |
| Excepciones | **E1 — Acceso rechazado:** Nexus rechaza la consulta sin exponer información no autorizada.<br>**EOP — Consulta no disponible:** Nexus comunica que no pudo completar la consulta y no modifica inventario. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** la tabla contiene sólo ofertas de consumibles que el actor está autorizado a consultar.<br>2. **Fallo:** no se modifican existencias ni relaciones.<br>**Alcance:** esta consulta no modifica registros. |
| Requisitos relacionados | `RF-CAT-025`, `RN-034`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [2. Consulta y guardado de registros](../../../architecture/views/processes/02-shared-runtime/01-list-and-record-save.md).
