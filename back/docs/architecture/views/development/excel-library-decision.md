# Motor de archivos Excel

Estado: aplicado. Fecha: 2026-11-07.

## Decisión y contexto

Usar **SheetKit `@sheetkit/node@1.0.1`**, fijado en el manifiesto y lockfile, para
lectura y escritura XLSX del backend. Sustituye ExcelJS en producción sin cambiar
los contratos HTTP, plantillas ni reglas del inventario. Requiere Node 24 y un
binario nativo; Docker y los requisitos locales se actualizan juntos.

La elección responde a la solicitud de un motor con mantenimiento propio.
Una versión 1.x no garantiza su mantenimiento futuro: cualquier actualización
debe pasar las mismas comprobaciones antes de cambiar el lockfile.

## Alternativas evaluadas

| Opción | Decisión |
| --- | --- |
| Conservar ExcelJS oficial | Menor cambio, pero no satisface la sustitución solicitada. Se conserva sólo como oráculo y generador de fixtures en desarrollo. |
| Fork de Protobi | Descartado: su mantenimiento se presenta como temporal. |
| `@office-kit/xlsx` | Alternativa independiente, todavía en serie 0.x; exige validar su adaptación completa. |
| `modern-xlsx` | Alternativa independiente con WASM; requiere otra adaptación de lectura y escritura. |
| SheetKit | Su API cubre las plantillas con listas/estilos, tipos y fórmulas con resultados guardados, además de reportes por flujo. Las pruebas del proyecto respaldan esta integración. |

## Consecuencias y mantenimiento

- Importaciones: worker temporal, límites de bytes/descompresión/filas y tiempo.
  El límite de memoria V8 no incluye las asignaciones nativas de Rust.
- Reportes: filas al temporal nativo sin tabla global de cadenas; guardado
  asíncrono y descarga del XLSX terminado. La hoja se retira para liberar el
  temporal nativo inmediatamente, también ante error o cancelación.
- El XML temporal ocupa más espacio que el XLSX comprimido. Compose reserva
  hasta 256 MiB en `/tmp`; el consumo depende de datos y concurrencia y puede
  contabilizarse como memoria del contenedor.
- ExcelJS y `read-excel-file` verifican los archivos desde pruebas; no se
  incluyen en la instalación de producción ni en Vue.

Validar las seis plantillas tras edición, rechazos de celdas, fórmulas con cero,
errores, descargas concurrentes, limpieza, HTTP/Prisma y el flujo real Vue/API.
La [guía de rendimiento](../../../testing/backend-performance.md) define las
mediciones; una comparación sintética local no establece un SLA.

Revisar esta decisión si faltan binarios de una plataforma soportada, cambia el
requisito de Node, aparecen fallos de compatibilidad o límites de recursos, o el
proyecto deja de mantener versiones. El motor queda concentrado en el worker y
`reportExcelUtils`, con utilidades de libro compartidas; cambiarlo no requiere
modificar los servicios de negocio. El mantenimiento corresponde al backend;
no se asigna aquí un responsable personal.
