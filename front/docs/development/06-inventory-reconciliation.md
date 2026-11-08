# 6. Conciliación de inventario y entregas históricas

**Estado: implementado.** Almacén usa un archivo por inventario con altas, ediciones
y ajustes mezclados por fila. Salidas permite registrar por lote entregas físicas
antiguas que permanecen pendientes o parciales.

## Inventario desactualizado

1. Hacer un conteo físico actual y evitar movimientos mientras se captura.
2. Abrir **Importar Excel** y descargar la plantilla de los registros filtrados.
3. Elegir por fila **Alta**, **Editar**, **Ajustar**, **Editar y ajustar** o **Conservar**.
4. Capturar el saldo físico final en `stock_contado_o_inicial` para ajustar,
   con motivo y observaciones. Cero es válido; vacío produce error.
5. Validar, revisar saldo anterior/final y diferencia, corregir errores y confirmar.

Editar conserva stock; Alta usa esa columna como existencia inicial. Editar y ajustar
resuelve datos y saldo en una fila. Conservar no escribe nada. Los IDs/versiones de
registros existentes se mantienen desde la descarga; las altas dejan el ID vacío.
Un error, repetido o versión vieja bloquea todo el archivo. No se copian conteos
antiguos sobre saldos actuales sin conciliar los movimientos posteriores.

## Salidas ya entregadas

1. Conciliar primero el inventario mediante el conteo físico actual.
2. En **Salidas → Materiales, Consumibles o Mermas**, abrir **Registrar entregas históricas**.
3. Indicar fecha/hora de corte en Ciudad de México y buscar por folio o proyecto.
4. Revisar lo ya registrado/devuelto y las cantidades pendientes por registrar.
5. Seleccionar las salidas entregadas completamente; se pueden seleccionar hasta
   100 de la página. Cambiar de corte, búsqueda o página limpia la selección.
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
El [backend](../../../back/docs/architecture/views/development/inventory-reconciliation.md)
define transacciones, persistencia, permisos y ausencia de movimientos históricos.
