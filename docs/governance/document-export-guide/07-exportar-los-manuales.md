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

El resultado se organiza primero por actor y después por conjunto funcional. Por ejemplo, el comando
del administrador escribe `build/docs/docx/administrador/acceso.docx`,
`identidad-y-acceso.docx`, `catalogos.docx` y `reportes.docx`; el de almacén escribe dentro de
`build/docs/docx/almacen/` los archivos de acceso, catálogos, compras de material, salidas de
material, salidas de merma y reportes. Cada archivo conserva la portada del actor y únicamente los
recorridos que corresponden a ese conjunto.
