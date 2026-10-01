# 1. Componentes y reutilización de frontend y backend

La vista muestra los componentes compartidos por `auth`, `admin`, `sales` y `warehouse`.

## Componentes y conexión entre frontend y backend

**Diagrama UML de componentes:** `DIA-ARQ-CMP-001`.

```mermaid
flowchart LR
    browser["Navegador"]

    subgraph frontend["Frontend entregado al navegador"]
        direction TB
        visual["«component»<br/>Componentes visuales<br/>*Page · formularios · modales · tablas<br/>public/js/ui · DataTable · Select2 · SweetAlert"]
        application["«component»<br/>Aplicación y composición<br/>application/&lt;dominio&gt;<br/>CRUD · reportes · salidas"]
        http["«component»<br/>Transporte HTTP<br/>services/{auth, admin, sales, warehouse}<br/>axiosInstanceApi"]
        socketClient["«component»<br/>Cliente Socket.IO<br/>window.io · indexPage"]

        visual --> application --> http
        socketClient -->|"CustomEvent"| visual
    end

    webInterface(("«interface»<br/>HTTP web"))
    staticInterface(("«interface»<br/>HTTP estático"))
    apiInterface(("«interface»<br/>HTTP /api"))
    eventInterface(("«interface»<br/>Socket.IO"))

    subgraph server["Backend · Node.js / Express"]
        direction TB
        web["«component»<br/>Web MVC<br/>routes/web · controllers/web<br/>views/pages · views/shared · layout"]
        static["«component»<br/>Archivos estáticos<br/>express.static"]
        api["«component»<br/>Frontera API<br/>routes/api · middleware · controllers/api · DTO"]
        domain["«component»<br/>Servicios backend<br/>auth · admin · sales · warehouse"]
        shared["«component»<br/>Servicios compartidos<br/>auditoría · documentos · inventario"]
        persistence["«component»<br/>Persistencia<br/>baseRepository · Prisma"]
        realtime["«component»<br/>Servidor Socket.IO<br/>socketUtils"]

        api --> domain
        domain --> shared
        domain --> persistence
        shared --> persistence
        api -->|"emite después de la escritura"| realtime
    end

    browser -->|"GET de navegación"| webInterface --> web
    web -->|"HTML o redirección"| webInterface --> browser
    browser -->|"GET de JS/CSS"| staticInterface --> static
    static -->|"módulos y estilos"| staticInterface --> visual
    http -->|"JSON, query o descarga"| apiInterface --> api
    api -->|"JSON o Blob"| apiInterface --> http
    socketClient -->|"conexión"| eventInterface --> realtime
    realtime -->|"eventos de inventario"| eventInterface --> socketClient
```

El diagrama general se complementa con [OpenAPI](../../openapi/openapi.json), las
[secuencias por caso de uso](../processes/index.md) y el
[patrón de componentes visuales](../development/design-and-construction-patterns/12-composition-and-ownership-of-components-visual.md).

### Canales comprobados en la implementación

La implementación usa estos canales:

| Canal | Recorrido real | Uso |
| --- | --- | --- |
| Página web | Navegador → ruta web → middleware/controller web → `res.render` o redirección. | Entrega el HTML EJS inicial. |
| Archivos estáticos | HTML → `GET /js/*` o `/css/*` → `express.static`. | Entrega los módulos ES y estilos que forman el frontend en el navegador. |
| API operacional | Página/UI → aplicación frontend → archivo `*Service.js` → `apiRequest` → Axios → ruta `/api` → middleware → controller API → servicio backend → Prisma o efecto. | Consultas, escrituras y descargas; la respuesta vuelve por la misma petición como JSON o `Blob`. |
| Renovación de sesión | Interceptor de `axiosInstanceApi.js` → `POST /api/auth/refresh` → reintento de la petición original; si falla, redirección a `/`. | Recupera una petición que recibió `401`; Axios envía las cookies porque usa `withCredentials`. |
| Tiempo real | Controller API después de una escritura → `emitInventoryUpdated` → Socket.IO → `indexPage.js` → `CustomEvent` → DataTable interesado. | Notifica cambios de materiales, mermas y movimientos; no reemplaza la respuesta HTTP ni transporta la escritura inicial. |

## Reutilización comprobada en el frontend

Las factories, configuradores y consumidores se detallan en los
[diagramas de reutilización](../development/code-diagrams/06-view-of-reuse-crud-and-interface.md)
y en el patrón [`DIA-PAT-CON-001`](../development/design-and-construction-patterns/04-catalog-visual-of-patterns-applied.md#factories-y-composición-sobre-herencia).

## Criterio para extender un flujo

1. Registrar la ruta bajo el dominio existente y mantener juntos sus nombres a través
   de ruta, controlador, servicio, aplicación y página.
2. Reutilizar una factory o componente compartido cuando el recorrido sea el mismo y
   expresar la diferencia mediante configuración; conservar en el dominio los
   selectores, payloads y reglas que no sean generales.
3. Mantener una sola transacción backend para escrituras compuestas y propagar `tx` a
   cada colaborador.
4. Representar una colaboración nueva en este diagrama sólo si cambia la estructura;
   el detalle de imports y rutas pertenece al [mapa generado](../development/code-map.md)
   y las secuencias concretas a las colecciones de
   [frontend](../processes/frontend-code-sequences/index.md) y
   [backend](../processes/backend-code-sequences/index.md).
