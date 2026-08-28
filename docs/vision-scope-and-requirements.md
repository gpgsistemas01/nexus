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

## Usuarios y partes interesadas

- **Almacén y proveeduría:** registra recepciones, proveedores, materiales, mermas,
  surtidos, devoluciones y consulta existencias.
- **Áreas solicitantes futuras:** su participación en salidas permanece pendiente de definir; ventas no tiene acceso al sistema.
- **Administración del sistema:** administra cuentas, personas y asignaciones de
  rol/departamento, además de ajustes de stock protegidos.
- **Coordinación y dirección:** consulta trazabilidad, reportes e indicadores para
  supervisar la operación.

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

Los requisitos siguientes son implementados salvo que indiquen expresamente otro
estado. Sus criterios de aceptación se obtienen de las validaciones, permisos y pruebas
referenciadas en la matriz de trazabilidad. Una modificación debe actualizar en el
mismo commit el enunciado, la evidencia y la prueba CRUD correspondiente.

## Requisitos funcionales implementados

### Acceso y administración

- **RF-AUT-01.** El sistema debe autenticar con nombre de usuario y contraseña, emitir
  tokens de acceso y renovación, renovar la sesión y devolver el usuario actual.
- **RF-AUT-02.** Toda ruta protegida debe validar el token y el permiso requerido; los
  permisos efectivos se calculan con las asignaciones `UserRoleDepartment` y la matriz
  de rol/departamento definida en código.
- **RF-AUT-03.** El sistema debe permitir consultar, crear, activar/desactivar y editar
  cuentas, y cambiar su contraseña. Una cuenta puede vincularse opcionalmente con una
  persona.
- **RF-AUT-04.** El sistema debe permitir consultar, crear y editar personas y sus
  asignaciones de rol/departamento, preservando `Person` para participantes del proceso
  y `User` para identidad de acceso/auditoría.
- **RF-AUT-05.** Roles y departamentos deben poder consultarse para formar las
  asignaciones; su mantenimiento no forma parte del API actual.

### Catálogos comerciales y de almacén

- **RF-CAT-01.** El sistema debe consultar, crear y editar clientes, con un asesor
  opcional que sea una persona registrada.
- **RF-CAT-02.** El sistema debe consultar, crear y editar proveedores; cada proveedor
  conserva código único, razón social, nombre comercial y estado activo.
- **RF-CAT-03.** El sistema debe consultar, crear, editar, desactivar/eliminar según las
  reglas del servicio y ajustar el stock de materiales. Cada material requiere
  presentación y unidad de medida, admite SKU único, stock mínimo y dimensiones.
- **RF-CAT-04.** El sistema debe mantener la relación única material-proveedor con SKU
  del proveedor, costo unitario máximo, stock actual y cantidad convertida.
- **RF-CAT-05.** El sistema debe exponer para consulta unidades de medida,
  presentaciones, motivos de ajuste y estados de surtido.
- **RF-CAT-06.** El sistema debe registrar mermas tomando un material y proveedor como
  plantilla, conservar proveedor, presentación, unidad y dimensiones como identidad
  ineditable, permitir correcciones del nombre y de sus datos secundarios, y realizar
  ajustes autorizados de stock mediante el flujo específico.

### Operación de inventario

- **RF-INV-01.** Cada recepción debe tener referencia única, proveedor, receptor,
  estado, fecha, totales, detalles de material y datos de factura opcionales.
- **RF-INV-02.** Confirmar una recepción debe generar entradas de inventario y
  actualizar existencias por material-proveedor de forma transaccional.
- **RF-INV-03.** Una línea de recepción debe poder corregirse o cancelarse conservando
  valores anteriores y corregidos, motivo, diferencias e impacto en movimientos; no se
  debe borrar su historia.
- **RF-INV-04.** Cada salida debe tener referencia única, departamento, solicitante,
  cliente, asesor, proyecto o número de proyecto, estado y líneas por material y
  proveedor.
- **RF-INV-05.** Las líneas de salida deben admitir surtido, surtido parcial y
  devolución, registrar cantidades entregadas/devueltas y actualizar el estado de
  cumplimiento del detalle y del documento.
- **RF-INV-06.** Una salida o devolución debe afectar existencias y crear movimientos
  con stock anterior y nuevo; una salida no debe dejar stock inválido.
- **RF-INV-07.** El sistema debe conservar movimientos de tipo entrada, salida o ajuste,
  con referencia, fecha y detalles vinculados al documento que los originó.
- **RF-INV-08.** Los ajustes de materiales deben registrar tipo incremento/decremento,
  motivo, creador, aprobador, estado, diferencias físicas y convertidas, y el movimiento
  resultante. Los ajustes de merma deben registrar el actor y las mismas diferencias.
- **RF-INV-09.** Las referencias documentales deben generarse con un contador único por
  prefijo y año.
