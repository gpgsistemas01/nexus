# Visión, alcance y requisitos de Nexus

## Propósito del documento

Este documento describe el producto **tal como está implementado**. Su fuente de verdad
es el código de rutas, servicios, permisos y validaciones, junto con el modelo
`prisma/schema.prisma`. Los requisitos marcados como brecha no deben interpretarse como
funcionalidad disponible. Cuando cambie una regla de negocio, una ruta o el esquema,
debe actualizarse este documento en el mismo cambio.

## Visión del producto

Nexus busca ofrecer una fuente única, trazable y segura para el control operativo de
materiales de GPG: desde la recepción y asociación con proveedores hasta el surtido,
la devolución, la merma y los ajustes de existencias. También relaciona esa operación
con personas, cuentas de acceso, áreas, clientes y proyectos, y entrega reportes para
la toma de decisiones.

El valor esperado es sustituir registros dispersos por flujos consistentes que:

- preserven el historial de cantidades, costos, responsables y documentos;
- eviten existencias incoherentes mediante movimientos transaccionales;
- separen a la persona que participa en el negocio de la cuenta que ejecuta la acción;
- restrinjan cada operación según rol, departamento y permiso; y
- faciliten la consulta operativa mediante vistas, notificaciones y exportaciones.

## Descripción del producto

Nexus es una aplicación web autenticada de control operativo. Combina páginas
renderizadas en servidor y una API REST para registrar catálogos, entradas, salidas,
existencias, mermas y movimientos; aplica autorización por rol, área y permiso, y
mantiene trazabilidad mediante referencias, historiales y auditoría. También ofrece
consultas, reportes Excel y actualizaciones en tiempo real para apoyar la operación y la
supervisión.

El producto centraliza el inventario y sus documentos relacionados; no es un ERP, un
sistema contable ni una plataforma general de gestión de proyectos. Las personas,
clientes, proyectos y áreas aportan identidad y contexto a la operación, pero sólo las
capacidades declaradas como vigentes forman parte del producto disponible.

## Áreas del contexto organizacional

Las áreas siguientes forman el catálogo organizacional utilizado por permisos,
personas, proyectos o encabezados de salida. Su presencia no concede acceso ni implica
que todas inicien casos de uso; la autorización efectiva depende de la combinación de
rol, área y permiso.

| Área | Participación vigente en el contexto de Nexus |
| --- | --- |
| Dirección | Parte interesada de supervisión; su acceso y casos de uso permanecen pendientes de definición. |
| Acabados | Contexto organizacional de personas, proyectos y salidas. |
| Administrativo | Contexto organizacional y de catálogos autorizados. |
| Almacén y proveduría | Operación de catálogos, entradas, inventario, salidas y mermas. |
| Diseño | Contexto organizacional de personas, proyectos y salidas. |
| Instalaciones | Contexto organizacional de personas, proyectos y salidas. |
| Impresión | Contexto organizacional de personas, proyectos y salidas. |
| Router | Contexto organizacional de personas, proyectos y salidas. |
| PT/Tráfico | Contexto organizacional de personas, proyectos y salidas. |
| Servicios y vigilancia | Contexto de proyectos y salidas; no se le atribuye acceso por aparecer en el catálogo. |
| Sistemas | Administración de cuentas, accesos, catálogos contextuales y operaciones protegidas. |
| Taller 3D | Contexto organizacional de personas, proyectos y salidas. |
| Ventas y proyectos especiales | Contexto comercial y de proyectos; ventas no tiene acceso vigente al sistema. |

## Usuarios y partes interesadas

- **Almacén y proveduría:** registra recepciones, proveedores, materiales, mermas,
  surtidos, devoluciones y consulta existencias.
- **Áreas solicitantes futuras:** su participación en salidas permanece pendiente de definir; ventas no tiene acceso al sistema.
- **Administración del sistema:** administra cuentas, personas y asignaciones de
  rol/departamento y puede ejecutar todas las capacidades vigentes, siempre sujeto a la
  autorización del servidor.
- **Dirección:** necesita supervisar la operación, pero sus consultas, reportes e
  indicadores autorizados permanecen pendientes de definición.

## Alcance actual

### Incluido

1. Aplicación web autenticada, API REST y sesión mediante tokens en cookies.
2. Cuentas de usuario, personas, roles, departamentos y asignaciones de acceso.
3. Catálogo de materiales con presentación, unidad de medida y relaciones por
   proveedor, incluido stock físico y cantidad convertida.
4. Proveedores, clientes y asesores asociados a personas.
5. Recepciones de compra con detalle, importes, correcciones, cancelación de líneas y
   movimientos de entrada.
6. Salidas de almacén con detalle por proveedor, surtido parcial o total,
   devoluciones y movimientos de salida.
7. Mermas, ajustes de stock, motivos y movimientos independientes de merma.
8. Historial de movimientos, notificaciones en tiempo real y reportes Excel de
   inventario, compras, salidas, mermas, proveedores, clientes, personas, usuarios y
   movimientos.

### Fuera del alcance actual

