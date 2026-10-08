# Glosario del negocio y terminología común

## Propósito

Este glosario forma parte del paquete versionado de requisitos, actualmente en revisión. Define el vocabulario que
usuarios, responsables funcionales, desarrollo y pruebas deben interpretar de la misma
forma. No es un inventario de columnas: el
[diccionario técnico de datos](../architecture/views/logical/data-and-persistence/generated/data-dictionary.md) describe nombres, tipos y
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
| Asignación organizacional | Vínculo de un rol y un área con una cuenta o persona, según su finalidad. | Concepto general del dominio; sus variantes son acceso de usuario y responsabilidad de persona. |
| Acceso de usuario | Asignación de rol y área a una cuenta que interviene en la determinación de sus permisos. | «Asignación de acceso» es alias aceptado; no es un permiso individual ni se concede por asignar responsabilidades a una persona. |
| Responsabilidad de persona | Asignación de rol y área que describe la participación organizacional de una persona. | No autoriza una cuenta ni convierte a la persona en usuario. |
| Rol | Responsabilidad organizacional considerada por la política de autorización. | No equivale a un caso de uso ni a un permiso individual. |
| Área o departamento | Área organizacional que aporta contexto y alcance a una asignación o salida. | La interfaz usa «Área» y el modelo técnico usa `Department`; no es un rol ni concede acceso por sí sola. |
| Permiso | Capacidad concreta que la política de autorización concede para consultar o ejecutar una operación cuando al menos una asignación combina un rol y un área admitidos. | No se deduce únicamente del nombre del rol, del área, de que una opción sea visible ni de que exista una ruta. Siempre se comprueba en el servidor. |
| Credencial | Dato o artefacto que permite probar una sesión, como usuario y contraseña al ingresar o los tokens emitidos al autenticar. | No es sinónimo de usuario, persona, rol ni permiso; no debe compartirse ni exponerse en documentación, capturas o registros. |
| Solicitante | Persona que origina o solicita un documento operativo. | Puede ser diferente del usuario que captura la operación. |
| Aprobador | Persona que autoriza una transición cuando el flujo lo requiere. | Que un modelo permita `approver` no implica que el flujo de aprobación esté disponible. |
| Persona que recibe | Persona a cuyo nombre se registra la recepción de una compra. | No es necesariamente el usuario que captura la entrada ni el proveedor que entrega el material. En código corresponde a `receivedBy`. |
| Personal de almacén | Actor funcional que mantiene catálogos y ejecuta operaciones de almacén cuando sus accesos le conceden el permiso correspondiente. | No es una persona concreta, un rol único ni el campo técnico `warehouseStaff`; cada operación conserva su propia política de autorización. |
| Administrador del sistema | Actor funcional del área Sistemas que administra identidades y catálogos y puede ejecutar las capacidades operativas vigentes, siempre sujeto a la autorización del servidor. | No equivale a omitir permisos ni a conceder acceso por el nombre de una cuenta; sus capacidades proceden de una asignación de acceso válida. |
| Asesor | Persona asociada como dato del contexto comercial de un cliente o salida. | No es actor ni usuario del sistema y no debe inferirse a partir del usuario autenticado. |
| Actor de auditoría | Usuario al que se atribuye una escritura o cambio crítico. | Puede conservarse como nulo únicamente en los casos técnicos previstos por la auditoría. |

## Catálogo, existencias y relaciones comerciales

