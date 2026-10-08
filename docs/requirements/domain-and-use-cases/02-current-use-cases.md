# 2. Casos de uso vigentes

Los diagramas usan la notación de casos de uso de Mermaid 12 (`usecase-beta`):
actores fuera del límite de Nexus, óvalos para objetivos y asociaciones del actor con
el caso de consulta de cada recurso. Las asociaciones directas con otras operaciones
se reservan para situaciones particulares justificadas en las fichas normativas.
La generalización apunta del actor especializado al general con un triángulo hueco. Las asociaciones expresan participación funcional; cada operación
conserva sus comprobaciones de permiso en el servidor. Los enlaces sin etiqueta desde
Consulta conservan la organización visual por recurso del documento; no representan
inclusión, extensión, generalización ni herencia de actores. `«include»` y `«extend»` se reservan para
comportamientos y puntos de extensión explícitos en las fichas normativas.
Ventas y Dirección no son actores con acceso vigente; su participación futura sigue
pendiente de definición. La visualización Markdown requiere un visor con Mermaid 12;
la exportación usa el renderizador compatible preparado por el proyecto.

Los participantes, precondiciones, garantías, pasos, alternativas y excepciones de cada
objetivo se detallan por tema en el
[catálogo de descripciones de casos de uso](../use-cases/index.md).
La vista se divide en bloques por grupo funcional para mantenerla legible. Estos bloques
no son paquetes UML ni paquetes documentales: el único límite de sistema es Nexus. Cada
bloque conserva los actores fuera del sistema y presenta los casos de su grupo
propietario. Compras y Salidas incluyen referencias a casos de otros grupos cuando
intervienen como extensiones; la repetición del identificador no crea otro caso.
Cada óvalo conserva únicamente el identificador y el nombre normativo del objetivo.
El grupo propietario y la condición de referencia se explican en el texto y en la
tabla de extensiones, sin añadir esas aclaraciones a la etiqueta del caso.
Las asociaciones con las consultas se muestran para el actor autorizado; las operaciones se despliegan desde la consulta.
Se conservan los enlaces directos que distinguen casos exclusivos del administrador
o altas desde selectores. El administrador hereda las asociaciones de Almacén mediante
generalización, sin duplicarlas.

La separación en vistas es una decisión de legibilidad, no una exigencia de UML. Un
único diagrama con los 85 casos y todas las asociaciones dificultaría su revisión. Las
relaciones se muestran junto al caso base y no en una vista independiente que obligue a
reconstruirlas entre diagramas. La jerarquía de autenticación enlaza Personal de almacén con Usuario registrado y
Administrador del sistema con Personal de almacén. La generalización operativa se
repite en las figuras que muestran ambos actores. Las asociaciones compartidas se
muestran sólo en el actor general: el administrador las hereda sin repetirlas y puede
además asociarse con sus casos exclusivos. Así, Personal de almacén participa en la
consulta, mientras el administrador hereda esa participación y se asocia directamente
con Ajustar existencia. No hay un enlace desde la consulta compartida hacia el ajuste.
La generalización no lleva palabra adicional, sólo el triángulo hueco hacia el actor
general.

