# Motor de archivos Excel

El backend usa **SheetKit `@sheetkit/node@1.0.1`** para leer y escribir XLSX en
producción. El motor está encapsulado en los workers de Excel y las utilidades de
reportes; las reglas de inventario y los contratos HTTP no dependen de su API.

## Lectura e importación

La importación se ejecuta en un worker temporal. Valida tamaño, descompresión,
filas y tiempo de procesamiento antes de confirmar los cambios. La base de datos
recibe la operación sólo después de validar el archivo. El límite de memoria de
V8 no incluye todas las asignaciones del módulo nativo; por eso también se limita
el archivo expandido y la duración.

## Escritura y reportes

Las hojas se escriben al temporal nativo y se guardan de forma asíncrona antes de
responder la descarga. Al terminar, la hoja y el temporal se liberan incluso si hay
error o cancelación. El XML temporal puede ocupar más espacio que el XLSX
comprimido; Compose reserva espacio temporal para la generación.

## Dependencias y compatibilidad

La versión de producción se fija en `back/package.json` y `back/package-lock.json`.
El paquete requiere Node 24 y un binario nativo compatible con la plataforma. La
imagen Docker y el entorno local usan Node compatible.

ExcelJS y `read-excel-file` se usan como herramientas de desarrollo para fixtures
y verificación; no forman parte de la instalación de producción ni del cliente Vue.
Las pruebas cubren formatos de plantilla, validación de celdas, fórmulas, rechazos,
descargas, concurrencia y liberación de recursos.
