# 4. Comandos

Sin argumentos, `npm run docs:export` reconstruye **todos** los paquetes en DOCX y PDF. Los
argumentos permiten limitar deliberadamente una ejecución: `<paquete>` significa qué colección
documental se va a generar, `<seccion>` identifica opcionalmente un único documento técnico y
`<formato>` admite `docx`, `pdf` o `ambos`. No son paquetes de npm. Elija uno de estos valores
cuando no necesite la entrega completa:

| Valor de `<paquete>` | Contenido generado | Cuándo usarlo |
| --- | --- | --- |
| `manuales` | Las carpetas `manuales/administrador/` y `manuales/almacen/`, con todos sus documentos. | Para publicar los manuales; no se permite exportar sólo un actor o una sección. |
| `requisitos` | Especificación y trazabilidad de requisitos. | Para revisión funcional. |
| `datos` | Mapa de datos, decisiones de acceso, esquema y diccionario técnico generados. | Para revisar persistencia y acceso a los datos. |
| `arquitectura` | Diseño, documentación técnica y contrato API con estructuras JSON y validaciones. | Para revisión técnica y de integraciones HTTP. |
| `pruebas` | Plan, cobertura, catálogo y resultados de pruebas. | Para evidencia de calidad. |
| `todos` | Los dos manuales por conjuntos y los cuatro documentos técnicos anteriores. | Para preparar una entrega documental completa con un solo comando. |

Al indicar sólo un paquete técnico se reconstruyen todos sus documentos. Para regenerar uno solo,
agregue el nombre de la sección mostrado en la salida, por ejemplo
`npm run docs:export -- arquitectura backend docx`. La selección de sección no se admite con
`todos` ni con `manuales`: la exportación general siempre reconstruye todo y los manuales siempre
se exportan completos para ambos actores.

Los paquetes por actor reutilizan las secciones comunes y omiten las que
no corresponden a ese recorrido. En particular, los reportes de movimientos se exportan sólo en
el manual de administrador; las compras y salidas se exportan sólo en el manual de almacén. Los
formatos
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
