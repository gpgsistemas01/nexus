# Ejecución y frontera de construcción

**Identificador:** `DIA-VUE-FIS-001`. **Pregunta:** ¿Qué se ejecuta en desarrollo y por dónde pasa la API?

**Fuente:** vite.config.ts, main.ts y apiClient.ts. **Notación y alcance:** Topología de ejecución aproximada con Mermaid; conexiones HTTP y persistencia, no UML de despliegue completo.

```mermaid
flowchart LR
    browser["Navegador · Vue y Router"] -->|assets y HMR| vite["Vite :5173"]
    browser -->|mismo origen /api y cierre| vite
    vite -->|proxy BACKEND_PROXY_TARGET| api["API Express :3000 por defecto"]
    api -->|reglas y persistencia| db[("PostgreSQL")]
```

**Identificador:** `DIA-VUE-FIS-002`. **Pregunta:** ¿Qué entra al build y qué llega a la imagen final?

**Fuente:** front/Dockerfile, Dockerfile.dockerignore y nginx.conf. **Notación y alcance:** Mapa de artefactos y ejecución; las etapas build y runtime se distinguen de procesos desplegados.

```mermaid
flowchart TB
    checkout["Checkout raíz"] --> vue["front/src y configuración"]
    checkout --> shared["Fuentes públicas permitidas de back/src"]
    vue --> build["Etapa Node · npm ci y Vite build"]
    shared --> build
    build --> dist["dist · HTML, JS, CSS y assets"]
    dist --> nginx["Imagen final · Nginx y configuración"]
    browser["Navegador"] -->|assets y fallback SPA| nginx
    nginx -->|API y cierre por upstream| api["Servicio API independiente"]
    docs["docs, scripts y build/docs"] -. excluidos del contexto .-> excluded["Fuera de imagen final"]
```

El [procedimiento de despliegue](../../../development/03-build-and-deployment.md) concreta comandos, variables, cookies y recuperación de fallos.
