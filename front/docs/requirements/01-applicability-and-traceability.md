# Requisitos y trazabilidad documental

## Fuentes propietarias

| Información común | Documento que la define |
| --- | --- |
| Necesidad, interesados y límites | [Visión y alcance](vision-scope-and-requirements/index.md). |
| Identificadores de requisitos, estados y aceptación | [Convenciones de la SRS](requirements-specification/02-conventions.md). |
| Relaciones normativas entre obligaciones y objetivos | [Trazabilidad de requisitos](requirements-specification/05-requirement-traceability-rules.md). |
| Condiciones de entorno y dependencias | [Interfaces y operación](requirements-specification/07-interfaces-and-operating-conditions.md). |
| Comprobación de cada requisito Vue y decisión funcional | [Verificación y aceptación](requirements-specification/08-verification-and-acceptance.md). |
| Plantilla y reglas de lectura de una ficha | [Catálogo de casos de uso](use-cases/index.md). |
| Modos, datos modificables y efectos | [Modos y operaciones](requirements-specification/06-operation-modes-and-effects.md). |
| Diseño, casos y evidencia DP/CP/EP | [Plan de pruebas](../testing/01-test-plan.md). |
| Revisión y mantenimiento documental | [Reglas de documentación](../governance/01-documentation-rules.md). |

Cada ficha conserva su objetivo y datos completos. Los índices de familia concentran
las referencias de realización y pruebas compartidas; los diagramas específicos se
enlazan desde las operaciones que explican.

## Correspondencia por capacidad

La revisión funcional parte de las rutas del [Router](../../src/app/router/index.ts)
y las acciones de sus páginas. Esta tabla permite localizar la información de cada
capacidad sin mantener otra descripción de sus pasos.

| Capacidad | Requisitos y casos | Procedimiento de usuario | Modelo de objetivos |
| --- | --- | --- | --- |
| Acceso y cierre | `RF-AUT-*`, `RF-VUE-001/002/014`; [Autenticación](use-cases/authentication/index.md). | [Acceso y sesión](../user-manual/01-access.md). | [Acceso](use-case-model/01-access.md). |
| Materiales, Consumibles y Mermas | `RF-CAT-*`, `RF-MER-*`, `RF-ADJ-*`, `RF-VUE-006/007/008`; [Inventario](use-cases/warehouse/index.md). | [Materiales](../user-manual/03-materials.md), [Consumibles](../user-manual/04-consumables.md), [Mermas](../user-manual/05-wastes.md). | [Inventario](use-case-model/03-inventory.md). |
| Seis catálogos auxiliares | `RF-CAT-019` a `RF-CAT-024`, `RF-VUE-005`; [Catálogos](use-cases/catalogs/index.md). | [Catálogos](../user-manual/06-catalogs.md). | [Catálogos](use-case-model/06-catalogs.md). |
| Personas y Usuarios | `RF-IAM-*`, `RF-VUE-005`; [Identidad](use-cases/identity-access/index.md). | [Personas](../user-manual/07-persons.md), [Usuarios](../user-manual/08-users.md). | [Identidad](use-case-model/02-identity.md). |
| Clientes y Proveedores: contexto de Almacén y mantenimiento de Sistemas | `RF-CAT-*`, `RF-VUE-005/012`; [Directorio](use-cases/directory/index.md). | [Clientes](../user-manual/09-clients.md), [Proveedores](../user-manual/10-suppliers.md). | [Directorio](use-case-model/05-directory.md). |
| Compras de materiales y consumibles | `RF-REC-*`, `RF-VUE-009`; [Compras](use-cases/purchases/index.md). | [Compras](../user-manual/11-purchases.md): alta, edición con detalles nuevos, corrección y cancelación. | [Compras](use-case-model/07-purchases.md). |
| Salidas de materiales, consumibles y merma | `RF-ISS-*`, `RF-WST-*`, `RF-VUE-010`; [Salidas](use-cases/issues/index.md). | [Salidas](../user-manual/12-issues.md): solicitud, edición, surtido y devolución. | [Salidas](use-case-model/08-issues.md). |
| Movimientos por recurso | `RF-REP-011`, `RF-VUE-011`; [Movimientos](use-cases/movements/index.md). | [Movimientos](../user-manual/13-movements.md). | [Historial](use-case-model/04-movements.md). |
| Reportes autorizados | `RF-REP-*`, `RF-VUE-013`; fichas de exportación de cada familia. | [Reportes](../user-manual/14-reports.md). | Incluidos en el modelo de cada recurso. |
| Altas desde selectores | `RF-VUE-012`; extensiones de [Proveedores](use-cases/directory/cu-cat-02.md), [Clientes](use-cases/directory/cu-cat-06.md) y [Artículos](use-cases/warehouse/index.md). | [Selección relacionada](../user-manual/02-navigation-and-controls.md#seleccionar-registros-relacionados). | Extensiones en Directorio, Compras y Salidas. |
| Recuperación, versiones y actualización visible | `RF-VUE-002/008`, `RD-VUE-002`, `RN-VUE-003/007`; condiciones de consulta y escritura de cada ficha. | [Controles comunes](../user-manual/02-navigation-and-controls.md) y [Errores](../user-manual/15-errors-and-recovery.md). | Flujos y excepciones de la familia; su realización está en las secuencias técnicas. |

Los modelos normativos representan actores, objetivos y estados del negocio. Los
[procesos](../architecture/views/processes/index.md) explican la colaboración de los
archivos del sistema. Los [ciclos de los documentos](domain-model/06-document-lifecycles.md)
se distinguen de las máquinas de lectura, captura y recuperación de la interfaz.
La evidencia de ejecución y sus brechas se consultan en la
[matriz de pruebas](../testing/04-use-case-coverage.md).
