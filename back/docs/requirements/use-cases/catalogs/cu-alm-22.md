# `CU-ALM-22` — Generar reporte de inventario de consumibles

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-22` |
| Nombre | Generar reporte de inventario de consumibles. |
| Actor | Personal de almacén o Administrador del sistema. |
| Disparador | Selecciona **Exportar Excel** desde `CU-ALM-17`. |
| Precondiciones | 1. El actor inició sesión.<br>2. Cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Actor:** selecciona **Exportar Excel** desde la consulta filtrada **(ver E1)**.<br>2. **Nexus:** muestra el diálogo de alcance con **Activos o con existencia**, **Sólo activos** y **Sólo con existencia**.<br>3. **Actor:** elige el alcance y confirma **(ver A1)**.<br>4. **Nexus:** vuelve a comprobar autorización, aplica la búsqueda, el proveedor y el alcance exclusivamente al catálogo de consumibles, consulta las ofertas sin incluir materiales y genera el archivo **(ver A2)** **(ver EOP)**; inicia la descarga sin modificar inventario. |
| Flujos alternativos | **A1 — Cancelar la exportación (antes del paso 3):**<br>1. **Actor:** cierra el diálogo.<br>2. **Nexus:** conserva los filtros y la consulta sin generar un archivo; termina el caso de uso.<br>**A2 — Resultado vacío (durante el paso 4):**<br>1. **Nexus:** informa que no hay datos para los criterios elegidos, sin incluir registros de otro catálogo.<br>2. **Actor:** recibe el aviso; termina el caso de uso. |
| Excepciones | **E1 — Exportación no autorizada:** Nexus rechaza la solicitud sin exponer datos.<br>**EOP — Error de consulta o generación:** Nexus informa el fallo y no entrega un archivo parcial. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** se descarga un archivo limitado a consumibles y al alcance elegido.<br>2. **Fallo:** no se modifica inventario ni se entrega un archivo parcial. |
| Requisitos relacionados | `RF-CAT-025`, `RF-REP-002`, `RF-REP-004`, `RF-REP-008`, `RF-REP-010`. |