- Contabilidad, pagos, cobranza, facturación fiscal y conciliación bancaria.
- Planeación de compras o reabastecimiento automático.
- Requisiciones de compra; el módulo anterior fue retirado del código y del esquema.
- Administración dinámica de la matriz de permisos desde la interfaz; la matriz está
  versionada en código.
- Aplicación móvil nativa, operación sin conexión e integraciones públicas con ERP,
  CRM o transportistas.
- CRUD público de proyectos, estados generales, roles, departamentos, presentaciones,
  unidades, motivos o estados de surtido; varios son catálogos de solo lectura en la
  API actual.
- Eliminación física generalizada del historial operacional.

## Criterios de calidad para redactar requisitos

Cada requisito de este documento debe cumplir simultáneamente estas condiciones antes
de considerarse aprobado:

| Condición | Regla de revisión |
| --- | --- |
| Necesario | Responde a una necesidad de un actor o a una restricción indispensable del negocio. |
| Correcto | Coincide con el comportamiento observable del código y con las restricciones de Prisma. |
| Claro y no ambiguo | Usa un sujeto y un verbo obligatorio; evita expresiones como «rápido», «adecuado», «cuando aplique» o «etcétera». |
| Atómico | Expresa una capacidad o regla verificable. Si dos comportamientos pueden aprobarse por separado, se documentan con identificadores distintos. |
| Completo | Indica actor o contexto, precondición relevante, respuesta esperada y datos afectados. |
| Consistente | No contradice otro requisito, el alcance, los estados del dominio ni la terminología `User`/`Person`. |
| Factible | Puede satisfacerse con la arquitectura y datos actuales; si requiere una decisión o desarrollo, se registra como brecha. |
| Verificable | Tiene un criterio de aceptación observable mediante una prueba, consulta de datos o inspección de configuración. |
| Trazable | Conserva un identificador estable y una referencia al código, prueba o modelo que lo sustenta. |
| Independiente de implementación | Describe el resultado de negocio; solo menciona tecnología cuando esta constituye una restricción del proyecto. |

### Plantilla y estado

La forma preferida es: **«Dado** [contexto], **cuando** [actor/evento], **el sistema
debe** [respuesta observable] **de modo que** [resultado verificable]». Los requisitos
pueden tener uno de estos estados:

- **Implementado:** existe evidencia en una ruta o servicio y en el modelo cuando hay
  persistencia.
- **Parcial:** solo una parte es accesible o verificable; se registra también como
  brecha.
- **Propuesto:** requiere validación del propietario de negocio y no se presenta como
  capacidad vigente.

El alcance siguiente incluye capacidades implementadas, parciales, modeladas o fuera
del alcance vigente. Su estado, criterios y evidencia se consultan en la especificación;
una modificación debe actualizar en el mismo cambio el enunciado, la trazabilidad y la
prueba correspondiente.

## Alcance funcional por grupo

