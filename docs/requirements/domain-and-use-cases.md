# Modelo de dominio, casos de uso y relación entre vistas

## Alcance de las vistas

Este documento contiene dos vistas curadas diferentes: el modelo conceptual explica
el vocabulario del negocio y el diagrama de casos de uso muestra objetivos de actores.
Los campos SQL y cardinalidades físicas están en el
[ER generado](../generated/database-schema.md), y los criterios verificables en la
[especificación de requisitos](requirements-specification.md). No se repiten aquí.

## Modelo de dominio conceptual

Se usa `classDiagram`, notación UML soportada por Mermaid. Las clases no representan
clases JavaScript ni copian tablas: son conceptos del negocio. La multiplicidad indica
la relación conceptual vigente; una relación pendiente se omite para no presentar una
intención como parte del dominio operativo.

```mermaid
classDiagram
    class Usuario
    class Persona
    class AsignacionAcceso
    class Cliente
    class Proveedor
    class Material
    class Merma
    class OfertaProveedorMaterial
    class EntradaCompra
    class SalidaMaterial
    class SalidaMerma
    class DetalleDocumento
    class Movimiento
    class Existencia

    Usuario "1" --> "0..*" AsignacionAcceso : posee
    Persona "1" --> "0..*" AsignacionAcceso : desempeña
    Proveedor "1" --> "0..*" OfertaProveedorMaterial : ofrece
    Material "1" --> "0..*" OfertaProveedorMaterial : cotizado como
    Material "1" --> "0..*" Merma : origina
    Proveedor "1" --> "0..*" EntradaCompra : abastece
    EntradaCompra "1" *-- "1..*" DetalleDocumento : contiene
    SalidaMaterial "1" *-- "1..*" DetalleDocumento : contiene
    SalidaMerma "1" *-- "1..*" DetalleDocumento : contiene
    Cliente "0..1" --> "0..*" SalidaMaterial : contextualiza
    Material "1" --> "0..*" SalidaMaterial : se entrega en
    Merma "1" --> "0..*" SalidaMerma : se entrega en
    EntradaCompra "1" --> "0..*" Movimiento : produce
    SalidaMaterial "1" --> "0..*" Movimiento : produce
    SalidaMerma "1" --> "0..*" Movimiento : produce
    Movimiento "0..*" --> "1" Existencia : modifica
```

`Persona` puede ser solicitante, receptor o referencia comercial sin que eso convierta
a esa persona en usuario. En particular, **asesor** es un dato del contexto comercial,
no un actor con acceso. Los proyectos siguen modelados técnicamente, pero se excluyen de
esta vista vigente hasta definir su flujo.

## Casos de uso vigentes

El diagrama se mantiene en Mermaid para que GitHub lo represente correctamente. Es una
**aproximación visual a un diagrama UML de casos de uso**, no UML estricto: Mermaid no
ofrece ese tipo de diagrama y se emplean nodos de `flowchart` con la semántica que se
explica a continuación. Los límites rectangulares representan el sistema. Cada actor se
muestra fuera de esos límites como un clasificador con el estereotipo UML `«actor»`; se
usa esta notación alternativa a la figura humana porque Mermaid no incorpora actores en
`flowchart`. Las asociaciones muestran quién inicia un objetivo y no equivalen a
permisos individuales. Ventas no es
actor: el área no tiene acceso. Tampoco se asignan salidas a otras áreas solicitantes;
su participación futura queda pendiente de definición.

Los participantes, precondiciones, garantías, pasos, alternativas y excepciones de cada
objetivo se detallan por tema en el
[catálogo de descripciones de casos de uso](use-case-descriptions.md).
La vista se divide en bloques por grupo funcional para mantenerla legible. Estos bloques
no son paquetes UML ni paquetes documentales: el único límite de sistema es Nexus. Cada
bloque conserva los actores fuera del sistema y muestra una sola vez los casos que le
pertenecen; juntos forman el diagrama de casos de uso.

