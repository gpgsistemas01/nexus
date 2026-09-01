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
pertenecen; juntos forman el diagrama de casos de uso. Los actores concretos se
generalizan mediante un actor común cuando comparten asociaciones y la distinción entre
ellos aporta información al grupo. Si todos participan de la misma forma, el actor común
los representa sin enumerar cada rol o área.

Se conservan seis grupos funcionales porque representan capacidades estables del
negocio y coinciden con la trazabilidad normativa existente: autenticación, identidad y acceso,
catálogos, compras de material, salidas, y consultas y reportes. Dividirlos otra vez en
nuevos grupos por cada entidad fragmentaría procesos que comparten actor, reglas y ciclo
operativo; agruparlos sólo por acción mezclaría entidades con validaciones distintas.
Dentro de cada grupo se usa por ello un **segundo nivel visual por entidad o documento**.
Este nivel mejora la lectura, pero no cambia identificadores ni fusiona casos de uso.
La decisión y las familias resultantes se resumen en el
[criterio de agrupación vigente](use-case-descriptions.md#criterio-de-agrupación-vigente).

### Grupo funcional AUT — Autenticación

```mermaid
flowchart LR
    user["«actor»<br/>Usuario registrado"]

    subgraph authPackage["Nexus · Grupo funcional AUT: Autenticación"]
        ucLogin(["CU-AUT-01 Iniciar sesión"])
        ucLogout(["CU-AUT-02 Cerrar sesión"])
    end

    user --- ucLogin
    user --- ucLogout
```

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
    admin --- ucUserQuery
    admin --- ucRoleQuery
    admin --- ucDepartmentQuery
    ucPersonQuery --- ucPersonCreate
    ucPersonQuery --- ucPersonEdit
    ucUserQuery --- ucUserCreate
    ucUserQuery --- ucUserEdit
    ucUserQuery --- ucPasswordEdit
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
    warehouse --- ucSupplierQuery
    warehouse --- ucWasteQuery
    warehouse --- ucPresentationQuery
    warehouse --- ucUnitQuery
    warehouse --- ucAdjustmentReasonQuery
    warehouse --- ucFulfillmentStatusQuery
    admin -- "generaliza" --> warehouse
    admin --- ucClientQuery
    ucMaterialQuery --- ucMaterialCreate
    ucMaterialQuery --- ucMaterialEdit
    ucMaterialQuery --- ucMaterialRemove
    ucMaterialQuery --- ucMaterialStock
    ucSupplierQuery --- ucSupplierCreate
    ucSupplierQuery --- ucSupplierEdit
    ucSupplierQuery --- ucSupplierStatus
    ucClientQuery --- ucClientCreate
    ucClientQuery --- ucClientEdit
    ucWasteQuery --- ucWasteCreate
    ucWasteQuery --- ucWasteEdit
    ucWasteQuery --- ucWasteStock
```

### Grupo funcional ENT — Compras de material

```mermaid
flowchart LR
    warehouse["«actor»<br/>Personal de almacén (área Almacén y proveduría)"]
    admin["«actor»<br/>Administrador del sistema (área Sistemas)"]
    admin -- "generaliza" --> warehouse

    subgraph receiptPackage["Nexus · Grupo funcional ENT: Compras de material"]
        ucReceiptQuery(["CU-ENT-01 Consultar compras de material"])
        ucReceiptCreate(["CU-ENT-02 Crear compra de material"])
        ucReceiptEdit(["CU-ENT-03 Editar compra de material"])
        ucReceiptCorrect(["CU-ENT-04 Corregir material de una compra"])
        ucReceiptCancel(["CU-ENT-05 Cancelar material de una compra"])
    end

    warehouse --- ucReceiptQuery
    ucReceiptQuery --- ucReceiptCreate
    ucReceiptQuery --- ucReceiptEdit
    ucReceiptQuery --- ucReceiptCorrect
    ucReceiptQuery --- ucReceiptCancel
```

### Grupo funcional SAL — Salidas de material y de merma

```mermaid
flowchart LR
    warehouse["«actor»<br/>Personal de almacén (área Almacén y proveduría)"]
    admin["«actor»<br/>Administrador del sistema (área Sistemas)"]
    admin -- "generaliza" --> warehouse

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
    warehouse --- ucWasteIssueQuery
    ucMaterialIssueQuery --- ucMaterialIssueCreate
    ucMaterialIssueQuery --- ucMaterialIssueHeader
    ucMaterialIssueQuery --- ucMaterialIssueDetails
    ucMaterialIssueQuery --- ucMaterialSupply
    ucMaterialIssueQuery --- ucMaterialReturn
    ucWasteIssueQuery --- ucWasteIssueCreate
    ucWasteIssueQuery --- ucWasteIssueHeader
    ucWasteIssueQuery --- ucWasteIssueDetails
    ucWasteIssueQuery --- ucWasteSupply
    ucWasteIssueQuery --- ucWasteReturn
```

### Grupo funcional REP — Consultas y reportes

```mermaid
flowchart LR
    authorized["«actor abstracto»<br/>Usuario autorizado de consulta y reporte"]
    warehouse["«actor»<br/>Personal de almacén"]
    admin["«actor»<br/>Administrador del sistema"]
    warehouse -- "generaliza" --> authorized
    admin -- "generaliza" --> authorized

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

    authorized --- ucMaterialInventory
    authorized --- ucWasteInventory
    authorized --- ucMaterialMovements
    authorized --- ucWasteMovements
    authorized --- ucMaterialInventoryReport
    authorized --- ucMaterialIssueReport
    authorized --- ucWasteIssueReport
    authorized --- ucPurchaseReport
    authorized --- ucWasteReport
    authorized --- ucSupplierReport
    authorized --- ucClientReport
    authorized --- ucPersonReport
    authorized --- ucUserReport
    authorized --- ucMaterialMovementReport
    authorized --- ucWasteMovementReport
```

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

`CU-SAL-05` y `CU-SAL-11` actualizan la existencia y registra el movimiento como parte de su propio
flujo; `CU-SAL-06` y `CU-SAL-12` registran la reversión y el movimiento inverso. No existe una relación
`«include»` con `CU-REP-03` y `CU-REP-04`: consultar movimientos es otro objetivo iniciado por un
actor, mientras registrar un movimiento es una responsabilidad interna de Nexus. Por la
misma razón, compartir servicios entre grupos no se representa como salto, inclusión o
extensión entre casos de uso.

Los actores vigentes son **Personal de almacén** del área Almacén y proveduría y
**Administrador del sistema** del área Sistemas. El Administrador del sistema se muestra
como especialización en los grupos operativos donde su acceso heredado debe distinguirse
del correspondiente al Personal de almacén; en `CAT` conserva además la asociación
directa con clientes. En `AUT`, **Usuario registrado** representa a ambos porque no varían
los casos de inicio y cierre de sesión. Esta generalización expresa disponibilidad
funcional, no omite las comprobaciones de permiso del servidor. Solicitantes,
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

Dentro de cada grupo, la lectura se organiza por recurso: desde su consulta se trazan
asociaciones simples, sin etiqueta, hacia las operaciones CRUD y específicas que le
corresponden. Sólo las relaciones con semántica `«include»` o `«extend»` deben indicarla
explícitamente. Corregir, cancelar, ajustar, cambiar estado, surtir o devolver permanecen
junto al recurso que modifican y reciben la secuencia correspondiente a esa posición.
Cuando el orden cambia, catálogo, fichas, diagramas y referencias técnicas se renumeran
en conjunto para conservar la trazabilidad. Una asociación simple no implica inclusión,
extensión ni dependencia de ejecución; una relación `«include»` o `«extend»` sólo existe
cuando aparece etiquetada explícitamente.
La generalización de actores también se identifica de forma expresa.

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
