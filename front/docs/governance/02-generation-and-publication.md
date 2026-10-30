# 2. Generación, validación y publicación

## Fuentes y resultados

Las guías editables viven en `front/docs`; las referencias de código y tipos se
generan desde `front/src`. Los resultados se guardan en `front/build/`, ignorado
por Git.

## Documentos y orden de lectura

| Sección | Contenido |
| --- | --- |
| `inicio` | Preparación local, incorporación y herramientas. |
| `requisitos` | Visión, alcance, especificación, glosario y modelos de negocio. |
| `casos-de-uso` | Fichas completas por objetivo y familia. |
| `arquitectura` | Vistas 4+1, modelos, procesos, decisiones, contratos y patrones. |
| `estandar` | Construcción y revisión del código. |
| `referencia` | Inventario generado de archivos, exports, contratos SFC e imports. |
| `tipos` / `tipos-<ámbito>` | Contratos TypeScript/SFC; libro separado, completo o por ámbito. |
| `pruebas` | Plan, diseño, casos, cobertura y preparación de sistema. |
| `operacion` | Construcción y despliegue. |
| `gobierno` | Reglas editoriales, referencias y publicación. |
| `manual` | Procedimientos y capturas; libro independiente del técnico. |

El [catálogo publications.json](../publications.json) fija fuentes y orden. Los
directorios se expanden con su índice y capítulos numerados; el libro completo
elimina fuentes repetidas. `entry` define una portada propia;
`includeInComplete: false` excluye la sección del libro técnico, manteniendo sus
comprobaciones. Los libros temáticos muestran sólo el contenido elegido.

## Comandos

Desde `front/`:

```bash
npm run docs:generate
npm run docs:check
npm run docs:export -- inicio ambos
npm run docs:export -- arquitectura pdf
npm run docs:export -- pruebas docx
npm run docs:export -- completo ambos
npm run docs:manual -- ambos
```

Desde la raíz se usa `npm --prefix front run` antes del nombre del script.
`docs:generate` actualiza las referencias de código y tipos; no se editan a mano.
`docs:check` comprueba su vigencia, catálogo, enlaces y recursos del documento
técnico y del manual. Estos comandos no requieren Pandoc.

`docs:export -- [seccion] [docx|pdf|ambos]` selecciona contenido y formato.
Sin sección, o con `completo`, reúne la colección; por ejemplo,
`docs:export -- ambos`. Una selección desconocida se rechaza antes de publicar.

| Selección | DOCX | PDF |
| --- | --- | --- |
| Completo | `build/docs/docx/arquitectura/frontend-vue.docx` | `build/docs/pdf/arquitectura/frontend-vue.pdf` |
| Tema, por ejemplo Pruebas | `build/docs/docx/arquitectura/frontend-vue-pruebas.docx` | `build/docs/pdf/arquitectura/frontend-vue-pruebas.pdf` |
| Manual general | `build/docs/docx/manuales-vue/manual-usuario.docx` | `build/docs/pdf/manuales-vue/manual-usuario.pdf` |

El formato PDF conserva su DOCX intermedio.

## Preparación del publicador

1. Tener el repositorio completo: la herramienta común reside en `back/scripts`.
2. Instalar dependencias con `npm ci --include=dev` desde `front/`.
3. Instalar Pandoc y comprobar `pandoc --version` para exportar Word.
4. Para PDF, instalar además LibreOffice y comprobar `soffice --version`. El motor
   intenta preparar el conversor si falta; instalarlo antes evita ese paso.
5. Para diagramas, disponer de Node compatible y Chromium. El motor prepara
   Mermaid CLI 12.0.0 y Mermaid 12.1.0; versiones, configuración y clave de caché
   se mantienen en `back/scripts/mermaidExportUtils.js`.

Flujo: Mermaid → PNG → Pandoc → DOCX → LibreOffice → PDF. Las imágenes y
fuentes temporales se guardan en `front/build/docs`; no sustituyen los Markdown.

## Configuración opcional y diagnóstico

| Variable del proceso de publicación | Uso |
| --- | --- |
| `DOCS_MERMAID_PUPPETEER_CONFIG` | Ruta de un JSON de Puppeteer para un Chromium instalado. |
| `DOCS_PDF_CONVERTER` | Ejecutable de LibreOffice si no se detecta en `PATH`. |
| `DOCS_REFERENCE_DOC` | DOCX de referencia opcional para estilos corporativos. |

En Bash se asigna `export NOMBRE=valor`; PowerShell usa `$env:NOMBRE = "valor"`.
Estas variables pertenecen a la herramienta local y no se publican en el navegador.
Corregir fuentes o enlaces ausentes antes de exportar. Si falla Pandoc,
LibreOffice o Chromium, comprobar instalación y `PATH`.

Las capturas del manual se preparan con la [guía correspondiente](05-user-manual.md).

## Revisión y distribución

Abrir Word/PDF y revisar títulos, tablas, etiquetas, saltos, leyendas y ausencia de
recortes. Al cambiar figuras o el exportador, comprobar la publicación afectada.
Registrar comando, entorno, fecha, resultado y limitaciones en CI o en la revisión.
Si la exportación falla, los archivos anteriores no se consideran actualizados.

La documentación se distribuye como artefacto. `docs/`, `scripts/` y `build/` quedan
fuera del contexto Docker; no se copian a `public/` ni a `dist/`. La imagen final
sirve los assets de Vue y no genera documentación al arrancar.

## Referencia de contratos declarados

`docs:generate` mantiene
`architecture/views/development/code-reference.md` y
`architecture/views/logical/type-reference/`; `docs:check` comprueba ambas salidas.
El [índice de tipos](../architecture/views/logical/type-reference/index.md)
define su alcance y notación. Los diagramas explicativos están en los
[modelos estructurales](../architecture/views/logical/class-and-type-models/index.md).

Para publicar un ámbito concreto, use `tipos-identidad`, `tipos-inventario`,
`tipos-compras`, `tipos-salidas`, `tipos-acceso`, `tipos-catalogos`,
`tipos-directorio`, `tipos-movimientos`, `tipos-aplicacion` o `tipos-compartidos`.
Por ejemplo: `npm run docs:export -- tipos-identidad ambos`.
