# Exportar documentación técnica

Ejecute desde `back/`. Las fuentes están en `docs/`; los resultados bajo `build/docs/`
no se versionan.

## Herramientas

| Herramienta | Uso y preparación |
| --- | --- |
| Node.js | Ejecute `npm ci` con la versión admitida por `package.json`. |
| Pandoc | Instale el ejecutable en el sistema y compruebe `pandoc --version`. Genera DOCX. |
| Mermaid CLI y Chromium | El exportador prepara el renderizador compatible cuando hay diagramas. Conserva su configuración en `scripts/mermaidExportUtils.js`. |
| LibreOffice | Convierte el DOCX a PDF. El exportador reutiliza `soffice` o intenta instalarlo con el gestor del sistema. Compruebe `soffice --version`. |

En Windows, instale Pandoc y LibreOffice y abra una terminal nueva. En Debian/Ubuntu,
puede usar `sudo apt-get install pandoc libreoffice`. La instalación requiere los
permisos y la conexión propios de su equipo.

## Comandos

```bash
npm run docs:check
npm run docs:export -- arquitectura backend --check-sources
npm run docs:export -- arquitectura backend --check
npm run docs:export -- arquitectura backend ambos
npm run docs:export -- arquitectura contrato-api ambos
npm run docs:export -- datos ambos
npm run docs:export -- pruebas ambos
```

La forma general es `npm run docs:export -- <familia> [seccion] <docx|pdf|ambos>`.
`todos` selecciona las familias disponibles. `--check-sources` comprueba fuentes y
enlaces; `--check` también exige que existan las imágenes referenciadas. Estos modos
no generan documentos. Para regenerar inventarios derivados de rutas, imports o
Prisma, ejecute `npm run docs:architecture` antes de `docs:check`.

## Configuración

| Variable | Función |
| --- | --- |
| `DOCS_REFERENCE_DOC` | Ruta a una plantilla DOCX opcional para tipografía, márgenes y estilos. |
| `DOCS_PDF_CONVERTER` | Ruta al ejecutable de LibreOffice si no está disponible como `soffice`; en Windows use `soffice.com`. |
| `DOCS_MERMAID_PUPPETEER_CONFIG` | Ruta a un JSON de Puppeteer para indicar Chromium o argumentos de lanzamiento del renderizador. |

Mermaid genera PNG y Pandoc los incorpora al DOCX; LibreOffice convierte ese DOCX a
PDF. Los editables quedan en `build/docs/docx/` y los PDF en `build/docs/pdf/`. Las
imágenes y fuentes de diagramas se conservan en `build/docs/diagrams/` y
`build/docs/diagram-sources/`. El caché depende de contenido, versiones y configuración.

## Revisar la publicación

Mantenga imágenes con texto alternativo y rutas relativas. Los enlaces con fragmento
deben corresponder a un título o ancla existente. Cada paquete conserva sus datos
generales en la entrada; los capítulos no repiten esa tabla.

Compruebe que tablas, texto y diagramas sean legibles y no estén recortados en ambos
formatos. `docs:check` valida fuentes y contratos; la revisión visual se realiza sobre
los archivos generados. Regenerar reemplaza sólo la salida seleccionada.
