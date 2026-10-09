# 7. Exportar los manuales

El paquete `manuales`
incluye capturas de la aplicación, pero `docs:export` **no toma capturas ni abre Nexus**. Antes de
exportarlo se requieren:

- las herramientas indicadas en [Preparar las herramientas](03-prepare-the-tools.md);
- todos los Markdown del paquete actualizados;
- todas las imágenes referenciadas presentes en `docs/user-manual/images/areas/almacen/` y
  `docs/user-manual/images/areas/sistemas/`, revisadas y
  correspondientes a la versión del manual.

Esta guía concentra los comandos de generación y mantenimiento. Los documentos entregados a cada
actor contienen sólo instrucciones para operar Nexus; no incluyen comandos, rutas del repositorio,
criterios editoriales ni relaciones técnicas con requisitos, diagramas o código.

Si se cumplen esos requisitos, no necesita una base de datos, una sesión ni Playwright para
exportar. Valide y genere el manual:

```bash
npm run docs:export -- manuales --check
npm run docs:export -- manuales docx
```

La exportación siempre genera todos los documentos de los dos actores; no acepta un actor ni una
sección específica. Sustituya `docx` por `pdf` cuando corresponda o use `ambos` si desea solicitar
explícitamente los dos formatos con un solo comando. Si falta una
imagen, `--check` detiene el proceso; en ese caso ejecute primero el flujo independiente siguiente.

El resultado se organiza primero por actor y después según los módulos visibles de `navList.ejs`,
no según las carpetas técnicas que almacenan los casos. Los submenús **Almacén**, **Salidas** y
**Movimientos** producen un documento por destino visible. Cada opción de **Catálogos auxiliares**
produce también su propio documento, aunque comparta permiso y patrón de pantalla con las demás.
Los accesos independientes **Usuarios**, **Personas**, **Clientes** y **Proveedores** tampoco se
mezclan bajo un documento genérico de identidad o catálogos.

El manual de Sistemas contiene los módulos operativos de Almacén, Compras y Salidas,
incluidos los ajustes exclusivos del administrador, además de Movimientos, Usuarios,
Personas, Clientes, Proveedores y cada catálogo auxiliar. El manual de Almacén contiene
inventarios sin ajustes absolutos, Compras, las tres clases de Salidas, Personas y
las consultas y altas de Clientes y Proveedores, conforme a los permisos vigentes del
servidor y del menú. La edición, estado y exportación de clientes y proveedores se
reservan a Sistemas. Ambos agregan `autenticacion` por separado.

Cada módulo conserva el actor en su portada. La información general incluye el plan
de inducción por sesiones, con objetivos, práctica acompañada y evidencias de aprendizaje.

Cada actor recibe además un único documento `informacion-general-y-anexos` con las indicaciones
comunes de uso, las convenciones de los procedimientos, la matriz de validación y el catálogo de
errores. Estas secciones no se anexan de nuevo a cada documento modular: el módulo conserva su
portada, procedimiento y capturas, e identifica la referencia común aplicable a sus validaciones y
errores. De esta manera, una corrección transversal tiene una sola copia publicada y
los documentos por módulo no crecen con contenido idéntico.

Cada archivo modular conserva una portada breve que identifica al actor y al módulo, pero no repite
sus responsabilidades, límites ni recorrido recomendado. Ese contenido aparece una sola vez en
`informacion-general-y-anexos`; cada módulo incluye únicamente sus procedimientos y las capturas
referenciadas por esos recorridos. Por ejemplo, Almacén no recibe el ajuste absoluto de existencia,
usuarios, edición de clientes y proveedores, catálogos auxiliares o movimientos; los
formularios contextuales usados dentro de compras o salidas permanecen en el documento operativo
que los presenta. Por ello, `compras` incorpora el alta contextual de proveedor y cada documento
de salidas incorpora el alta contextual de cliente; estos formularios se enseñan en su contexto operativo, además de las consultas y altas
permitidas desde los listados **Proveedores** y **Clientes**.

Los reportes tampoco producen un documento genérico: el reporte de inventario queda en
`almacen-materiales`, `almacen-consumibles` o `almacen-mermas`; el de compras en `compras`; los de salidas en su destino;
los de personas, usuarios, clientes y proveedores en el documento del mismo módulo; y cada reporte
de movimientos en `movimientos-materiales` o `movimientos-mermas`. Así, la captura del diálogo de
exportación permanece junto a la consulta y los filtros cuyo alcance descarga.

## Selección de imágenes por actor

Los procedimientos compartidos conservan referencias lógicas bajo `images/`. Al validar
y exportar, el exportador las resuelve exclusivamente dentro de `images/areas/almacen/`
para Personal de almacén y `images/areas/sistemas/` para Administrador del sistema.
No recurre a la carpeta común ni a las imágenes del otro actor si falta una captura.
Una imagen pendiente detiene la validación y debe completarse antes de publicar.

Promueva los PNG revisados desde `build/docs/screenshots/areas/<área>/` a
`docs/user-manual/images/areas/<área>/`, conservando subcarpetas y nombres. No copie una
captura de Sistemas a Almacén para completar un faltante. Documente el rol de la cuenta
ficticia utilizada: compartir área no garantiza que dos usuarios tengan los mismos permisos.
