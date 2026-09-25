# 3. Catálogo de pantallas

Cada fila identifica un destino web registrado, su propósito y la vista que lo
implementa. El acceso se ofrece en el menú sólo cuando la sesión posee el permiso
indicado por `src/views/layout/ui/navList.ejs`; las rutas vuelven a comprobarlo en el
servidor. **Movimientos** y **Catálogos** son accesos exclusivos del **Administrador del
sistema** del área Sistemas en la política vigente.

| Área | Pantalla y ruta | Propósito visible | Interacciones principales | Implementación EJS |
| --- | --- | --- | --- | --- |
| Acceso | Inicio de sesión (`/inicio-sesion`) | Autenticar una cuenta. | Capturar credenciales e iniciar sesión. | `src/views/pages/home/login/loginPage.ejs` |
| Almacén | Existencias (`/almacen/materiales`) | Consultar materiales y stock; las columnas `Existencia` y `Costo Unitario de Conversión` mantienen los mismos títulos que en Mermas, y todas las celdas de cada fila, incluido el nombre, se muestran centradas. | Filtrar, paginar y abrir el alta/edición de material. | `src/views/pages/warehouse/materials/materialsPage.ejs` |
| Almacén | Consumibles (`/almacen/consumibles`) | Presentar el módulo dentro de la navegación de almacén. | Consultar la pantalla con acceso de lectura de materiales; el contenido operativo continúa pendiente. | `src/views/pages/warehouse/consumables/consumablesPage.ejs` |
| Sistemas | Catálogos (`/catalogos/departments`, `/catalogos/roles`, `/catalogos/presentations`, `/catalogos/unit-measures`, `/catalogos/reasons`, `/catalogos/fulfillment-statuses`) | Administrar áreas, roles, presentaciones, unidades, motivos y estados desde una pantalla CRUD por catálogo y una implementación compartida por capas. | Elegir uno de los seis accesos del submenú; listar, crear y editar con `catalogs:manage`; sólo para el Administrador del sistema. | `src/views/pages/admin/catalogs/catalogsPage.ejs` |
| Almacén | Mermas (`/almacen/mermas`) | Consultar y administrar existencias de merma con todas las celdas de cada fila centradas, incluido el nombre. | Filtrar, registrar/editar, agregar stock para almacén y ajustar stock sólo para administración. | `src/views/pages/warehouse/wastes/wastesPage.ejs` |
| Almacén | Registro de compras (`/compras`) | Consultar y registrar entradas de compra. | Filtrar, registrar compra, materiales/proveedores y corregir detalles. | `src/views/pages/warehouse/goodsReceipts/goodsReceiptsPage.ejs` |
| Almacén | Salidas de almacén (`/salidas/materiales`) | Consultar y registrar entregas de materiales. | Filtrar, registrar salida, seleccionar cliente y devolver detalles. | `src/views/pages/warehouse/goodsIssues/goodsIssuesPage.ejs` |
| Almacén | Salidas de mermas (`/salidas/mermas`) | Consultar y registrar salidas de merma. | Registrar, editar, surtir y devolver detalles de merma. | `src/views/pages/warehouse/wasteIssues/wasteIssuesPage.ejs` |
| Almacén | Proveedores (`/proveedores`) | Consultar y administrar proveedores. | Crear/editar desde modal. | `src/views/pages/warehouse/suppliers/suppliersPage.ejs` |
| Sistemas | Clientes (`/clientes`) | Consultar y administrar clientes. | Crear/editar desde modal. | `src/views/pages/sales/clients/clientsPage.ejs` |
| Sistemas | Usuarios (`/usuarios-sistemas`) | Administrar cuentas y asignaciones. | Crear/editar usuario, roles y departamentos. | `src/views/pages/admin/users/usersPage.ejs` |
| Sistemas | Personas (`/personas`) | Administrar personas participantes del negocio. | Filtrar y crear/editar datos y asignaciones. | `src/views/pages/admin/persons/personsPage.ejs` |
| Sistemas | Movimientos de materiales (`/movimientos/materiales`) | Auditar movimientos del inventario de materiales. | Filtrar, consultar y exportar el historial con `movements:read`; sólo para el Administrador del sistema. | `src/views/pages/admin/movements/movementsPage.ejs` |
| Sistemas | Movimientos de merma (`/movimientos/mermas`) | Auditar movimientos del inventario de merma. | Filtrar, consultar y exportar el historial con `movements:read`; sólo para el Administrador del sistema. | `src/views/pages/admin/movements/movementsPage.ejs` |
| Sistema | No encontrada (`/error/404`) | Recuperar al usuario de una URL inexistente. | Volver al inicio apropiado según la sesión. | `src/views/pages/error/notFound/notFoundPage.ejs` |

### Redirecciones de compatibilidad

```mermaid
flowchart LR
    oldMaterials["/materiales"] -->|"308"| newMaterials["/almacen/materiales"]
    oldWastes["/mermas"] -->|"308"| newWastes["/almacen/mermas"]
    oldGoods["/salidas-materiales"] -->|"308"| newGoods["/salidas/materiales"]
    oldWasteIssues["/salidas-mermas"] -->|"308"| newWasteIssues["/salidas/mermas"]
    oldProfiles["/perfiles"] -->|"308"| newPersons["/personas"]
```
