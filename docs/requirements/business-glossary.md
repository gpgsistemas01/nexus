# Glosario del negocio y terminología común

## Propósito

Este glosario forma parte de la línea base de requisitos. Define el vocabulario que
usuarios, responsables funcionales, desarrollo y pruebas deben interpretar de la misma
forma. No es un inventario de columnas: el
[diccionario técnico de datos](../generated/data-dictionary.md) describe nombres, tipos y
restricciones de Prisma, mientras este documento describe significado, alcance y
sinónimos aceptados en el negocio.

Una palabra usada con otro sentido en una historia, pantalla o reporte debe aclararse
antes de implementar el cambio. La definición funcional prevalece sobre un nombre
histórico del código; si ambos difieren, se registra el alias y se planifica la
alineación sin renombrar silenciosamente contratos existentes.

Se revisaron los conceptos que aparecen de forma transversal en requisitos, casos de
uso, interfaz y modelo persistente. Se documentan aquí cuando su interpretación cambia
una regla, un permiso, una identidad o un efecto de inventario. Los nombres de campos,
estados técnicos y detalles de implementación que no aportan una distinción funcional
permanecen en sus fuentes técnicas; repetirlos en este glosario produciría una segunda
fuente de verdad.

## Personas, acceso y responsabilidades

| Término canónico | Definición compartida | Alias o distinción importante |
| --- | --- | --- |
| Persona | Individuo que participa en un proceso del negocio, aun cuando no tenga credenciales para entrar a Nexus. | No es sinónimo de usuario. En código corresponde al concepto persistido `Person`. |
| Usuario | Cuenta autenticable que ejecuta acciones en Nexus y permite atribuir auditoría. Puede estar vinculada con una persona. | No se usa para nombrar genéricamente a cualquier solicitante o asesor. |
| Asignación de acceso | Combinación de rol y departamento asociada a un usuario o persona para describir su participación y calcular permisos. | No es por sí sola un permiso almacenado; los permisos se calculan con la política del servidor. |
| Rol | Responsabilidad organizacional considerada por la política de autorización. | No equivale a un caso de uso ni a un permiso individual. |
| Área o departamento | Área organizacional que aporta contexto y alcance a una asignación o salida. | La interfaz usa «Área» y el modelo técnico usa `Department`; no es un rol ni concede acceso por sí sola. |
| Permiso | Capacidad concreta que la política de autorización concede para consultar o ejecutar una operación cuando al menos una asignación combina un rol y un área admitidos. | No se deduce únicamente del nombre del rol, del área, de que una opción sea visible ni de que exista una ruta. Siempre se comprueba en el servidor. |
| Credencial | Dato o artefacto que permite probar una sesión, como usuario y contraseña al ingresar o los tokens emitidos al autenticar. | No es sinónimo de usuario, persona, rol ni permiso; no debe compartirse ni exponerse en documentación, capturas o registros. |
| Solicitante | Persona que origina o solicita un documento operativo. | Puede ser diferente del usuario que captura la operación. |
| Aprobador | Persona que autoriza una transición cuando el flujo lo requiere. | Que un modelo permita `approver` no implica que el flujo de aprobación esté disponible. |
| Persona que recibe | Persona a cuyo nombre se registra la recepción de una compra. | No es necesariamente el usuario que captura la entrada ni el proveedor que entrega el material. En código corresponde a `receivedBy`. |
| Personal de almacén | Actor funcional que mantiene catálogos y ejecuta operaciones de almacén cuando sus accesos le conceden el permiso correspondiente. | No es una persona concreta, un rol único ni el campo técnico `warehouseStaff`; cada operación conserva su propia política de autorización. |
| Asesor | Persona asociada como dato del contexto comercial de un cliente o salida. | No es actor ni usuario del sistema y no debe inferirse a partir del usuario autenticado. |
| Actor de auditoría | Usuario al que se atribuye una escritura o cambio crítico. | Puede conservarse como nulo únicamente en los casos técnicos previstos por la auditoría. |

## Catálogo, existencias y relaciones comerciales

