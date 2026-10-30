# 5. Manual de usuario: fuentes, capturas y publicación

## Audiencia y alcance

El [manual](../user-manual/index.md) explica las tareas del operador en la interfaz
Vue. Sus capítulos cubren acceso, navegación, Almacén, Catálogos, Identidad,
Directorio, Compras, Salidas, Movimientos, reportes e incidencias, precedidos de un
recorrido de primera jornada y acompañados de un glosario de operación. No exige abrir
la referencia técnica para conocer un campo o completar una operación.

Los entregables por cuenta se generan mediante el
[procedimiento de generación por cuenta](07-manual-accounts-and-files.md): selecciona tareas por permiso y obtiene
capturas con el acceso correspondiente. Este capítulo describe la fuente completa
y las capturas de referencia con datos ficticios.

La [aplicabilidad de estándares](03-standard-applicability.md) recoge la referencia
ISO/IEC/IEEE 26514 y su alcance para esta colección.

Cada capítulo agrupa las tareas de una página o familia funcional: preparación,
pasos, campos, resultado y alternativas de error. La granularidad sigue el objetivo
de consulta del operador; no replica carpetas de componentes ni crea una ficha por
botón. Las etiquetas se contrastan con las pantallas actuales. Los procedimientos
describen el funcionamiento, sin explicar decisiones de conversaciones de desarrollo.

Los procedimientos utilizan capturas y etiquetas de pantalla, sin requerir
conocimientos técnicos. El índice del manual conserva sus datos y estado editorial.

## Fuentes y alcance de publicación

El [glosario de operación](../user-manual/16-glossary.md) explica términos visibles,
distinciones que afectan la captura y ejemplos de cantidades. Se contrasta con el
[glosario funcional](../requirements/business-glossary.md), que conserva las
definiciones del negocio. No se trasladan al manual nombres de modelos, contratos,
patrones ni términos de requisitos o infraestructura. La inducción introduce el
vocabulario básico; el glosario es la referencia de consulta. Los capítulos
operativos conservan los pasos y las advertencias junto a la acción.

El capítulo se incluye también en cada manual por acceso. Sus bloques condicionales
reutilizan los permisos y el filtrado existentes: las cuentas de áreas operativas
leen los estados de sus solicitudes, pero las instrucciones de surtido y devolución
permanecen en las ediciones con ese permiso. Al cambiar una etiqueta o regla de
operación, revisar ambas definiciones y los ejemplos afectados.

- Markdown: `front/docs/user-manual/index.md` y capítulos numerados.
- Imágenes fuente: `front/docs/user-manual/images/*.png`, versionadas junto al texto.
- Catálogo: sección `manual` de [publications.json](../publications.json), con
  entrada propia y exclusión de la publicación técnica completa.
- Automatización: [configuración Playwright](../../playwright.manual.config.ts) y
  [recorridos de captura](../../tests/manual/manualScreenshots.spec.ts).
- Artefactos ignorados: `front/build/docs/docx/manuales-vue/manual-usuario.docx`
  y `front/build/docs/pdf/manuales-vue/manual-usuario.pdf`.

## Generar las capturas

Desde `front/`, con las dependencias de desarrollo instaladas:

```bash
npm ci --include=dev
npx playwright install chromium
npm run docs:screenshots
```

Playwright inicia esta copia de Vite en `http://127.0.0.1:5176`. El puerto debe estar
libre; la configuración no reutiliza otro servidor. Si Chromium ya está instalado,
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` permite indicar su ejecutable. No necesita
el backend, credenciales de aplicación ni una base de datos.

Los recorridos reutilizan fixtures y simuladores de API de las pruebas de navegador.
Los datos muestran registros ficticios existentes. La ruta de contexto bloquea
cualquier petición API no simulada y una barrera de página bloquea todo método
distinto de GET. La comprobación final exige cero intentos de escritura. Las
capturas sólo consultan, abren formularios, cambian valores locales o agregan
detalles al borrador; nunca pulsan la acción que confirma una mutación.

La devolución se abre sobre un fixture ya surtido; no se registra un surtido para
preparar la imagen. La edición usa un registro existente. Las contraseñas permanecen
vacías. Si un selector o una captura falla, se corrige su preparación o recorrido;
no se elimina la imagen exigida por el manual ni se modifica la aplicación para
que el recorrido pase.

El comando completo puede ejecutarse otra vez para regenerar todas las capturas.
Para revisar un recorrido concreto se puede usar, por ejemplo:

```bash
npm run docs:screenshots -- --grep "compras:"
```

Las imágenes de otros capítulos no se eliminan. Antes de publicar hay que ejecutar
el conjunto completo para comprobar que ninguna captura quedó pendiente. El reporte
JUnit se guarda en `front/build/test-results/manual.xml`; los rastros de fallos son
artefactos de Playwright ignorados por Git.

## Comprobar y exportar

```bash
npm run docs:check
npm run docs:manual -- ambos
```

`docs:export -- manual pdf` es la invocación equivalente para un solo formato.
`docs:check` valida también la existencia de imágenes y enlaces del manual; no
requiere regenerar las capturas ni iniciar el navegador. La exportación requiere
Pandoc y, para PDF, LibreOffice, descritos en la
[guía del publicador](02-generation-and-publication.md).

Abra los dos archivos y revise portada, contenido, tablas, leyendas, tamaño de
capturas y ausencia de recortes. Contraste las instrucciones con los controles de
Vue y sus permisos. Las capturas simuladas demuestran el aspecto de la interfaz;
no prueban persistencia, permisos efectivos del servidor ni aceptación funcional.
Esos resultados pertenecen a las pruebas correspondientes y a la revisión del manual.

## Actualización y distribución

Cuando cambie un campo, etiqueta, estado, navegación o resultado observable, actualice
su procedimiento y vuelva a capturar el recorrido afectado. Revise las diferencias
de las imágenes antes de versionarlas. No publique datos reales ni credenciales.

El manual se distribuye como DOCX/PDF por el canal documental de la organización.
Fuentes, imágenes, automatización y resultados quedan fuera del contexto y de la
imagen de producción del frontend. No se copian a `public/` ni a `dist/` y no se
generan al arrancar el contenedor.
