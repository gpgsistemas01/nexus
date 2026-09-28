# 4. Comandos

Esta sección es la referencia de sintaxis para los comandos de exportación y capturas. Los
capítulos posteriores describen el orden de ejecución y los requisitos de cada flujo sin cambiar
esta interfaz.

## Exportación documental

| Objetivo | Comando |
| --- | --- |
| Validar todos los paquetes sin generar archivos | `npm run docs:export -- --check` |
| Validar un paquete | `npm run docs:export -- <paquete> --check` |
| Generar toda la entrega en DOCX y PDF | `npm run docs:export` |
| Generar un paquete y formato concretos | `npm run docs:export -- <paquete> <docx\|pdf\|ambos>` |

Sin argumentos, `npm run docs:export` genera **todos** los paquetes en DOCX y PDF. Los argumentos
permiten limitar deliberadamente una ejecución: `<paquete>` significa qué colección documental se
va a generar y `<formato>` admite `docx`, `pdf` o `ambos`. No son paquetes de npm. Elija uno de
estos valores cuando no necesite la entrega completa:

| Valor de `<paquete>` | Contenido generado | Cuándo usarlo |
| --- | --- | --- |
| `manual-administrador` | Carpeta `manuales/administrador/` con archivos separados para autenticación, identidad y acceso, catálogos auxiliares y reportes de movimientos. | Para personal administrador del sistema del área Sistemas. |
| `manual-almacen` | Carpeta `manuales/almacen/` con archivos separados para los grupos `AUT`, `CAT` y `ENT`; `SAL` se divide entre salidas de material y salidas de merma. | Para personal de almacén y proveeduría. |
| `requisitos` | Especificación y trazabilidad de requisitos. | Para revisión funcional. |
| `datos` | Mapa de datos, decisiones de acceso, esquema y diccionario técnico generados. | Para revisar persistencia y acceso a los datos. |
| `arquitectura` | Diseño, documentación técnica y contrato API con estructuras JSON y validaciones. | Para revisión técnica y de integraciones HTTP. |
| `pruebas` | Plan, cobertura, catálogo y resultados de pruebas. | Para evidencia de calidad. |
| `todos` | Los dos manuales por conjuntos y los cuatro documentos técnicos anteriores. | Para preparar una entrega documental completa con un solo comando. |

Los paquetes por actor reutilizan las secciones comunes y omiten las que
no corresponden a ese recorrido. En particular, los reportes de movimientos se exportan sólo en
`manual-administrador`; las compras y salidas se exportan sólo en `manual-almacen`. Los formatos
admitidos son `docx`, `pdf` y `ambos`; `pdf` y
`ambos` conservan el DOCX intermedio además del PDF, mientras que `ambos` permite expresar esa
intención de forma explícita. Markdown permanece como fuente navegable y por eso no se genera una
copia HTML equivalente.

Los nombres de los archivos siguen los mismos grupos funcionales que las fichas `CU-*`:
autenticación, identidad y acceso, catálogos y compras de material. Las salidas son la excepción:
material y merma se entregan en archivos distintos. Las
capturas de consultas y exportaciones se incluyen en el grupo del caso de uso al que dan evidencia;
no se genera un grupo genérico de reportes.

La exportación de `arquitectura` y `todos` resuelve las fuentes modulares de OpenAPI y
genera el contrato autocontenido `build/docs/openapi/openapi.json`. Se entrega separado
del DOCX o PDF porque está destinado a validadores, generadores de clientes y
visualizadores; dividirlo por formato de respuesta no aporta documentos adicionales al
lector.

## Capturas del manual

Las capturas siempre se solicitan para un área. El comando acepta `almacen` o `sistemas`, y no
genera documentos ni actualiza por sí solo las imágenes versionadas:

| Objetivo | Comando |
| --- | --- |
| Consultar el inventario completo | `npm run docs:screenshots -- --list` |
| Generar o reanudar las capturas de un área | `npm run docs:screenshots -- --area <almacen\|sistemas>` |
| Generar sólo las capturas ausentes de un área | `npm run docs:screenshots -- --area <almacen\|sistemas> --missing` |
| Regenerar todas las capturas de un área | `npm run docs:screenshots -- --area <almacen\|sistemas> --fresh` |

`DOCS_CAPTURE_AREA` puede sustituir `--area` en CI. La selección por identificador, la reanudación
desde un punto y la preparación de las sesiones se detallan en
[Actualizar las capturas del manual](08-update-the-screenshots-of-the-manual.md#reanudación-y-capturas-selectivas).
`--missing`, `--fresh`, la selección por identificador y la reanudación desde un punto son
alternativas excluyentes.
