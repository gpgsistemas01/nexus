# Vistas reutilizadas

| Vista | Patrón o notación | Pregunta que responde | Fuente y actualización |
| --- | --- | --- | --- |
| Contexto | Inspirada en C4, sin afirmar conformidad C4 | ¿Quién usa Nexus y con qué sistemas se comunica? | Decisión curada; cambia al agregar actores o dependencias externas. |
| Contenedores y capas | Capas y separación de responsabilidades | ¿Dónde se ejecuta cada responsabilidad principal? | Arquitectura curada y registro real de capas. |
| Despliegue | Grafo de nodos y entornos de ejecución inspirado en UML | ¿En qué entorno se ejecutan los artefactos y con qué dependencias se comunican? | Decisión operativa, `Dockerfile`, Compose y entrypoint; separa con línea discontinua la topología objetivo aún no versionada. |
| Secuencia | `sequenceDiagram` de Mermaid | ¿Cómo atraviesa las capas un caso concreto? | Flujo curado y asociado con un solo `CU-*`; no se crea si una ficha tabular basta. |
| Navegación | Máquina de estados inspirada en UML para acceso y mapa de sitio dirigido para el menú | ¿Qué transición cambia el estado de acceso y qué destinos ofrece la navegación principal? | Rutas web y `navList`; cambia al modificar sesión, destinos, categorías o permisos. |
| Trazabilidad | Grafo dirigido | ¿Desde dónde se llega a una evidencia? | Requisitos y referencias; la leyenda define el significado de cada enlace. |
| Ciclo CRUD o estados | Máquina de estados | ¿Qué transiciones admite el proceso? | Reglas de negocio; una flecha expresa una transición, no una llamada de código. |
| Entidad-relación | `erDiagram` de Mermaid | ¿Qué estructura persistente y cardinalidades existen? | Generada desde Prisma; Prisma y las migraciones conservan el detalle normativo. |
| Dominio conceptual | Conceptos y relaciones del negocio | ¿Qué lenguaje comparten actores y desarrollo sin introducir tablas o clases técnicas? | Curada con validación funcional; se enlaza con requisitos y persistencia. |
| Casos de uso | Objetivos agrupados por actor | ¿Qué quiere lograr un actor y qué capacidades están disponibles o pendientes? | Curada desde requisitos; no equivale a un inventario de endpoints. |
| Dependencias | Grafo dirigido generado | ¿Qué áreas importan otras áreas? | Generada desde imports relativos bajo `src`; no equivale a una dependencia en ejecución. |