- **RF-INV-10.** El sistema debe conservar instantáneas descriptivas en documentos y
  movimientos (nombres, dimensiones, unidad, presentación, cliente o responsable)
  para que cambios futuros de catálogo no destruyan la lectura histórica.

### Seguimiento y salida de información

- **RF-SEG-01.** El sistema debe generar notificaciones relacionadas con una entidad y
  opcionalmente dirigirlas a un usuario o departamento; debe permitir consultar las
  recientes y marcarlas como leídas.
- **RF-SEG-02.** Las actualizaciones operativas deben poder emitirse a clientes web en
  tiempo real mediante Socket.IO.
- **RF-REP-01.** Los usuarios autorizados deben poder exportar Excel de inventario,
  recepciones, salidas, mermas, proveedores, clientes, personas, usuarios y movimientos.
- **RF-REP-02.** Los listados deben admitir los filtros y paginación implementados por
  cada servicio, sin eludir la autorización del dominio.

## Requisitos de datos

- **RD-01. Identidad.** Las entidades usan UUID; referencias documentales, nombres de
  catálogos indicados por Prisma y SKU de material, cuando existe, deben ser únicos.
- **RD-02. Precisión.** Cantidades, existencias, dimensiones, costos e importes se
  almacenan como `Decimal(10,2)` y no como punto flotante de JavaScript.
- **RD-03. Integridad.** Recepciones, salidas y movimientos deben
  conservar sus relaciones de cabecera-detalle y claves foráneas.
- **RD-04. Trazabilidad.** Correcciones, cancelaciones, devoluciones y ajustes se
  representan mediante registros relacionados; no deben sobrescribir o eliminar el
  hecho histórico que explica una variación de stock.
- **RD-05. Temporalidad.** Los modelos operativos que lo declaran deben mantener
  `createdAt` y `updatedAt`; fechas del negocio (solicitud, aprobación, entrega,
  recepción, aplicación) no se sustituyen por esas marcas técnicas.
- **RD-06. Estado.** Los catálogos maestros que incluyen `isActive` usan desactivación
  lógica. Los documentos y detalles usan estados explícitos como confirmada,
  cancelada, pendiente, aplicada o surtida.
- **RD-07. Separación de identidades.** `Person` representa participantes (solicitante,
  aprobador, receptor, asesor o almacenista); `User` representa la cuenta autenticada
  que crea, aprueba o devuelve cuando el modelo exige auditoría.

## Atributos de calidad y requisitos no funcionales

Los atributos se expresan como escenarios verificables: fuente, estímulo, ambiente,
respuesta y medida. No se inventan SLA o umbrales de rendimiento que el proyecto aún
no haya acordado; esas definiciones permanecen como brechas.

### Seguridad

- **RNF-SEG-01.** Dada una credencial almacenada, cuando se consulte `User`, el valor de
  `password` debe ser un hash generado por bcrypt y no la contraseña en texto claro.
  **Medida:** ninguna operación de alta o cambio de contraseña persiste el texto
  recibido. **Evidencia:** `src/utils/encryptionUtils.js` y `userService.js`.
- **RNF-SEG-02.** Dada una petición a una ruta protegida, cuando falte un token válido o
  el usuario no tenga el permiso exigido, la API debe rechazarla antes de ejecutar el
  controlador. **Medida:** respuesta HTTP de autenticación/autorización y cero
  escrituras del controlador. **Evidencia:** `authMiddleware.js` y rutas API.
- **RNF-SEG-03.** Dada una petición API con cuerpo, cuando su tipo de contenido no sea
  el declarado para la ruta, el sistema debe rechazarla antes de procesar el cuerpo.
  **Medida:** respuesta de tipo de contenido no soportado. **Evidencia:**
  `contentTypeMiddleware.js`.
- **RNF-SEG-04.** En cualquier ambiente, los secretos JWT y las URLs con credenciales
  deben proceder de variables de entorno y no deben escribirse en los logs.
  **Medida:** los archivos versionados no contienen secretos operativos y el arranque
  solo informa el nombre de la variable seleccionada.

### Integridad y confiabilidad

- **RNF-CON-01.** Dada una operación que modifica un documento, existencias y
  movimientos, cuando falle cualquiera de sus pasos, la transacción debe revertir
  todos los cambios. **Medida:** después del error no existe modificación parcial en
  ninguna tabla participante. **Evidencia:** transacciones de los servicios de
  recepciones, salidas y ajustes.
- **RNF-CON-02.** Dado un valor monetario, dimensional o de inventario, cuando se
  persista, debe conservar una precisión decimal máxima de dos posiciones conforme a
  `Decimal(10,2)`. **Medida:** Prisma/PostgreSQL rechaza valores fuera de capacidad y
  las lecturas no dependen de aritmética binaria de punto flotante.
