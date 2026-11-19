# `CU-ALM-02` — Crear existencia de material

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-02` |
| Nombre | Crear existencia de material. |
| Actor | Personal de almacén o Administrador del sistema. |
| Relaciones entre casos | `CU-ALM-26` puede extender este caso cuando falta la identidad de artículo; al volver, la existencia se vincula al proveedor seleccionado. |
| Puntos de extensión | Proveedor faltante durante el paso 3: `CU-CAT-02` registra el proveedor y devuelve la selección. Artículo faltante durante el paso 3: `CU-ALM-26` registra la identidad y devuelve el artículo sin crear la oferta. |
| Disparador | Selecciona **Nueva existencia** desde `CU-ALM-01` Consultar materiales. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de alta.<br>3. El proveedor y artículo existen o el actor puede registrarlos desde el selector. |
| Flujo principal | 1. **Actor:** abre **Nueva existencia** desde la consulta.<br>2. **Nexus:** muestra selectores de proveedor y material del catálogo completo.<br>3. **Actor:** selecciona ambos; Nexus muestra nombre, presentación, unidad, medidas y stock mínimo como referencia de sólo lectura. El actor captura costo máximo, estado, cantidad inicial y observaciones y pulsa **Guardar** **(ver A1)** **(ver A4 y A5)**.<br>4. **Nexus:** comprueba tipo e identidad por ID, permisos, proveedor y oferta duplicada **(ver A2)**; vincula el artículo y registra el stock inicial atómicamente. Actualiza el listado **(ver EOP)**. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** señala los campos que no cumplen las reglas y conserva la captura sin guardar cambios.<br>2. **Actor:** corrige los campos y pulsa **Guardar**; continúa en el paso 4 del flujo principal.<br>**A2 — Oferta del proveedor ya registrada (durante el paso 4):**<br>1. **Nexus:** informa que ya existe la oferta de ese material con el proveedor y rechaza el alta sin modificar identidad, costo ni existencia; conserva la captura.<br>2. **Actor:** corrige los datos del alta y pulsa **Guardar**; continúa en el paso 4 del flujo principal.<br>**A4 — Proveedor no registrado (durante la selección del paso 3):**<br>1. **Actor:** escribe el proveedor buscado y pulsa **Registrar proveedor** cuando no encuentra coincidencia y tiene permiso de alta.<br>2. **Nexus:** conserva la captura principal y abre el formulario del caso `CU-CAT-02`.<br>3. **Actor:** completa el alta del proveedor mediante ese caso o cancela el formulario auxiliar.<br>4. **Nexus:** retoma la captura principal; selecciona el proveedor creado si está activo y conserva la selección anterior si se cancela el alta o queda inactivo.<br>**A5 — Artículo faltante:** el actor escribe el nombre en el selector y pulsa **Registrar material**. Nexus abre `CU-ALM-26`; al guardar, selecciona el artículo sin crear oferta ni stock. Cancelar conserva la captura principal. Continúa en el paso 3. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1 o durante el paso 4):**<br>1. **Nexus:** rechaza la solicitud, comunica el motivo y no presenta información ni ejecuta cambios fuera de la autorización del actor; termina el caso de uso.<br>**EOP — Operación no confirmada (durante el paso 4):**<br>1. **Nexus:** comunica que no pudo confirmar el resultado y no anuncia éxito; conserva la captura cuando el formulario sigue disponible. Termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Alta con presentación, unidad y relaciones válidas.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-006`, `RF-CAT-012`, `RN-023` a `RN-026`, `RN-030`, `RN-032`. |

El material no requiere capturar pesos del rollo nuevo; la referencia de muestra se
captura con la merma en `CU-ALM-10`. Los pesos antiguos quedan históricos.

El alta de Existencias toma presentación, unidad y medidas del artículo. El modal auxiliar permite registrarlo; KILOGRAMOS y METRO LINEAL fijan `1 × 1`. La consulta y edición directa de identidades se realizan en **Almacén → Artículos** conforme a `CU-ALM-25` a `CU-ALM-27`.

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [Selección dependiente y escritura de inventario](../../../architecture/views/processes/05-warehouse/01-inventory-selection-write.md).
