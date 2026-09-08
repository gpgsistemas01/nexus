# Publicación, estructura y versionado documental

## Propósito y audiencia

El `README.md` raíz es la guía operativa de la aplicación (requisitos técnicos, configuración,
inicio y pruebas). `docs/README.md` es el índice del cuerpo documental. No deben fusionarse:
una persona que despliega no necesita recorrer la especificación completa y una persona que
audita requisitos necesita una entrada estable, independiente de los comandos cotidianos.

## Orden de publicación

Cada entrega exportable conserva este orden:

1. portada: producto, título del documento, versión del sistema, versión documental, fecha,
   estado y responsable;
2. control de cambios y aprobaciones;
3. tabla de contenido generada;
4. propósito, audiencia, alcance y exclusiones;
5. contenido principal;
6. trazabilidad, glosario, referencias y anexos.

Los paquetes recomendados son **Requisitos**, **Diseño y arquitectura**, **Plan y evidencia de
pruebas** y **Manual de usuario**. Cada paquete tiene su propio archivo de entrada y carpeta de
imágenes; no se exporta toda la carpeta `docs` como un único documento.

## Formatos y estilos

- Markdown es la fuente versionada y conserva notas de mantenimiento, enlaces al repositorio y
  bloques Mermaid que no tienen valor en una entrega impresa.
- DOCX es el formato editable para revisión y firmas. Se genera sin una plantilla adicional; un
  `reference.docx` opcional puede definir tipografías, encabezados, tablas y numeración.
- PDF es la entrega no editable. Pandoc requiere un motor PDF instalado; la organización debe
  elegir y fijar uno antes de declarar reproducibilidad. Adobe Acrobat o Adobe Reader abren el
  archivo terminado, pero no reemplazan al motor que lo compone desde Pandoc.

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
cada bloque Mermaid en el Markdown fuente,
lo renderiza como una imagen PNG temporal mediante Mermaid CLI y entrega esa imagen a Pandoc. Así
DOCX y PDF muestran el diagrama visual en vez de copiar su código; los archivos temporales se
eliminan al finalizar.

Antes de convertir, cada enlace local con fragmento se valida contra un título o ancla
explícita real. Las referencias entre fuentes incluidas conservan su ruta Markdown
relativa y Pandoc las resuelve al ensamblarlas con alcance por archivo. Un enlace a otro
documento sin fragmento lleva al inicio de ese documento. Los enlaces a fuentes que no
forman parte del paquete se presentan como texto. Mermaid se limita a producir la figura
y no usa `click`, porque el hipervínculo dejaría de ser uniforme al renderizar el bloque
como imagen para DOCX o PDF.

Para DOCX, el exportador materializa la tabla de contenido y el índice de imágenes como
navegación interna a partir de los títulos y leyendas del paquete. No delega esa tarea a
campos de Word pendientes de actualización, porque además de mostrar un aviso al abrir el
archivo esos campos no contienen un resultado calculado por Pandoc. En PDF se conservan
los índices nativos de Pandoc, que el motor de composición resuelve durante la exportación.

Al repetir una exportación, el archivo de la misma combinación de paquete y formato se reemplaza;
no se exige una limpieza manual previa. Los demás formatos permanecen en `build/docs/` hasta que
se retiren de forma intencional. El flujo de capturas es distinto: el script elimina
automáticamente el inventario anterior y lo genera completo para impedir que una publicación
mezcle ejecuciones.

La preparación del entorno y los comandos no se duplican en esta norma. Se mantienen en la
[guía operativa de exportación](../README.md#exportar-la-documentación), que es la entrada para
quien trabaja con los documentos.

## Imágenes y capturas

Las imágenes se guardan en `docs/<familia>/images/<módulo>/NN-descripcion.png`. El número fija
el orden narrativo, no la identidad del requisito. Toda imagen debe tener texto alternativo,
referencia desde el contenido y resolución legible; no debe contener credenciales ni datos
personales reales. Requisitos, arquitectura y pruebas usan sus propias carpetas.

El manual usa `docs/user-manual/images/`. `scripts/captureManualScreenshots.js` automatiza
capturas con Playwright a partir de un estado de autenticación de prueba. El script recorre un
inventario explícito de módulos, espera un elemento estable y sólo después captura. Los modales
requieren una acción propia; no se debe usar una demora arbitraria. La automatización es
repetible, pero no se ejecuta en producción ni durante `npm start`.

Playwright es una herramienta opcional de desarrollo: se instala en la estación que genera el
manual con `npm install --no-save playwright` y `npx playwright install chromium`; no se incluye
en producción. Se configuran `DOCS_BASE_URL` y, para páginas protegidas,
`DOCS_STORAGE_STATE` con una sesión de datos ficticios. El inventario cubre los listados
principales; cada modal o paso nuevo agrega al mismo script una acción localizada y otra captura
numerada. El acceso puede capturarse sin sesión; el resto debe fallar si la cuenta no posee el
permiso que el manual pretende demostrar.

Playwright **no se ejecuta junto con Pandoc**. Primero, y sólo cuando cambian las pantallas,
`docs:screenshots` abre la aplicación y actualiza las imágenes; después `docs:export`
lee esas imágenes ya existentes. Pandoc por sí solo genera DOCX sin Playwright,
LibreOffice ni Microsoft Word. Para PDF siempre delega la composición final a un motor
adicional (`DOCS_PDF_ENGINE`); esa dependencia no puede eliminarse sin escoger otro
conversor o publicar DOCX en su lugar.

## Versionado

Sistema y documentación evolucionan de forma relacionada, pero no comparten número por fuerza:

- **Sistema:** SemVer `MAYOR.MENOR.PARCHE`; MAYOR rompe contratos, MENOR agrega capacidad
  compatible y PARCHE corrige sin cambiar el contrato intencional.
- **Documento:** `MAYOR.MENOR`; MAYOR cambia estructura, alcance aprobado o interpretación
  normativa; MENOR aclara, agrega evidencia o sincroniza comportamiento sin redefinir alcance.
- Un documento registra la versión del sistema que describe. Un cambio funcional debe elevar la
  versión documental del paquete afectado; cambios sólo editoriales no elevan la del sistema.
- Estados: `Borrador`, `En revisión`, `Aprobado` y `Obsoleto`. Sólo una versión aprobada se trata
  como línea base. Git conserva el historial; la portada y el control de cambios expresan la
  línea base para lectores externos.

## Idioma

La prosa y la interfaz se redactan en español. Se conserva en inglés un nombre propio o término
técnico sin equivalente preciso (`Node.js`, `Express`, `Prisma`, `PostgreSQL`, `Playwright`,
`middleware`, `commit`, `rollback`, `endpoint`, `DTO`, `API`). En su primera aparición se explica
en español cuando la audiencia no sea técnica. Los identificadores de código nunca se traducen.
Los anglicismos no asentados se sustituyen: *despliegue* por *deployment*, *marco de trabajo* por
*framework* cuando no se nombre un producto, y *caso de prueba* por *test case*. En Markdown se
usa cursiva para un término extranjero introducido en prosa, no para nombres de productos ni
código.
