# 2. Navegación y controles comunes

## Abrir una sección

Pulse **Menú**, abra el grupo deseado y seleccione una página. El menú muestra las
secciones permitidas para su cuenta.

En pantallas grandes, el panel comienza como una columna de iconos. Al navegar,
hacer clic fuera del panel o pulsar **Escape**, vuelve al estado compacto. En un
teléfono, también puede cerrarlo con **Cerrar menú**.

Puede guardar la dirección de una página como favorito.

### Áreas operativas: Almacén y Salidas

Las cuentas asignadas únicamente a Impresión, Router, Taller/Herrería (TALLER 3D),
PT/TRÁFICO, Instalaciones o Acabados trabajan sólo en **Almacén** y **Salidas**.
Esto aplica también a sus coordinadores; ser coordinador de un área operativa
no concede las funciones de Almacén.

| Sección                                   | Qué puede hacer el área operativa                                                                |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Almacén: Materiales, Consumibles y Mermas | Consultar la tabla, buscar, filtrar, ordenar, recorrer páginas y actualizar la consulta.         |
| Salidas: Materiales, Consumibles y Mermas | Consultar, registrar y editar solicitudes de sus áreas asignadas, según el estado del documento. |

En Almacén no hay acciones de alta, edición, eliminación, entrada o ajuste de
existencias, importación ni exportación. Tampoco se muestran costos ni el botón
**Detalles de peso** de Mermas.

En Salidas se seleccionan clientes y artículos con proveedores existentes. Las áreas
operativas no registran clientes ni proveedores, no surten ni registran devoluciones.
Si falta un registro o necesita corregir el inventario, solicítelo al responsable de
Almacén. Compras, Directorio, Identidad y acceso, Movimientos, Catálogos y Reportes
no forman parte de ese acceso operativo.

Almacén y Sistemas tienen funciones propias. Si una cuenta tiene además una
asignación autorizada en esas áreas, su menú y su manual reúnen los permisos de
todas sus asignaciones activas.

![Menú expandido con los grupos y páginas disponibles para la cuenta.](images/02-navigation.png)

## Buscar y recorrer una tabla

1. Abra el módulo y espere a que termine la carga.
2. Capture el texto o seleccione los filtros generales disponibles.
3. Pulse **Buscar** para aplicar la captura a la consulta.
4. Si aparece **Filtrar por columna**, abra el panel, complete uno o varios campos y
   pulse **Aplicar filtros**. En Solicitud y Recepción puede buscar el nombre de la
   persona o escribir una fecha `AAAA-MM-DD`.
5. Revise los resultados y utilice los controles de página para recorrerlos.
6. Use **Limpiar filtros** para regresar a la consulta general.

Pulse un encabezado habilitado para ordenar y cambie el tamaño de página para ver
más registros. En teléfonos (hasta 599 px), cada registro se presenta como ficha con
sus campos identificados. Desde 600 px se muestra la tabla. Entre 600 y 899 px, si no
caben todas las columnas, desplázate dentro de la tabla con la barra inferior o los
controles de flecha superiores; la columna identificadora permanece fija y la página
no se desplaza horizontalmente. Desde 900 px las columnas vuelven a ajustarse para
aprovechar el espacio disponible. Use los encabezados o el selector para ordenar.
Al final de las fichas o la tabla se indica cuántos registros contiene la página actual; el
selector **Registros por página** permite cambiar ese límite.
Las fichas de todas las tablas conservan sus acciones e inputs, incluidos los detalles
de compras y salidas y las asignaciones de personas.
Los formularios distribuyen los campos según el ancho disponible.

Si falta un registro, limpie los filtros. La actualización automática los conserva
y espera mientras tiene una captura abierta. Ante un fallo, use **Actualizar** o
**Reintentar**. Evite recargar el navegador con cambios sin guardar.

## Consultas de documentos

Al abrir un documento, una ventana muestra su carga e impide usar los controles del fondo.