| Término canónico | Definición compartida | Alias o distinción importante |
| --- | --- | --- |
| Artículo de compra | Concepto común que agrupa material y consumible, adquirido mediante una entrada de compra. | Clase abstracta del dominio; no incluye merma ni constituye un catálogo adicional. |
| Material | Artículo base administrado en inventario, definido por nombre, presentación, unidad y reglas de existencia. | No representa por sí solo la existencia de un proveedor concreto. |
| Contexto de inventario | Clasificación como material o consumible que delimita consultas, selectores y operaciones. | Es independiente del área organizacional y los permisos. |
| Identidad de material | Combinación de clasificación como material o consumible, nombre recortado y comparado sin distinguir mayúsculas, presentación, unidad de medida, base y altura que permite reconocer el mismo artículo aunque lo ofrezcan proveedores distintos. | Base y altura ocupan posiciones distintas y pueden omitirse sólo como pareja. El proveedor no forma parte de esta identidad: se conserva en la oferta proveedor-material. Cambiar existencia, cantidad convertida, costo máximo, stock mínimo o el estado activo de una oferta no crea otra identidad. |
| Dimensiones | Base y altura opcionales que caracterizan físicamente un material o una merma y participan en el cálculo de cantidad convertida. | No son cantidades de inventario. En textos operativos, «ancho» y «largo» se interpretan como los campos **Base** y **Altura** mostrados por Nexus. |
| Presentación | Forma comercial o física en que se identifica un material. | Es catálogo auxiliar; no es la unidad de medida. |
| Unidad de medida | Unidad y símbolo usados para expresar cantidades de un material. | Debe conservarse separada de factores o cantidades convertidas. |
| Consumible | Artículo clasificado explícitamente como consumible, sin dimensiones, con presentación y unidad de medida explícitas. | Conserva proveedor, costo y existencia mediante la oferta proveedor-material. Sus operaciones se separan de materiales. |
| Catálogo auxiliar | Conjunto controlado de opciones que clasifica o configura otros registros, como presentación, unidad, motivo o estado de cumplimiento. | Su lectura dentro de un selector operativo no concede mantenimiento; las seis variantes registradas sólo pueden administrarse por el administrador autorizado desde sus pantallas de mantenimiento. |
| Alta contextual | Creación de un registro desde el selector de otra operación para incorporarlo y seleccionarlo en el formulario de origen. | Reutiliza el alta autorizada, pero no concede acceso al listado independiente ni a las acciones de consulta, edición o reporte del catálogo. En el alcance vigente aplica a materiales o consumibles desde su compra correspondiente, proveedores desde formularios operativos y clientes desde una salida. |
| Proveedor | Organización que suministra materiales y participa en entradas de compra. | Sus nombres legal y comercial son datos distintos. |
| Oferta de proveedor | Relación única entre proveedor y material que conserva costo máximo, existencia y estado activo asociados. | «Oferta proveedor-material» es alias aceptado, también para consumibles. En código corresponde a `SupplierMaterial`; no duplica el artículo base. |
| Inventario | Vista de existencias de materiales o consumibles por proveedor, o de existencias independientes de merma. | No es un único saldo global: materiales, consumibles y mermas se consultan y reportan en contextos separados, aunque los consumibles reutilicen las relaciones y movimientos de `Material`. |
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
| Documento operativo | Registro de una intención o hecho de inventario con referencia y estado; puede contener encabezado y detalles según su tipo. | «Documento de inventario» es el concepto general usado en el dominio. Entradas, salidas y ajustes tienen estructuras y reglas propias. |
| Salida de artículos | Concepto común de las salidas de material y consumible. | Clase abstracta del dominio; cada documento mantiene un solo contexto, sin mezclar ambos tipos. No incluye salida de merma. |
| Entrada adicional de merma | Documento de incorporación de una cantidad positiva a una merma existente. | Corresponde a **Agregar stock**; no es compra ni ajuste que sustituya el saldo total. |
| Requisición de compra | Solicitud planificada de materiales con eventual aprobación y entrega. | No forma parte del código ni del esquema vigente; requiere un nuevo alcance antes de reimplementarse. |
| Entrada de compra | Recepción de materiales o consumibles de un proveedor que incrementa existencias y genera trazabilidad de movimiento. | En código se denomina `GoodsReceipt`; «compra» en la UI no sustituye la recepción efectiva. |
| Documento homogéneo | Compra o salida con detalles del mismo contexto que su cabecera. | Debe tener al menos un detalle; los cancelados conservan su clasificación. |
| Documento mixto | Documento histórico con detalles de materiales y consumibles. | Se conserva para regularización y queda excluido de las operaciones de ambos contextos. |
| Regularización de contexto | Corrección trazable de la coherencia entre la cabecera y sus detalles. | No hay un flujo de regularización implementado. |
| Tipo de comprobante | Selección que indica si una compra se recibe con factura o con remisión. | Controla si el número de factura debe capturarse; no es el estado de la compra. |
| Factura | Número de comprobante informado para una compra facturada. | No representa un flujo de facturación fiscal. Sólo puede identificar una compra por proveedor; una compra con remisión no lleva número de factura. |
| Remisión | Tipo de comprobante usado para registrar una compra que no se recibe con factura. | No es una factura pendiente ni requiere un número de factura. |
| Salida de material | Documento que solicita y suministra materiales a un cliente/proyecto, con posibilidad de devolución. | En código se denomina `GoodsIssue`. |
| Salida de consumible | Documento para solicitar, surtir y devolver consumibles a un cliente o proyecto. | Comparte el proceso de `GoodsIssue`, con catálogo y existencias de consumibles. |
| Salida de merma | Documento que solicita y suministra existencias de merma, con posibilidad de devolución. | Reutiliza el patrón de salida, pero conserva stock y movimientos de merma separados. |
| Encabezado | Datos generales compartidos por todos los detalles de un documento, como actores, fechas, cliente, proyecto y observaciones. | Editar encabezado no equivale a cambiar cantidades de detalle. |
| Detalle | Renglón de un documento que identifica recurso, cantidad, importes o estado de cumplimiento. | Sus operaciones pueden requerir un permiso diferente del encabezado. |
| Suministro o entrega | Entrega de toda la cantidad pendiente de uno o varios detalles, con descuento de existencia y registro de movimiento. | Una salida queda parcialmente surtida si quedan otros detalles pendientes; no es sinónimo de crear o editar el documento. |
| Devolución | Operación que reingresa una cantidad previamente suministrada y la enlaza con documento, detalle y movimiento originales. | Puede ser parcial o total, no elimina el suministro histórico y no es una acción directa de cancelación. |
| Corrección | Cambio trazable de un detalle de entrada que conserva valor anterior, valor corregido, motivo y actor. | No es una edición silenciosa ni una devolución. |
| Cancelación | Transición que invalida un documento o detalle conforme a sus reglas, conservando su historia. | En salidas es un resultado derivado: la devolución total cancela el detalle y sólo la cancelación de todos los detalles cancela el encabezado; no existe una acción ni un endpoint de cancelación directa. |
| Ajuste de stock | Operación autorizada que establece una nueva cantidad total, aplica inmediatamente la diferencia de existencia y genera su movimiento, razón y trazabilidad. | En el flujo vigente no queda una solicitud pendiente de aprobación: el usuario que ejecuta el ajuste queda registrado como creador y aprobador. No es una entrada ni una salida. |
| Razón de ajuste | Opción del catálogo que explica por qué se establece una nueva cantidad de stock. | **Stock inicial** se asigna automáticamente durante un alta. No sustituye las observaciones ni es el motivo interno de una corrección o cancelación de compra. |
| Efecto de inventario | Cambio de existencia de un recurso ocasionado por una operación confirmada, con cantidad anterior y posterior. | Un movimiento puede reunir efectos sobre varios recursos. Cada efecto corresponde a una oferta de proveedor o a una merma, no a ambas. |
| Trazabilidad | Posibilidad de seguir la relación entre operación, documento, cantidades, participantes e historia conservada. | No implica asignar entregas a compras concretas sin lotes ni garantiza auditoría exhaustiva. |
| Auditoría | Evidencia que permite revisar quién ejecutó una acción, cuándo y qué cambió, con el alcance disponible. | La persona participante no sustituye al usuario que ejecutó la acción; su cobertura tiene brechas documentadas. |
| Datos históricos | Valores conservados para interpretar una operación tal como se registró. | «Snapshot» es alias técnico; un cambio posterior del catálogo no debe reinterpretar el documento histórico. |
| Movimiento | Registro inmutable del efecto de una entrada, salida, devolución, corrección o ajuste sobre existencias. | El documento de origen explica la operación y el movimiento demuestra su efecto. Los movimientos forman un historial por recurso y saldo; no asignan una salida a una entrada específica cuando no existen lotes o partidas. |
| Folio o referencia documental | Identificador legible y único que enlaza documentos y movimientos con su origen. | La interfaz usa **Folio** y el código `referenceNumber`; no sustituye el UUID técnico ni el número de factura o proyecto. |
| Estado | Situación general de un documento o registro. | Se distingue del estado de cumplimiento de una entrega. |
| Estado activo | Indicador de disponibilidad de un registro de catálogo para operaciones posteriores. | Activar o desactivar no elimina el registro, no cambia su identidad ni modifica sus existencias o historia. |
| Estado de compra | Situación derivada de una entrada: **Confirmada** mientras conserva detalles activos y **Cancelada** cuando todos sus detalles se cancelaron. | No se captura directamente. Corregir un detalle no cancela la compra y editar el encabezado no cambia el estado. |
| Estado de detalle de compra | Situación **Activo** o **Cancelado** de un renglón de entrada. | Un detalle corregido permanece activo; cancelar revierte su inventario, lo excluye de los totales activos y conserva su historia. |
| Estado de cumplimiento | Grado de surtimiento de una salida o detalle: **Pendiente**, **Surtido parcial**, **Surtido** o **Cancelado** para la salida; el detalle usa **Pendiente**, **Surtido** y **Cancelado**. | El cumplimiento parcial indica que quedan otros detalles pendientes. Se deriva de suministros y devoluciones; no es estado activo ni aprobación. |
| Tipo de movimiento | Clasificación del efecto registrado en inventario: entrada, salida, ajuste o devolución presentada a partir de su movimiento de reversa. | Describe el efecto sobre stock; no es el tipo de comprobante ni el estado del documento de origen. |

