# `CU-ALM-22` — Generar reporte de inventario de consumibles

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-22` |
| Nombre | Generar reporte de inventario de consumibles. |
| Actor | Personal de almacén o Administrador del sistema. |
| Disparador | Selecciona **Exportar Excel** desde `CU-ALM-17`. |
| Precondiciones | 1. El actor inició sesión.<br>2. Cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Actor:** selecciona **Exportar Excel** desde la consulta filtrada **(ver E1)**.<br>2. **Nexus:** muestra el diálogo de alcance con **Activos o con existencia**, **Sólo activos** y **Sólo con existencia**.<br>3. **Actor:** elige el alcance y confirma **(ver A1)**.<br>4. **Nexus:** vuelve a comprobar autorización, combina búsqueda, proveedor y alcance con `type = CONSUMABLE`, consulta las ofertas sin incluir materiales y genera el archivo **(ver A2)** **(ver EBD)**.<br>5. **Nexus:** inicia la descarga sin modificar inventario. |
| Flujos alternativos | **A1 — Cancelar exportación (después del paso 3):** el actor cierra el diálogo; Nexus conserva filtros y tabla y no genera un archivo.<br>**A2 — Resultado vacío (durante el paso 4):** Nexus informa que no hay datos para los criterios elegidos y no entrega un archivo con registros de otro tipo. |
| Excepciones | **E1 — Exportación no autorizada:** Nexus rechaza la solicitud sin exponer datos.<br>**EBD — Error de consulta o generación:** Nexus informa el fallo y no entrega un archivo parcial. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** se descarga un archivo limitado a consumibles y al alcance elegido.<br>2. **Fallo:** no se modifica inventario ni se entrega un archivo parcial. |
| Requisitos relacionados | `RF-CAT-025`, `RF-REP-002`, `RF-REP-004`, `RF-REP-008`, `RF-REP-010`. |