La visión no mantiene una segunda lista de enunciados `RF-*`: hacerlo produjo niveles de
detalle distintos entre acceso, catálogos y operación. La
[especificación normativa](requirements-specification.md#4-requisitos-funcionales) es la
única fuente de cada obligación, criterio, estado y evidencia. Esta vista se limita a
mostrar el alcance y los rangos que deben revisarse juntos.

| Área de alcance | Requisitos normativos | Resultado incluido en la visión |
| --- | --- | --- |
| Autenticación | `RF-AUT-001` a `RF-AUT-003` | Iniciar, renovar y cerrar sesión como obligaciones independientes. |
| Identidades y acceso | `RF-IAM-001` a `RF-IAM-008` | Consultar, crear y actualizar usuarios o personas, cambiar contraseña y consultar catálogos de acceso. |
| Catálogos | `RF-CAT-001` a `RF-CAT-018` | Consultar, crear, actualizar, retirar o ajustar cada recurso según su política. |
| Entradas | `RF-REC-001` a `RF-REC-008` | Consultar, registrar, editar, corregir y cancelar entradas o detalles. |
| Salidas de material | `RF-ISS-001` a `RF-ISS-006` | Consultar, crear, editar encabezado, ajustar detalles, surtir y devolver. |
| Merma y sus salidas | `RF-WST-001` a `RF-WST-007`; `RF-MER-001` a `RF-MER-009` | Operar inventario y salidas de merma conservando snapshots y reglas dimensionales. |
| Ajustes | `RF-ADJ-001`, `RF-ADJ-002` | Registrar y aplicar ajustes; su estado permanece parcial. |
| Movimientos y reportes | `RF-REP-001` a `RF-REP-005` | Consultar y exportar información autorizada con reglas propias por reporte. |
| Capacidades no vigentes | `RF-REQ-001`, `RF-PRJ-001`, `RF-PRJ-002` | Requisiciones fuera de alcance y proyectos modelados sin CRUD registrado. |

La misma regla de granularidad aplica a todos los grupos: otra operación recibe otro
`RF-*` cuando cambia el resultado observable, permiso, validación principal o prueba de
cumplimiento. Los atributos de una misma identidad y las variantes del mismo resultado
permanecen como condiciones o criterios `CA-*`; no se crea un requisito por campo.

## Alcance de datos y calidad

La visión tampoco duplica los enunciados de datos o calidad. Los ámbitos de
[persistencia e integridad](requirements-specification.md#46-persistencia-e-integridad-de-información)
y de [operación y calidad](requirements-specification.md#47-operación-y-calidad-del-producto)
son sus fuentes normativas.

| Área | Requisitos normativos | Alcance resumido |
| --- | --- | --- |
| Identidad e integridad de datos | `RD-001` a `RD-010` | Identificadores, precisión, relaciones, historia, temporalidad, estados y separación `Person`/`User`. |
| Seguridad | `RC-SEG-001` a `RC-SEG-004` | Credenciales, rutas protegidas, tipos de contenido y secretos. |
| Datos y pruebas | `RC-DAT-001`, `RC-DAT-002`, `RC-PRU-001`, `RC-PRU-002` | Migraciones reproducibles, base de pruebas aislada y cobertura por nivel. |
| Mantenibilidad y documentación | `RC-MAN-001`, `RC-MAN-002`, `RC-DOC-001` | Organización por dominio, reutilización y documentación sincronizada. |
| Observabilidad y despliegue | `RC-OBS-001`, `RC-OBS-002`, `RC-DES-001`, `RC-DES-002` | Logs estructurados, confidencialidad y separación runtime/migraciones. |
| Compatibilidad y usabilidad | `RC-COM-001`, `RC-COM-002`, `RC-USA-001`, `RC-USA-002` | Runtime soportado, contrato de contenido y respuesta visible de la interfaz. |
| Rendimiento y disponibilidad | `RC-REN-001` a `RC-REN-003`; `RC-DIS-001`, `RC-DIS-002` | Paginación vigente y objetivos medibles todavía pendientes. |

La regla de singularidad se aplica igualmente a `RD-*`, `RN-*` y `RC-*`: una restricción
o atributo recibe otro identificador cuando puede incumplirse, aprobarse o comprobarse
independientemente. Varias propiedades inseparables de una misma garantía pueden
permanecer en un solo requisito.

## Matriz de trazabilidad resumida

| Área | Código de referencia | Datos principales |
| --- | --- | --- |
| Acceso | `src/routes/api/authApiRoute.js`, `src/constants/permissions.js` | `User`, `Role`, `Department`, `UserRoleDepartment` |
| Personas | `src/routes/api/admin/personApiRoute.js` | `Person`, `PersonRoleDepartment` |
| Clientes | `src/routes/api/sales/clientApiRoute.js` | `Client`, `Person` |
| Materiales y proveedores | `src/routes/api/warehouse/materialApiRoute.js`, `supplierApiRoute.js` | `Material`, `Supplier`, `SupplierMaterial` |
| Recepciones | `src/routes/api/warehouse/goodsReceiptApiRoute.js` | `GoodsReceipt`, `GoodsReceiptDetail`, `GoodsReceiptDetailChange` |
| Salidas y devoluciones | `src/routes/api/warehouse/goodsIssueApiRoute.js` | `GoodsIssue`, `GoodsIssueDetail`, `GoodsIssueReturn` |
| Mermas y ajustes | `src/routes/api/warehouse/wasteApiRoute.js` | `Waste`, `WasteStockAdjustment`, `StockAdjustment` |
| Movimientos | `src/services/inventory/movementService.js` | `InventoryMovement`, `MovementDetail`, `WasteMovement` |
| Reportes | `src/routes/api/*/reportApiRoute.js` | Lecturas de los dominios anteriores |

## Brechas conocidas y decisiones pendientes

1. **Proyectos sin CRUD.** `Project` participa en salidas, pero no tiene
   rutas ni servicio de administración. Debe definirse su fuente de datos y responsable.
2. **Catálogos parcialmente administrables.** Estados, roles, departamentos,
   presentaciones, unidades, motivos y estados de surtido se consultan, pero no todos
   tienen mantenimiento desde la aplicación. Debe decidirse cuáles son datos maestros
   administrados y cuáles pertenecen exclusivamente al seed.
3. **Auditoría incompleta.** Algunos hechos registran `User` creador/aprobador, mientras
   otros solo conservan una `Person` participante o marcas de tiempo. La ampliación de
   auditoría está detallada en `docs/data/database-users-and-permissions-analysis.md`.
4. **Criterios de producto.** Faltan propietarios de negocio, metas cuantificables,
   SLA, política de retención y recuperación, clasificación de datos y criterios de
   aceptación acordados con usuarios. Este documento no inventa esos compromisos.
5. **Cobertura.** Persisten servicios sin cobertura CRUD completa; el inventario
   actualizado se mantiene en `docs/testing/service-test-coverage.md`.

## Criterio para mantener este documento

Un cambio está documentalmente completo cuando: (1) el requisito afectado conserva su
identificador o registra su reemplazo; (2) alcance, rutas y modelo no se contradicen;
(3) una brecha resuelta actualiza su estado en la especificación; (4) las pruebas cubren
el caso CRUD y sus invariantes de datos, autorización y aislamiento; y (5) cada
requisito nuevo supera todas las condiciones de redacción y, si expresa un atributo de
calidad, incluye fuente, estímulo, ambiente, respuesta y medida verificable.
