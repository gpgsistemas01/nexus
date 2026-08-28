# Glosario del negocio y terminología común

## Propósito

Este glosario forma parte de la línea base de requisitos. Define el vocabulario que
usuarios, responsables funcionales, desarrollo y pruebas deben interpretar de la misma
forma. No es un inventario de columnas: el
[diccionario técnico de datos](generated/data-dictionary.md) describe nombres, tipos y
restricciones de Prisma, mientras este documento describe significado, alcance y
sinónimos aceptados en el negocio.

Una palabra usada con otro sentido en una historia, pantalla o reporte debe aclararse
antes de implementar el cambio. La definición funcional prevalece sobre un nombre
histórico del código; si ambos difieren, se registra el alias y se planifica la
alineación sin renombrar silenciosamente contratos existentes.

## Personas, acceso y responsabilidades

| Término canónico | Definición compartida | Alias o distinción importante |
| --- | --- | --- |
| Persona | Individuo que participa en un proceso del negocio, aun cuando no tenga credenciales para entrar a Nexus. | No es sinónimo de usuario. En código corresponde al concepto persistido `Person`. |
| Usuario | Cuenta autenticable que ejecuta acciones en Nexus y permite atribuir auditoría. Puede estar vinculada con una persona. | No se usa para nombrar genéricamente a cualquier solicitante o asesor. |
| Asignación de acceso | Combinación de rol y departamento asociada a un usuario o persona para describir su participación y calcular permisos. | No es por sí sola un permiso almacenado; los permisos se calculan con la política del servidor. |
| Rol | Responsabilidad organizacional considerada por la política de autorización. | No equivale a un caso de uso ni a un permiso individual. |
| Departamento | Área organizacional que aporta contexto y alcance a una asignación. | En documentos operativos puede conservarse también su nombre histórico. |
| Solicitante | Persona que origina o solicita un documento operativo. | Puede ser diferente del usuario que captura la operación. |
| Aprobador | Persona que autoriza una transición cuando el flujo lo requiere. | Que un modelo permita `approver` no implica que el flujo de aprobación esté disponible. |
| Asesor | Persona asociada como dato del contexto comercial de un cliente o salida. | No es actor ni usuario del sistema y no debe inferirse a partir del usuario autenticado. |
| Actor de auditoría | Usuario al que se atribuye una escritura o cambio crítico. | Puede conservarse como nulo únicamente en los casos técnicos previstos por la auditoría. |

## Catálogo, existencias y relaciones comerciales

| Término canónico | Definición compartida | Alias o distinción importante |
| --- | --- | --- |
| Material | Artículo base administrado en inventario, definido por nombre, presentación, unidad y reglas de existencia. | No representa por sí solo la existencia de un proveedor concreto. |
| Presentación | Forma comercial o física en que se identifica un material. | Es catálogo auxiliar; no es la unidad de medida. |
| Unidad de medida | Unidad y símbolo usados para expresar cantidades de un material. | Debe conservarse separada de factores o cantidades convertidas. |
| Proveedor | Organización que suministra materiales y participa en entradas de compra. | Sus nombres legal y comercial son datos distintos. |
| Oferta proveedor-material | Relación única entre proveedor y material que conserva SKU del proveedor, costo máximo y existencia asociada. | En código corresponde a `SupplierMaterial`; no es un material duplicado. |
| Existencia | Cantidad disponible de un recurso en un contexto identificable. | `stock` es el nombre técnico aceptado; toda modificación debe quedar explicada por un movimiento o ajuste permitido. |
| Merma | Existencia reutilizable o residual vinculada a una oferta proveedor-material y, cuando aplica, dimensiones propias. | En código aparece como `Waste`; no significa eliminación física ni salida de merma. |
| Cliente | Organización o contexto comercial receptor de una salida. Puede tener un asesor asociado. | No es lo mismo que proyecto. |
| Proyecto | Contexto de trabajo identificable que puede relacionarse con salidas. | Está modelado, pero su CRUD completo permanece pendiente. |

## Documentos y trazabilidad de inventario

| Término canónico | Definición compartida | Alias o distinción importante |
| --- | --- | --- |
| Documento operativo | Encabezado y detalles que registran una intención o hecho de inventario con referencia y estado. | Entrada, salida y ajuste tienen reglas propias; compartir estructura no iguala sus transiciones. |
| Requisición de compra | Solicitud planificada de materiales con eventual aprobación y entrega. | No forma parte del código ni del esquema vigente; requiere un nuevo alcance antes de reimplementarse. |
| Entrada de compra | Recepción de materiales de un proveedor que incrementa existencias y genera trazabilidad de movimiento. | En código se denomina `GoodsReceipt`; «compra» en la UI no sustituye la recepción efectiva. |
| Salida de material | Documento que solicita y suministra materiales a un cliente/proyecto, con posibilidad de devolución. | En código se denomina `GoodsIssue`. |
| Salida de merma | Documento que solicita y suministra existencias de merma, con posibilidad de devolución. | Reutiliza el patrón de salida, pero conserva stock y movimientos de merma separados. |
| Encabezado | Datos generales compartidos por todos los detalles de un documento, como actores, fechas, cliente, proyecto y observaciones. | Editar encabezado no equivale a cambiar cantidades de detalle. |
| Detalle | Renglón de un documento que identifica recurso, cantidad, importes o estado de cumplimiento. | Sus operaciones pueden requerir un permiso diferente del encabezado. |
| Suministro o entrega | Aplicación total o parcial de un detalle que afecta existencia y registra movimiento. | No es sinónimo de crear o editar el documento. |
| Devolución | Reingreso de una cantidad previamente suministrada, enlazado con documento, detalle y movimiento originales. | No elimina el suministro histórico. |
| Corrección | Cambio trazable de un detalle de entrada que conserva valor anterior, valor corregido, motivo y actor. | No es una edición silenciosa ni una devolución. |
| Cancelación | Transición que invalida un documento o detalle conforme a sus reglas, conservando su historia. | No implica eliminación física. |
| Ajuste de stock | Operación controlada que propone y, cuando se aprueba, aplica una diferencia de existencia con motivo y trazabilidad. | El modelo o servicio aislado no prueba que exista un flujo completo. |
| Movimiento | Registro inmutable del efecto de una entrada, salida, devolución, corrección o ajuste sobre existencias. | El documento explica el motivo; el movimiento demuestra el efecto. |
| Referencia documental | Identificador legible y único que enlaza documentos y movimientos con su origen. | No sustituye el UUID técnico. |
| Estado | Situación general de un documento o registro. | Se distingue del estado de cumplimiento de una entrega. |
| Estado de cumplimiento | Grado de suministro o atención de un documento/detalle. | No debe usarse como sinónimo de activo, cancelado o aprobado. |

## Cantidades

| Término canónico | Definición compartida | Regla de uso |
| --- | --- | --- |
| Cantidad solicitada | Cantidad registrada como objetivo en un detalle de salida. | Es la base para validar acumulados de suministro y devolución. |
| Cantidad suministrada | Acumulado efectivamente entregado para un detalle. | No puede quedar incompatible con cantidad solicitada y devoluciones. |
| Cantidad devuelta | Acumulado reingresado después de un suministro. | Cada incremento requiere trazabilidad con su movimiento de reversa. |
| Cantidad convertida | Cantidad expresada mediante la conversión definida por el contexto del material o merma. | Debe nombrarse junto con la unidad o regla de conversión aplicable. |
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
