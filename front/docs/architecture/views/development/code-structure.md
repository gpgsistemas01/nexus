# Estructura y responsabilidades del código

## Solución y alcance

El cliente es una SPA Vue 3 con TypeScript y Composition API. Vue Router selecciona
páginas; Vuetify presenta controles; los composables coordinan estado e interacciones;
los servicios consumen la API mediante Axios. La API decide autorización y persistencia.
La [guía de incorporación](developer-onboarding.md) explica estos términos y recorre
un cambio desde la ruta hasta sus pruebas.

## Organización del código

```text
front/src/
├── main.ts             # Crear aplicación, proveedor visual, sesión y router
├── App.vue             # Contenedor raíz de navegación
├── app/
│   ├── router/         # Rutas, guardas y destino protegido
│   ├── pages/          # Errores y Workspaces de composición entre módulos
│   ├── layouts/        # Marco de navegación y contenido
│   ├── components/     # Presentación del menú
│   ├── composables/    # Acceso de páginas
│   └── plugins/        # Configuración visual de aplicación
├── modules/
│   ├── auth/           # Acceso, credenciales y contrato de sesión
│   ├── warehouse/      # Inventario de Materiales, Consumibles y Mermas
│   ├── catalogs/       # Seis catálogos administrables
│   ├── identity/       # Personas, responsabilidades y usuarios
│   ├── directory/      # Clientes y proveedores
│   ├── movements/      # Historiales y sus filtros/reportes
│   ├── purchases/      # Compras, detalles y corrección/cancelación
│   └── issues/         # Salidas, surtido y devolución
└── shared/
    ├── components/     # Marcos, tabla, modal, selector y controles transversales
    ├── composables/    # Listas, búsqueda, guardado, selección y ciclo de vida
    ├── http/           # Transporte, errores, contratos y descargas
    ├── services/       # Lecturas organizacionales transversales
    ├── ui/             # Avisos, defaults y estilos comunes
    └── utils/          # Funciones puras transversales
```

Las carpetas de cada módulo existen según sus necesidades. Un dominio puede tener
contratos en su raíz, `pages`, `components`, `composables`, `services` y `mappers`.
Los tipos no son otra capa ejecutable: describen datos y operaciones permitidas.

## Dirección de dependencias

| Elemento | Responsabilidad | Colaboración |
| --- | --- | --- |
| Arranque y Router | Crear colaboradores compartidos, resolver ruta y cargar sesión. | `main.ts`, `createAppRouter`, `createAuthSession`. |
| Page | Conectar permisos, consulta/editor y presentación de una capacidad. | Composable propio, componentes y contratos del módulo. |
| Workspace | Componer capacidades de dominios distintos por callbacks/eventos. | Inventario/Directorio con Compra o Salida. |
| Componente presentacional | Mostrar props, estado visual local y emitir intenciones. | Vue/Vuetify y presentación compartida; sin HTTP/sesión. |
| Composable | Estado, interacción y ciclo de vida de una responsabilidad. | Funciones, servicios y otros composables mediante contratos explícitos. |
| Servicio/mapper | Validar/traducir datos y realizar la operación HTTP del recurso. | Contratos, funciones puras y transporte compartido; sin renderizado. |
| Shared | Contrato o mecanismo transversal con consumidores identificados. | Sin dependencia de `app` o módulos de negocio. |

ESLint comprueba parte de estas fronteras; la revisión comprueba también dependencias
indirectas y efectos. La [referencia generada](code-reference.md) enumera archivos,
exports, contratos SFC e imports. Las [vistas de componentes](../logical/components/index.md)
muestran las colaboraciones de cada dominio.

## Estado y ciclo de vida

Cada lista/editor tiene estado propio. La sesión se crea una vez por aplicación y
se proporciona con una clave tipada. Las páginas consultan permisos de esa sesión;
las guardas conservan un destino interno válido cuando se requiere recuperar acceso.
Las lecturas reciben AbortSignal y una secuencia cuando se necesita descartar datos
obsoletos. Los listeners, timers y callbacks se cierran con su propietario.

El [inventario de estado](../logical/state-and-lifecycle.md) identifica alcance y salida
de cada dato. Los [estados de documentos](../logical/document-states.md) distinguen
consulta, edición, surtido, devolución y captura incierta.

## Reutilización y extensión

Los marcos de tabla, filtros y modal se componen con props, eventos y slots. Las listas
usan query aplicada y búsqueda borrador separadas. Los selectores remotos comparten
paginación, selección fuera de página, cancelación y reintento. Los editores comparten
interacción/guardado; los payloads y reglas de cada operación permanecen en su dominio.

Una capacidad exclusiva de un módulo permanece allí. Una necesidad transversal puede
extraerse cuando sus consumidores comparten un contrato. La extracción conserva
responsabilidades: un selector emite `create`, un Workspace abre el auxiliar y sólo
el resultado confirmado vuelve como opción al formulario origen.

El [catálogo de patrones](design-and-construction-patterns/index.md) mantiene problema,
modelo general, aplicaciones y límites. El [estándar](../../coding-standards/index.md)
regula nombres, formato, imports y revisión; las [decisiones](../../decisions.md)
explican las elecciones de arquitectura.

## Contratos, reglas públicas y construcción

Los servicios comprueban JSON y códigos de éxito. Los mappers seleccionan campos por
modo, conservan las versiones leídas cuando corresponden y excluyen derivados que
la API calcula. Las reglas de captura públicas se compilan mediante alias `@nexus/*`
definidos en Vite/TypeScript. El build requiere esas fuentes del checkout; los assets
resultantes no acceden al filesystem privado del servidor.

Los [contratos HTTP](../../contracts/client-contracts.md) describen paginación, errores, mutaciones
y descargas. La [vista física](../physical/index.md) identifica procesos, proxy y
frontera de build. Los comandos y archivos locales pertenecen a la [guía de inicio](../../../development/01-getting-started.md).

Los [contratos de formularios](../../contracts/form-and-event-contracts.md)
definen props, eventos y callbacks; los [modos de operación](../../../requirements/requirements-specification/06-operation-modes-and-effects.md),
los datos modificables. Los
[roles de las secuencias](../processes/00-reading-and-roles.md) identifican la frontera
visual o de transporte y el coordinador que ejecuta cada operación.

## Verificación del cambio

Se identifica el contrato afectado, se revisan consumidores y se elige la evidencia
que observa el riesgo. Unitarias comprueban datos/estado; navegador comprueba
interacción real con API simulada; sistema comprueba un recorrido con API y base
reales. El [plan](../../../testing/01-test-plan.md) define sus formatos y límites.
Los diagramas se mantienen junto con su colaboración y la referencia se regenera
cuando cambian fuentes o imports.
