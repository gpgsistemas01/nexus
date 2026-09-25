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

Sustituya `manual-administrador` por `manual-almacen` y `docx` por `pdf` cuando corresponda. Use
`ambos` si desea solicitar explícitamente los dos formatos con un solo comando. Si falta una
imagen, `--check` detiene el proceso; en ese caso ejecute primero el flujo independiente siguiente.

El resultado se organiza primero por actor y después con los mismos grupos funcionales de los casos
de uso. Por ejemplo, el comando del administrador escribe
`build/docs/docx/manuales/administrador/autenticacion.docx`, `identidad-y-acceso.docx`,
`catalogos.docx` y `reportes.docx`;
el de almacén escribe `autenticacion.docx`, `catalogos.docx`, `compras-de-material.docx` y
los archivos separados `salidas-de-material.docx` y `salidas-de-merma.docx` dentro de
`build/docs/docx/manuales/almacen/`. Las capturas de consultas y
exportaciones quedan en el grupo `CU-*` que respaldan, en vez de crear grupos distintos por pantalla
o un archivo genérico de reportes.
Cada archivo conserva la portada del actor y únicamente los recorridos que corresponden a ese grupo.
Los reportes de movimientos no se incorporan al manual de Almacén; se publican en el manual del
Administrador del sistema del área Sistemas. De forma inversa, las compras y salidas no se
incorporan al manual de Sistemas.