| Término canónico | Definición compartida | Alias o distinción importante |
| --- | --- | --- |
| Material | Artículo base administrado en inventario, definido por nombre, presentación, unidad y reglas de existencia. | No representa por sí solo la existencia de un proveedor concreto. |
| Identidad de material | Combinación de nombre recortado y comparado sin distinguir mayúsculas, presentación, unidad de medida, base y altura que permite reconocer el mismo artículo aunque lo ofrezcan proveedores distintos. | Base y altura ocupan posiciones distintas y pueden omitirse sólo como pareja. El proveedor no forma parte de esta identidad: se conserva en la oferta proveedor-material. Cambiar existencia, cantidad convertida, costo máximo, stock mínimo o estado activo no crea otra identidad. |
| Dimensiones | Base y altura opcionales que caracterizan físicamente un material o una merma y participan en el cálculo de cantidad convertida. | No son cantidades de inventario. En textos operativos, «ancho» y «largo» se interpretan como los campos **Base** y **Altura** mostrados por Nexus. |
| Presentación | Forma comercial o física en que se identifica un material. | Es catálogo auxiliar; no es la unidad de medida. |
| Unidad de medida | Unidad y símbolo usados para expresar cantidades de un material. | Debe conservarse separada de factores o cantidades convertidas. |
| Catálogo auxiliar | Conjunto controlado de opciones que clasifica o configura otros registros, como presentación, unidad, motivo o estado de cumplimiento. | Su consulta alimenta selectores operativos y su mantenimiento está reservado al administrador del sistema. |
| Proveedor | Organización que suministra materiales y participa en entradas de compra. | Sus nombres legal y comercial son datos distintos. |
| Oferta proveedor-material | Relación única entre proveedor y material que conserva costo máximo y existencia asociada. | En código corresponde a `SupplierMaterial`; no es un material duplicado. |
| Inventario | Vista conjunta de las existencias de materiales por proveedor o de las existencias independientes de merma. | No es un único saldo global: materiales y mermas mantienen relaciones, movimientos y reportes separados. |
| Existencia | Cantidad disponible de un recurso en un contexto identificable. | `stock` es el nombre técnico aceptado; toda modificación debe quedar explicada por un movimiento o ajuste permitido. |
| Stock mínimo | Umbral de referencia configurado para señalar que una existencia es baja. | No es stock disponible, reserva ni límite máximo; modificarlo no mueve inventario. La interfaz también lo presenta como **Stock Mínimo**. |
| Costo unitario máximo | Mayor costo por unidad convertida registrado para la oferta de un material y proveedor; también puede conservarse como dato propio de una merma. | La interfaz también usa **Costo Máximo** o **Costo máximo unitario**. No es el costo por presentación de un renglón ni el importe total de una compra. |
| Merma | Recurso reutilizable o residual con proveedor, presentación, unidad, dimensiones, costos y existencias propios. | En código aparece como `Waste`. Un material de referencia sirve como plantilla durante el alta, pero no queda como relación persistente; merma tampoco significa eliminación física ni salida de merma. |
| Identidad de merma | Combinación de proveedor, nombre, base y altura que permite reconocer una merma ya registrada. | Presentación y unidad se copian de la plantilla al crearla y no sustituyen esa combinación. Stock, costo máximo, mínimo y estado activo tampoco forman parte de la identidad. |
| Cliente | Organización o contexto comercial receptor de una salida. Puede tener un asesor asociado. | No es lo mismo que proyecto. |
| Proyecto | Contexto de trabajo identificable que puede relacionarse con salidas. | Está modelado, pero su CRUD completo permanece pendiente. |

## Documentos y trazabilidad de inventario