- **RNF-CON-03.** Dada una corrección, cancelación, devolución o ajuste aplicado,
  cuando finalice la operación, debe existir un registro histórico relacionado con el
  documento y el movimiento que explica el cambio. **Medida:** la variación puede
  reconstruirse mediante claves foráneas sin depender de logs de aplicación.

### Disponibilidad y desplegabilidad

- **RNF-DES-01.** Dado un arranque de contenedor con migraciones habilitadas, cuando
  `DIRECT_URL` falte o `prisma migrate deploy` falle, el proceso debe terminar con
  código distinto de cero antes de iniciar Node.js. **Medida:** no existe proceso de
  aplicación después del fallo. **Evidencia:** `docker-entrypoint.sh`.
- **RNF-DES-02.** Dado un despliegue correcto, la aplicación debe utilizar
  `DATABASE_URL` para ejecución y Prisma CLI debe preferir `DIRECT_URL` para
  migraciones. **Medida:** cada proceso selecciona el nombre de variable documentado
  sin imprimir su valor.

### Compatibilidad e interoperabilidad

- **RNF-COM-01.** La aplicación debe instalarse y ejecutarse en versiones de Node.js
  `>=22 <25`. **Medida:** `package.json#engines` declara ese intervalo y la instalación
  fuera de él se considera no soportada.
- **RNF-COM-02.** La API debe intercambiar JSON salvo los endpoints declarados para
  archivos o texto plano. **Medida:** el middleware acepta únicamente el tipo asignado
  a cada prefijo de ruta.

### Usabilidad

- **RNF-USA-01.** Dada una tabla operativa en una pantalla angosta, cuando no quepan
  todas sus columnas, debe mantener visibles las acciones y datos prioritarios y mover
  los secundarios al detalle desplegable. **Medida:** compras conserva acciones y
  salidas conserva cantidad convertida y control de surtido.
- **RNF-USA-02.** Dado un error de validación de formulario, cuando la API lo devuelva,
  la interfaz debe presentar el mensaje asociado sin perder el contexto del formulario.
  **Medida:** el usuario identifica el campo o la causa que impide completar el CRUD.

### Mantenibilidad y capacidad de prueba

- **RNF-MAN-01.** Dado un cambio CRUD, la lógica de negocio debe residir en servicios,
  la validación en validadores y la normalización en DTO cuando exista ese patrón en el
  dominio. **Medida:** los controladores coordinan la petición y no duplican reglas del
  servicio.
- **RNF-MAN-02.** Antes de crear un flujo, componente o helper, se debe revisar si un
  patrón existente puede reutilizarse o parametrizarse para el nuevo contexto.
  **Medida:** la revisión identifica el componente reutilizado o justifica por qué el
  comportamiento requiere uno nuevo.
- **RNF-PRU-01.** Dado un cambio CRUD, las pruebas deben replicar bajo `tests/` la
  ubicación del código y cubrir las operaciones públicas afectadas según
  `docs/service-test-coverage.md`. **Medida:** creación, consulta, actualización y
  desactivación/eliminación aplicable tienen una aserción observable.
- **RNF-PRU-02.** Dada una prueba con persistencia real, debe usar
  `DATABASE_TEST_URL`, datos identificables y limpieza acotada; puede usar rollback si
  el servicio acepta el cliente transaccional. **Medida:** nunca modifica
  `DATABASE_URL` ni elimina catálogos compartidos.

### Eficiencia de desempeño

- **RNF-REN-01 (parcial).** Dado un listado, el servicio debe aplicar paginación y
  filtros en la consulta de datos en lugar de cargar el conjunto completo para
  paginarlo en memoria. **Medida actual:** la respuesta conserva total, total filtrado
  y página solicitada cuando el servicio implementa listado paginado.
- **RNF-REN-02 (propuesto).** Deben acordarse percentiles de latencia, concurrencia,
  volumen de datos y tamaño máximo de exportación antes de afirmar un objetivo de
  rendimiento. Hasta entonces no existe un SLA verificable de desempeño.

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
   auditoría está detallada en `docs/database-users-and-permissions-analysis.md`.
4. **Criterios de producto.** Faltan propietarios de negocio, metas cuantificables,
   SLA, política de retención y recuperación, clasificación de datos y criterios de
   aceptación acordados con usuarios. Este documento no inventa esos compromisos.
5. **Cobertura.** Persisten servicios sin cobertura CRUD completa; el inventario
   actualizado se mantiene en `docs/service-test-coverage.md`.

## Criterio para mantener este documento

Un cambio está documentalmente completo cuando: (1) el requisito afectado conserva su
identificador o registra su reemplazo; (2) alcance, rutas y modelo no se contradicen;
(3) una brecha resuelta se mueve a requisitos implementados; (4) las pruebas cubren
el caso CRUD y sus invariantes de datos, autorización y aislamiento; y (5) cada
requisito nuevo supera todas las condiciones de redacción y, si expresa un atributo de
calidad, incluye fuente, estímulo, ambiente, respuesta y medida verificable.