| Situación                    | Qué hacer                                                                     |
| ---------------------------- | ----------------------------------------------------------------------------- |
| La consulta está cargando    | Espere, o pulse **Cancelar consulta** para detenerla.                         |
| La consulta informa un error | Si aparece **Reintentar consulta**, púlselo para volver a abrir el documento. |
| Quiere dejar de intentar     | Pulse **Cancelar consulta**; podrá continuar usando la página.                |

Cancelar una lectura no guarda ni modifica registros.

Si el registro ya no está disponible o cambió de estado, cierre el aviso y actualice
el listado antes de elegir otra acción. En esos casos no aparece el reintento.

## Seleccionar registros relacionados

Abra el selector, escriba parte del nombre y **seleccione una opción de la lista**.
Las opciones cargan al abrirlo. Si la consulta falla, use **Reintentar catálogo**
cuando aparezca. Puede cerrar la lista y continuar con los otros campos; su captura
se conserva. El área asignada automáticamente en Salidas se prepara al abrir el formulario.
Escribir el nombre no basta para elegir el registro.

Algunos campos dependen de una selección previa. En Mermas, elija primero el
proveedor y después el material de referencia. Revise el artículo si cambia de proveedor.

Desplácese al final de la lista para cargar más opciones. Ante un fallo, pulse
**Reintentar catálogo**.

<!-- manual:any suppliers:manage clients:create materials:write persons:write -->

Cuando aparezca una acción **Registrar…** junto al selector:

1. Abra esa acción sin cerrar el formulario principal.
2. Complete el formulario secundario y guárdelo.
3. Compruebe que regresa al formulario principal y que el nuevo registro queda
   seleccionado.
4. Continúe y guarde la operación principal.

El registro creado permanece aunque cierre la operación principal. Cerrar el
formulario secundario sin guardar conserva la captura principal.

<!-- manual:end -->

## Usar los formularios

Corrija los campos que muestren un mensaje al editar o enviar. Los campos de
consulta no se pueden cambiar.

**Guardar** registra un alta; **Actualizar** guarda una edición. Espere la respuesta
sin repetir el envío. **Cerrar** o **Regresar** abandona los cambios sin guardar.
Si aparece un conflicto, siga [Errores y recuperación](15-errors-and-recovery.md).

Si la presentación es **PIEZA**, capture cantidades y stock mínimo enteros:
por ejemplo, **2**, no **2.5**. Corrija la fracción indicada; el sistema no la redondea.
Los costos, medidas y cantidades convertidas conservan su precisión.

## Campos de captura y de consulta

Un campo de captura permite escribir o seleccionar un valor. Un campo de consulta
muestra un dato conservado o calculado; puede copiarlo, pero no modificarlo en esa
operación. Cada capítulo indica los campos habilitados al editar.

Los selectores dependientes se habilitan al completar su selección previa. Durante
una carga o al guardar, espere a que termine el trabajo. Si aparece un conflicto,
actualice el registro siguiendo [Errores y recuperación](15-errors-and-recovery.md#conflictos-de-edición).
Los botones y campos disponibles dependen de su permiso y del estado del documento.

## Archivos en su equipo

Guarde las descargas en una carpeta reconocible y distinga reportes de consulta,
plantillas de captura e informes de errores. Conserve el archivo descargado y una
copia de trabajo con un nombre que identifique el inventario, la operación y la fecha.
Renombrar el archivo no cambia su operación ni reemplaza su contenido.

Al abrirlo en Excel o una aplicación compatible, mantenga el formato `.xlsx`.
Cerrar Nexus, descartar un borrador o cerrar sesión no elimina archivos de su equipo.
Conserve las copias necesarias para comprobar el trabajo y elimine las restantes
cuando ya no se necesiten, según el procedimiento de su organización. Los archivos
pueden contener cantidades, costos y datos de otras personas; compártalos sólo con
quienes deban utilizarlos y no incluya contraseñas en ellos.
