# 3. Vista estructural: superficie HTTP registrada

Esta vista responde qué áreas exponen rutas API y páginas web. Los conteos son una
fotografía revisada contra los routers vigentes: 61 rutas API y 16 rutas web. El detalle
de método, ruta y archivo permanece en el mapa generado.

```mermaid
flowchart TB
    nexus["Nexus HTTP"]
    api["API · 61 rutas"]
    web["Web · 16 rutas"]

    nexus --> api
    nexus --> web

    api --> apiAuth["auth · 3<br/>sesión e identidad actual"]
    api --> apiAdmin["admin · 14<br/>usuarios · personas · movimientos · reportes"]
    api --> apiSales["sales · 4<br/>clientes · reporte"]
    api --> apiWarehouse["warehouse · 40<br/>catálogos · entradas · salidas · reportes"]

    web --> webAuth["auth · 3"]
    web --> webAdmin["admin · 5"]
    web --> webSales["sales · 1"]
    web --> webWarehouse["warehouse · 6"]
    web --> webHome["home · 1"]
```
