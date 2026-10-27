# Navegación y catálogo de pantallas

## Fuentes y acceso

Fuentes: `src/app/router/index.ts`, `src/app/navigation.ts`, configuración de cada
recurso y `usePageAccess`. Las rutas protegidas cargan sesión antes de resolver
su permiso público. La API autoriza cada petición. Los índices de grupo seleccionan
el primer recurso autorizado cuando corresponde; el catch-all presenta página no encontrada.

| Ruta/capacidad | Contenedor | Objetivos |
| --- | --- | --- |
| `/inicio-sesion` | `LoginPage` | `CU-AUT-01`. |
| `/almacen/materiales`, `/almacen/consumibles`, `/almacen/mermas` | `InventoryWorkspace` y `InventoryPage` | Consultas, alta, edición, baja/stock según `CU-ALM`. |
| `/compras/materiales`, `/compras/consumibles` | `PurchaseWorkspace` y `PurchasePage` | `CU-ENT-01..12`. |
| `/salidas/materiales`, `/salidas/consumibles`, `/salidas/mermas` | `IssueWorkspace` y `IssuePage` | `CU-SAL-01..21`. |
| `/movimientos/materiales`, `/movimientos/consumibles`, `/movimientos/mermas` | `MovementPage` | Historiales/reportes de `CU-ALM`. |
| `/identidad/personas`, `/identidad/usuarios` | `IdentityPage` | `CU-IDA-01..09`. |
| `/directorio/clientes`, `/directorio/proveedores` | `DirectoryPage` | `CU-CAT-01..08`. |
| `/catalogos/<recurso>` | `CatalogPage` | Áreas, Roles, Presentaciones, Unidades, Motivos y Estados de cumplimiento; `CU-CAT-09..26`. |
| `/sin-permiso`, `/sesion-no-disponible` | `AccessErrorPage` | Rechazo y recuperación del destino. |
| Ruta desconocida | `NotFoundPage` | Recuperación de navegación. |

## Menú y editores

El menú contiene grupos plegables y enlaces Vue autorizados. En escritorio la barra
compacta muestra iconos; pulsar la expande y clic fuera, Escape o navegación la cierran.
En móvil se utiliza drawer temporal. Los editores son diálogos del contexto actual;
abrir uno no registra una ruta nueva ni escribe. Los auxiliares se componen en el
Workspace para preservar la captura origen.

## Destino y recuperación

El retorno conserva ruta, query y fragmento de una ruta protegida registrada.
`protectedDestination` rechaza externos, rutas de error/login, valores ambiguos y
rutas desconocidas. Un 401 definitivo abre login; un 403 muestra acceso no permitido;
un fallo de conexión conserva destino en recuperación con reintento visible.
Las pruebas de router y `sessionRecovery.spec.ts` verifican esos escenarios.
