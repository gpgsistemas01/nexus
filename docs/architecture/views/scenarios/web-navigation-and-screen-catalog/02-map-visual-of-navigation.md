# 2. Navegación web por actor

Esta vista separa la navegación de los dos actores con acceso vigente. Cada flecha
significa que el destino se ofrece desde el menú principal; no impone una secuencia de
trabajo. Las categorías redondeadas despliegan opciones y no registran una URL propia.
La visibilidad final siempre depende de los permisos calculados para la sesión y las
rutas vuelven a comprobar la autorización en el servidor.

Los diagramas se contrastan con el partial compartido `src/views/layout/ui/navList.ejs`.
La definición normativa de los actores permanece en la
[SRS](../../../../requirements/requirements-specification/03-actors-and-system-responsibilities.md):
ambos actores especializan a Usuario registrado. Sus destinos operativos compartidos
se autorizan explícitamente; no hay generalización entre Administrador y Personal de almacén.

## Acceso y sesión compartidos

**Identificador:** `DIA-ARQ-EST-001`.

La raíz dirige a la autenticación o al área protegida según la sesión. Este recorrido es
común a ambos actores y no representa una pantalla adicional para el área autenticada.

```mermaid
stateDiagram-v2
    [*] --> Root
    state "Raíz (/)" as Root
    state "Inicio de sesión<br/>/inicio-sesion" as Login
    state "Área autenticada" as Authenticated
    state "Renovar sesión<br/>/revocar-sesion" as Refresh
    state "Cerrar sesión<br/>/cerrar-sesion" as Logout
    state "No encontrada<br/>/error/404" as NotFound

    Root --> Login: abrir [sesión ausente] / mostrar inicio de sesión
    Root --> Authenticated: abrir [sesión válida] / mostrar área
    Login --> Authenticated: iniciar sesión [credenciales válidas] / autenticar
    Authenticated --> Refresh: solicitar recurso [token vencido] / renovar sesión
    Refresh --> Authenticated: renovar [token válido] / restablecer sesión
    Refresh --> Login: renovar [token inválido] / solicitar autenticación
    Authenticated --> Logout: solicitud POST
    Logout --> Login: sesión cerrada
    Authenticated --> NotFound: navegar [ruta inexistente o acceso denegado] / mostrar error
    NotFound --> Root: volver al inicio
```

## Personal de almacén

**Identificador:** `DIA-ARQ-NAV-001`. El mapa muestra la navegación operativa base del
actor. Las etiquetas de las flechas indican el permiso que hace visible cada destino.
Los accesos independientes de administración, movimientos, clientes, proveedores y
catálogos auxiliares no forman parte de este recorrido.

```mermaid
flowchart LR
    actor["Personal de almacén"] --> menu(["Menú principal"])
    menu --> warehouse(["Almacén"])
    warehouse -->|"materials:read"| materials["Materiales<br/>/almacen/materiales"]
    warehouse -->|"materials:read"| consumables["Consumibles<br/>/almacen/consumibles"]
    warehouse -->|"wastes:page-view"| wastes["Mermas<br/>/almacen/mermas"]
    menu -->|"goods:receipts-page-view"| purchases["Compras<br/>/compras"]
    menu --> issues(["Salidas"])
    issues -->|"goods:issues-page-view"| goodsIssues["Materiales<br/>/salidas/materiales"]
    issues -->|"goods:issues-page-view"| consumableIssues["Consumibles<br/>/salidas/consumibles"]
    issues -->|"waste:issues-page-view"| wasteIssues["Mermas<br/>/salidas/mermas"]
    menu -->|"persons:page-view"| persons["Personas<br/>/personas"]
```

## Administrador del sistema

**Identificador:** `DIA-ARQ-NAV-002`. Este actor dispone de la navegación operativa y de
los destinos administrativos. El diagrama expande todos los destinos para que pueda
leerse sin depender del mapa anterior; las etiquetas reproducen el permiso comprobado
por el menú compartido para mostrar cada opción.

```mermaid
flowchart LR
    actor["Administrador del sistema"] --> menu(["Menú principal"])
    menu --> warehouse(["Almacén"])
    warehouse -->|"materials:read"| materials["Materiales<br/>/almacen/materiales"]
    warehouse -->|"materials:read"| consumables["Consumibles<br/>/almacen/consumibles"]
    warehouse -->|"wastes:page-view"| wastes["Mermas<br/>/almacen/mermas"]
    menu -->|"goods:receipts-page-view"| purchases["Compras<br/>/compras"]
    menu --> issues(["Salidas"])
    issues -->|"goods:issues-page-view"| goodsIssues["Materiales<br/>/salidas/materiales"]
    issues -->|"goods:issues-page-view"| consumableIssues["Consumibles<br/>/salidas/consumibles"]
    issues -->|"waste:issues-page-view"| wasteIssues["Mermas<br/>/salidas/mermas"]
    menu --> movements(["Movimientos"])
    movements -->|"movements:read"| materialMovements["Materiales<br/>/movimientos/materiales"]
    movements -->|"movements:read"| wasteMovements["Mermas<br/>/movimientos/mermas"]
    menu -->|"users:manage"| users["Usuarios<br/>/usuarios-sistemas"]
    menu --> catalogs(["Catálogos"])
    catalogs -->|"catalogs:manage"| departments["Áreas<br/>/catalogos/departments"]
    catalogs -->|"catalogs:manage"| roles["Roles<br/>/catalogos/roles"]
    catalogs -->|"catalogs:manage"| presentations["Presentaciones<br/>/catalogos/presentations"]
    catalogs -->|"catalogs:manage"| units["Unidades de medida<br/>/catalogos/unit-measures"]
    catalogs -->|"catalogs:manage"| reasons["Motivos de ajuste<br/>/catalogos/reasons"]
    catalogs -->|"catalogs:manage"| fulfillment["Estados de cumplimiento<br/>/catalogos/fulfillment-statuses"]
    menu -->|"persons:page-view"| persons["Personas<br/>/personas"]
    menu -->|"clients:page-view"| clients["Clientes<br/>/clientes"]
    menu -->|"suppliers:page-view"| suppliers["Proveedores<br/>/proveedores"]
```

Los modales CRUD no se dibujan como pantallas porque reutilizan la página propietaria y
no tienen rutas web independientes. Las redirecciones históricas se mantienen en el
[catálogo de pantallas](03-catalog-of-screens.md#redirecciones-de-compatibilidad).
