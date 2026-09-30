# 2. Navegación web por actor

Esta vista separa la navegación de los dos actores con acceso vigente. Cada flecha
significa que el destino se ofrece desde el menú principal; no impone una secuencia de
trabajo. Las categorías redondeadas despliegan opciones y no registran una URL propia.
La visibilidad final siempre depende de los permisos calculados para la sesión y las
rutas vuelven a comprobar la autorización en el servidor.

Los diagramas se contrastan con el partial compartido `src/views/layout/ui/navList.ejs`.
La definición normativa de los actores permanece en la
[SRS](../../../../requirements/requirements-specification/03-actors-and-responsibility-of-the-system.md):
el Administrador del sistema hereda las capacidades operativas del Personal de almacén,
pero no a la inversa.

## Acceso y sesión compartidos

La raíz dirige a la autenticación o al área protegida según la sesión. Este recorrido es
común a ambos actores y no representa una pantalla adicional para el área autenticada.

```mermaid
stateDiagram-v2
    [*] --> Root
    state "Raíz (/)" as Root
    state "Inicio de sesión<br/>/inicio-sesion" as Login
    state "Área autenticada" as Authenticated
    state "Renovar sesión<br/>/revocar-sesion" as Refresh
    state "No encontrada<br/>/error/404" as NotFound

    Root --> Login: sin sesión
    Root --> Authenticated: con sesión
    Login --> Authenticated: credenciales válidas
    Authenticated --> Refresh: token vencido
    Refresh --> Authenticated: renovación válida
    Refresh --> Login: renovación inválida
    Authenticated --> Login: cerrar sesión
    Authenticated --> NotFound: URL inexistente o acceso denegado
    NotFound --> Root: volver al inicio
```

## Personal de almacén

**Identificador:** `DIA-ARQ-NAV-001`. El mapa muestra la navegación operativa base del
actor. La pantalla Personas sólo aparece cuando su asignación efectiva incluye
`persons:page-view`; los accesos independientes de administración, movimientos,
clientes, proveedores y catálogos auxiliares no forman parte de este recorrido.

```mermaid
flowchart TB
    actor["Personal de almacén"] --> menu(["Menú principal"])
    menu --> warehouse(["Almacén"])
    warehouse --> materials["Materiales<br/>/almacen/materiales"]
    warehouse --> consumables["Consumibles<br/>/almacen/consumibles"]
    warehouse --> wastes["Mermas<br/>/almacen/mermas"]
    menu --> purchases["Compras<br/>/compras"]
    menu --> issues(["Salidas"])
    issues --> goodsIssues["Materiales<br/>/salidas/materiales"]
    issues --> wasteIssues["Mermas<br/>/salidas/mermas"]
    menu -. "si posee persons:page-view" .-> persons["Personas<br/>/personas"]
```

## Administrador del sistema

**Identificador:** `DIA-ARQ-NAV-002`. Este actor dispone de la navegación operativa y de
los destinos administrativos. El diagrama expande todos los destinos para que pueda
leerse sin depender del mapa anterior; cada opción continúa condicionada por el permiso
indicado en el menú compartido.

```mermaid
flowchart TB
    actor["Administrador del sistema"] --> menu(["Menú principal"])
    menu --> warehouse(["Almacén"])
    warehouse --> materials["Materiales<br/>/almacen/materiales"]
    warehouse --> consumables["Consumibles<br/>/almacen/consumibles"]
    warehouse --> wastes["Mermas<br/>/almacen/mermas"]
    menu --> purchases["Compras<br/>/compras"]
    menu --> issues(["Salidas"])
    issues --> goodsIssues["Materiales<br/>/salidas/materiales"]
    issues --> wasteIssues["Mermas<br/>/salidas/mermas"]
    menu --> movements(["Movimientos"])
    movements --> materialMovements["Materiales<br/>/movimientos/materiales"]
    movements --> wasteMovements["Mermas<br/>/movimientos/mermas"]
    menu --> users["Usuarios<br/>/usuarios-sistemas"]
    menu --> catalogs(["Catálogos"])
    catalogs --> departments["Áreas<br/>/catalogos/departments"]
    catalogs --> roles["Roles<br/>/catalogos/roles"]
    catalogs --> presentations["Presentaciones<br/>/catalogos/presentations"]
    catalogs --> units["Unidades de medida<br/>/catalogos/unit-measures"]
    catalogs --> reasons["Motivos de ajuste<br/>/catalogos/reasons"]
    catalogs --> fulfillment["Estados de cumplimiento<br/>/catalogos/fulfillment-statuses"]
    menu --> persons["Personas<br/>/personas"]
    menu --> clients["Clientes<br/>/clientes"]
    menu --> suppliers["Proveedores<br/>/proveedores"]
```

Los modales CRUD no se dibujan como pantallas porque reutilizan la página propietaria y
no tienen rutas web independientes. Las redirecciones históricas se mantienen en el
[catálogo de pantallas](03-catalog-of-screens.md#redirecciones-de-compatibilidad).
