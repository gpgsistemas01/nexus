# 9. Ejemplos de exportación

```bash
# Sólo valida fuentes e imágenes; no necesita Pandoc.
npm run docs:export -- requisitos --check

# Genera build/docs/docx/manual-administrador.docx.
npm run docs:export -- manual-administrador docx

# Genera en DOCX un manual con el recorrido del personal de almacén.
npm run docs:export -- manual-almacen docx

# Genera un DOCX, incluida la portada definida en el Markdown.
npm run docs:export -- arquitectura docx

# Genera primero el DOCX y después lo convierte a PDF con LibreOffice.
npm run docs:export -- pruebas pdf
```

La exportación se ejecuta en desarrollo o CI, nunca mediante `npm start` ni como parte del
servidor de producción. Los archivos bajo `build/docs/` son resultados regenerables y no
se versionan.
