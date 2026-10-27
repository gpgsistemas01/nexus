# 2. Generación, validación y publicación

## Fuentes y resultados

Las fuentes editables viven en `front/docs`. La referencia de código se genera
desde `front/src`; las demás guías se redactan y revisan contra la implementación.
El paquete Vue incorpora requisitos, arquitectura, desarrollo, pruebas y gobierno.
Arquitectura incluye las cinco vistas, patrones y referencias breves por dominio.
Los casos y contratos se mantienen íntegros en sus fuentes propietarias.

## Documentos y orden de lectura

| Sección de publicación | Contenido |
| --- | --- |
| `inicio` | Preparación local, incorporación y herramientas. |
| `requisitos` | Glosario, trazabilidad y especificación. |
| `casos-de-uso` | Fichas completas agrupadas por objetivo y familia. |
| `arquitectura` | Contexto, vistas 4+1, decisiones, contratos, patrones y módulos. |
| `estandar` | Reglas de construcción y revisión del código. |
| `referencia` | Inventario generado de archivos, exports, contratos SFC e imports. |
| `pruebas` | Plan, diseño, registro CP, cobertura y preparación de sistema. |
| `operacion` | Construcción y despliegue. |
| `gobierno` | Reglas editoriales, referencias, criterios y publicación. |
| `manual` | Procedimientos de usuario y capturas Vue; libro independiente, excluido del completo técnico. |

El [catálogo publications.json](../publications.json) declara fuentes y orden de cada
sección. Un directorio se expande con su índice primero y después sus capítulos
numerados. Los temas principales se ordenan explícitamente: la vista general precede
al detalle de arquitectura, el plan precede a los casos de prueba y la referencia
extensa de código tiene una publicación propia. Una fuente tiene una ubicación en
el catálogo; el documento completo elimina repeticiones. Una sección con `entry`
declara su portada propia y con `includeInComplete: false` queda fuera del libro
técnico, manteniendo la comprobación de sus fuentes. Así se publica el manual.

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
`docs:generate` actualiza `docs/architecture/views/development/code-reference.md`;
`docs:check` comprueba frescura, pertenencia de todas las guías al catálogo y fuentes,
enlaces y recursos de la publicación técnica y del manual. Ninguno exige Pandoc para validar.

`docs:export -- [seccion] [docx|pdf|ambos]` selecciona contenido y formato. Omitir
la sección o usar `completo` reúne la colección: `docs:export -- ambos` conserva ese
comportamiento. Una sección/formato desconocidos se rechazan antes de publicar.

| Selección | DOCX | PDF |
| --- | --- | --- |
| Completo | `build/docs/docx/arquitectura/frontend-vue.docx` | `build/docs/pdf/arquitectura/frontend-vue.pdf` |
| Tema, por ejemplo Pruebas | `build/docs/docx/arquitectura/frontend-vue-pruebas.docx` | `build/docs/pdf/arquitectura/frontend-vue-pruebas.pdf` |
| Manual de usuario | `build/docs/docx/manuales-vue/manual-usuario.docx` | `build/docs/pdf/manuales-vue/manual-usuario.pdf` |

El formato PDF conserva su DOCX intermedio. Los resultados son artefactos ignorados,
no fuentes del sitio. La referencia se obtiene con TypeScript y `vue/compiler-sfc`;
las decisiones y casos se mantienen en sus documentos propietarios.

## Preparación del publicador

1. Instalar las dependencias del frontend con `npm ci --include=dev` desde `front/`.
2. Tener el repositorio completo, porque el motor de publicación común reside en
   `back/scripts`; las fuentes de esta publicación siguen siendo las de `front/docs`.
3. Para validar fuentes basta Node y las dependencias del frontend. Para exportar,
   instalar Pandoc y comprobar `pandoc --version` en la misma terminal.
4. DOCX sólo requiere Pandoc. PDF requiere además LibreOffice/`soffice`; comprobar
   `soffice --version`. El motor intenta preparar el conversor si no lo encuentra,
   por lo que es preferible instalarlo antes en el equipo de desarrollo o CI.
5. Los diagramas usan Mermaid CLI 12.0.0 y Mermaid 12.1.0, preparados por el motor
   común, con Node compatible y un Chromium disponible. La configuración y clave
   de caché permanecen centralizadas en `back/scripts/mermaidExportUtils.js`.

El flujo es Mermaid → PNG → Pandoc → DOCX → LibreOffice → PDF. Las imágenes y
fuentes temporales se guardan bajo `front/build/docs`; los Markdown originales
no se sustituyen por las imágenes. Se comparte la herramienta de publicación,
sin copiar su implementación al frontend ni usar documentos backend como contenido.

## Configuración opcional y diagnóstico

| Variable del proceso de publicación | Uso |
| --- | --- |
| `DOCS_MERMAID_PUPPETEER_CONFIG` | Ruta de un JSON con configuración de Puppeteer para un Chromium instalado en ese entorno. |
| `DOCS_PDF_CONVERTER` | Ejecutable de LibreOffice si no se detecta en `PATH`. |
| `DOCS_REFERENCE_DOC` | DOCX de referencia opcional para estilos corporativos. No es una fuente de requisitos. |

En Bash se asigna `export NOMBRE=valor`; PowerShell usa `$env:NOMBRE = "valor"`.
Estas variables son de la herramienta local, no son `VITE_*` y no se publican
en el navegador. Una fuente ausente o enlace roto se corrige antes de exportar.
Si falla Pandoc, LibreOffice o Chromium, comprobar primero instalación y `PATH`.
Una generación de PDF fallida no se registra como publicación aprobada.

El [procedimiento del manual](05-user-manual.md) explica la generación reproducible
de capturas Vue con datos ficticios y sin escrituras, su revisión y publicación.

## Revisión y distribución

La comprobación de fuentes no sustituye abrir los documentos. Al cambiar figuras
o el exportador se revisan DOCX y PDF: títulos, tablas, etiquetas, saltos de página,
leyendas, proporciones y ausencia de recortes. Los vínculos suplementarios externos
no deben contener la única explicación de un flujo del cliente.
La revisión conserva comando, entorno, fecha, resultado y limitaciones en CI o
en la solicitud de cambio. Los resultados generados se distribuyen como artefactos;
`build/` permanece ignorado por Git.

Las fuentes están fuera de `public/` y `dist/`. El contexto Docker frontend sólo
admite archivos de compilación, fuentes y módulos públicos necesarios; excluye
`docs/`, `scripts/` y `build/`. La imagen final contiene Nginx y assets de Vue.
Generar documentación es una tarea de desarrollo/CI y no un paso del arranque
del sitio en producción.
