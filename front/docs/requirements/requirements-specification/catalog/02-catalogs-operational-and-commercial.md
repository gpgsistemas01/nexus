# 4.2 Catálogos operativos y comerciales

La administración compartida comprende exactamente **Áreas**, **Roles**,
**Presentaciones**, **Unidades de medida**, **Motivos de ajuste** y **Estados de
cumplimiento**. Clientes, proveedores, materiales y mermas permanecen en sus requisitos
y módulos propietarios; no se interpretan como variantes del catálogo auxiliar.

| ID | Requisito | Estado |
| --- | --- | --- |
| RF-CAT-001 | Nexus debe permitir a los usuarios autorizados de áreas operativas, al Personal de almacén o al Administrador del sistema consultar materiales y sus ofertas de proveedor sin modificar existencias. | Implementado |
| RF-CAT-002 | Nexus debe permitir al Administrador del sistema de Sistemas consultar proveedores autorizados en su página independiente sin modificar sus datos; Almacén conserva las lecturas de los selectores operativos. | Implementado |
| RF-CAT-003 | Nexus debe permitir al Administrador del sistema de Sistemas consultar clientes autorizados en su página independiente sin modificar sus datos; Almacén conserva las lecturas de los selectores operativos. | Implementado |
| RF-CAT-004 | Nexus debe permitir a los usuarios autorizados de áreas operativas, al Personal de almacén o al Administrador del sistema consultar existencias de merma sin modificar sus datos ni existencias. | Implementado |
| RF-CAT-005 | Nexus debe permitir al usuario autorizado consultar presentaciones activas sin modificar el catálogo. | Implementado |
| RF-CAT-006 | Nexus debe permitir al Personal de almacén o al Administrador del sistema crear un material y su oferta de proveedor con identidad y datos válidos; el efecto inicial depende del alta directa o contextual según sus criterios. | Implementado |
| RF-CAT-007 | Nexus debe permitir al Personal de almacén o al Administrador del sistema editar el nombre y stock mínimo compartidos de un material, y el costo máximo y estado de la oferta seleccionada, sin cambiar existencias. | Implementado |
| RF-CAT-008 | Nexus debe permitir al Personal de almacén o al Administrador del sistema retirar una oferta de material sólo cuando el material no tenga historia operativa protegida; su identidad sólo se elimina si no conserva otras ofertas. | Implementado |
| RF-CAT-009 | Nexus debe permitir sólo al Administrador del sistema establecer la nueva existencia de un material mediante un ajuste trazable, con motivo y observaciones, conforme a `RF-ADJ-001`. | Implementado |
| RF-CAT-010 | Nexus debe permitir al Personal de almacén o al Administrador del sistema crear un proveedor con razón social, nombre comercial y estado activo o inactivo. Debe asignarle un código único; el acceso contextual de Almacén sigue sus criterios. | Implementado |
| RF-CAT-011 | Nexus debe permitir al Administrador del sistema de Sistemas actualizar los datos admitidos y el estado activo de un proveedor sin eliminar sus relaciones o historia. | Implementado |
| RF-CAT-012 | El sistema debe rechazar una oferta de proveedor duplicada sin modificar sus datos, existencia ni costo. | Implementado |
| RF-CAT-013 | Nexus debe permitir al Personal de almacén o al Administrador del sistema crear un cliente con nombre y estado activo o inactivo. El acceso contextual de Almacén sigue sus criterios. | Implementado |
| RF-CAT-014 | Nexus debe permitir al Administrador del sistema de Sistemas actualizar los datos admitidos y el estado activo de un cliente sin eliminar sus relaciones o historia. | Implementado |
| RF-CAT-015 | Nexus debe permitir al Personal de almacén o al Administrador del sistema crear una merma con datos propios a partir de un material y proveedor usados como plantilla. | Implementado |
| RF-CAT-016 | El sistema debe impedir que una edición de merma cambie su proveedor, presentación, unidad de medida o dimensiones, para conservar su identidad física. | Implementado |
| RF-CAT-017 | Nexus debe permitir al Personal de almacén o al Administrador del sistema actualizar nombre, stock mínimo, costo unitario máximo y estado activo de una merma sin alterar existencias ni historia; `RF-MER-003` precisa esa misma edición. | Implementado |
| RF-CAT-018 | Nexus debe permitir sólo al Administrador del sistema establecer la nueva existencia de una merma mediante un ajuste trazable, con motivo y observaciones, conforme a `RF-ADJ-001`. | Implementado |
| RF-CAT-019 | Nexus debe permitir al usuario operativo autorizado consultar unidades de medida activas para las operaciones que las requieren; su mantenimiento se rige por `RF-CAT-022` a `RF-CAT-024`. | Implementado |
| RF-CAT-020 | Nexus debe permitir al usuario autorizado consultar motivos de ajuste activos para las operaciones que los requieren; su mantenimiento se rige por `RF-CAT-022` a `RF-CAT-024`. | Implementado |
| RF-CAT-021 | Nexus debe permitir al usuario autorizado consultar estados de cumplimiento activos; su mantenimiento se rige por `RF-CAT-022` a `RF-CAT-024` y no permite asignar libremente el estado de un documento. | Implementado |
| RF-CAT-022 | Nexus debe permitir sólo al Administrador del sistema de Sistemas abrir y consultar las pantallas de los seis catálogos auxiliares administrables. | Implementado |
| RF-CAT-023 | Nexus debe permitir al Administrador del sistema autorizado crear una entrada activa o inactiva en Áreas, Roles, Presentaciones, Unidades de medida, Motivos de ajuste o Estados de cumplimiento, capturando únicamente los campos admitidos para el recurso. | Implementado |
| RF-CAT-024 | Nexus debe permitir al Administrador del sistema autorizado editar los datos admitidos y el estado activo de una opción de los seis catálogos auxiliares; debe rechazarse un recurso o dato no admitido sin modificar el catálogo. | Implementado |
| RF-CAT-025 | Nexus debe permitir a los usuarios autorizados de áreas operativas, al Personal de almacén o al Administrador del sistema consultar, buscar y filtrar por proveedor las ofertas de consumibles, sin incluir materiales ni modificar existencias. | Implementado |
| RF-CAT-026 | Nexus debe permitir al Personal de almacén o al Administrador del sistema crear un consumible y su oferta de proveedor con presentación y unidad explícitas, sin dimensiones; su existencia inicial sigue las variantes de alta directa y desde compra de los criterios de `RF-CAT-006`. | Implementado |
| RF-CAT-027 | Nexus debe permitir al Personal de almacén o al Administrador del sistema editar el nombre y stock mínimo compartidos de un consumible y el costo máximo y estado de la oferta seleccionada, sin cambiar su tipo, identidad física ni existencia. | Implementado |
| RF-CAT-028 | Nexus debe permitir al Personal de almacén o al Administrador del sistema retirar una oferta de consumible sólo cuando no exista historia operativa protegida; la identidad sólo debe eliminarse cuando no conserve otras ofertas. | Implementado |
| RF-CAT-029 | Nexus debe permitir al Administrador del sistema ajustar la existencia de un consumible mediante motivo y observaciones, conservando el ajuste y movimiento trazables; un recurso de otro tipo debe rechazarse. | Implementado |

