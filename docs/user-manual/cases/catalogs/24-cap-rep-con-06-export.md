<a id="CAP-REP-CON-06-EXPORT"></a>
# 24. CAP-REP-CON-06-EXPORT — Exportar inventario de consumibles

**Casos de uso:** `CU-ALM-22` — Generar reporte de inventario de consumibles.

1. Aplique en el listado la búsqueda y el proveedor que necesite conservar.
2. Seleccione **Exportar Excel** y compruebe el diálogo:

   ![CAP-REP-CON-06-EXPORT: alcance del inventario de consumibles](../../images/consumables/06-export-report.png)

3. Elija el alcance:
   - **Activos o con existencia:** incluye toda oferta activa y también una oferta
     inactiva cuando aún conserva existencias.
   - **Sólo activos:** incluye únicamente ofertas activas, aunque su existencia sea cero.
   - **Sólo con existencia:** incluye ofertas activas o inactivas cuyo saldo sea mayor
     que cero.
4. Seleccione **Descargar**. El archivo conserva los filtros y contiene únicamente
   consumibles; esta operación no modifica existencias.
