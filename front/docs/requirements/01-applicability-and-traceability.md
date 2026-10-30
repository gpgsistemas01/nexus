# Mapa de requisitos por capacidad

La tabla enlaza los requisitos, casos, manuales y diagramas de cada capacidad.
Las [convenciones](requirements-specification/02-conventions.md) explican los IDs.

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


Las comprobaciones están en la [cobertura de pruebas](../testing/04-use-case-coverage.md);
la implementación, en las [secuencias](../architecture/views/processes/index.md).