## Criterios de alta de artículos

- **CA-RF-CAT-006-1:** en el alta directa se requieren costo máximo y existencia
  inicial no negativos; se conserva el ajuste inicial con sus observaciones.
- **CA-RF-CAT-006-2:** desde una compra no se solicitan costo máximo, existencia
  inicial, motivo ni observaciones de ajuste. La oferta se crea sin existencia ni ajuste
  inicial; el detalle recibido establece costo y existencia al confirmar la compra.
- **CA-RF-CAT-006-3:** si la identidad ya existe para otro proveedor, se reutiliza y se
  crea únicamente la oferta nueva; si la oferta ya existe, se rechaza sin modificarla.
- **CA-RF-CAT-026-1:** las mismas variantes se aplican al consumible con clasificación
  explícita y sin dimensiones; su unidad de medida no está restringida a «pieza».

## Criterios de alta comercial

- **CA-RF-CAT-010-1:** Almacén inicia el alta desde el selector de proveedor de un
  material, consumible o compra autorizada. Al confirmar, vuelve a la captura con
  el nuevo proveedor seleccionado y los datos principales conservados.
- **CA-RF-CAT-013-1:** Almacén inicia el alta desde el selector de cliente de una
  salida autorizada. Al confirmar, vuelve a la salida con el cliente seleccionado
  y la captura conservada.
- Las páginas independientes, su edición y reportes requieren el acceso de Sistemas
  definido en [Actores y responsabilidades](../03-actors-and-system-responsibilities.md#alta-contextual-de-clientes-y-proveedores).

Las [equivalencias históricas](../05-requirement-traceability-rules.md#cobertura-y-límites-de-evidencia)
identifican los requisitos que describen una misma garantía de merma.
