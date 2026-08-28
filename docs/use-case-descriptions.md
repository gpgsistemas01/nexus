# Descripciones de casos de uso

## Propósito y alcance

Este catálogo desarrolla los objetivos representados en el
[diagrama de casos de uso](domain-and-use-cases.md#casos-de-uso-vigentes). Agrupa en una
misma sección los casos que comparten tema, actor, ciclo CRUD o efectos de inventario,
para que sus semejanzas y diferencias puedan revisarse sin crear un documento por
módulo.

Las descripciones expresan comportamiento de negocio, no endpoints ni permisos. Para
conocer operaciones y permisos se consulta la
[matriz de operaciones](requirements-operations-matrix.md); para criterios verificables
y estado se consulta la [especificación de requisitos](requirements-specification.md).
Una capacidad parcial, modelada o fuera de alcance no se incorpora como caso vigente.

## Convenciones de lectura

- **Actor principal** identifica quién inicia el objetivo; no concede autorización.
- **Precondiciones** resumen el estado necesario antes de comenzar.
- **Flujo principal** describe el resultado exitoso observable y no una pantalla
  específica.
- **Alternativas y errores** reúnen decisiones relevantes que deben comprobarse sin
  convertir cada validación en otro caso de uso.
- **Resultado** indica los datos o efectos que deben existir al terminar.
- **Requisitos relacionados** enlaza los identificadores estables que contienen los
  criterios de aceptación y la evidencia técnica.

Los casos de catálogos siguen el mismo ciclo listar-crear-actualizar y sólo incorporan
eliminar, activar, desactivar o ajustar cuando el contexto lo permite. Los casos de
documentos comparten encabezado y detalles, pero surtir, devolver y corregir conservan
reglas y efectos propios.

## 1. Acceso e identidades

### CU-IAM-01 — Administrar personas, usuarios y accesos

| Elemento | Descripción |
| --- | --- |
| Actor principal | Administración del sistema. |
| Objetivo | Mantener separadas las personas que participan en la operación y las cuentas que acceden a Nexus, vinculándolas cuando corresponda. |
| Precondiciones | El actor inició sesión y posee el permiso de la operación; roles y departamentos están disponibles para consulta. |
| Flujo principal | 1. El actor consulta personas o usuarios. 2. Registra o selecciona la identidad. 3. Captura sus datos y asignaciones. 4. El sistema valida identidad y relaciones. 5. El sistema persiste el cambio y la lectura posterior lo refleja. |
| Alternativas y errores | Una entrada inválida no se persiste. Una cuenta puede existir sin persona vinculada. Roles y departamentos sólo se consultan: su mantenimiento no forma parte de este caso. El cambio de contraseña o accesos conserva las reglas específicas de usuario. |
| Resultado | La persona o cuenta y sus asignaciones válidas quedan disponibles para autorización, contexto operativo o auditoría. |
| Requisitos relacionados | `RF-IAM-001`, `RF-IAM-002`, `RF-IAM-003`, `RN-001`, `RN-008`. |

Este caso reúne personas y usuarios porque comparten administración de identidades,
pero mantiene la distinción del dominio: una persona no obtiene acceso por el solo
hecho de participar en un documento.

## 2. Catálogos operativos y contextuales

### CU-CAT-01 — Mantener catálogos de almacén

| Elemento | Descripción |
| --- | --- |
| Actor principal | Personal de almacén. |
| Objetivo | Mantener materiales, proveedores, ofertas proveedor-material y existencias de merma necesarias para los documentos operativos. |
| Precondiciones | El actor inició sesión y posee el permiso del catálogo y de la acción solicitada. |
| Flujo principal | 1. El actor consulta el catálogo con sus filtros. 2. Crea o selecciona un registro. 3. Captura o corrige los datos editables y relaciones obligatorias. 4. El sistema valida unicidad, estado y reglas dimensionales o comerciales. 5. El sistema persiste y actualiza el listado. |
| Alternativas y errores | Material permite eliminación física sólo sin relaciones protegidas. Los demás registros usan actualización de estado cuando corresponda. El stock no se altera mediante la edición general: utiliza el ajuste autorizado. Una merma toma un material como plantilla, pero conserva snapshots propios y no una relación persistente con él. Los catálogos auxiliares se consultan sin ofrecer un CRUD inexistente. |
| Resultado | El catálogo queda consistente y disponible para entradas, salidas, ajustes, movimientos y reportes. |
| Requisitos relacionados | `RF-CAT-001`, `RF-CAT-002`, `RF-CAT-004`, `RF-CAT-005`, `RF-WST-001`, `RF-MER-001` a `RF-MER-004`, `RN-006`, `RN-007`. |

### CU-CAT-02 — Mantener clientes como catálogo contextual

| Elemento | Descripción |
| --- | --- |
| Actor principal | Administración del sistema. |
| Objetivo | Mantener clientes y su asesor opcional para utilizarlos como contexto comercial de una salida. |
| Precondiciones | El actor inició sesión y posee el permiso de consultar, crear o actualizar clientes; la persona asesora ya existe cuando se desea asociarla. |
| Flujo principal | 1. El actor consulta clientes. 2. Registra o selecciona uno. 3. Captura o modifica sus datos y, opcionalmente, el asesor. 4. El sistema valida la entrada y la referencia de persona. 5. El sistema persiste el cambio y actualiza el listado. |
| Alternativas y errores | El asesor puede omitirse. Una referencia inválida o datos que incumplen las reglas no se persisten. El asesor es contexto comercial y no se convierte por ello en actor con acceso. |
| Resultado | El cliente queda disponible como contexto de las salidas y para reportes autorizados. |
| Requisitos relacionados | `RF-CAT-003`, `RN-001`, `RN-006`. |

Los dos casos anteriores comparten el patrón CRUD, sus componentes de listado y
formulario y la expectativa de reutilización. Se separan porque pertenecen a actores y
contextos de negocio distintos, y porque clientes no administra inventario.

## 3. Entradas y correcciones

### CU-REC-01 — Registrar y corregir entradas

| Elemento | Descripción |
| --- | --- |
| Actor principal | Personal de almacén. |
| Objetivo | Registrar la recepción de materiales y corregir sus detalles sin perder el historial que explica el inventario. |
| Precondiciones | El actor inició sesión y posee el permiso; proveedor y materiales relacionados existen; para editar o corregir, la entrada existe y su estado admite la acción. |
| Flujo principal | 1. El actor crea una entrada con proveedor, factura, fechas, receptor y detalles. 2. El sistema valida la referencia y los datos. 3. En una transacción, persiste encabezado y detalles, incrementa existencias y crea movimientos. 4. Posteriormente, el actor puede editar el encabezado permitido o agregar detalles nuevos. 5. Si un detalle persistido requiere cambio, registra una corrección con su motivo. |
| Alternativas y errores | La misma factura no puede duplicarse para el proveedor. Una entrada admite renglones repetidos del mismo material cuando representan lotes o precios distintos. El proveedor original no cambia durante la edición. Una corrección o cancelación de detalle registra valores anteriores y nuevos y revierte o ajusta su efecto; no sobrescribe la historia. Cualquier fallo transaccional deja documento, stock y movimientos sin cambios parciales. |
| Resultado | La entrada, sus importes, correcciones, existencias y movimientos permanecen conciliados y trazables. |
| Requisitos relacionados | `RF-REC-001`, `RF-REC-002`, `RF-REC-003`, `RN-002`, `RN-004`, `RN-005`. |

## 4. Salidas, surtido y devolución

### CU-ISS-01 — Crear y editar salidas

| Elemento | Descripción |
| --- | --- |
| Actor principal | Personal de almacén. |
| Objetivo | Preparar una salida de material o merma con su contexto y cantidades solicitadas antes o durante su atención. |
| Precondiciones | El actor inició sesión y posee el permiso; los catálogos requeridos existen; para editar, el documento existe y su estado admite cambios. |
| Flujo principal | 1. El actor elige el contexto de material o merma. 2. Captura encabezado, solicitante y detalles. 3. El sistema valida relaciones, cantidades y campos del contexto. 4. Persiste el documento sin descontar existencias aún no surtidas. 5. Una edición posterior modifica sólo encabezado o cantidades admitidas y puede agregar detalles según las reglas del estado. |
| Alternativas y errores | Material y merma reutilizan el patrón de modal, encabezado y detalle, pero consultan inventarios distintos. Los snapshots de presentación y unidad permiten mostrar el recurso sin reconstruir su historia. No se reescriben cantidades ya surtidas o devueltas. Un dato inválido o un estado no permitido no produce cambios. |
| Resultado | La salida queda disponible para surtimiento, con detalles pendientes y contexto trazable. |
| Requisitos relacionados | `RF-ISS-001`, `RF-WST-002`, `RN-001`, `RN-003`, `RN-006`. |

### CU-ISS-02 — Surtir detalles

| Elemento | Descripción |
| --- | --- |
| Actor principal | Personal de almacén. |
| Objetivo | Entregar total o parcialmente la cantidad pendiente de un detalle de salida. |
| Precondiciones | La salida y el detalle existen, su estado permite surtir, existe cantidad pendiente y el inventario correspondiente es suficiente. |
| Flujo principal | 1. El actor selecciona el detalle y captura la cantidad a surtir. 2. El sistema valida la cantidad disponible y pendiente. 3. En una transacción, acumula la cantidad surtida, reduce la existencia, deriva los estados y crea el movimiento vinculado. 4. El sistema presenta el documento y el inventario actualizados. |
| Alternativas y errores | Un surtimiento parcial mantiene el detalle pendiente por la diferencia. Material y merma usan existencias y conversiones propias. Una cantidad inválida, stock insuficiente o fallo en cualquier escritura revierte toda la operación. |
| Resultado | Cantidad surtida, estado, existencia y movimiento coinciden y nunca dejan stock inválido. |
| Requisitos relacionados | `RF-ISS-002`, `RF-WST-003`, `RN-002`, `RN-003`, `RN-004`. |

### CU-ISS-03 — Devolver detalles surtidos

| Elemento | Descripción |
| --- | --- |
| Actor principal | Personal de almacén. |
| Objetivo | Reintegrar al inventario una cantidad previamente surtida sin eliminar la entrega original. |
| Precondiciones | La salida y el detalle existen, hay cantidad surtida aún disponible para devolución y el actor posee el permiso específico. |
| Flujo principal | 1. El actor selecciona un detalle surtido y captura la cantidad a devolver. 2. El sistema valida que no exceda lo retornable. 3. En una transacción, acumula la devolución, incrementa la existencia, deriva los estados y crea el movimiento inverso enlazado al origen. 4. El sistema presenta los acumulados actualizados. |
| Alternativas y errores | Una devolución parcial conserva como surtida la diferencia. Material y merma mantienen reglas de existencia distintas dentro del mismo proceso coordinado. Una cantidad inválida o un fallo transaccional no altera acumulados, stock ni movimientos. |
| Resultado | La devolución queda trazada sin borrar el surtimiento, y documento, existencia y movimiento permanecen consistentes. |
| Requisitos relacionados | `RF-ISS-003`, `RF-WST-003`, `RN-002`, `RN-003`, `RN-005`. |

Estos tres casos forman una familia porque material y merma replican el proceso de
salida con diferente contexto. La separación por objetivo evita tratar surtimiento y
devolución como una edición CRUD y facilita exigir pruebas de sus transacciones y
efectos negativos específicos.

## 5. Consulta y salida de información

### CU-REP-01 — Consultar movimientos y reportes

| Elemento | Descripción |
| --- | --- |
| Actor principal | Personal de almacén o administración del sistema, según el ámbito del reporte. |
| Objetivo | Consultar trazabilidad operativa y exportar la información autorizada. |
| Precondiciones | El actor inició sesión y posee el permiso de lectura o reporte del ámbito. |
| Flujo principal | 1. El actor abre movimientos o un reporte. 2. Define los filtros disponibles. 3. El sistema valida el ámbito y consulta los datos. 4. Presenta resultados paginados o consolidados. 5. Si el actor solicita exportación, genera el archivo con resultados y fórmulas aplicables. |
| Alternativas y errores | En movimientos, primero se selecciona proveedor y después material o merma; cambiar proveedor limpia el inventario elegido. Los reportes sólo exponen el ámbito autorizado. Las mermas se agrupan según presentación, nombre, proveedor y dimensiones definidas por su requisito. Una consulta sin resultados entrega una respuesta válida sin inventar datos. |
| Resultado | El actor obtiene una vista o archivo consistente con los filtros, cálculos y permisos aplicados. |
| Requisitos relacionados | `RF-REP-001`, `RF-REP-002`, `RF-REP-003`, `RF-REP-004`, `RN-001`. |

## Relación entre familias y reutilización

| Tema compartido | Casos | Elementos reutilizables que deben evaluarse primero | Diferencia que debe conservarse |
| --- | --- | --- | --- |
| CRUD de catálogos | `CU-IAM-01`, `CU-CAT-01`, `CU-CAT-02` | Fábricas CRUD, listados, formularios, validación y refresco de tabla. | Permisos, identidad del recurso, relaciones y política de eliminación. |
| Documentos con detalles | `CU-REC-01`, `CU-ISS-01` | Encabezado, modal/formulario, tabla de detalles, DTO y transacción coordinadora. | La entrada incrementa stock al confirmarse; la salida no lo descuenta hasta surtir. |
| Operación de salidas | `CU-ISS-01`, `CU-ISS-02`, `CU-ISS-03` | Proceso de material replicable para merma, componentes informativos y coordinación de movimientos. | Inventario, conversión, permisos, estados y cantidades acumuladas del contexto. |
| Consulta y exportación | `CU-REP-01` y listados de los demás casos | Filtros, paginación, dependencias entre selects y utilidades Excel. | Columnas, agrupaciones, fórmulas y permiso de cada reporte. |

Reutilizar no significa fusionar reglas de negocio. Antes de crear otro flujo se revisan
los [patrones de diseño y construcción](design-and-construction-patterns.md), se replica
el proceso existente sólo cuando cambia el contexto, y se mantienen explícitas sus
validaciones, transacciones y pruebas CRUD.

## Trazabilidad y mantenimiento

1. Al agregar, retirar o cambiar un objetivo de actor, se actualizan este catálogo y el
   diagrama de casos de uso en el mismo cambio.
2. Si cambia una operación, se revisan también la especificación, la matriz de
   operaciones y el plan de pruebas.
3. Las pruebas unitarias conservan la ruta paralela al código; las integraciones CRUD
   atraviesan HTTP y Prisma en `tests/integration/controllers/*DbTest.js`, conforme a
   la [estrategia de pruebas](service-test-coverage.md).
4. Un caso nuevo debe describir actor, objetivo, precondiciones, flujo, alternativas,
   resultado y requisitos relacionados antes de considerarse documentado.
5. Proyectos, requisiciones y ajustes sin flujo HTTP completo permanecen en la
   especificación con su estado correspondiente; se incorporarán aquí sólo al pasar a
   alcance vigente.
