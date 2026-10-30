# 8. Criterios de aceptación

## Criterios de los recorridos críticos del cliente

Estas condiciones concretan los [requisitos del cliente](client-specification.md).

### Acceso y navegación

| Criterio | Condición y resultado esperado |
| --- | --- |
| `CA-RF-VUE-001-1` | Después del login, el cliente debe recuperar el destino protegido guardado, con su consulta y fragmento, si sigue siendo válido. Debe descartar destinos externos, ambiguos, desconocidos o de acceso/error y resolver una página autorizada. |
| `CA-RF-VUE-002-1` | Ante respuestas 401 concurrentes de operaciones protegidas, el cliente debe coordinar una renovación y repetir cada solicitud original como máximo una vez en ese recorrido. Un rechazo del login público no debe iniciar la renovación. |
| `CA-RF-VUE-002-2` | Si se rechaza la renovación, el cliente debe solicitar acceso nuevamente y conservar un destino interno permitido. Si falla la conexión o el proxy, debe ofrecer volver a comprobar el acceso; no debe interpretar ese fallo como credenciales inválidas. |
| `CA-RF-VUE-003-1` | Almacén debe conservar lecturas y altas de Clientes/Proveedores desde selectores autorizados, con las páginas independientes reservadas a Sistemas. La restricción debe comprobarse también al abrir una URL directa. |

### Captura de compras y salidas

| Criterio | Condición y resultado esperado |
| --- | --- |
| `CA-RF-VUE-009-1` | En una compra nueva, cambiar el proveedor debe limpiar los detalles preparados y la persona que recibe. Al editar una compra existente, el proveedor debe permanecer bloqueado y la solicitud debe conservar el leído. |
| `CA-RF-VUE-009-2` | Al agregar un detalle de compra, la cantidad debe ser al menos 1 y el costo por presentación debe ser positivo. Corregir un detalle debe admitir cantidades positivas menores que 1, sin superar la cantidad recibida vigente. |
| `CA-RF-VUE-010-1` | Almacén debe poder consultar y preparar salidas para todas las áreas de su acceso. Una cuenta operativa debe limitarse a las suyas: si la respuesta completa sin búsqueda contiene una sola área activa, debe seleccionarse y bloquearse. Una coincidencia de búsqueda no debe bloquear un catálogo múltiple. |
| `CA-RF-VUE-010-2` | En un encabezado editable, cambiar Cliente debe limpiar Asesor y Número de proyecto; cambiar Área debe limpiar Solicitante y Número de proyecto. Las opciones y sugerencias deben actualizarse según la nueva selección. |
| `CA-RF-VUE-010-3` | Al agregar detalles de Materiales o Consumibles, la cantidad debe ser al menos 1. En Mermas, debe ser positiva y puede ser menor que 1. Agregar de nuevo la misma selección debe acumularla según `CA-RF-ISS-004-1` o `CA-RF-WST-002-2`. |
| `CA-RF-VUE-010-4` | Surtir debe exigir al menos un detalle pendiente seleccionado y una Cantidad de proyecto positiva para cada uno. Desmarcarlo debe limpiar esa cantidad de la captura. La solicitud debe omitir detalles ya surtidos o cancelados. |
| `CA-RF-VUE-010-5` | El selector de Asesor debe cargarse después de elegir Cliente: para GPG INTERNO debe ofrecer coordinadores; para otros clientes, personas de Ventas y proyectos especiales o Dirección. Solicitante debe cargarse después de elegir Área y filtrar sus personas. Estas lecturas auxiliares no deben conceder acceso a las áreas consultadas. |
| `CA-RF-VUE-010-6` | Para GPG INTERNO, elegir Cliente y Área debe sugerir el proyecto configurado. La confirmación debe respetar `RN-035`, aunque el campo haya sido alterado en el navegador. |

### Altas contextuales y recuperación

| Criterio | Condición y resultado esperado |
| --- | --- |
| `CA-RF-VUE-012-1` | Abrir o cancelar un alta auxiliar no debe guardar el formulario principal. Confirmar el alta debe incorporar y seleccionar el registro activo, conservando la captura de origen. El registro creado debe permanecer aunque después se abandone el documento principal. |
| `CA-RF-VUE-012-2` | Un registro creado como inactivo debe permanecer guardado, pero no debe seleccionarse para una operación nueva que exija registros activos. El alta auxiliar no debe confirmar esa operación principal. |
| `CA-RF-VUE-012-3` | Un resultado auxiliar recibido después de cerrar o desmontar su origen no debe modificar otra captura ni aplicar una selección tardía. |
| `CA-RF-VUE-008-1` | Reintentar una alta o entrada de merma con resultado incierto debe conservar la misma clave de operación y el mismo cuerpo. Cambiar de cuenta o acción no debe recuperar una captura ajena; una entrada adicional debe distinguir también la merma de destino. Un rechazo definitivo por duplicado puede ofrecer otro formulario, pero abrirlo no debe registrar stock. |

### Datos y presentación

| Criterio | Condición y resultado esperado |
| --- | --- |
| `CA-RD-VUE-002-1` | En recursos con contrato versionado, editar o ajustar debe enviar la versión que abrió la captura. Un conflicto debe conservar los datos y exigir consultar la versión vigente; un nuevo intento no debe sustituir automáticamente la versión original. |
| `CA-RD-VUE-007-1` | Una página debe contener una colección de registros y conteos enteros seguros no negativos. Cero debe ser válido para una consulta vacía; conteos negativos, fraccionarios o inválidos deben rechazar la respuesta. |
| `CA-RD-VUE-007-2` | La lectura por ID de una compra o salida debe devolver ese mismo documento y un contexto compatible. Un ID distinto o un tipo explícitamente contrario al recurso solicitado debe impedir usarlo en el editor. |
| `CA-RD-VUE-007-3` | Una escritura debe recibir el código de confirmación de su operación y recurso antes de cerrar como éxito. Si el contrato exige un registro para seleccionar la nueva opción, también debe comprobar su identidad y datos requeridos. Un HTTP 2xx por sí solo no debe confirmar un resultado incompleto. |
| `CA-RD-VUE-007-4` | Una descarga debe recibirse como archivo con el tipo MIME anunciado para XLSX. Una respuesta con tipo HTML o JSON no debe iniciar una descarga presentada como Excel. |
| `CA-RN-VUE-001-1` | Abrir un formulario intacto no debe mostrar errores de captura. Validar un campo modificado o enviar el formulario debe mostrar los errores aplicables sin perder valores corregibles. |
| `CA-RN-VUE-004-1` | Un nombre o mensaje recibido que contenga etiquetas debe mostrarse como texto literal, sin crear elementos HTML ni ejecutar sus manejadores. |
| `CA-RN-VUE-007-1` | Un listado no debe recargarse automáticamente mientras esté oculto, exista una carga incompatible o haya una captura protegida. Si vuelve a ser elegible y transcurrió el intervalo desde el último intento, la siguiente comprobación de actualización debe renovar la consulta sin perder filtros. |

## Comprobación

La [cobertura por requisito](../../testing/04-use-case-coverage.md#requisitos-del-cliente)
localiza las pruebas y revisiones. Los datos, pasos y resultados de prueba se
mantienen en esa colección.

## Información necesaria para aceptar una entrega

Registrar la versión revisada, los requisitos incluidos, sus resultados, los
pendientes y la decisión del responsable funcional. El
[plan de pruebas](../../testing/01-test-plan.md) define el registro de ejecución;
las [reglas documentales](../../governance/01-documentation-rules.md) definen los
responsables de revisión.
