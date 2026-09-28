# 9. Ejemplos de exportación

```bash
# Sólo valida fuentes e imágenes; no necesita Pandoc.
npm run docs:export -- requisitos --check

# Genera todos los manuales de ambos actores; no admite una sección individual.
npm run docs:export -- manuales docx

# Genera DOCX y PDF de todos los manuales con la misma estructura.
npm run docs:export -- manuales ambos

# Genera los DOCX de arquitectura por sección y grupo en build/docs/docx/arquitectura/.
npm run docs:export -- arquitectura docx

# Regenera únicamente el documento backend de arquitectura.
npm run docs:export -- arquitectura backend docx

# Genera primero el DOCX y después lo convierte a PDF con LibreOffice.
npm run docs:export -- pruebas pdf
```

La exportación se ejecuta en desarrollo o CI, nunca mediante `npm start` ni como parte del
servidor de producción. Los archivos bajo `build/docs/` son resultados regenerables y no
se versionan.
