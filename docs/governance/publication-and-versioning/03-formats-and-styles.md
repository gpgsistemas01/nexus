# 3. Formatos y estilos

- Markdown es la fuente versionada y conserva notas de mantenimiento, enlaces al repositorio y
  bloques Mermaid que no tienen valor en una entrega impresa.
- DOCX es el formato editable para revisión y firmas. Se genera sin una plantilla adicional; un
  `reference.docx` opcional puede definir tipografías, encabezados, tablas y numeración.
- PDF es la entrega no editable. El exportador genera primero el DOCX y lo convierte mediante
  LibreOffice en modo no interactivo; conserva los editables en `build/docs/docx/` y las entregas
  finales en `build/docs/pdf/` para que cada PDF corresponda al DOCX revisado sin mezclar formatos.
- HTML o EPUB no se generan como otro artefacto: la navegación granular ya se publica desde los
  Markdown enlazados, mientras DOCX cubre revisión y PDF cubre entrega. Incorporar otro formato sin
  una audiencia, requisito de distribución o validación propia duplicaría salidas sin reducir el
  contenido normativo.

La portada se genera desde `title`, `subtitle`, `author` y `date` del bloque YAML del
primer archivo del manifiesto. En DOCX puede adoptar los estilos de un documento de referencia cuando se
proporciona, pero no lo necesita para generar la portada. No se mantiene una portada como
captura: así sus versiones, estado, fecha y responsable permanecen revisables como texto.
Markdown aporta títulos, énfasis, listas,
tablas, citas y bloques de código; `DOCS_REFERENCE_DOC` permite controlar tipografías, márgenes,
encabezados, tablas y numeración de DOCX.

`scripts/exportDocs.js` ensambla los manifiestos cuyos archivos de entrada viven en la familia
correspondiente, comprueba imágenes y delega la conversión a Pandoc. Es herramienta **de desarrollo/CI**, no dependencia ni proceso
del servidor en producción. El estilo DOCX se pasa con `DOCS_REFERENCE_DOC`. El exportador conserva
cada bloque Mermaid en el Markdown fuente, lo renderiza como una imagen PNG temporal y entrega
esa imagen a Pandoc. Así DOCX y PDF muestran el diagrama visual en vez de copiar su código; los
archivos temporales se eliminan al finalizar.

Antes de convertir, cada enlace local con fragmento se valida contra un título o ancla
explícita real. Las referencias entre fuentes incluidas se declaran con una ruta Markdown
relativa al archivo de origen; el exportador las convierte en referencias internas únicas
antes de ensamblar el paquete. Un enlace a otro documento sin fragmento lleva al inicio de
ese documento. Los enlaces a fuentes que no forman parte del paquete se presentan como
texto. No es necesario distribuir los Markdown junto al DOCX o PDF: sus referencias pasan
a ser internas; sólo los enlaces web conservan una URL absoluta. Mermaid se limita a producir
la figura y no usa `click`, porque el hipervínculo dejaría de ser uniforme al renderizar el
bloque como imagen para DOCX o PDF.

Para DOCX, el exportador materializa la tabla de contenido y el índice de imágenes como
navegación interna a partir de los títulos y leyendas del paquete. No delega esa tarea a
campos de Word pendientes de actualización, porque además de mostrar un aviso al abrir el
archivo esos campos no contienen un resultado calculado por Pandoc. En PDF se conservan
la misma tabla de contenido y el mismo índice de imágenes al convertir el DOCX con LibreOffice.
Todas las figuras de un paquete reciben una leyenda correlativa `Figura N. …`, incluida en
el índice y asociada a la misma referencia interna que la imagen. La numeración se materializa
durante cada exportación, en vez de depender de campos `SEQ` de Word, para que DOCX y PDF
publiquen el mismo número y para que los paquetes generados sin Microsoft Word sean completos.

Las anclas explícitas que preceden a un encabezado se preparan como un bloque independiente.
La separación evita que Pandoc interprete el encabezado y su atributo interno como texto visible;
los identificadores sirven sólo para navegación y no forman parte del título publicado.

Al repetir una exportación, el archivo de la misma combinación de paquete y formato se reemplaza;
no se exige una limpieza manual previa. Los DOCX permanecen en `build/docs/docx/` y los PDF en
`build/docs/pdf/` hasta que se retiren de forma intencional. Esta separación distingue los
editables de revisión de las entregas no editables sin duplicar la estructura por paquete. El flujo
de capturas es distinto: el script elimina automáticamente el inventario anterior y lo genera
completo para impedir que una publicación mezcle ejecuciones.

La preparación del entorno y los comandos no se duplican en esta norma. Se mantienen en la
[guía operativa de exportación](../document-export-guide/index.md), que es la entrada para
quien trabaja con los documentos.
