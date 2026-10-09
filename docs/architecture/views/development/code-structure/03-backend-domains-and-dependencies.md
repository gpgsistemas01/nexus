# 3. Backend: dominios y dependencias

El backend distribuye el transporte en `routes/api`, `routes/web`, `controllers/api`
y `controllers/web`. Los registros HTTP están en el [capítulo 2](02-http-entry-points.md).
El mapa siguiente amplía `src/services`, donde se encuentran reglas, consultas y
transacciones. Incluye las áreas funcionales y los colaboradores que atraviesan esas
áreas y permite localizar las variantes de materiales, consumibles y mermas.

## Distribución de módulos y subdominios

**Identificador:** `DIA-COD-MOD-001`. **Pregunta:** ¿qué carpetas y módulos de servicio
componen el backend? **Fuente:** estructura de `src/services`. **Leyenda:** las flechas
representan ubicación/agrupación, no llamadas ni imports. «Colaboradores transversales»
agrupa carpetas y archivos hermanos de las áreas; no es una carpeta adicional.

```mermaid
flowchart LR
    root["src/services"] --> admin["admin/<br/>person · user · catálogos"]
    root --> sales["sales/<br/>clientService.js"]
    root --> warehouse["warehouse/"]
    warehouse --> inventory["materials/ · consumables/<br/>wastes/"]
    warehouse --> receipts["goodsReceipts/<br/>variantes y detailChanges"]
    warehouse --> issues["goodsIssues/ · wasteIssues/<br/>issues/ · detailReturns"]
    warehouse --> catalogs["Catálogos · proveedores<br/>ajustes · reportes"]
    root --> common["Colaboradores transversales"]
    common --> movement["inventory/<br/>stock · movimientos · reportes"]
    common --> document["document/<br/>folios de referencia"]
    common --> audit["audit/<br/>auditService.js"]
    common --> auth["Servicios en raíz<br/>sesión · JWT · roles · errores"]
```

`warehouse/issues` aporta encabezados y cumplimiento compartidos; no es otro endpoint.
Los reportes están en `warehouse/reportService.js`, `inventory/reportService.js` y los
controllers de sus áreas: reutilizan consultas y formato Excel, sin constituir un
dominio independiente. `serviceErrorHandler.js`, `errors`, `messages`, `constants`
y `utils` son soporte transversal. La tabla contrasta los imports y completa el alcance de los nodos agrupados.
Los servicios que consultan modelos usan `getDb(tx)` o métodos del `tx` recibido;
la construcción del cliente se detalla en [Prisma](06-prisma-and-persistence.md).

| Área/carpeta | Implementación y colaboraciones verificables |
| --- | --- |
| `admin` | Usuarios usan personas; catálogos administrables seleccionan modelos desde `constants/catalogs.js`; movimientos/reportes de administración delegan en `services/inventory`. Los dos primeros están bajo `services/admin`; los últimos tienen allí su transporte, no un servicio duplicado. |
| `sales` | `clientService.js` mantiene clientes. `issueHeaderService.js` consulta clientes al construir encabezados de salidas. |
| `warehouse/materials`, `consumables` | `consumableService.js` fija `MATERIAL_TYPES.CONSUMABLE` y delega en material/supplierMaterial. La relación proveedor–material y su stock viven en `supplierMaterialService.js`. |
| `warehouse/wastes` | Mermas conservan servicio, inventario, movimientos, ajustes y entrada de stock propios. Usan helpers de conversión/identidad de `inventory`, sin reutilizar toda la persistencia de materiales. |
| `warehouse/goodsReceipts` | Adaptadores material/consumable configuran `type`; el núcleo coordina documento, detalles y movimiento. Corrección/cancelación tienen servicios separados. |
| `warehouse/goodsIssues`, `wasteIssues`, `issues` | Salidas comparten encabezado/cumplimiento; los movimientos de merma usan `wastes/wasteMovementService.js`. Devoluciones y reglas específicas conservan sus propios módulos. |
| `inventory`, `document` | Movimientos de material y consultas/reportes; folios anuales mediante el `tx` recibido directamente. `movementService.js` también importa `warehouse/materials/supplierMaterialService.js`: existe colaboración en ambos sentidos entre esos grupos, no una jerarquía estricta. |
| `authService`, `jwtService`, `roleService`, `audit` | Sesión/JWT, consulta de accesos y auditoría. `authMiddleware.js` y `auditMiddleware.js` invocan estos servicios desde la entrada HTTP. |

## Mapas completos por módulo

La [referencia backend](../backend-technical-documentation/02-module-code-maps.md)
contiene un mapa de código para cada módulo. Compras y salidas enumeran ambas variantes
material/consumable y sus núcleos; el capítulo compartido cubre los 28 routers API,
transporte web, reportes e infraestructura. Cada figura muestra imports entre archivos,
sin representar el recorrido de creación, surtimiento o devolución.
