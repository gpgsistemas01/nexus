# `CU-ALM-02` — Crear material

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-02` |
| Nombre | Crear material. |
| Actor | Personal de almacén o Administrador del sistema. |
| Relaciones entre casos | Extiende `CU-ENT-02` en el punto de selección de material (paso 3, A5 de la compra) cuando se elige **Registrar material**; devuelve la oferta con existencia cero y sin costo máximo y reanuda el detalle en el paso 3. Extiende también `CU-ENT-03` durante la selección de artículo de un detalle nuevo (paso 3, A3), con proveedor fijado; retorna al paso 3 para completar el detalle, sin editar detalles persistidos. |
| Puntos de extensión | Selección de proveedor durante el paso 3, si falta el registro y el actor tiene permiso de alta; `CU-CAT-02` registra el proveedor y devuelve la selección sin cerrar la captura. |
| Disparador | Selecciona la acción principal para crear un material desde `CU-ALM-01` Consultar materiales o **Registrar material** desde el selector de `CU-ENT-02` Crear compra de material o de un detalle nuevo de `CU-ENT-03` Editar compra de material. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de alta.<br>3. Existen los datos relacionados requeridos para completar el registro. |
| Flujo principal | 1. **Actor:** abre la opción para crear material **(ver E1)** **(ver A3)**.<br>2. **Nexus:** muestra el formulario y carga las opciones relacionadas que puede utilizar.<br>3. **Actor:** captura nombre, proveedor, presentación, unidad, ambas dimensiones o ninguna cuando la unidad sea metros o litros, stock mínimo, costo máximo, estado, existencia inicial y observaciones; después pulsa **Guardar** **(ver A1)** **(ver A4)**.<br>4. **Nexus:** valida autorización, obligatoriedad, formato, identidad y relaciones **(ver A2)**; registra la identidad o reutiliza la existente, crea la oferta del proveedor y registra el ajuste de existencia inicial; actualiza el listado y muestra la confirmación **(ver EOP)**. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** señala los campos que no cumplen las reglas y conserva la captura sin guardar cambios.<br>2. **Actor:** corrige los campos y pulsa **Guardar**; continúa en el paso 4 del flujo principal.<br>**A2 — Oferta del proveedor ya registrada (durante el paso 4):**<br>1. **Nexus:** informa que ya existe la oferta de ese material con el proveedor y rechaza el alta sin modificar identidad, costo ni existencia; conserva la captura.<br>2. **Actor:** corrige los datos del alta y pulsa **Guardar**; continúa en el paso 4 del flujo principal.<br>**A3 — Alta invocada desde una compra (después del paso 1):**<br>1. **Nexus:** abre el alta de material con el proveedor de la compra y los campos de identidad, stock mínimo y estado; omite costo máximo, existencia inicial, motivo y observaciones del ajuste.<br>2. **Actor:** completa los campos de esta modalidad y pulsa **Guardar**; puede usar A4 si necesita registrar un proveedor y el contexto permite cambiarlo.<br>3. **Nexus:** valida y crea o reutiliza la identidad y registra su oferta con existencia cero y sin costo máximo, sin ajuste inicial; retoma la compra y selecciona el registro creado sólo si está activo; si está inactivo, informa el motivo y conserva la selección previa. Termina este caso y continúa en el paso 3 de `CU-ENT-02` o de `CU-ENT-03` para capturar cantidad y costo y agregar el detalle.<br>**A4 — Proveedor no registrado (durante la selección del paso 3):**<br>1. **Actor:** escribe el proveedor buscado y pulsa **Registrar proveedor**, cuando tiene permiso y el proveedor no está fijado por una compra.<br>2. **Nexus:** conserva la captura principal y abre el formulario del caso `CU-CAT-02`.<br>3. **Actor:** completa el alta del proveedor mediante ese caso o cancela el formulario auxiliar.<br>4. **Nexus:** retoma la captura principal; selecciona el registro confirmado si está activo y conserva la selección anterior si se cancela el alta o el registro creado queda inactivo. Continúa en el paso 3 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1 o durante el paso 4):**<br>1. **Nexus:** rechaza la solicitud, comunica el motivo y no presenta información ni ejecuta cambios fuera de la autorización del actor; termina el caso de uso.<br>**EOP — Operación no confirmada (durante el paso 4):**<br>1. **Nexus:** comunica que no pudo confirmar el resultado y no anuncia éxito; conserva la captura cuando el formulario sigue disponible. Termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Alta con presentación, unidad y relaciones válidas.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-006`, `RF-CAT-012`, `RN-023` a `RN-026`, `RN-030`, `RN-032`. |

El material no requiere capturar pesos del rollo nuevo; la referencia de muestra se
captura con la merma en `CU-ALM-10`. Los pesos antiguos quedan históricos.

La sección de medidas se oculta y deshabilita para pieza, otras unidades y consumibles.
Al cambiar a una unidad que no utiliza medidas durante el alta, se borran los valores
y errores anteriores; los inputs deshabilitados se omiten del envío. El mismo criterio
se aplica al alta desde compras. La edición y el ajuste no habilitan cambios de identidad.

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [Selección dependiente y escritura de inventario](../../../architecture/views/processes/05-warehouse/01-inventory-selection-write.md).
