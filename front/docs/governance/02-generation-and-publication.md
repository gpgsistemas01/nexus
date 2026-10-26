# 2. Generación, validación y publicación

## Fuentes y resultados

Las fuentes editables viven en `front/docs`. La referencia de código se genera
desde `front/src`; las demás guías se redactan y revisan contra la implementación.
El paquete Vue incorpora estas fuentes completas: arquitectura, patrones, módulos,
desarrollo, requisitos, pruebas y gobierno documental. No obtiene el contenido
de las fichas Vue siguiendo enlaces a documentos del servidor.

| Operación desde `front/` | Resultado |
| --- | --- |
| `npm run docs:generate` | Actualiza `docs/architecture/05-code-reference.md` a partir de los SFC y TypeScript actuales. |
| `npm run docs:check` | Detecta referencia desactualizada y valida las fuentes, enlaces y recursos del paquete Vue. No modifica las guías. |
| `npm run docs:export -- docx` | Publica `build/docs/docx/arquitectura/frontend-vue.docx`. |
| `npm run docs:export -- pdf` | Conserva DOCX y publica `build/docs/pdf/arquitectura/frontend-vue.pdf`. |
| `npm run docs:export -- ambos` | Produce ambos formatos; es también el valor predeterminado de `docs:export`. |

Desde la raíz se antepone `npm --prefix front run`, por ejemplo:

```bash
npm --prefix front run docs:generate
npm --prefix front run docs:check
npm --prefix front run docs:export -- ambos
```

La referencia usa TypeScript y `vue/compiler-sfc`, ya instalados con las
dependencias de desarrollo. No ejecuta la aplicación
y no infiere reglas de negocio a partir de nombres. Al agregar o mover fuentes se
regenera y se versiona el Markdown resultante; CI detecta si quedó desactualizado.

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
