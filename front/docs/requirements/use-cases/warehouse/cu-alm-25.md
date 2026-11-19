# `CU-ALM-25` — Consultar artículos

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-25` |
| Nombre | Consultar artículos. |
| Actor | Personal de almacén o Administrador del sistema con `material-catalogs:manage`. |
| Disparador | Abre **Almacén → Artículos**. |
| Precondiciones | 1. El actor inició sesión.<br>2. La cuenta tiene `material-catalogs:manage`. |
| Flujo principal | 1. **Actor:** abre Artículos y busca o pagina la tabla.<br>2. **Nexus:** muestra cada identidad de artículo una vez, con tipo, presentación, unidad, medidas y stock mínimo; no duplica filas por sus ofertas de proveedor.<br>3. **Actor:** consulta los datos o inicia **Nuevo artículo** (`CU-ALM-26`) o **Editar** (`CU-ALM-27`). |
| Excepciones | **E1 — Acceso rechazado:** Nexus rechaza la consulta y no expone los artículos. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** no se modifican artículos ni existencias.<br>2. **Fallo:** no se ejecuta una operación sin autorización. |
| Requisitos relacionados | `RF-CAT-030`, `RF-VUE-006`. |