## Cantidades

| Término canónico | Definición compartida | Regla de uso |
| --- | --- | --- |
| Cantidad solicitada | Cantidad registrada como objetivo en un detalle de salida. | Es la base para validar acumulados de suministro y devolución. |
| Cantidad pendiente de surtir | Cantidad solicitada menos la cantidad ya suministrada del detalle. | Se entrega completa al surtir el detalle; una devolución no vuelve a abrirlo como pendiente. |
| Cantidad suministrada | Acumulado efectivamente entregado para un detalle. | No puede quedar incompatible con cantidad solicitada y devoluciones. |
| Cantidad devuelta | Acumulado reingresado después de un suministro. | Cada incremento requiere trazabilidad con su movimiento de reversa. |
| Saldo entregado | Cantidad suministrada de un detalle menos sus devoluciones anteriores. | Es el máximo disponible para una nueva devolución; no es existencia de almacén ni cantidad pendiente de surtir. |
| Cantidad convertida | Cantidad expresada mediante la conversión definida por el contexto del material o merma. | Debe nombrarse junto con la unidad o regla de conversión aplicable. |
| Cantidad de proyecto | Cantidad informada al surtir para comparar el consumo previsto por el proyecto con la cantidad convertida del detalle. | No sustituye la cantidad solicitada ni determina por sí sola cuánto stock se descuenta; la diferencia se conserva por separado. |
| Cantidad a agregar | Cantidad positiva que se suma a la existencia vigente mediante **Agregar stock** de una merma y queda respaldada por un documento individual de entrada y su movimiento. | Es incremental: no representa el saldo final, no requiere una razón de ajuste y no sustituye una entrada de compra ni **Ajustar stock**. |
| Nueva cantidad | Existencia total que debe quedar después de un alta o ajuste. | Sustituye el stock vigente; no representa un incremento que Nexus sumará automáticamente. |
| Costo por presentación | Costo capturado para la cantidad expresada en la presentación de un detalle de compra. | Se usa para calcular los montos del renglón y el costo por unidad convertida; no es el costo máximo. |
| Monto sin/con IVA | Importe de un detalle o compra antes o después de aplicar el impuesto al valor agregado (IVA) utilizado por Nexus. | El monto con IVA se calcula a partir del monto sin IVA; ninguno representa una cantidad de inventario. |
| Existencia anterior/nueva | Valores antes y después de una operación confirmada que afecta inventario. | Se conservan en movimientos o ajustes para explicar la diferencia. |

