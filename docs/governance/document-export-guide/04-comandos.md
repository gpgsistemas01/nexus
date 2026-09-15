# 4. Comandos

En los comandos, `<paquete>` significa **qué contenido se va a reunir en un solo archivo**. No es
un paquete de npm. Elija uno de estos valores:

| Valor de `<paquete>` | Contenido generado | Cuándo usarlo |
| --- | --- | --- |
| `manual-administrador` | Acceso, identidad, catálogos y reportes disponibles para Sistemas. | Para personal administrador del sistema. |
| `manual-almacen` | Acceso, catálogos, compras, salidas y reportes operativos. | Para personal de almacén y proveeduría. |
| `requisitos` | Especificación y trazabilidad de requisitos. | Para revisión funcional. |
| `datos` | Mapa de datos, decisiones de acceso, esquema y diccionario técnico generados. | Para revisar persistencia y acceso a los datos. |
| `arquitectura` | Diseño, documentación técnica y contrato API con estructuras JSON y validaciones. | Para revisión técnica y de integraciones HTTP. |
| `pruebas` | Plan, cobertura, catálogo y resultados de pruebas. | Para evidencia de calidad. |
| `todos` | Los seis documentos anteriores, cada uno en su propio archivo. | Para preparar una entrega documental completa con un solo comando. |

Los paquetes por actor reutilizan las secciones comunes y omiten las que
no corresponden a ese recorrido. Los formatos de entrega admitidos son `docx` y `pdf`; Markdown
permanece como fuente navegable y por eso no se genera una copia HTML equivalente.

La exportación de `arquitectura` y `todos` resuelve las fuentes modulares de OpenAPI y
genera el contrato autocontenido `build/docs/openapi/openapi.json`. Se entrega separado
del DOCX o PDF porque está destinado a validadores, generadores de clientes y
visualizadores; dividirlo por formato de respuesta no aporta documentos adicionales al
lector.