Se conservan seis grupos funcionales propietarios porque representan capacidades estables del
negocio: autenticación, identidad y acceso, almacén, catálogos, compras de materiales y consumibles y
salidas. Las consultas y exportaciones se integran en el grupo del recurso que las
origina; no forman un paquete funcional independiente. Dividirlos otra vez en nuevos
grupos por cada entidad fragmentaría procesos que comparten actor, reglas y ciclo
operativo; agruparlos sólo por acción mezclaría entidades con validaciones distintas.
Dentro de cada grupo los objetivos se ordenan por entidad o documento.
Esta organización conserva identificadores y no fusiona casos de uso. Cada grupo
se divide en figuras por recurso para que los óvalos sigan siendo legibles al exportar;
cada figura muestra una parte del mismo límite de Nexus y no crea otro sistema.
Mermaid no admite límites anidados en `usecase-beta`.
La decisión y las familias resultantes se resumen en el
[criterio de agrupación vigente](../use-cases/index.md#criterio-de-agrupación-vigente).

### Numeración y orden de lectura

Los 85 casos conservan una secuencia continua dentro de cada grupo propietario:
`AUT` 01–02, `IDA` 01–09, `ALM` 01–22, `CAT` 01–26, `ENT` 01–12 y `SAL` 01–14.
Las veinte figuras no reinician ni cambian esa numeración. Por ejemplo, Materiales
presenta `CU-ALM-01` a `CU-ALM-06`, Movimientos de materiales continúa con
`CU-ALM-07` y `CU-ALM-08`, y Mermas comienza en `CU-ALM-09`.

El catálogo, las fichas y las declaraciones de casos en los diagramas conservan el
mismo orden: Consulta, Crear o Registrar, Editar, operaciones particulares del recurso
y Reporte. En Movimientos sólo corresponden Consulta y Reporte; Autenticación conserva
Inicio y Cierre de sesión. Los casos referenciados como extensiones mantienen el número
de su grupo propietario, aunque aparezcan dentro de otra figura.

La ubicación de los óvalos responde a la distribución de las relaciones en Mermaid;
no establece un recorrido obligatorio ni cambia el orden de las fichas. Un diagrama de
casos de uso muestra objetivos y participación, no una secuencia de ejecución.
Se mantienen varias figuras por grupo para conservar la legibilidad de las operaciones
y actores: agrupar todos los casos en una sola figura no es una exigencia de UML.

### Grupo funcional AUT — Autenticación

```mermaid
usecase-beta
direction LR
    actor user("Usuario registrado")
    actor warehouse("Personal de almacén")
    actor admin("Administrador del sistema")
    warehouse --|> user
    admin --|> warehouse

    systemBoundary authPackage1["Nexus · Autenticación"]
        ucLogin("CU-AUT-01 Iniciar sesión")
        ucLogout("CU-AUT-02 Cerrar sesión")
    end

    user -- ucLogin
    user -- ucLogout
```

### Grupo funcional IDA — Identidad y acceso

#### Personas

```mermaid
usecase-beta
direction LR
    actor warehouse("Personal de almacén")
    actor admin("Administrador del sistema")
    admin --|> warehouse

    systemBoundary identityPackage1["Nexus · Personas"]
        ucPersonQuery("CU-IDA-01 Consultar personas")
        ucPersonCreate("CU-IDA-02 Crear persona")
        ucPersonEdit("CU-IDA-03 Editar persona")
        ucPersonReport("CU-IDA-04 Generar reporte de personas")
    end

    warehouse -- ucPersonQuery

    ucPersonQuery -- ucPersonCreate
    ucPersonQuery -- ucPersonEdit
    ucPersonQuery -- ucPersonReport
```

#### Usuarios y credenciales

```mermaid
usecase-beta
direction LR
    actor admin("Administrador del sistema")

    systemBoundary identityPackage2["Nexus · Usuarios y credenciales"]
        ucUserQuery("CU-IDA-05 Consultar usuarios")
        ucUserCreate("CU-IDA-06 Crear usuario y asignar acceso")
        ucUserEdit("CU-IDA-07 Editar usuario y acceso")
        ucPasswordEdit("CU-IDA-08 Cambiar contraseña de usuario")
        ucUserReport("CU-IDA-09 Generar reporte de usuarios")
    end

    admin -- ucUserQuery

    ucUserQuery -- ucUserCreate
    ucUserQuery -- ucUserEdit
    ucUserQuery -- ucPasswordEdit
    ucUserQuery -- ucUserReport
```

### Grupo funcional ALM — Almacén

#### Materiales

```mermaid
usecase-beta
direction LR
    actor warehouse("Personal de almacén")
    actor admin("Administrador del sistema")
    admin --|> warehouse

    systemBoundary warehousePackage1["Nexus · Materiales"]
        ucMaterialQuery("CU-ALM-01 Consultar materiales")
        ucMaterialCreate("CU-ALM-02 Crear material")
        ucMaterialEdit("CU-ALM-03 Editar material")
        ucMaterialRemove("CU-ALM-04 Retirar material")
        ucMaterialStock("CU-ALM-05 Ajustar existencia de material")
        ucMaterialInventoryReport("CU-ALM-06 Generar reporte de inventario de materiales")
    end

    warehouse -- ucMaterialQuery
    admin -- ucMaterialStock

    ucMaterialQuery -- ucMaterialCreate
    ucMaterialQuery -- ucMaterialEdit
    ucMaterialQuery -- ucMaterialRemove
    ucMaterialQuery -- ucMaterialInventoryReport
```

#### Movimientos de materiales

La consulta de movimientos es independiente de la consulta de materiales. Sólo el
Administrador del sistema del área Sistemas accede a ella; su reporte parte de esta
consulta de movimientos.

```mermaid
usecase-beta
direction LR
    actor admin("Administrador del sistema")

    systemBoundary materialMovementsPackage["Nexus · Movimientos de materiales"]
        ucMaterialMovements("CU-ALM-07 Consultar movimientos de materiales")
        ucMaterialMovementReport("CU-ALM-08 Generar reporte de movimientos de materiales")
    end

    admin -- ucMaterialMovements
    ucMaterialMovements -- ucMaterialMovementReport
```

#### Mermas

```mermaid
usecase-beta
direction LR
    actor warehouse("Personal de almacén")
    actor admin("Administrador del sistema")
    admin --|> warehouse

    systemBoundary warehousePackage2["Nexus · Mermas"]
        ucWasteQuery("CU-ALM-09 Consultar mermas")
        ucWasteCreate("CU-ALM-10 Registrar merma")
        ucWasteEdit("CU-ALM-11 Editar merma")
        ucWasteStock("CU-ALM-12 Ajustar existencia de merma")
        ucWasteAddStock("CU-ALM-13 Agregar existencia de merma")
        ucWasteReport("CU-ALM-14 Generar reporte de mermas")
    end

    warehouse -- ucWasteQuery
    admin -- ucWasteStock

    ucWasteQuery -- ucWasteCreate
    ucWasteQuery -- ucWasteEdit
    ucWasteQuery -- ucWasteAddStock
    ucWasteQuery -- ucWasteReport
```

#### Movimientos de mermas

La consulta de movimientos es independiente de la consulta de mermas. Sólo el
Administrador del sistema del área Sistemas accede a ella; su reporte parte de esta
consulta de movimientos.

```mermaid
usecase-beta
direction LR
    actor admin("Administrador del sistema")

    systemBoundary wasteMovementsPackage["Nexus · Movimientos de mermas"]
        ucWasteMovements("CU-ALM-15 Consultar movimientos de mermas")
        ucWasteMovementReport("CU-ALM-16 Generar reporte de movimientos de mermas")
    end

    admin -- ucWasteMovements
    ucWasteMovements -- ucWasteMovementReport
```

#### Consumibles

```mermaid
usecase-beta
direction LR
    actor warehouse("Personal de almacén")
    actor admin("Administrador del sistema")
    admin --|> warehouse

    systemBoundary warehousePackage3["Nexus · Consumibles"]
        ucConsumableQuery("CU-ALM-17 Consultar consumibles")
        ucConsumableCreate("CU-ALM-18 Crear consumible")
        ucConsumableEdit("CU-ALM-19 Editar consumible")
        ucConsumableRemove("CU-ALM-20 Retirar consumible")
        ucConsumableStock("CU-ALM-21 Ajustar existencia de consumible")
        ucConsumableReport("CU-ALM-22 Generar reporte de inventario de consumibles")
    end

    warehouse -- ucConsumableQuery
    admin -- ucConsumableStock

    ucConsumableQuery -- ucConsumableCreate
    ucConsumableQuery -- ucConsumableEdit
    ucConsumableQuery -- ucConsumableRemove
    ucConsumableQuery -- ucConsumableReport
```

El grupo de **Almacén** concentra los casos operativos de material, consumible y merma porque comparten
actor, reglas de inventario, ciclo de consulta y operación sobre la misma área funcional.
Los recursos comerciales y de configuración quedan para `CAT`, mientras los documentos de
entrada y salida mantienen su propio grupo de negocio. Los identificadores vigentes de este
grupo usan la familia estable `CU-ALM-*`.

### Grupo funcional CAT — Catálogos

#### Proveedores

```mermaid
usecase-beta
direction LR
    actor admin("Administrador del sistema")
    actor warehouse("Personal de almacén")
    admin --|> warehouse

    systemBoundary catalogPackage1["Nexus · Proveedores"]
        ucSupplierQuery("CU-CAT-01 Consultar proveedores")
        ucSupplierCreate("CU-CAT-02 Crear proveedor")
        ucSupplierEdit("CU-CAT-03 Editar proveedor")
        ucSupplierReport("CU-CAT-04 Generar reporte de proveedores")
    end

    admin -- ucSupplierQuery
    warehouse -- ucSupplierCreate

    ucSupplierQuery -- ucSupplierCreate
    ucSupplierQuery -- ucSupplierEdit
    ucSupplierQuery -- ucSupplierReport
```

#### Clientes

```mermaid
usecase-beta
direction LR
    actor admin("Administrador del sistema")
    actor warehouse("Personal de almacén")
    admin --|> warehouse

    systemBoundary catalogPackage2["Nexus · Clientes"]
        ucClientQuery("CU-CAT-05 Consultar clientes")
        ucClientCreate("CU-CAT-06 Crear cliente")
        ucClientEdit("CU-CAT-07 Editar cliente")
        ucClientReport("CU-CAT-08 Generar reporte de clientes")
    end

    admin -- ucClientQuery
    warehouse -- ucClientCreate

    ucClientQuery -- ucClientCreate
    ucClientQuery -- ucClientEdit
    ucClientQuery -- ucClientReport
```

#### Áreas

```mermaid
usecase-beta
direction LR
    actor admin("Administrador del sistema")

    systemBoundary catalogPackage3["Nexus · Áreas"]
        ucAreaQuery("CU-CAT-09 Consultar área")
        ucAreaCreate("CU-CAT-10 Crear área")
        ucAreaEdit("CU-CAT-11 Editar área")
    end

    admin -- ucAreaQuery

    ucAreaQuery -- ucAreaCreate
    ucAreaQuery -- ucAreaEdit
```

#### Roles

```mermaid
usecase-beta
direction LR
    actor admin("Administrador del sistema")

    systemBoundary catalogPackage4["Nexus · Roles"]
        ucRoleQuery("CU-CAT-12 Consultar rol")
        ucRoleCreate("CU-CAT-13 Crear rol")
        ucRoleEdit("CU-CAT-14 Editar rol")
    end

    admin -- ucRoleQuery

    ucRoleQuery -- ucRoleCreate
    ucRoleQuery -- ucRoleEdit
```

#### Presentaciones

```mermaid
usecase-beta
direction LR
    actor admin("Administrador del sistema")

    systemBoundary catalogPackage5["Nexus · Presentaciones"]
        ucPresentationQuery("CU-CAT-15 Consultar presentación")
        ucPresentationCreate("CU-CAT-16 Crear presentación")
        ucPresentationEdit("CU-CAT-17 Editar presentación")
    end

    admin -- ucPresentationQuery

    ucPresentationQuery -- ucPresentationCreate
    ucPresentationQuery -- ucPresentationEdit
```

#### Unidades de medida

```mermaid
usecase-beta
direction LR
    actor admin("Administrador del sistema")

    systemBoundary catalogPackage6["Nexus · Unidades de medida"]
        ucUnitMeasureQuery("CU-CAT-18 Consultar unidad de medida")
        ucUnitMeasureCreate("CU-CAT-19 Crear unidad de medida")
        ucUnitMeasureEdit("CU-CAT-20 Editar unidad de medida")
    end

    admin -- ucUnitMeasureQuery

    ucUnitMeasureQuery -- ucUnitMeasureCreate
    ucUnitMeasureQuery -- ucUnitMeasureEdit
```

#### Motivos de ajuste

```mermaid
usecase-beta
direction LR
    actor admin("Administrador del sistema")

    systemBoundary catalogPackage7["Nexus · Motivos de ajuste"]
        ucAdjustmentReasonQuery("CU-CAT-21 Consultar motivo de ajuste")
        ucAdjustmentReasonCreate("CU-CAT-22 Crear motivo de ajuste")
        ucAdjustmentReasonEdit("CU-CAT-23 Editar motivo de ajuste")
    end

    admin -- ucAdjustmentReasonQuery

    ucAdjustmentReasonQuery -- ucAdjustmentReasonCreate
    ucAdjustmentReasonQuery -- ucAdjustmentReasonEdit
```

#### Estados de cumplimiento

```mermaid
usecase-beta
direction LR
    actor admin("Administrador del sistema")

    systemBoundary catalogPackage8["Nexus · Estados de cumplimiento"]
        ucFulfillmentStatusQuery("CU-CAT-24 Consultar estado de cumplimiento")
        ucFulfillmentStatusCreate("CU-CAT-25 Crear estado de cumplimiento")
        ucFulfillmentStatusEdit("CU-CAT-26 Editar estado de cumplimiento")
    end

    admin -- ucFulfillmentStatusQuery

    ucFulfillmentStatusQuery -- ucFulfillmentStatusCreate
    ucFulfillmentStatusQuery -- ucFulfillmentStatusEdit
```

Las consultas, edición y reportes de **Proveedores** y **Clientes** se asocian
con el Administrador. Personal de almacén participa únicamente en sus altas desde
selectores operativos. Los seis catálogos auxiliares se asocian con el Administrador
y exigen `catalogs:manage`. Las lecturas que sólo alimentan controles de selección
son soporte de otros objetivos y no nuevos casos de uso.

### Grupo funcional ENT — Compras de materiales y consumibles

#### Compras de materiales

```mermaid
usecase-beta
direction LR
    actor warehouse("Personal de almacén")
    actor admin("Administrador del sistema")
    admin --|> warehouse

    systemBoundary receiptPackage1["Nexus · Compras de materiales"]
        ucReceiptQuery("CU-ENT-01 Consultar compras de material")
        ucReceiptCreate("CU-ENT-02 Crear compra de material")
        ucReceiptEdit("CU-ENT-03 Editar compra de material")
        ucReceiptCorrect("CU-ENT-04 Corregir material de una compra")
        ucReceiptCancel("CU-ENT-05 Cancelar material de una compra")
        ucPurchaseReport("CU-ENT-06 Generar reporte de compras de material")
        supplierExtension("CU-CAT-02 Crear proveedor")
        materialExtension("CU-ALM-02 Crear material")
    end

    supplierExtension ..>:extend ucReceiptCreate
    materialExtension ..>:extend ucReceiptCreate

    warehouse -- ucReceiptQuery
    warehouse -- supplierExtension
    warehouse -- materialExtension

    ucReceiptQuery -- ucReceiptCreate
    ucReceiptQuery -- ucReceiptEdit
    ucReceiptQuery -- ucReceiptCorrect
    ucReceiptQuery -- ucReceiptCancel
    ucReceiptQuery -- ucPurchaseReport
```

#### Compras de consumibles

```mermaid
usecase-beta
direction LR
    actor warehouse("Personal de almacén")
    actor admin("Administrador del sistema")
    admin --|> warehouse

    systemBoundary receiptPackage2["Nexus · Compras de consumibles"]
        ucConsumableReceiptQuery("CU-ENT-07 Consultar compras de consumible")
        ucConsumableReceiptCreate("CU-ENT-08 Crear compra de consumible")
        ucConsumableReceiptEdit("CU-ENT-09 Editar compra de consumible")
        ucConsumableReceiptCorrect("CU-ENT-10 Corregir consumible de una compra")
        ucConsumableReceiptCancel("CU-ENT-11 Cancelar consumible de una compra")
        ucConsumablePurchaseReport("CU-ENT-12 Generar reporte de compras de consumible")
        supplierExtension("CU-CAT-02 Crear proveedor")
        consumableExtension("CU-ALM-18 Crear consumible")
    end

    supplierExtension ..>:extend ucConsumableReceiptCreate
    consumableExtension ..>:extend ucConsumableReceiptCreate

    warehouse -- ucConsumableReceiptQuery
    warehouse -- supplierExtension
    warehouse -- consumableExtension

    ucConsumableReceiptQuery -- ucConsumableReceiptCreate
    ucConsumableReceiptQuery -- ucConsumableReceiptEdit
    ucConsumableReceiptQuery -- ucConsumableReceiptCorrect
    ucConsumableReceiptQuery -- ucConsumableReceiptCancel
    ucConsumableReceiptQuery -- ucConsumablePurchaseReport
```

### Grupo funcional SAL — Salidas de materiales, consumibles y mermas

Consumibles sigue los recorridos `CU-SAL-01` a `CU-SAL-07` con pantalla,
rutas y recursos propios, y las mismas transiciones de estado.

#### Salidas de materiales

```mermaid
usecase-beta
direction LR
    actor warehouse("Personal de almacén")
    actor admin("Administrador del sistema")
    admin --|> warehouse

    systemBoundary issuePackage1["Nexus · Salidas de materiales"]
        ucMaterialIssueQuery("CU-SAL-01 Consultar salidas de material")
        ucMaterialIssueCreate("CU-SAL-02 Crear salida de material")
        ucMaterialIssueHeader("CU-SAL-03 Editar encabezado de salida de material")
        ucMaterialIssueDetails("CU-SAL-04 Editar detalles de material de una salida")
        ucMaterialSupply("CU-SAL-05 Surtir material")
        ucMaterialReturn("CU-SAL-06 Devolver material surtido")
        ucMaterialIssueReport("CU-SAL-07 Generar reporte de salidas de material")
        clientExtension("CU-CAT-06 Crear cliente")
    end

    clientExtension ..>:extend ucMaterialIssueCreate

    warehouse -- ucMaterialIssueQuery
    warehouse -- clientExtension

    ucMaterialIssueQuery -- ucMaterialIssueCreate
    ucMaterialIssueQuery -- ucMaterialIssueHeader
    ucMaterialIssueQuery -- ucMaterialIssueDetails
    ucMaterialIssueQuery -- ucMaterialSupply
    ucMaterialIssueQuery -- ucMaterialReturn
    ucMaterialIssueQuery -- ucMaterialIssueReport
```

#### Salidas de mermas

```mermaid
usecase-beta
direction LR
    actor warehouse("Personal de almacén")
    actor admin("Administrador del sistema")
    admin --|> warehouse

    systemBoundary issuePackage2["Nexus · Salidas de mermas"]
        ucWasteIssueQuery("CU-SAL-08 Consultar salidas de merma")
        ucWasteIssueCreate("CU-SAL-09 Crear salida de merma")
        ucWasteIssueHeader("CU-SAL-10 Editar encabezado de salida de merma")
        ucWasteIssueDetails("CU-SAL-11 Editar detalles de merma de una salida")
        ucWasteSupply("CU-SAL-12 Surtir merma")
        ucWasteReturn("CU-SAL-13 Devolver merma surtida")
        ucWasteIssueReport("CU-SAL-14 Generar reporte de salidas de merma")
    end

    warehouse -- ucWasteIssueQuery

    ucWasteIssueQuery -- ucWasteIssueCreate
    ucWasteIssueQuery -- ucWasteIssueHeader
    ucWasteIssueQuery -- ucWasteIssueDetails
    ucWasteIssueQuery -- ucWasteSupply
    ucWasteIssueQuery -- ucWasteReturn
    ucWasteIssueQuery -- ucWasteIssueReport
```

### Condiciones y puntos de extensión

Las cinco extensiones se dibujan en las vistas `ENT` y `SAL`, junto a sus casos base.
Los casos referenciados conservan su identificador y su definición en `CAT` o `ALM`.
Esta tabla complementa las flechas con la condición, el punto de inserción y el retorno
que también figuran en las fichas.

| Extensión | Caso base | Punto de extensión y condición | Retorno al caso base |
| --- | --- | --- | --- |
| `CU-CAT-02` Crear proveedor | `CU-ENT-02` Crear compra de material | Paso 3, seleccionar proveedor; el actor elige **Nuevo proveedor** (A6). | Proveedor creado seleccionado; continúa la captura del paso 3. |
| `CU-CAT-02` Crear proveedor | `CU-ENT-08` Crear compra de consumible | Paso 3, seleccionar proveedor; el actor elige **Nuevo proveedor** (A6). | Proveedor creado seleccionado; continúa la captura del paso 3. |
| `CU-ALM-02` Crear material | `CU-ENT-02` Crear compra de material | Paso 3, seleccionar material; el actor elige **Registrar material** (A5). | Material con existencia cero seleccionado; continúa el detalle en el paso 4. |
| `CU-ALM-18` Crear consumible | `CU-ENT-08` Crear compra de consumible | Paso 3, seleccionar consumible; el actor elige **Registrar consumible** (A5). | Consumible con existencia cero seleccionado; continúa el detalle en el paso 4. |
| `CU-CAT-06` Crear cliente | `CU-SAL-02` Crear salida de material | Paso 3, seleccionar cliente; el actor elige **Nuevo cliente** (A3). | Cliente creado seleccionado; continúa la captura del paso 3. |

Las bases pueden completarse seleccionando recursos existentes; las extensiones no son
obligatorias y por ello no se representan con `«include»`. Si un alta se cancela o
falla, no se confirma el documento base; el actor puede elegir un recurso existente,
reintentar o abandonar el formulario. Cada alta conserva su propia autorización y
persistencia: la relación UML no implica una única transacción con la compra o salida.

### Criterio de inclusión, exclusión y relaciones entre casos

La revisión de las capacidades transversales detectó que **iniciar sesión** y **cerrar
sesión** estaban implementados y especificados, pero no se visualizaban como objetivos
del usuario. Se incorporan porque cada uno tiene disparador, interacción y resultado
observable: obtener acceso a las capacidades autorizadas o terminar ese acceso. Su
visibilidad permite entender el impacto de Nexus sobre el control de acceso al negocio,
aunque no pertenezcan a un CRUD operativo.

La revisión aplica estas decisiones de forma explícita:

| Situación revisada | Decisión de modelado | Motivo |
| --- | --- | --- |
| El actor persigue un resultado observable y Nexus ofrece una interacción completa para lograrlo. | Incluir como caso de uso. | Expone una capacidad y su impacto en el trabajo o control del negocio. |
| El comportamiento siempre forma parte del objetivo base y tiene un objetivo reutilizable propio. | Modelar `«include»`, sólo si ambos casos y el retorno al caso base están definidos. | La ejecución obligatoria no debe confundirse con una asociación temática. |
| El comportamiento es opcional, se inserta bajo una condición y tiene sentido como objetivo separado. | Modelar `«extend»`, sólo si existe un punto de extensión explícito. | Una alternativa interna no crea por sí sola otro caso. |
| La acción es validación, persistencia, auditoría, cálculo, movimiento o coordinación interna. | Excluir como caso independiente y describirla dentro del flujo que apoya. | Nexus participa internamente; no existe otro objetivo iniciado por el actor. |
| Una consulta sólo llena un selector dentro de otro objetivo y no ofrece una opción independiente. | Excluir de la asociación del actor para ese contexto. | Es una capacidad auxiliar, no mantenimiento del catálogo. |
| Existe sólo modelo, servicio parcial, permiso, ruta técnica sin interacción definida o intención futura. | Excluir del diagrama vigente y conservar su estado como modelado, parcial o fuera de alcance. | No debe presentarse una capacidad aún no disponible para el negocio. |

Con este criterio, **renovar credenciales** y **consultar la sesión actual** no se
incorporan como casos de uso: son mecanismos técnicos que Nexus ejecuta para conservar
o reconstruir una sesión, no objetivos que el usuario seleccione. Tampoco se crea
`«include»` desde cada caso protegido hacia `CU-AUT-01`: una sesión iniciada es una
precondición, y el inicio de sesión no se ejecuta obligatoriamente dentro de cada
consulta o mutación. `CU-AUT-02` es independiente porque el usuario sí decide terminar
su acceso. La revisión no encontró otra capacidad implementada con actor, disparador y
resultado de negocio que permanezca oculta; proyectos, ajustes parciales y requisiciones
continúan fuera del diagrama por su estado no vigente.

`CU-SAL-05` y `CU-SAL-12` actualizan la existencia y registra el movimiento como parte de su propio
flujo; `CU-SAL-06` y `CU-SAL-13` registran la reversión y el movimiento inverso. No existe una relación
`«include»` con `CU-ALM-07` y `CU-ALM-15`: consultar movimientos es otro objetivo iniciado por un
actor, mientras registrar un movimiento es una responsabilidad interna de Nexus. Por la
misma razón, compartir servicios entre grupos no se representa como salto, inclusión o
extensión entre casos de uso.

Los actores operativos vigentes son **Personal de almacén** del área Almacén y
proveduría y **Administrador del sistema** del área Sistemas. Personal de almacén
especializa a **Usuario registrado**; el administrador especializa a Personal de almacén
y hereda sus asociaciones, incluidas las de autenticación. Además tiene casos propios. Los
movimientos y sus reportes (`CU-ALM-07`, `CU-ALM-08`, `CU-ALM-15`, `CU-ALM-16`), los
ajustes y las operaciones administrativas conservan asociaciones exclusivas con el
administrador, conforme a sus fichas. Solicitantes, aprobadores, asesores y proveedores
participan como roles o entidades del negocio, pero no se dibujan como actores porque
no inician estos casos mediante acceso a Nexus.

Cada caso pertenece a un único grupo funcional propietario; no quedan casos sueltos ni
un paquete independiente de reportes dentro del límite de Nexus. Los identificadores se numeran secuencialmente dentro de su grupo propietario y los
reportes se muestran junto a la consulta o recurso desde el que se inician. Los identificadores son los mismos del catálogo
operativo y permiten pasar de cada objetivo visual a su
[ficha normativa](../use-cases/index.md). No se mantiene un segundo diagrama de flujo por
caso: la ficha conserva el comportamiento actor–sistema y las secuencias de arquitectura
describen su realización técnica.
No se usa «administrar» o «mantener» como objetivo: cada óvalo expresa una operación
observable.

El actor se asocia con la consulta de cada recurso; desde esa consulta se despliegan
sus operaciones mediante enlaces sin texto, sin repetir el enlace del actor a cada
operación. El administrador hereda las asociaciones de Almacén. Cuando una ficha
define una participación particular, se conserva la asociación directa correspondiente:

- Los ajustes de existencia exclusivos del administrador (`CU-ALM-05`, `CU-ALM-12`
  y `CU-ALM-21`) mantienen su enlace para distinguirlos de las operaciones compartidas
  con Almacén. No se enlazan desde la consulta compartida, para no atribuir el ajuste
  al Personal de almacén. Abrir el ajuste desde esa pantalla es el disparador descrito
  en la ficha; sólo el administrador autorizado puede ejecutarlo.
- Las consultas de movimientos (`CU-ALM-07` y `CU-ALM-15`) se muestran en figuras
  independientes, asociadas sólo con el administrador y sin enlaces desde las consultas
  de materiales o mermas. Sus reportes (`CU-ALM-08` y `CU-ALM-16`) parten únicamente de
  la consulta de movimientos correspondiente.
- Las altas de materiales y consumibles (`CU-ALM-02` y `CU-ALM-18`) se enlazan desde
  su consulta en las vistas de inventario, sin repetir la asociación directa del actor.
  Su participación desde selectores se muestra en las extensiones de Compras.
- Las altas de proveedores y clientes desde selectores (`CU-CAT-02` y `CU-CAT-06`)
  mantienen la asociación con Personal de almacén, que no participa en la consulta
  independiente de esos catálogos según las fichas vigentes. Las cinco extensiones de
  altas conservan sus asociaciones en Compras y Salidas, donde se inicia ese contexto.
- Iniciar y cerrar sesión (`CU-AUT-01` y `CU-AUT-02`) conservan sus asociaciones
  independientes porque no parten de una consulta.

Los enlaces desde Consulta son una convención
visual del documento y no una relación UML de inclusión, extensión o generalización.
Sólo `«include»` y `«extend»` llevan su estereotipo; la generalización se identifica por
el triángulo hueco, sin etiqueta. Las cinco extensiones opcionales se conservan junto
a sus casos base y en la tabla de condiciones y las fichas correspondientes.

Los grupos son ayudas de lectura, no límites del sistema ni permisos. El Administrador
del sistema del área Sistemas tiene acceso vigente a todos los casos visualizados, pero
cada petición conserva la comprobación de su política; el Personal de almacén sólo
opera entradas, inventario y salidas autorizadas.
Las demás áreas aparecen
únicamente cuando una política de lectura o el encabezado de una salida lo permite.
Consultar un catálogo desde un `combobox` es una capacidad auxiliar de lectura y no un
caso de uso independiente: debe autorizarse en el servidor, pero no se asocia como si el
actor mantuviera el catálogo. Dirección no se dibuja como actor vigente: su
participación y alcance permanecen por definir y las políticas actuales no justifican
atribuirle el conjunto de consultas y reportes. Cuando esa decisión se apruebe, deberán actualizarse conjuntamente políticas,
requisitos, fichas y asociaciones, sin inferir acceso por el nombre del área o del rol.

Los casos de uso son objetivos del actor, no módulos de código. Por ello **no se requiere
crear una carpeta `useCases` ni renombrar los dominios existentes**. La trazabilidad se
mantiene desde el identificador hacia rutas, controllers, DTO, servicios y pruebas; una
operación puede coordinar varios de esos artefactos y un servicio puede apoyar más de un
caso sin que ambos deban compartir nombre.

No se dibujan operaciones pendientes como asociaciones. Las áreas que eventualmente
soliciten o registren salidas, y el mantenimiento de proyectos, deben definirse primero
como alcance, permisos y criterios de aceptación.

