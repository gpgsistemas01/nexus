# 5. Importación de inventario por Excel

**Importar Excel** está disponible en Materiales, Consumibles y Mermas para cuentas
con lectura, escritura y lectura de costos. Comparte formulario, servicio y
recuperación entre los tres módulos.

## Recorrido

1. Elegir **Crear registros** o **Actualizar datos**.
2. Descargar la plantilla. En actualización, elegir página de 100 registros y
   filtros; en alta de merma, seleccionar proveedor para obtener sus referencias.
3. Conservar hojas/encabezados, completar valores y seleccionar el `.xlsx`.
4. Pulsar **Validar archivo** y revisar filas, cantidad inicial, valores anteriores,
   cambios, errores y advertencias. Se muestran diez filas por página, en tarjetas
   adaptadas al móvil.
5. Corregir el archivo si hay errores; **Descartar borrador** permite subirlo de nuevo.
   **Descargar errores** genera una lista de fila, columna y mensaje.
6. Pulsar **Confirmar importación**. El recibo confirma el resultado; el modal permanece
   abierto para revisarlo y ofrece **Otro archivo**.

La actualización admite nombre, mínimo, costo y activo. Conserva IDs y versiones;
no cambia existencias, dimensiones, unidades, presentación ni pesos. Nombre y mínimo
afectan al material compartido entre proveedores. Las altas duplicadas se rechazan.
Pieza exige enteros; un alta sin costo muestra advertencia y no puede usarse en salidas
hasta configurar un costo positivo en Almacén.

## Código y transporte

`InventoryPage` carga `InventoryImportPage` al abrir la función y pausa la recarga
automática del listado. `useInventoryImport` coordina el estado; el componente
`InventoryImportDialog` recibe datos y emite acciones. `EditorDialog` conserva foco,
carga y presentación de pantalla completa en móvil.

`inventoryImportService` reutiliza `apiClient`, validación de confirmaciones,
`requestExcel` y `useFileExport`. Envía `FormData` sólo en la vista previa; el navegador
establece su boundary. Confirmar envía una sola petición JSON con `expectedVersion`+y `operationId`, sin escrituras por fila. El contrato de respuesta se comprueba
antes de mostrar éxito. Un `200` incompleto no confirma la importación.

Los límites públicos se comparten por `@nexus/inventory-imports`: 2 MiB y 100 filas.
El navegador comprueba tamaño/extensión; Express valida el contenido y las reglas.
Las plantillas de actualización se descargan por páginas y sus catálogos se acotan.
No se carga ExcelJS ni se analiza el libro en el navegador.

## Recuperación y archivos

Antes de confirmar se guarda sólo `{ id, expectedVersion, operationId }` en una clave
local separada por cuenta y recurso. No contiene archivo, filas ni costos. Si se pierde
la respuesta, **Revisar y reintentar confirmación** consulta el mismo lote: recupera
su recibo si terminó o repite la misma confirmación si sigue pendiente. No crea otra
importación. **Descartar borrador** queda condicionado por el estado del servidor.

El XLSX se descarta en el servidor después del análisis; el borrador privado vence en
24 horas y se limpia periódicamente. El recibo confirmado permanece en la base.
El original y las descargas del equipo del usuario no se eliminan automáticamente.

El [backend](../../../back/docs/architecture/views/development/inventory-excel-import.md)
documenta atomicidad, permisos, limpieza y límites de ejecución. El contrato HTTP
completo es [OpenAPI](../../../back/docs/architecture/openapi/index.md).
Los [comandos de comprobación](00-commands.md#pruebas) reúnen las pruebas y el benchmark.
