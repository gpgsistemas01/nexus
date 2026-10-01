# 1. Componentes y reutilización de frontend y backend

La vista muestra los componentes compartidos por `auth`, `admin`, `sales` y `warehouse`.

## Componentes y conexión entre frontend y backend

**Diagrama de componentes:** `DIA-ARQ-CMP-001`.

```mermaid
C4Component
    title Componentes y conexión entre frontend y backend

    Container(browser, "Navegador", "Web browser", "Ejecuta el frontend y presenta la interfaz")

    Container_Boundary(frontend, "Frontend entregado al navegador") {
        Component(visual, "Componentes visuales", "Page · formularios · modales · tablas", "public/js/ui · DataTable · Select2 · SweetAlert")
        Component(application, "Aplicación y composición", "application/<dominio>", "CRUD · reportes · salidas")
        Component(http, "Transporte HTTP", "services/{auth, admin, sales, warehouse}", "axiosInstanceApi")
        Component(socketClient, "Cliente Socket.IO", "window.io", "indexPage")
    }

    Container_Boundary(server, "Backend · Node.js / Express") {
        Component(web, "Web MVC", "routes/web · controllers/web", "views/pages · views/shared · layout")
        Component(static, "Archivos estáticos", "Express", "express.static")
        Component(api, "Frontera API", "routes/api · middleware", "controllers/api · DTO")
        Component(domain, "Servicios backend", "auth · admin · sales · warehouse", "Reglas de negocio y transacciones")
        Component(shared, "Servicios compartidos", "auditoría · documentos · inventario", "Capacidades reutilizadas entre dominios")
        Component(persistence, "Persistencia", "baseRepository · Prisma", "Acceso a datos")
        Component(realtime, "Servidor Socket.IO", "socketUtils", "Publicación de eventos")
    }

    Rel(visual, application, "Delega acciones")
    Rel(application, http, "Solicita operaciones")
    Rel(socketClient, visual, "Publica CustomEvent")
    Rel(browser, web, "Solicita navegación", "HTTP GET")
    Rel(web, browser, "Entrega HTML o redirección", "HTTP")
    Rel(browser, static, "Solicita JS/CSS", "HTTP GET")
    Rel(static, visual, "Entrega módulos y estilos", "HTTP")
    Rel(http, api, "Envía JSON, query o descarga", "HTTP /api")
    Rel(api, http, "Responde JSON o Blob", "HTTP /api")
    Rel(socketClient, realtime, "Establece conexión", "Socket.IO")
    Rel(realtime, socketClient, "Publica eventos de inventario", "Socket.IO")
    Rel(api, domain, "Delega")
    Rel(domain, shared, "Reutiliza")
    Rel(domain, persistence, "Persiste")
    Rel(shared, persistence, "Persiste")
    Rel(api, realtime, "Emite después de la escritura")
```

El bloque usa `C4Component` y declara cada pieza mediante `Component(...)`; la figura y
la identificación visual del componente las genera Mermaid, sin estereotipos ni glifos
añadidos manualmente. Los protocolos se conservan en las relaciones que cruzan las
fronteras del navegador y del backend.

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