Se conservan los cinco grupos funcionales porque representan capacidades estables del
negocio y coinciden con la trazabilidad normativa existente: identidad y acceso,
catálogos, compras de material, salidas, y consultas y reportes. Dividirlos otra vez en
nuevos grupos por cada entidad fragmentaría procesos que comparten actor, reglas y ciclo
operativo; agruparlos sólo por acción mezclaría entidades con validaciones distintas.
Dentro de cada grupo se usa por ello un **segundo nivel visual por entidad o documento**.
Este nivel mejora la lectura, pero no cambia identificadores ni fusiona casos de uso.
La decisión y las familias resultantes se resumen en el
[criterio de agrupación vigente](use-case-descriptions.md#criterio-de-agrupación-vigente).

### Grupo funcional IDA — Identidad y acceso

```mermaid
flowchart LR
    admin["«actor»<br/>Administrador del sistema (área Sistemas)"]

    subgraph identityPackage["Nexus · Grupo funcional IDA: Identidad y acceso"]
        subgraph personFamily["Personas"]
            ucPersonQuery(["CU-IDA-01 Consultar personas"])
            ucPersonCreate(["CU-IDA-02 Crear persona"])
            ucPersonEdit(["CU-IDA-03 Editar persona"])
        end
        subgraph userFamily["Usuarios y credenciales"]
            ucUserQuery(["CU-IDA-04 Consultar usuarios"])
            ucUserCreate(["CU-IDA-05 Crear usuario y asignar acceso"])
            ucUserEdit(["CU-IDA-06 Editar usuario y acceso"])
            ucPasswordEdit(["CU-IDA-07 Cambiar contraseña de usuario"])
        end
        subgraph accessCatalogFamily["Catálogos de acceso"]
            ucRoleQuery(["CU-IDA-08 Consultar roles"])
            ucDepartmentQuery(["CU-IDA-09 Consultar departamentos"])
        end
    end

    admin --- ucPersonQuery
    admin --- ucPersonCreate
    admin --- ucPersonEdit
    admin --- ucUserQuery
    admin --- ucUserCreate
    admin --- ucUserEdit
    admin --- ucPasswordEdit
    admin --- ucRoleQuery
    admin --- ucDepartmentQuery
```

### Grupo funcional CAT — Catálogos

```mermaid
flowchart LR
    warehouse["«actor»<br/>Personal de almacén (área Almacén y proveduría)"]
    admin["«actor»<br/>Administrador del sistema (área Sistemas)"]

    subgraph catalogPackage["Nexus · Grupo funcional CAT: Catálogos"]
        direction TB
        subgraph materialCatalogFamily["Materiales"]
            ucMaterialQuery(["CU-CAT-01 Consultar materiales"])
            ucMaterialCreate(["CU-CAT-02 Crear material"])
            ucMaterialEdit(["CU-CAT-03 Editar material"])
            ucMaterialRemove(["CU-CAT-04 Retirar material"])
            ucMaterialStock(["CU-CAT-05 Ajustar existencia de material"])
        end
        subgraph supplierCatalogFamily["Proveedores"]
            ucSupplierQuery(["CU-CAT-06 Consultar proveedores"])
            ucSupplierCreate(["CU-CAT-07 Crear proveedor"])
            ucSupplierEdit(["CU-CAT-08 Editar proveedor"])
            ucSupplierStatus(["CU-CAT-09 Cambiar estado de proveedor"])
        end
        subgraph clientCatalogFamily["Clientes"]
            ucClientQuery(["CU-CAT-10 Consultar clientes"])
            ucClientCreate(["CU-CAT-11 Crear cliente"])
            ucClientEdit(["CU-CAT-12 Editar cliente"])
        end
        subgraph wasteCatalogFamily["Mermas"]
            ucWasteQuery(["CU-CAT-13 Consultar mermas"])
            ucWasteCreate(["CU-CAT-14 Registrar merma"])
            ucWasteEdit(["CU-CAT-15 Editar merma"])
            ucWasteStock(["CU-CAT-16 Ajustar existencia de merma"])
        end
        subgraph auxiliaryCatalogFamily["Catálogos auxiliares de sólo lectura"]
            ucPresentationQuery(["CU-CAT-17 Consultar presentaciones"])
            ucUnitQuery(["CU-CAT-18 Consultar unidades de medida"])
            ucAdjustmentReasonQuery(["CU-CAT-19 Consultar motivos de ajuste"])
            ucFulfillmentStatusQuery(["CU-CAT-20 Consultar estados de cumplimiento"])
        end
    end

    warehouse --- ucMaterialQuery
    warehouse --- ucMaterialCreate
    warehouse --- ucMaterialEdit
    warehouse --- ucMaterialRemove
    warehouse --- ucMaterialStock
    warehouse --- ucSupplierQuery
    warehouse --- ucSupplierCreate
    warehouse --- ucSupplierEdit
    warehouse --- ucWasteQuery
    warehouse --- ucWasteCreate
    warehouse --- ucWasteEdit
    warehouse --- ucWasteStock
    warehouse --- ucPresentationQuery
    warehouse --- ucUnitQuery
    warehouse --- ucAdjustmentReasonQuery
    warehouse --- ucFulfillmentStatusQuery
    warehouse --- ucSupplierStatus
    admin --- ucClientQuery
    admin --- ucClientCreate
    admin --- ucClientEdit
```

### Grupo funcional ENT — Compras de material

```mermaid
flowchart LR
    warehouse["«actor»<br/>Personal de almacén (área Almacén y proveduría)"]

    subgraph receiptPackage["Nexus · Grupo funcional ENT: Compras de material"]
        ucReceiptQuery(["CU-ENT-01 Consultar compras de material"])
        ucReceiptCreate(["CU-ENT-02 Crear compra de material"])
        ucReceiptEdit(["CU-ENT-03 Editar compra de material"])
        ucReceiptCorrect(["CU-ENT-04 Corregir material de una compra"])
        ucReceiptCancel(["CU-ENT-05 Cancelar material de una compra"])
    end

    warehouse --- ucReceiptQuery
    warehouse --- ucReceiptCreate
    warehouse --- ucReceiptEdit
    warehouse --- ucReceiptCorrect
    warehouse --- ucReceiptCancel
```

### Grupo funcional SAL — Salidas de material y de merma

```mermaid
flowchart LR
    warehouse["«actor»<br/>Personal de almacén (área Almacén y proveduría)"]

    subgraph issuePackage["Nexus · Grupo funcional SAL: Salidas"]
        subgraph materialIssueFamily["Salidas de material"]
            ucMaterialIssueQuery(["CU-SAL-01 Consultar salidas de material"])
            ucMaterialIssueCreate(["CU-SAL-02 Crear salida de material"])
            ucMaterialIssueHeader(["CU-SAL-03 Editar encabezado de salida de material"])
            ucMaterialIssueDetails(["CU-SAL-04 Ajustar materiales de una salida"])
            ucMaterialSupply(["CU-SAL-05 Surtir material"])
            ucMaterialReturn(["CU-SAL-06 Devolver material surtido"])
        end
        subgraph wasteIssueFamily["Salidas de merma"]
            ucWasteIssueQuery(["CU-SAL-07 Consultar salidas de merma"])
            ucWasteIssueCreate(["CU-SAL-08 Crear salida de merma"])
            ucWasteIssueHeader(["CU-SAL-09 Editar encabezado de salida de merma"])
            ucWasteIssueDetails(["CU-SAL-10 Ajustar mermas de una salida"])
            ucWasteSupply(["CU-SAL-11 Surtir merma"])
            ucWasteReturn(["CU-SAL-12 Devolver merma surtida"])
        end
    end

    warehouse --- ucMaterialIssueQuery
    warehouse --- ucMaterialIssueCreate
    warehouse --- ucMaterialIssueHeader
    warehouse --- ucMaterialIssueDetails
    warehouse --- ucMaterialSupply
    warehouse --- ucMaterialReturn
    warehouse --- ucWasteIssueQuery
    warehouse --- ucWasteIssueCreate
    warehouse --- ucWasteIssueHeader
    warehouse --- ucWasteIssueDetails
    warehouse --- ucWasteSupply
    warehouse --- ucWasteReturn
```

### Grupo funcional REP — Consultas y reportes

```mermaid
flowchart LR
    warehouse["«actor»<br/>Personal de almacén (área Almacén y proveduría)"]
    admin["«actor»<br/>Administrador del sistema (área Sistemas)"]
    management["«actor»<br/>Director (área Dirección)"]

    subgraph reportPackage["Nexus · Grupo funcional REP: Consultas y reportes"]
        direction TB
        subgraph reportMaterialFamily["Materiales"]
            ucMaterialInventory(["CU-REP-01 Consultar inventario de materiales"])
            ucMaterialMovements(["CU-REP-03 Consultar movimientos de materiales"])
            ucMaterialInventoryReport(["CU-REP-05 Generar reporte de inventario de materiales"])
            ucMaterialIssueReport(["CU-REP-06 Generar reporte de salidas de material"])
            ucMaterialMovementReport(["CU-REP-14 Generar reporte de movimientos de materiales"])
        end
        subgraph reportWasteFamily["Mermas"]
            ucWasteInventory(["CU-REP-02 Consultar inventario de mermas"])
            ucWasteMovements(["CU-REP-04 Consultar movimientos de mermas"])
            ucWasteIssueReport(["CU-REP-07 Generar reporte de salidas de merma"])
            ucWasteReport(["CU-REP-09 Generar reporte de mermas"])
            ucWasteMovementReport(["CU-REP-15 Generar reporte de movimientos de mermas"])
        end
        subgraph reportPurchaseFamily["Compras de material"]
            ucPurchaseReport(["CU-REP-08 Generar reporte de compras de material"])
        end
        subgraph reportSupplierFamily["Proveedores"]
            ucSupplierReport(["CU-REP-10 Generar reporte de proveedores"])
        end
        subgraph reportClientFamily["Clientes"]
            ucClientReport(["CU-REP-11 Generar reporte de clientes"])
        end
        subgraph reportIdentityFamily["Identidad"]
            ucPersonReport(["CU-REP-12 Generar reporte de personas"])
            ucUserReport(["CU-REP-13 Generar reporte de usuarios"])
        end
    end

    warehouse --- ucMaterialInventory
    warehouse --- ucWasteInventory
    warehouse --- ucMaterialMovements
    warehouse --- ucWasteMovements
    warehouse --- ucMaterialInventoryReport
    warehouse --- ucMaterialIssueReport
    warehouse --- ucWasteIssueReport
    warehouse --- ucPurchaseReport
    warehouse --- ucWasteReport
    warehouse --- ucSupplierReport
    warehouse --- ucClientReport
    warehouse --- ucPersonReport
    warehouse --- ucUserReport
    warehouse --- ucMaterialMovementReport
    warehouse --- ucWasteMovementReport
    admin --- ucMaterialInventory
    admin --- ucWasteInventory
    admin --- ucMaterialMovements
    admin --- ucWasteMovements
    admin --- ucMaterialInventoryReport
    admin --- ucMaterialIssueReport
    admin --- ucWasteIssueReport
    admin --- ucPurchaseReport
    admin --- ucWasteReport
    admin --- ucSupplierReport
    admin --- ucClientReport
    admin --- ucPersonReport
    admin --- ucUserReport
    admin --- ucMaterialMovementReport
    admin --- ucWasteMovementReport
    management --- ucMaterialInventory
    management --- ucWasteInventory
    management --- ucMaterialMovements
    management --- ucWasteMovements
    management --- ucMaterialInventoryReport
    management --- ucMaterialIssueReport
    management --- ucWasteIssueReport
    management --- ucPurchaseReport
    management --- ucWasteReport
    management --- ucSupplierReport
    management --- ucClientReport
    management --- ucPersonReport
    management --- ucUserReport
    management --- ucMaterialMovementReport
    management --- ucWasteMovementReport
```

`CU-SAL-05` y `CU-SAL-11` actualizan la existencia y registra el movimiento como parte de su propio
flujo; `CU-SAL-06` y `CU-SAL-12` registran la reversión y el movimiento inverso. No existe una relación
`«include»` con `CU-REP-03` y `CU-REP-04`: consultar movimientos es otro objetivo iniciado por un
actor, mientras registrar un movimiento es una responsabilidad interna de Nexus. Por la
misma razón, compartir servicios entre grupos no se representa como salto, inclusión o
extensión entre casos de uso.

Los actores vigentes son **Personal de almacén** del área Almacén y proveduría,
**Administrador del sistema** del área Sistemas, y **Director** del área Dirección. En
`CAT`, almacén inicia operaciones sobre catálogos operativos y administración sobre los
contextuales; en `REP`, cada actor consulta sólo el alcance autorizado. Solicitantes,
aprobadores, asesores y proveedores participan como roles o entidades del negocio, pero
no se dibujan como actores porque no inician estos casos mediante acceso a Nexus.

Cada caso pertenece a un único grupo funcional; no quedan casos sueltos dentro del
límite de Nexus. Cada grupo conserva el código definido en el catálogo y cada caso usa
el formato `CU-<GRUPO>-<SECUENCIA>`. Los identificadores son los mismos del catálogo
operativo y permiten pasar de cada objetivo visual a su descripción y a su diagrama de
flujo específico en
[Diagramas de requisitos](requirements-diagrams.md#flujos-de-cada-caso-de-uso).
No se usa «administrar» o «mantener» como objetivo: cada óvalo expresa una operación
observable.

Dentro de cada grupo, la lectura se organiza por recurso: primero su consulta, después
las operaciones CRUD disponibles y finalmente las operaciones específicas asociadas a
ese mismo CRUD. Corregir, cancelar, ajustar, cambiar estado, surtir o devolver permanecen
junto al recurso que modifican y reciben la secuencia correspondiente a esa posición.
Cuando el orden cambia, catálogo, fichas, diagramas y referencias técnicas se renumeran
en conjunto para conservar la trazabilidad. Este orden expresa asociación funcional;
sólo una flecha estereotipada explícita representa `«include»`, `«extend»` o
generalización.

Los grupos son ayudas de lectura, no límites del sistema ni permisos. El Administrador
del sistema del área Sistemas conserva el alcance que conceden las políticas
vigentes; el Personal de almacén sólo opera entradas, inventario y salidas autorizadas.
Las demás áreas aparecen
únicamente cuando una política de lectura o el encabezado de una salida lo permite.
Consultar un catálogo desde un `combobox` es una capacidad auxiliar de lectura y no un
caso de uso independiente: debe autorizarse en el servidor, pero no se asocia como si el
actor mantuviera el catálogo. Dirección no se dibuja con acceso total porque esa regla
aún no existe de manera uniforme en las políticas.

Los casos de uso son objetivos del actor, no módulos de código. Por ello **no se requiere
crear una carpeta `useCases` ni renombrar los dominios existentes**. La trazabilidad se
mantiene desde el identificador hacia rutas, controllers, DTO, servicios y pruebas; una
operación puede coordinar varios de esos artefactos y un servicio puede apoyar más de un
caso sin que ambos deban compartir nombre.

No se dibujan operaciones pendientes como asociaciones. Las áreas que eventualmente
soliciten o registren salidas, y el mantenimiento de proyectos, deben definirse primero
como alcance, permisos y criterios de aceptación.

## Estados y datos modificados por acción

Los modos de formulario (`crear`, `editar`, `surtir`, `devolver`) no son estados del
documento. El siguiente UML usa exclusivamente los nombres persistidos que resuelve el
código (`Pendiente`, `Surtido parcial`, `Surtido` y `Cancelado`); por tanto, no presenta
`Borrador` o `Devuelta` como estados aunque esas palabras puedan describir una acción o
una condición funcional. La máquina resume el **cumplimiento agregado** común a salidas
de material y merma. El estado de cada detalle y el del encabezado se derivan después de
la operación, no se asignan desde el formulario.

Las diferencias de permisos, campos y efectos se consultan en la
[matriz de operaciones](requirements-operations-matrix.md#modos-precondiciones-y-datos-modificados),
y las reglas verificables están en `src/constants/warehouseStatuses.js`,
`src/services/warehouse/issues/issueFulfillmentRules.js` y los servicios específicos de
salidas de material y merma.

```mermaid
stateDiagram-v2
    [*] --> Pendiente: crear encabezado y detalles
    Pendiente --> Pendiente: editar encabezado o detalles admitidos
    Pendiente --> Parcial: surtir parte de al menos un detalle
    Pendiente --> Surtida: surtir todos los detalles
    Parcial --> Parcial: surtir sin completar el documento
    Parcial --> Surtida: completar todos los detalles
    Surtida --> Surtida: devolución parcial de un detalle
    Surtida --> Cancelada: devolver todo lo surtido de todos los detalles
    Parcial --> Cancelada: devolver todo lo surtido de todos los detalles
    Cancelada --> [*]
```

`Parcial` es la etiqueta abreviada de `Surtido parcial` y `Surtida` representa el valor
persistido `Surtido`. La devolución parcial no crea un estado `Devuelta`: conserva el
detalle como surtido mientras aún exista cantidad neta entregada. Sólo cuando todos los
detalles resultan cancelados se deriva `Cancelado` para el encabezado. Esta aclaración
evita interpretar el diagrama como un catálogo adicional de estados.

## Vistas de diseño del sistema

El diseño no se duplica en este archivo. Consulta la
[arquitectura del sistema](../architecture/architecture-and-web-views.md#1-arquitectura-del-sistema)
para contexto, contenedores, despliegue, componentes y secuencia; el
[mapa generado](../generated/code-map.md) para imports y rutas; y el
[ER](../generated/database-schema.md) para diseño físico de datos. La vista de despliegue
distingue el entorno vigente en Render y Supabase del objetivo de trasladar la
aplicación a un VPS; los detalles todavía no decididos se presentan como propuesta y
no como infraestructura implementada.
