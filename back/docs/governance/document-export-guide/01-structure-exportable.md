# 1. Estructura exportable

El manifiesto de `scripts/exportDocs.js` selecciona la entrada y los capítulos de
cada publicación. La entrada contiene título y datos generales; el contrato API
usa `docs/architecture/openapi/index.md` como entrada propia.

Las fuentes versionadas se organizan en `requirements/`, `architecture/`, `testing/`
y `governance/`. El exportador produce DOCX y PDF bajo `build/docs/`; esos resultados
y las imágenes generadas de Mermaid permanecen fuera de Git.

Los enlaces locales deben apuntar a archivos y anclas existentes. Las imágenes
agregadas al Markdown requieren texto alternativo y ruta relativa. El exportador
rechaza imágenes ausentes y geometría inválida; los bloques Mermaid originales
permanecen en las fuentes.
