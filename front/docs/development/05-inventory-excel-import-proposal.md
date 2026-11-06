# 5. Propuesta de importación de inventario por Excel

## Datos generales del documento

| Versión documental | Versión del sistema | Estado | Fecha | Responsable |
| --- | --- | --- | --- | --- |
| 1.0 | 1.0.0 | Propuesta | 2026-11-06 | Equipo Nexus |

## Estado y alcance

**Estado: propuesta de implementación; función todavía no disponible.**
Este documento define la experiencia Vue. El [diseño del backend](../../../back/docs/architecture/views/development/inventory-excel-import-proposal.md)
conserva el formato de las plantillas, los endpoints propuestos, las transacciones
y la política de archivos.

## Flujo recomendado

1. Entrar al módulo de Almacén: Materiales, Consumibles o Mermas.
2. Elegir **Altas** o **Actualizar datos** y descargar la plantilla correspondiente.
3. Completar el archivo y seleccionarlo para validar.
4. Revisar el resumen y las filas con sus cambios, errores y advertencias.
5. Corregir los errores antes de confirmar. La validación no modifica inventario.
6. Confirmar una sola vez y consultar el resultado del lote.

La primera entrega contempla altas y datos generales. Los ajustes de existencias
y las entradas posteriores siguen sus acciones actuales. La plantilla de alta
puede incluir la cantidad inicial del registro nuevo.

## Plantillas y vista previa

| Situación | Comportamiento propuesto |
| --- | --- |
| Alta | Plantilla vacía con instrucciones y opciones del catálogo. Las mermas requieren un material de referencia ya registrado. |
| Actualización | Plantilla con datos actuales, IDs y versiones que se conservan al subirla. Mostrar cuáles columnas se pueden editar. |
| Datos compartidos | Advertir que nombre y stock mínimo del material también afectan a sus otros proveedores; costo y activo corresponden al proveedor de la fila. |
| Errores | Mostrar fila, columna y motivo; conservar el contexto para corregir y validar de nuevo. Un vacío no borra automáticamente un dato. |
| Consulta extensa o móvil | Resumen visible y filas paginadas. En móvil, mostrar cada fila con campos y diferencias legibles, sin descargar todo el detalle a una tabla gigante. |
| Lote confirmado | Mostrar cantidades creadas, actualizadas y omitidas, además del identificador de la importación. No volver a enviar las filas. |

La UI debe comprobar formato y tamaño para dar feedback temprano. La API realiza
la validación definitiva, calcula derivados, autoriza la operación y detecta
conflictos. Un `200` sin el contrato esperado no confirma una importación.

## Organización y recuperación

Crear una interfaz de importación compartida por los tres módulos, configurada
por recurso y modo. El contenedor coordina selección, vista previa y confirmación;
componentes de presentación muestran el resultado. Reutilizar el cliente HTTP,
errores y descargas de Excel; usar `FormData` sólo en la petición del archivo.

Conservar un `operationId` estable desde la primera confirmación y guardar como
referencia de recuperación sólo `importId` y esa clave, sin filas ni costos en
almacenamiento del navegador. Ante una respuesta perdida, consultar el lote antes
de repetir la misma confirmación. Un estado pendiente no demuestra rollback.
Si el borrador venció o existen versiones antiguas, solicitar otra validación;
el cliente no reemplaza versiones para forzar una actualización.

Al cerrar o cancelar, liberar el archivo y las vistas previas de la sesión. Si hay
una confirmación en curso, conservar la referencia de recuperación hasta comprobar
su resultado; cerrar la pantalla no garantiza cancelar una escritura en el servidor.

## Qué se elimina

El servidor descarta el XLSX recibido después de analizarlo. Los borradores se
eliminan al confirmar/cancelar o mediante su limpieza por vencimiento. El recibo
y la historia de cambios se conservan por separado para consulta y recuperación.

El Excel original y los informes descargados pertenecen al usuario y permanecen
en su equipo. La interfaz debe explicar esta diferencia al terminar la operación.
No presentar un borrado del archivo del servidor como borrado del original local.

Esta propuesta se publica separada de la documentación completa de las funciones
vigentes. El manual de usuario y sus capturas se actualizan cuando el flujo exista.
