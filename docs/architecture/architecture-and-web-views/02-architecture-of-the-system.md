# 2. Arquitectura del sistema

### Diagrama de contexto del sistema

Esta vista responde **quién utiliza Nexus y para qué se relaciona con él**. Su límite
es el sistema completo: las personas se muestran fuera y Nexus como una única caja;
el navegador, Express y Prisma son detalles internos y, por tanto, no forman parte de
este nivel. Supabase sí aparece porque es un sistema externo administrado del que
Nexus depende para persistir sus datos. Las flechas expresan interacción, no permisos
individuales ni una secuencia técnica.

```mermaid
flowchart LR
    warehouse["Personal de almacén y proveduría<br/>Actor operativo"]
    administration["Administración del sistema<br/>Actor administrativo"]
    management["Coordinación y dirección<br/>Parte interesada de supervisión"]
    nexus["Nexus<br/>Sistema de control operativo"]
    supabase[("Supabase<br/>Servicio externo de PostgreSQL")]

    warehouse -->|"Registra y consulta la operación<br/>de inventario"| nexus
    administration -->|"Administra accesos, personas,<br/>catálogos y ajustes protegidos"| nexus
    management -->|"Consulta trazabilidad,<br/>reportes e indicadores"| nexus
    nexus -->|"Persiste y consulta<br/>datos operativos"| supabase
```

Supabase es una dependencia de infraestructura, no una integración funcional pública
como ERP, CRM o transportistas, que permanecen fuera del alcance. Render se muestra en
la vista de despliegue y no aquí porque aloja Nexus sin ser un sistema con el que los
actores intercambien información de negocio.

### Contenedores y capas

```mermaid
flowchart TB
    subgraph client["Navegador"]
        pages["Vistas EJS renderizadas"]
        scripts["JavaScript de páginas, módulos y servicios"]
        pages --> scripts
    end

    subgraph server["Aplicación Node.js / Express"]
        middleware["Middleware<br/>autenticación · autorización · validación"]
        webRoutes["Rutas y controladores web"]
        apiRoutes["Rutas y controladores API REST"]
        services["Servicios de dominio"]
        realtime["Socket.IO"]
        prisma["Prisma Client"]

        middleware --> webRoutes
        middleware --> apiRoutes
        webRoutes --> services
        apiRoutes --> services
        services --> prisma
        services --> realtime
    end

    database[("PostgreSQL")]
    pages <-->|"HTML"| webRoutes
    scripts <-->|"JSON"| apiRoutes
    scripts <-->|"eventos"| realtime
    prisma <-->|"SQL"| database
```

### Despliegue actual: Render y Supabase

La instancia vigente aloja la aplicación en Render y utiliza PostgreSQL administrado
por Supabase. Esa asignación es una decisión operativa curada; el contenido del
contenedor y su arranque sí se verifican en `Dockerfile` y `docker-entrypoint.sh`. Los
rectángulos anidados son nodos o entornos de ejecución; el cilindro representa la base
de datos y las flechas indican comunicación o secuencia de arranque. Las credenciales
se inyectan como variables de entorno en Render y no forman parte de la imagen.

```mermaid
flowchart TB
    browser["Navegador del usuario"]

    subgraph render["Render · servicio web administrado"]
        publicEndpoint["Endpoint público de Render"]
        subgraph appContainer["Contenedor app · imagen Nexus"]
            entrypoint["docker-entrypoint.sh<br/>NODE_ENV=production"]
            migrations["Prisma CLI<br/>migrate deploy"]
            nodeApp["Node.js / Express / Socket.IO<br/>puerto 3000"]

            entrypoint -->|"RUN_MIGRATIONS=true"| migrations
            migrations -->|"migración correcta"| nodeApp
            entrypoint -->|"RUN_MIGRATIONS=false"| nodeApp
        end

        publicEndpoint --> nodeApp
    end

    subgraph supabase["Supabase · servicio administrado"]
        runtimeEndpoint["Endpoint de ejecución<br/>DATABASE_URL · directo o pooler"]
        database[("PostgreSQL<br/>base Nexus")]
        runtimeEndpoint --> database
    end

    browser -->|"HTTPS"| publicEndpoint
    nodeApp -->|"consultas de aplicación"| runtimeEndpoint
    migrations -->|"conexión directa · DIRECT_URL"| database
```

La aplicación usa `DATABASE_URL` durante la ejecución y Prisma CLI usa `DIRECT_URL`
durante las migraciones. Si las migraciones están activadas, un fallo o la ausencia de
la URL directa detiene el contenedor antes de iniciar Node.js. `docker-compose.yml`
conserva el mismo contenedor como alternativa reproducible para ejecución en un host,
pero no describe el entorno de producción actual ni levanta PostgreSQL localmente.

### Despliegue objetivo: aplicación en un VPS

La dirección prevista es trasladar el contenedor de la aplicación desde Render a un
VPS. Esta es una vista objetivo, no implementada: las líneas discontinuas distinguen
la intención de la topología actual. Antes de considerarla vigente deben versionarse
la terminación TLS, el proxy inverso, la automatización del despliegue, respaldos y
monitoreo. También queda por decidir si la persistencia continuará en Supabase o se
operará PostgreSQL en infraestructura propia.

```mermaid
flowchart LR
    browserTarget["Navegador del usuario"]

    subgraph vps["VPS · objetivo"]
        ingress["Proxy inverso y TLS<br/>por definir"]
        nexusContainer["Contenedor Nexus<br/>Node.js · puerto interno 3000"]
        ingress -.-> nexusContainer
    end

    targetDatabase[("Persistencia objetivo<br/>Supabase o PostgreSQL propio<br/>decisión pendiente")]

    browserTarget -.->|"HTTPS"| ingress
    nexusContainer -.->|"DATABASE_URL / DIRECT_URL"| targetDatabase
```

### Componentes de aplicación

Esta vista UML de componentes complementa los contenedores: muestra contratos y
dependencias de diseño, no cada import concreto. El detalle mecánico permanece en el
[mapa generado](../../generated/code-map.md).

```mermaid
classDiagram
    class Rutas {
        <<component>>
        +autorizar()
        +validar()
    }
    class Controladores {
        <<component>>
        +traducirHTTP()
    }
    class DTO {
        <<component>>
        +normalizarEntrada()
        +normalizarSalida()
    }
    class ServiciosDominio {
        <<component>>
        +ejecutarCasoDeUso()
    }
    class RepositorioPrisma {
        <<component>>
        +consultar()
        +persistir()
    }
    class AplicacionCliente {
        <<component>>
        +coordinarCRUD()
    }
    class ComponentesUI {
        <<component>>
        +presentarEstado()
    }

    Rutas --> Controladores
    Controladores --> DTO
    Controladores --> ServiciosDominio
    ServiciosDominio --> RepositorioPrisma
    AplicacionCliente --> Rutas : HTTP
    ComponentesUI --> AplicacionCliente
```

### Recorrido de una interacción

```mermaid
sequenceDiagram
    actor U as Usuario
    participant V as Vista EJS + JS
    participant R as Ruta / middleware
    participant C as Controlador
    participant S as Servicio
    participant P as Prisma / PostgreSQL

    U->>V: abre una pantalla o ejecuta una acción
    V->>R: petición web o API
    R->>R: autentica, autoriza y valida
    R->>C: delega la petición
    C->>S: coordina el caso de uso
    S->>P: consulta o modifica datos
    P-->>S: resultado
    S-->>C: resultado de dominio
    C-->>V: HTML o JSON
    V-->>U: actualiza la interfaz
```
