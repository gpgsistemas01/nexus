# 9. Ejemplos de exportación

```bash
# Sólo valida fuentes e imágenes; no necesita Pandoc.
npm run docs:export -- requisitos --check

# Genera los conjuntos en build/docs/docx/manuales/administrador/.
npm run docs:export -- manual-administrador docx

# Genera los conjuntos del personal de almacén en build/docs/docx/manuales/almacen/.
npm run docs:export -- manual-almacen docx

# Genera DOCX y PDF del personal de almacén con la misma estructura.
npm run docs:export -- manual-almacen ambos

# Genera los DOCX de arquitectura por sección y grupo en build/docs/docx/arquitectura/.
npm run docs:export -- arquitectura docx

# Genera primero el DOCX y después lo convierte a PDF con LibreOffice.
npm run docs:export -- pruebas pdf
```

La exportación se ejecuta en desarrollo o CI, nunca mediante `npm start` ni como parte del
servidor de producción. Los archivos bajo `build/docs/` son resultados regenerables y no
se versionan.
