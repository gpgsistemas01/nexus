# CP-VUE-IMP-001-01 — recuperar una importación

`DP-VUE-IMP-001`; `RF-VUE-015`, `RF-IMP-002`. Transición borrador → confirmación
incierta → recarga → recibo o reintento del mismo comando.

| Precondiciones y datos | Acción | Resultado esperado | Limpieza |
| --- | --- | --- | --- |
| Cuenta con lectura/escritura/costos. Lote: Lona, cantidad inicial 2, costo 10, versión 0. API simulada pierde la respuesta del POST y después devuelve COMPLETED. | Validar, revisar cantidad, confirmar, recargar, abrir Importar Excel y revisar confirmación. | Se presenta el recibo; sólo hubo un POST de confirmación. Storage conserva sólo ID, versión y clave por cuenta/recurso y se limpia al recuperar. Con DRAFT, el reintento lleva la misma clave. | Desmontar composable, restaurar adaptador y limpiar Storage/contexto del navegador. |

La variante de duplicados presenta dos filas de Lona, la segunda señalada como
repetida de la fila 2. La vista previa avisa que ninguna se guardó, permite descargar
el informe y bloquea la confirmación. Ante pérdida de respuesta, no muestra ese aviso
como certeza sobre la operación pendiente.

[Unitarias](../../../tests/unit/modules/warehouse/inventoryImportTest.ts) cubren
contrato, aislamiento, error y reintento. [Chromium](../../../tests/e2e/inventoryImport.spec.ts)
comprueba controles, recarga, permisos y ausencia de desbordamiento a 320 px.
La API simulada no prueba stock; la
[integración HTTP/Prisma](../../../../back/tests/integration/controllers/inventoryImportControllerDbTest.js)
comprueba recibos, movimientos, versiones y rollback reales.

La variante de archivo único muestra tres filas: Alta de Lona, Editar costo 10→15
y Ajustar stock 2→0. Una sola carga y confirmación devuelve las tres. La plantilla
mixta permite operación por fila, conserva las columnas de IDs/versiones y comparte
recuperación con contratos anteriores. El permiso de ajuste permite importar conteos
sin lectura de costos; sin escritura/costos ni ajuste, el botón permanece oculto.
