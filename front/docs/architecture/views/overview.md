# Vista general de la arquitectura web

## Contexto y organización

La aplicación es una SPA cliente-servidor con dominios funcionales, componentes de
presentación, composables y adaptadores HTTP. La documentación se organiza en vistas
4+1. Los cortes C4 muestran límites y colaboradores; las secuencias describen mensajes
y decisiones; los estados describen modos y recuperación.

## Vista lógica de ejecución del cliente

**Identificador:** `DIA-VUE-ARQ-001`. **Pregunta:** ¿dónde se ejecuta Vue y qué
relación tiene con Express y PostgreSQL? **Fuente:** `main.ts`, Router,
`apiClient`, `vite.config.ts`, Dockerfiles y `back/src/lib/prisma.js`.
Vista inspirada en el nivel de contenedores C4 con cajas Mermaid: es una
aproximación, no notación C4 completa ni prueba de un proveedor desplegado.
Las flechas representan interacción o comunicación, no orden de arranque.

**Lectura visual:** [formas, límites y flechas del mapa](diagram-reading.md#mapas-y-actividades).

```mermaid
flowchart TB
    user["Usuario autorizado"]
    user -->|interactúa| spa
    spa["Frontend Vue<br/>SPA en el navegador"] -->|API mediante proxy HTTP| api["Express<br/>API de la aplicación"]
    api -->|consultas y transacciones| db[("PostgreSQL")]
```

La SPA y la API son unidades de software con responsabilidades distintas. Un
«contenedor» C4 no equivale necesariamente a un contenedor Docker: Vue se ejecuta
en el navegador; Nginx u otro alojamiento entrega sus archivos estáticos.
El [Dockerfile frontend](../../../Dockerfile) compila `dist` y lo entrega con Nginx;
el [Dockerfile raíz](../../../../Dockerfile) prepara Express. No se necesita ejecutar
ambas aplicaciones en una misma imagen.

En desarrollo Vite sirve el cliente y deriva la API. En la imagen frontend,
[nginx.conf](../../../nginx.conf) configura el destino mediante `BACKEND_UPSTREAM`.
Las variantes de proveedor requieren su configuración de proxy/fallback y cookies;
el repositorio no acredita por sí solo cuál está desplegada. El navegador no
accede a Prisma, credenciales de PostgreSQL ni archivos privados del servidor.

## Vista de componentes: navegación y acceso a Catálogos

**Identificador:** `DIA-VUE-ARQ-002`. **Pregunta:** ¿qué componentes lógicos enlazan
navegación, sesión, módulo y transporte? **Fuente:** `main.ts`, `createAppRouter`,
`createAuthSession`, `usePageAccess`, `CatalogPage` y `catalogService`.
Corte de componentes inspirado en C4, representado con Mermaid; flechas = consumo
de un colaborador. No enumera todos los módulos ni representa unidades Docker.

```mermaid
flowchart TB
    router["Arranque y Router<br/>main.ts y createAppRouter"] --> catalog["Módulo Catálogos<br/>páginas, composables y servicio"]
    router --> session["Sesión de aplicación<br/>createAuthSession"]
    catalog -->|mediante usePageAccess| session
    catalog --> http["Transporte compartido<br/>apiClient"]
    session --> http
    http --> api["API del sistema"]
```

La tabla de [fuentes propietarias](../../index.md#organización-y-fuentes-propietarias)
ubica los componentes. El [patrón contenedor/presentación](development/design-and-construction-patterns/02-container-and-presentation.md)
y los [composables configurados](development/design-and-construction-patterns/03-composables-and-callbacks.md)
amplían el interior del módulo; la [provisión de sesión](development/design-and-construction-patterns/06-session-provision.md)
explica que Router y páginas usan la misma instancia. Se evita repetir todo el
código de cada página en el diagrama arquitectónico.

## Cómo documentar una página o flujo web

Las [reglas de síntesis](../../governance/01-documentation-rules.md#síntesis-y-lectura-visual)
indican cuándo usar gráficos, tablas y texto. La
[referencia por módulo](development/frontend-technical-documentation/index.md)
relaciona objetivos, contratos, permisos, errores y evidencia con los colaboradores reales.
El [inicio local](../../development/01-getting-started.md) conserva los comandos de preparación.

## Referencias

- [Modelo C4](https://c4model.com/diagrams).
- [Vistas del cliente](index.md).
- [Criterios documentales](../../governance/03-standard-applicability.md).
