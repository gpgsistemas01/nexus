# Navegación y catálogo de pantallas web

## Propósito y alcance

Este documento reúne exclusivamente las vistas que describen la experiencia web de
Nexus: estados de acceso, navegación disponible, pantallas y redirecciones de
compatibilidad. No describe contenedores, componentes, despliegue ni dependencias entre
capas; esas decisiones pertenecen a la [descripción de arquitectura](architecture-and-web-views.md).

Las vistas usan Mermaid y siguen las [convenciones de diagramas](diagram-conventions.md).
Las rutas registradas se comprueban en el [mapa generado del código](../generated/code-map.md),
mientras que aquí se conserva el propósito visible y la estructura de navegación que
no pueden inferirse automáticamente.

## 1. Mapa visual de navegación

La navegación se documenta con dos vistas para no confundir estados de sesión con la
jerarquía del menú. La primera usa la notación de máquina de estados de Mermaid,
inspirada en UML, porque sus flechas sí representan transiciones. La segunda es un
mapa de sitio dirigido: una flecha significa que el destino se ofrece desde el menú,
no que exista una secuencia obligatoria entre pantallas. Las rutas entre paréntesis
son las URL registradas; el acceso efectivo y la visibilidad de cada opción dependen
de los permisos calculados para la sesión.

El shell usa en todos los tamaños el mismo control de navegación del encabezado. Para
que sea inmediatamente reconocible, ocupa la posición inicial convencional, conserva
el icono de hamburguesa, muestra siempre la etiqueta «Menú principal» y emplea mayor
contraste que las acciones secundarias. El control abre desde arriba y por encima del
contenido un único offcanvas adaptable, con etiquetas completas, por lo que no resta
anchura a tablas y formularios ni redimensiona la página. El panel se ancla a los
cuatro bordes de la ventana y sobrescribe las variables de tamaño del componente de
MDB con el `100%` de su bloque contenedor fijo. También mantiene el desplazamiento
vertical dentro de su cuerpo; así ocupa toda el área visible sin que el alto
predeterminado del offcanvas vuelva a recortarlo al cambiar el tamaño o la orientación.
En anchos menores a `1200px` mantiene una columna fácil de recorrer; a partir de ese
ancho distribuye las opciones en tres columnas, o cuatro desde `1600px`, para
aprovechar el espacio horizontal sin estrechar cada opción ni convertir la navegación
en una barra lateral permanente. Cada acceso de primer nivel forma un bloque visual y
las categorías conservan sus opciones relacionadas dentro de ese bloque. Se mantiene
una única lista semántica y el partial compartido `navList`: las columnas son una
adaptación de presentación, no listas paralelas que puedan divergir en permisos,
estado activo o destinos. La interacción, el estado activo, los permisos y los
submenús conservan una sola implementación en todos los tamaños, y la capa superpuesta
concentra la atención en la navegación.
Durante la apertura, el activador sincroniza `aria-expanded` con los eventos de MDB.
El panel identifica explícitamente su título como «Menú principal», expone la lista
como navegación principal, aporta una instrucción no visible asociada mediante
`aria-describedby` y conserva dentro del encabezado su control compartido de cierre.
Así, la señal visual para abrir permanece siempre reconocible, la interfaz evita texto
explicativo redundante y las acciones de abrir y cerrar están disponibles en el
contexto donde cada una se utiliza.
La identidad se resuelve con un monograma tipográfico, fondos con profundidad y
transiciones breves; no depende de una imagen adicional y respeta la preferencia del
sistema para reducir movimiento.

### Estados de acceso y sesión

Esta máquina cubre las rutas web que no son destinos del menú: raíz, autenticación,
renovación, cierre de sesión y recuperación ante una ruta no encontrada. El estado
«Área autenticada» agrupa las pantallas protegidas inventariadas en el mapa de sitio
siguiente; no representa una pantalla adicional.

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
    Authenticated --> Refresh: token de acceso vencido
    Refresh --> Authenticated: renovación válida
    Refresh --> Login: renovación inválida
    Authenticated --> Login: cerrar sesión (POST /cerrar-sesion)
    Authenticated --> NotFound: URL web inexistente o acceso web denegado
    NotFound --> Root: volver al inicio
```

### Mapa de sitio del menú principal

El nodo raíz representa el partial compartido `navList`. Los nodos de categoría son
controles que despliegan opciones y no URL; los rectángulos terminales son todas las
pantallas ofrecidas por el menú vigente. Abrir o cerrar el offcanvas no cambia de
pantalla y, por ello, no se modela como transición.

```mermaid
flowchart TB
    menu(["Menú principal"])

    menu --> warehouse(["Almacén"])
    warehouse --> materials["Materiales<br/>/almacen/materiales"]
    warehouse --> wastes["Mermas<br/>/almacen/mermas"]

    menu --> purchases["Compras<br/>/compras"]

    menu --> issues(["Salidas"])
    issues --> goodsIssues["Materiales<br/>/salidas/materiales"]
    issues --> wasteIssues["Mermas<br/>/salidas/mermas"]

    menu --> movements(["Movimientos"])
    movements --> materialMovements["Materiales<br/>/movimientos/materiales"]
    movements --> wasteMovements["Mermas<br/>/movimientos/mermas"]

    menu --> users["Usuarios<br/>/usuarios-sistemas"]
    menu --> persons["Personas<br/>/personas"]
    menu --> clients["Clientes<br/>/clientes"]
    menu --> suppliers["Proveedores<br/>/proveedores"]