## Requisitos, alcance y representación

| Término canónico | Definición compartida | Distinción importante |
| --- | --- | --- |
| Parte interesada | Persona, grupo u organización con necesidades o preocupaciones sobre el producto. | No toda parte interesada es usuario o actor de un caso de uso. |
| Actor de caso de uso | Papel externo que interactúa con Nexus para alcanzar un objetivo. | Puede generalizar otro papel; no representa una entidad de datos ni una pantalla. |
| Objetivo de negocio | Resultado de valor que justifica el producto o una capacidad. | Una capacidad implementada no demuestra una meta alcanzada; requiere indicadores acordados. |
| Alcance vigente | Capacidades y límites incluidos actualmente en el producto. | Un concepto modelado o una propuesta no equivalen a una capacidad disponible. |
| Supuesto | Condición que se toma como base para analizar u operar y debe confirmarse. | No es un hecho verificado ni un requisito aprobado por sí mismo. |
| Dependencia | Condición, dato o servicio necesario para una capacidad u operación. | Su disponibilidad y responsabilidad requieren revisión. |
| Restricción | Límite que condiciona una solución u operación. | Debe tener fuente; no se deduce de una preferencia de implementación. |
| Riesgo | Posible situación que afecta un objetivo o la operación. | No es un incidente ya ocurrido; las decisiones abiertas pueden dejar riesgos sin tratar. |
| SRS | Especificación de requisitos de software que conserva obligaciones, reglas, criterios, estados y trazabilidad. | Complementa visión y alcance; no equivale a arquitectura ni a código. |
| Requisito | Obligación identificada y verificable sobre una capacidad, dato, regla o calidad. | Su fuente normativa es la SRS; el código aporta evidencia, no aceptación funcional. |
| Criterio de aceptación | Condición observable que permite comprobar el cumplimiento de un requisito o resultado acordado. | Aprobar pruebas técnicas no sustituye la aceptación de negocio. |
| Línea base de requisitos | Conjunto versionado y aprobado de requisitos y vocabulario usado como referencia para cambios. | Un paquete En revisión es una propuesta; su versionado no demuestra aceptación funcional. |
| Guarda | Condición que debe cumplirse para tomar una transición de estado. | Se representa entre corchetes; no es una acción ni su efecto. |
| Efecto de transición | Resultado de ejecutar una transición, por ejemplo incorporar, descontar o reponer existencia. | Puede nombrarse brevemente y definirse en una leyenda; no exige código de programación. |
| SLA | Acuerdo de nivel de servicio con medidas y compromisos aceptados. | Nexus no tiene aquí valores comprometidos; están pendientes de acuerdo. |
| RTO | Objetivo de tiempo de recuperación del servicio después de una interrupción. | Es un objetivo por acordar, no un tiempo demostrado. |
| RPO | Objetivo de pérdida máxima de datos expresada como intervalo entre el último punto recuperable y la interrupción. | Es distinto de RTO; requiere política y medios de recuperación acordados. |

El modelo conceptual puede omitir atributos cuando su propósito es explicar conceptos
y relaciones. Si una característica resulta imprescindible para distinguir un concepto
o entender una regla, se incorpora como atributo de negocio en una vista que lo requiera,
sin copiar identificadores, claves o estructuras internas de la base de datos.

## Gobierno del glosario

1. Un requisito nuevo reutiliza primero un término canónico; no crea un sinónimo por
   módulo o pantalla.
2. Una diferencia real de contexto se expresa con un calificativo, por ejemplo «salida
   de material», «salida de consumible» y «salida de merma», y reutiliza el proceso común cuando corresponde.
3. El responsable funcional valida definiciones nuevas o ambiguas antes de aceptar el
   requisito. Desarrollo verifica su correspondencia con rutas, DTO, servicios y datos.
4. Cambiar el significado de un término obliga a revisar requisitos, casos de uso,
   [modos y efectos de las operaciones](requirements-specification/06-operation-modes-and-effects.md),
   diagramas de dominio, contrato API, mensajes visibles y pruebas relacionadas.
5. El glosario no enumera todos los campos ni valores permitidos. Esos detalles se
   mantienen en el diccionario técnico, Prisma, validadores o catálogos según su fuente.
