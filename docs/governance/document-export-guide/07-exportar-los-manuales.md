# 7. Exportar los manuales

Los paquetes `manual-administrador` y `manual-almacen`
incluyen capturas de la aplicación, pero `docs:export` **no toma capturas ni abre Nexus**. Antes de
exportar uno de esos paquetes se requieren:

- las herramientas indicadas en [Preparar las herramientas](#preparar-las-herramientas);
- todos los Markdown del paquete actualizados;
- todas las imágenes referenciadas presentes en `docs/user-manual/images/`, revisadas y
  correspondientes a la versión del manual.

Si se cumplen esos requisitos, no necesita una base de datos, una sesión ni Playwright para
exportar. Valide y genere el manual:

```bash
npm run docs:export -- manual-administrador --check
npm run docs:export -- manual-administrador docx
```

Sustituya `manual-administrador` por `manual-almacen` y `docx` por `pdf` cuando corresponda. Si falta una
imagen, `--check` detiene el proceso; en ese caso ejecute primero el flujo independiente siguiente.