```

La ruta `/movimientos` redirige a `/movimientos/materiales`; los alias históricos se
documentan en [Redirecciones de compatibilidad](#redirecciones-de-compatibilidad). No
se dibujan los modales CRUD como páginas porque reutilizan el contexto de su pantalla
propietaria y no registran rutas web independientes.

## 2. Catálogo de pantallas

| Área | Pantalla y ruta | Propósito visible | Interacciones principales | Implementación EJS |
| --- | --- | --- | --- | --- |
| Acceso | Inicio de sesión (`/inicio-sesion`) | Autenticar una cuenta. | Capturar credenciales e iniciar sesión. | `src/views/pages/home/login/loginPage.ejs` |
| Almacén | Existencias (`/almacen/materiales`) | Consultar materiales y stock; las columnas `Existencia` y `Costo Unitario de Conversión` mantienen los mismos títulos que en Mermas, y todas las celdas de cada fila, incluido el nombre, se muestran centradas. | Filtrar, paginar y abrir el alta/edición de material. | `src/views/pages/warehouse/materials/materialsPage.ejs` |
| Almacén | Mermas (`/almacen/mermas`) | Consultar y administrar existencias de merma con todas las celdas de cada fila centradas, incluido el nombre. | Filtrar, registrar/editar y ajustar stock. | `src/views/pages/warehouse/wastes/wastesPage.ejs` |
| Almacén | Registro de compras (`/compras`) | Consultar y registrar entradas de compra. | Filtrar, registrar compra, materiales/proveedores y corregir detalles. | `src/views/pages/warehouse/goodsReceipts/goodsReceiptsPage.ejs` |
| Almacén | Salidas de almacén (`/salidas/materiales`) | Consultar y registrar entregas de materiales. | Filtrar, registrar salida, seleccionar cliente y devolver detalles. | `src/views/pages/warehouse/goodsIssues/goodsIssuesPage.ejs` |
| Almacén | Salidas de mermas (`/salidas/mermas`) | Consultar y registrar salidas de merma. | Registrar, editar, surtir y devolver detalles de merma. | `src/views/pages/warehouse/wasteIssues/wasteIssuesPage.ejs` |
| Almacén | Proveedores (`/proveedores`) | Consultar y administrar proveedores. | Crear/editar desde modal. | `src/views/pages/warehouse/suppliers/suppliersPage.ejs` |
| Administración | Clientes (`/clientes`) | Consultar y administrar clientes. | Crear/editar desde modal. | `src/views/pages/sales/clients/clientsPage.ejs` |
| Administración | Usuarios (`/usuarios-sistemas`) | Administrar cuentas y asignaciones. | Crear/editar usuario, roles y departamentos. | `src/views/pages/admin/users/usersPage.ejs` |
| Administración | Personas (`/personas`) | Administrar personas participantes del negocio. | Filtrar y crear/editar datos y asignaciones. | `src/views/pages/admin/persons/personsPage.ejs` |
| Administración | Movimientos de materiales (`/movimientos/materiales`) | Auditar movimientos del inventario de materiales. | Filtrar, consultar y exportar el historial. | `src/views/pages/admin/movements/movementsPage.ejs` |
| Administración | Movimientos de merma (`/movimientos/mermas`) | Auditar movimientos del inventario de merma. | Filtrar, consultar y exportar el historial. | `src/views/pages/admin/movements/movementsPage.ejs` |
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

## 3. Mantenimiento

Al agregar, renombrar o retirar una vista web:

1. Actualizar el mapa de navegación y el catálogo de este documento.
2. Regenerar el catálogo de rutas; no copiarlo al `README.md`.
3. Verificar que ruta, permiso, controlador, plantilla y JavaScript de página conserven
   nombres coherentes.
4. Si cambia un límite del sistema o una dependencia externa, actualizar también los
   diagramas de contexto y contenedores.
5. Revisar los diagramas en la vista previa de Markdown de GitHub antes de fusionar.
6. Ejecutar `npm run docs:architecture` cuando cambien routers o imports entre áreas y
   confirmar con `npm run docs:check` antes de enviar el cambio. La misma verificación
   se ejecuta automáticamente en CI para pull requests y pushes a la rama principal.

Los diagramas describen el diseño a nivel de sistema; el código sigue siendo la fuente
de verdad para los detalles de endpoints, payloads y reglas de autorización. Las vistas
nuevas deben seguir las [convenciones y patrones para diagramas](diagram-conventions.md),
incluida la distinción entre notación visual, patrón documental y patrón con evidencia
en el código.
