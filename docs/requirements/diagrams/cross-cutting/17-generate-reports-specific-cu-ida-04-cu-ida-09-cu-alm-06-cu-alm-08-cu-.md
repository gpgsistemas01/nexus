# 17. Generar reportes específicos — `CU-IDA-04`, `CU-IDA-09`, `CU-ALM-06`, `CU-ALM-08`, `CU-CAT-04`, `CU-CAT-08`, `CU-ALM-14`, `CU-ALM-16`, `CU-ENT-06`, `CU-SAL-07` y `CU-SAL-14`

```mermaid
flowchart LR
    reportRequest["Elegir reporte y parámetros"] --> reportKind{"¿Inventario o reporte temporal?"}
    reportKind -->|inventario de material o merma| inventoryScope{"¿Activos, con existencia o ambos?"}
    inventoryScope --> inventoryFilters["Combinar inventoryScope con búsqueda, proveedor y orden"]
    reportKind -->|compras, salidas o movimientos| reportMode{"¿Mes actual, otro mes o filtros?"}
    reportMode -->|mes actual u otro mes| reportRange["Derivar rango del mes y neutralizar filtros incompatibles"]
    reportMode -->|filtros aplicados| reportFilters["Normalizar búsqueda, fechas, relaciones y orden"]
    inventoryFilters --> reportQuery["Consultar filas autorizadas en servicio de reportes"]
    reportRange --> reportQuery["Consultar filas autorizadas en servicio de reportes"]
    reportFilters --> reportQuery
    reportQuery --> reportTransform["Construir encabezados, filas, agrupaciones y totales"]
    reportTransform --> reportFormula["Agregar fórmulas conservando valores calculados"]
    reportFormula --> reportExcel["Crear una hoja con nombre y columnas del reporte"]
    reportExcel --> reportResponse["Enviar archivo Excel"]
```

Los inventarios no aplican selección mensual: su modal elige `inventoryScope`. Los
reportes temporales conservan mes actual, otro mes o filtros aplicados. Todos reutilizan
el canal consulta → transformación → Excel, pero
mantienen columnas, agrupación, fórmulas, permiso y nombre de hoja propios. Una nueva
variante replica ese proceso con configuración contextual antes de crear otro canal.
