# `CU-ALM-26` — Crear artículo

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-26` |
| Nombre | Crear artículo. |
| Actor | Personal de almacén o Administrador del sistema con `material-catalogs:manage`. |
| Relaciones entre casos | Se inicia desde `CU-ALM-25` o como alta contextual desde `CU-ALM-02`, `CU-ALM-18`, `CU-ENT-02`, `CU-ENT-03`, `CU-ENT-08` o `CU-ENT-09`. |
| Disparador | Selecciona **Nuevo artículo** o **Registrar material/consumible** desde un selector autorizado. |
| Precondiciones | 1. El actor inició sesión y tiene `material-catalogs:manage`.<br>2. La presentación y unidad requeridas están disponibles. |
| Flujo principal | 1. **Nexus:** muestra nombre, tipo, presentación, unidad y medidas aplicables.<br>2. **Actor:** captura los datos y selecciona **Guardar**.<br>3. **Nexus:** valida la identidad y sus datos. Para las presentaciones KILOGRAMOS y METRO LINEAL fija medidas `1 × 1` y oculta esos campos; no crea proveedor, costo ni existencia.<br>4. **Nexus:** guarda el artículo y, si el alta fue contextual, devuelve el registro a la captura de origen. |
| Flujos alternativos | **A1 — Identidad ya existente:** Nexus rechaza el alta duplicada. El actor cierra el formulario y selecciona el artículo existente en el selector; no se modifica el catálogo.<br>**A2 — Alta contextual desde compra:** el artículo vuelve a la compra sin oferta ni stock. Al guardar la compra se crea la relación con el proveedor y se registra la recepción. |
| Excepciones | **E1 — Datos inválidos o acceso rechazado:** Nexus indica el rechazo y no crea el artículo. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** queda registrada una identidad de artículo sin oferta de proveedor ni existencias.<br>2. **Fallo:** no hay cambios parciales. |
| Requisitos relacionados | `RF-CAT-030`, `RF-CAT-031`, `RF-VUE-006`, `RN-024` a `RN-027`, `RN-030` a `RN-032`. |
