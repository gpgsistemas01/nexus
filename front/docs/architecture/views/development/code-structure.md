# Estructura y responsabilidades del código

El código se organiza en aplicación, módulos de negocio y colaboradores compartidos. La
[guía de incorporación](developer-onboarding.md) recorre una edición para mostrar cómo
encontrarlos.

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

Cada módulo crea sólo las carpetas que necesita: contratos, `pages`, `components`,
`composables`, `services` y `mappers`. Los tipos describen datos y operaciones; no añaden
una capa ejecutable.

## Unidades de construcción

| Unidad | Organización concreta |
| --- | --- |
| `main.ts` y `app` | El arranque inicia la aplicación; el Router carga sus páginas. Los Workspaces integran dominios: `PurchaseWorkspace` compone Compras, Directorio e Inventario. |
| `modules/<dominio>` | El archivo del dominio, como `purchase.ts`, declara contratos; `*Config.ts`, etiquetas y descriptores. `pages` conecta presentación y composables; `services` y `mappers` conservan sus adaptaciones propias. |
| `shared` | Controles, contratos y funciones usados por distintos módulos. `usePagedList` recibe la consulta por callback y `ServerTable` recibe datos/slots; ninguno importa el servicio de un dominio. |

La [composición de documentos](design-and-construction-patterns/08-document-responsibilities.md)
localiza reglas, esquemas, detalles y adaptadores de Compras/Salidas. El
[alta contextual](design-and-construction-patterns/09-contextual-creation.md) muestra
cómo un Workspace conecta módulos mediante contratos de retorno.

Las direcciones permitidas y las restricciones que comprueba ESLint se definen en
el [estándar de imports](../../coding-standards/04-imports-exports-and-dependencies.md#dirección-admisible).
La [referencia generada](code-reference.md) enumera los archivos, exports e imports
reales; los [mapas de componentes](../logical/components/index.md) seleccionan las
dependencias relevantes de cada dominio.

## Navegación y carga de páginas

`src/app/router/index.ts` registra y carga páginas bajo demanda; `App.vue` las presenta en
`RouterView`. Para añadir una pantalla, crear su contenedor y registrar recurso y permiso
en el router. Los diálogos pueden vivir en `pages` sin URL propia.

Los enlaces internos usan `RouterLink`; una operación puede navegar mediante el
router. Los enlaces HTML normales se reservan a destinos externos. El
[catálogo de pantallas](../scenarios/navigation-and-screens.md) conserva rutas,
contenedores y recuperación de navegación.
