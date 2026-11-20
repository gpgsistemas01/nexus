# `CU-ALM-19` — Editar existencia de consumible

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-19` |
| Nombre | Editar existencia de consumible. |
| Actor | Personal de almacén o Administrador del sistema. |
| Disparador | Selecciona **Editar existencia** sobre una fila de `CU-ALM-17`. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor tiene autorización para mantener el catálogo de consumibles.<br>3. El consumible y la oferta seleccionada existen. |
| Flujo principal | 1. **Actor:** selecciona **Editar existencia** sobre el consumible y proveedor correspondientes **(ver E1)**.<br>2. **Nexus:** muestra nombre, proveedor, presentación, unidad y medidas de sólo lectura. En **Existencias**, muestra el saldo actual y la cantidad convertida, y habilita stock mínimo, costo máximo y estado. Si tiene permisos, ofrece accesos a la edición del artículo o proveedor.<br>3. **Actor:** actualiza los campos permitidos y pulsa **Guardar** **(ver A1)**.<br>4. **Nexus:** valida la versión y los valores, actualiza sólo la oferta seleccionada, conserva existencias e historial y actualiza el listado **(ver EOP)** **(ver E2)**. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** señala los campos que no cumplen las reglas y conserva la captura sin guardar cambios.<br>2. **Actor:** corrige los campos y pulsa **Guardar**; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1 o durante el paso 4):**<br>1. **Nexus:** rechaza la solicitud, comunica el motivo y no presenta información ni ejecuta cambios fuera de la autorización del actor; termina el caso de uso.<br>**EOP — Operación no confirmada (durante el paso 4):**<br>1. **Nexus:** comunica que no pudo confirmar el resultado y no anuncia éxito; conserva la captura cuando el formulario sigue disponible. Termina el caso de uso.<br>**E2 — El registro cambió durante la captura (durante el paso 4):**<br>1. **Nexus:** rechaza el guardado por versión desactualizada, conserva la captura sin sobrescribir los datos vigentes y bloquea otro envío; muestra **Cerrar y actualizar inventario**.<br>2. **Actor:** pulsa **Cerrar y actualizar inventario** para consultar el estado vigente.<br>3. **Nexus:** cierra el formulario y actualiza la consulta; termina el caso de uso. Una nueva edición comienza desde el paso 1 con el registro actualizado. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** sólo cambian stock mínimo, costo máximo y estado de la oferta seleccionada; el tipo, stock e historial se conservan.<br>2. **Fallo:** no se producen cambios parciales. |
| Requisitos relacionados | `RF-CAT-027`, `RN-023`, `RN-027`, `RN-030`, `RN-031`, `RN-034`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [Selección dependiente y escritura de inventario](../../../architecture/views/processes/05-warehouse/01-inventory-selection-write.md).
