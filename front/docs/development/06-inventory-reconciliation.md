# 6. Conciliación de inventario y entregas históricas

**Estado: implementado.** Almacén usa el mismo botón de Excel para alta, edición
y ajuste, con una operación elegida para todo el archivo. Salidas permite registrar por lote entregas físicas
antiguas que permanecen pendientes o parciales.

## Inventario desactualizado

1. Hacer un conteo físico actual y evitar movimientos mientras se captura.
2. Abrir **Importar Excel**, elegir **Ajustar existencias** y descargar los registros filtrados.
3. Conservar las columnas de consulta y los IDs/versiones; capturar **Stock contado**,
   motivo y observaciones. Cero es válido; vacío produce error.
4. Validar, revisar saldo anterior/final y diferencia, corregir errores y confirmar.

Cada Excel representa una operación. Editar datos conserva stock; Alta captura
Cantidad inicial y genera los IDs nuevos. Si también se corrigen datos, completar
esa operación y descargar una plantilla actual para ajustar las existencias.
Un error, repetido o versión vieja bloquea todo el archivo. No se copian conteos
antiguos sobre saldos actuales sin conciliar los movimientos posteriores.

## Salidas ya entregadas

1. Conciliar primero el inventario mediante el conteo físico actual.
2. En **Salidas → Materiales, Consumibles o Mermas**, abrir **Registrar entregas históricas**.
3. Indicar fecha/hora de corte en Ciudad de México y cargar el listado de salidas pendientes
   y parcialmente surtidas anteriores al corte.
4. Revisar lo ya registrado/devuelto y las cantidades pendientes por registrar.
5. Seleccionar las salidas cuyas partidas pendientes ya se entregaron por completo.
   **Seleccionar todo** abarca todas las páginas si hay hasta 100 salidas; si hay más,
   selecciona manualmente hasta 100 por lote. Cambiar el corte limpia la selección.
6. Capturar motivo/evidencia; fecha real de entrega sólo si se conoce.
7. Declarar expresamente que todas las partidas pendientes se entregaron antes del
   corte y pulsar **Registrar entregas seleccionadas**.
8. Conservar el recibo y comprobar la marca **Regularizada por entrega histórica**.

La capacidad corresponde a Sistemas y Coordinación de Almacén. El permiso de surtir
por sí solo no la habilita. Una revisión desactualizada exige volver a leer los folios.
No cambia el stock ni reconstruye compras. Conserva entregas y devoluciones previas;
completa sólo lo que faltaba registrar. Costos y datos de proyecto históricos quedan
identificados como no verificados en consulta y reportes.

Una entrega nueva se registra por **Surtir**. Una devolución posterior a la regularización
requiere confirmar que el material está entrando físicamente al almacén ahora.
No se usa una devolución para volver a contar material que ya estaba en el inventario.

## Respuesta incierta

El cliente guarda la captura original por cuenta/recurso antes del POST. Si se pierde
la conexión, reabrir el diálogo y pulsar **Revisar y reintentar registro**. Conserva
la misma clave, selección, revisión y declaración; el servidor devuelve el mismo
recibo si ya terminó. No se crea una segunda entrega.

`HistoricalDeliveryPage` compone `HistoricalDeliveryDialog` y `useHistoricalDelivery`.
Reutiliza `EditorDialog`, controles Vuetify, Axios, errores, UUID y conversión horaria.
`pendingHistoricalDelivery` encapsula la recuperación por cuenta/recurso; los límites,
revisiones y códigos de error usan `@nexus/historical-deliveries`, compartido con Express.
El [backend](../../../back/docs/architecture/views/development/inventory-reconciliation.md)
define transacciones, persistencia, permisos y ausencia de movimientos históricos.