| Término canónico | Definición compartida | Alias o distinción importante |
| --- | --- | --- |
| Documento operativo | Encabezado y detalles que registran una intención o hecho de inventario con referencia y estado. | Entrada, salida y ajuste tienen reglas propias; compartir estructura no iguala sus transiciones. |
| Requisición de compra | Solicitud planificada de materiales con eventual aprobación y entrega. | No forma parte del código ni del esquema vigente; requiere un nuevo alcance antes de reimplementarse. |
| Entrada de compra | Recepción de materiales de un proveedor que incrementa existencias y genera trazabilidad de movimiento. | En código se denomina `GoodsReceipt`; «compra» en la UI no sustituye la recepción efectiva. |
| Tipo de comprobante | Selección que indica si una compra se recibe con factura o con remisión. | Controla si el número de factura debe capturarse; no es el estado de la compra. |
| Factura | Número de comprobante informado para una compra facturada. | No representa un flujo de facturación fiscal. Sólo puede identificar una compra por proveedor; una compra con remisión no lleva número de factura. |
| Remisión | Tipo de comprobante usado para registrar una compra que no se recibe con factura. | No es una factura pendiente ni requiere un número de factura. |
| Salida de material | Documento que solicita y suministra materiales a un cliente/proyecto, con posibilidad de devolución. | En código se denomina `GoodsIssue`. |
| Salida de merma | Documento que solicita y suministra existencias de merma, con posibilidad de devolución. | Reutiliza el patrón de salida, pero conserva stock y movimientos de merma separados. |
| Encabezado | Datos generales compartidos por todos los detalles de un documento, como actores, fechas, cliente, proyecto y observaciones. | Editar encabezado no equivale a cambiar cantidades de detalle. |
| Detalle | Renglón de un documento que identifica recurso, cantidad, importes o estado de cumplimiento. | Sus operaciones pueden requerir un permiso diferente del encabezado. |
| Suministro o entrega | Aplicación total o parcial de un detalle que afecta existencia y registra movimiento. | No es sinónimo de crear o editar el documento. |
| Devolución | Operación que reingresa una cantidad previamente suministrada y la enlaza con documento, detalle y movimiento originales. | Puede ser parcial o total, no elimina el suministro histórico y no es una acción directa de cancelación. |
| Corrección | Cambio trazable de un detalle de entrada que conserva valor anterior, valor corregido, motivo y actor. | No es una edición silenciosa ni una devolución. |
| Cancelación | Transición que invalida un documento o detalle conforme a sus reglas, conservando su historia. | En salidas es un resultado derivado: la devolución total cancela el detalle y sólo la cancelación de todos los detalles cancela el encabezado; no existe una acción ni un endpoint de cancelación directa. |
| Ajuste de stock | Operación autorizada que establece una nueva cantidad total, aplica inmediatamente la diferencia de existencia y genera su movimiento, razón y trazabilidad. | En el flujo vigente no queda una solicitud pendiente de aprobación: el usuario que ejecuta el ajuste queda registrado como creador y aprobador. No es una entrada ni una salida. |
| Razón de ajuste | Opción del catálogo que explica por qué se establece una nueva cantidad de stock. | **Stock inicial** se asigna automáticamente durante un alta. No sustituye las observaciones ni es el motivo interno de una corrección o cancelación de compra. |
| Movimiento | Registro inmutable del efecto de una entrada, salida, devolución, corrección o ajuste sobre existencias. | El documento explica el motivo; el movimiento demuestra el efecto. |
| Folio o referencia documental | Identificador legible y único que enlaza documentos y movimientos con su origen. | La interfaz usa **Folio** y el código `referenceNumber`; no sustituye el UUID técnico ni el número de factura o proyecto. |
| Estado | Situación general de un documento o registro. | Se distingue del estado de cumplimiento de una entrega. |
| Estado activo | Indicador de disponibilidad de un registro de catálogo para operaciones posteriores. | Activar o desactivar no elimina el registro, no cambia su identidad ni modifica sus existencias o historia. |
| Estado de compra | Situación derivada de una entrada: **Confirmada** mientras conserva detalles activos y **Cancelada** cuando todos sus detalles se cancelaron. | No se captura directamente. Corregir un detalle no cancela la compra y editar el encabezado no cambia el estado. |
| Estado de detalle de compra | Situación **Activo** o **Cancelado** de un renglón de entrada. | Un detalle corregido permanece activo; cancelar revierte su inventario, lo excluye de los totales activos y conserva su historia. |
| Estado de cumplimiento | Grado de surtimiento de una salida o detalle: **Pendiente**, **Surtido parcial**, **Surtido** o **Cancelado** según corresponda. | Se deriva de las cantidades surtidas y devueltas; no debe usarse como sinónimo de estado activo o de aprobación. |
| Tipo de movimiento | Clasificación del efecto registrado en inventario: entrada, salida, ajuste o devolución presentada a partir de su movimiento de reversa. | Describe el efecto sobre stock; no es el tipo de comprobante ni el estado del documento de origen. |

## Cantidades

| Término canónico | Definición compartida | Regla de uso |
| --- | --- | --- |
| Cantidad solicitada | Cantidad registrada como objetivo en un detalle de salida. | Es la base para validar acumulados de suministro y devolución. |
| Cantidad suministrada | Acumulado efectivamente entregado para un detalle. | No puede quedar incompatible con cantidad solicitada y devoluciones. |
| Cantidad devuelta | Acumulado reingresado después de un suministro. | Cada incremento requiere trazabilidad con su movimiento de reversa. |
| Cantidad convertida | Cantidad expresada mediante la conversión definida por el contexto del material o merma. | Debe nombrarse junto con la unidad o regla de conversión aplicable. |
| Cantidad de proyecto | Cantidad informada al surtir para comparar el consumo previsto por el proyecto con la cantidad convertida del detalle. | No sustituye la cantidad solicitada ni determina por sí sola cuánto stock se descuenta; la diferencia se conserva por separado. |
| Nueva cantidad | Existencia total que debe quedar después de un alta o ajuste. | Sustituye el stock vigente; no representa un incremento que Nexus sumará automáticamente. |
| Costo por presentación | Costo capturado para la cantidad expresada en la presentación de un detalle de compra. | Se usa para calcular los montos del renglón y el costo por unidad convertida; no es el costo máximo. |
| Monto sin/con IVA | Importe de un detalle o compra antes o después de aplicar el IVA utilizado por Nexus. | El monto con IVA se calcula a partir del monto sin IVA; ninguno representa una cantidad de inventario. |
| Existencia anterior/nueva | Valores antes y después de una mutación atómica. | Se conservan en movimientos o ajustes para explicar la diferencia. |

## Gobierno del glosario

1. Un requisito nuevo reutiliza primero un término canónico; no crea un sinónimo por
   módulo o pantalla.
2. Una diferencia real de contexto se expresa con un calificativo, por ejemplo «salida
   de material» y «salida de merma», y reutiliza el proceso común cuando corresponde.
3. El responsable funcional valida definiciones nuevas o ambiguas antes de aceptar el
   requisito. Desarrollo verifica su correspondencia con rutas, DTO, servicios y datos.
4. Cambiar el significado de un término obliga a revisar requisitos, casos de uso,
   [matriz de operaciones](requirements-operations-matrix.md), diagramas de dominio,
   contrato API, mensajes visibles y pruebas relacionadas.
5. El glosario no enumera todos los campos ni valores permitidos. Esos detalles se
   mantienen en el diccionario técnico, Prisma, validadores o catálogos según su fuente.
