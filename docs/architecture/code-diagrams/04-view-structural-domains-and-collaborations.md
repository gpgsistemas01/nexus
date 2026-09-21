# 4. Vista estructural: dominios y colaboraciones

Esta vista responde qué dominios de transporte coordinan servicios compartidos. No
muestra cada import; para ello se usa el grafo generado de dependencias entre áreas. Los
subgrafos hacen visible el patrón **Monolito modular** y las flechas internas respetan la
**arquitectura por capas** sin presentar cada carpeta como un servicio desplegable.

```mermaid
flowchart LR
    subgraph admin["admin"]
        adminRoutes["Rutas y controllers<br/>usuarios · personas · movimientos · reportes"]
        adminServices["Servicios<br/>personas · usuarios · roles · departamentos"]
        adminRoutes --> adminServices
    end

    subgraph sales["sales"]
        salesRoutes["Rutas y controllers<br/>clientes · reportes"]
        salesServices["Servicio de clientes"]
        salesRoutes --> salesServices
    end

    subgraph warehouse["warehouse"]
        warehouseRoutes["Rutas y controllers<br/>catálogos · entradas · salidas · reportes"]
        catalogServices["Servicios de catálogo<br/>material · proveedor · merma"]
        documentServices["Servicios documentales<br/>entrada · salida material · salida merma"]
        warehouseRoutes --> catalogServices
        warehouseRoutes --> documentServices
    end

    documentServices --> inventory["Servicios compartidos de inventario<br/>stock · movimiento · consulta"]
    catalogServices --> inventory
    documentServices --> reference["Referencia documental"]
    adminRoutes --> inventory
```
