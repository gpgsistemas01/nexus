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

El resultado se organiza primero por actor y después según los módulos visibles de `navList.ejs`,
no según las carpetas técnicas que almacenan los casos. Los submenús **Almacén**, **Salidas** y
**Movimientos** producen un documento por destino visible; **Catálogos** conserva un documento
para sus seis opciones auxiliares porque comparten pantalla, permiso y procedimiento. Los accesos
independientes **Usuarios**, **Personas**, **Clientes** y **Proveedores** tampoco se mezclan bajo
un documento genérico de identidad o catálogos.

El manual de Sistemas contiene `movimientos-materiales`, `movimientos-mermas`, `usuarios`,
`catalogos`, `personas`, `clientes` y `proveedores`. El manual de Almacén contiene
`almacen-materiales`, `almacen-mermas`, `compras`, `salidas-materiales` y `salidas-mermas`.
Ambos agregan por separado `autenticacion` para explicar el acceso y el menú. Esta asignación
coincide con los módulos por área usados por el inventario de capturas; no agrega a un manual un
recorrido sólo porque la política técnica permita reutilizar alguna operación desde otro contexto.

Cada archivo conserva la portada del actor, los recorridos permitidos y sólo las capturas
referenciadas por esos recorridos. Por ejemplo, Almacén no recibe el ajuste absoluto de existencia,
personas, usuarios, clientes, proveedores independientes, catálogos auxiliares o movimientos; los
formularios contextuales usados dentro de compras o salidas permanecen en el documento operativo
que los presenta. Por ello, `compras` incorpora el alta contextual de proveedor y cada documento
de salidas incorpora el alta contextual de cliente; incluir esos procedimientos no agrega al actor
los listados independientes **Proveedores** o **Clientes**.

Los reportes tampoco producen un documento genérico: el reporte de inventario queda en
`almacen-materiales` o `almacen-mermas`; el de compras en `compras`; los de salidas en su destino;
los de personas, usuarios, clientes y proveedores en el documento del mismo módulo; y cada reporte
de movimientos en `movimientos-materiales` o `movimientos-mermas`. Así, la captura del diálogo de
exportación permanece junto a la consulta y los filtros cuyo alcance descarga.
