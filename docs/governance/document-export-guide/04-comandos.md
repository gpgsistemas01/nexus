# 4. Comandos

En los comandos, `<paquete>` significa **qué colección documental se va a generar**. No es
un paquete de npm. Los manuales producen varios archivos por conjunto funcional; los demás
paquetes producen un archivo. Elija uno de estos valores:

| Valor de `<paquete>` | Contenido generado | Cuándo usarlo |
| --- | --- | --- |
| `manual-administrador` | Carpeta `administrador/` con archivos separados de acceso, personas, usuarios y catálogos auxiliares. | Para personal administrador del sistema. |
| `manual-almacen` | Carpeta `almacen/` con archivos separados por módulo operativo: acceso, materiales, proveedores, clientes, mermas, compras y cada tipo de salida. | Para personal de almacén y proveeduría. |
| `requisitos` | Especificación y trazabilidad de requisitos. | Para revisión funcional. |
| `datos` | Mapa de datos, decisiones de acceso, esquema y diccionario técnico generados. | Para revisar persistencia y acceso a los datos. |
| `arquitectura` | Diseño, documentación técnica y contrato API con estructuras JSON y validaciones. | Para revisión técnica y de integraciones HTTP. |
| `pruebas` | Plan, cobertura, catálogo y resultados de pruebas. | Para evidencia de calidad. |
| `todos` | Los dos manuales por conjuntos y los cuatro documentos técnicos anteriores. | Para preparar una entrega documental completa con un solo comando. |

Los paquetes por actor reutilizan las secciones comunes y omiten las que
no corresponden a ese recorrido. Los formatos de entrega admitidos son `docx` y `pdf`; Markdown
permanece como fuente navegable y por eso no se genera una copia HTML equivalente.

Las consultas y exportaciones de reportes se incluyen en el archivo del módulo al que pertenecen;
no se genera un manual genérico de reportes separado del flujo que explica sus datos.

La exportación de `arquitectura` y `todos` resuelve las fuentes modulares de OpenAPI y
genera el contrato autocontenido `build/docs/openapi/openapi.json`. Se entrega separado
del DOCX o PDF porque está destinado a validadores, generadores de clientes y
visualizadores; dividirlo por formato de respuesta no aporta documentos adicionales al
lector.
