# Vistas de arquitectura de la API

[ISO/IEC/IEEE 42010:2022](https://www.iso.org/standard/74393.html) es la referencia
para describir la arquitectura: interesados, preocupaciones, puntos de vista y modelos.
Se aplica como guía; no se declara conformidad integral.

## Estilos arquitectónicos identificados

| Estilo o estructura | Evidencia en el sistema | Cómo se documenta |
| --- | --- | --- |
| Cliente-servidor | Vue consume contratos HTTP de Express; PostgreSQL es una dependencia externa. | Contexto C4 y despliegue; contratos en OpenAPI. |
| Monolito modular por dominio con capas | Rutas/controladores, servicios y persistencia viven en una aplicación Node y se agrupan por dominio. | Componentes UML y dependencias entre capas y módulos. |
| Persistencia relacional | Prisma define el acceso a PostgreSQL y las transacciones coordinan escrituras. | Modelo ER y secuencias de confirmación, conflicto y rollback. |
| Procesamiento concurrente acotado | El análisis de Excel usa workers temporales `worker_threads` dentro del mismo backend. | Secuencias de ejecución que distinguen el hilo HTTP del worker; no se dibuja como servicio independiente. |
| Notificación complementaria | El backend publica eventos por Socket.IO después de completar operaciones; el cliente Vue actual no mantiene una suscripción. | Mostrar el canal como contrato secundario en componentes y despliegue, sin clasificar el sistema como arquitectura dirigida por eventos. |

## Métodos para describirla

Los estilos describen cómo está construido el sistema; estas referencias describen
cómo comunicar esa estructura. No son alternativas excluyentes.

| Método o notación | Uso en esta documentación |
| --- | --- |
| [ISO/IEC/IEEE 42010:2022](https://www.iso.org/standard/74393.html) | Guía para relacionar interesados, preocupaciones, puntos de vista y modelos; se usa como referencia, sin declarar conformidad integral. |
| [4+1 de Kruchten](https://philippe.kruchten.com/architecture/) | Organiza las vistas lógica, procesos, desarrollo y física que ya corresponden a los lectores y al sistema. |
| [C4](https://c4model.com/diagrams) | Contexto y unidades ejecutables para los límites externos; componentes cuando aclaren responsabilidades. No se exige dibujar todos sus niveles. |
| UML y ER | Componentes/dependencias, despliegue, secuencias y modelo relacional. Mermaid es la herramienta de renderizado, no el estándar de arquitectura. |
| [arc42](https://arc42.org/overview/) | Referencia para comprobar cobertura de contexto, ejecución y despliegue; no se adopta la plantilla completa. |

La arquitectura general se comunica con una vista de contexto cliente-servidor y una
vista lógica de módulos y capas. Las vistas de procesos, desarrollo y despliegue
completan preguntas concretas; los diagramas se vinculan a código y contratos vigentes.

## Vistas y lectores

| Lector y preocupación | Vista | Contenido verificable |
| --- | --- | --- |
| Integrador: límites y dependencias | [Física](physical/index.md) | Vue como cliente externo, API Express, PostgreSQL y conexiones; distinguir configuración del repositorio y despliegue documentado. |
| Mantenedor: responsabilidades y acceso | [Lógica](logical/index.md) | Dominios, rutas/controladores, servicios, repositories, identidad y persistencia. |
| Desarrollador: transacciones y fallos | [Procesos](processes/index.md) | Secuencias HTTP, workers, validaciones, bloqueos, confirmación, rechazo y auditoría. |
| Desarrollador: ubicación e impacto de cambios | [Desarrollo](development/index.md) | Archivos, imports, patrones y mapa generado. |
| Operación: recuperación y disponibilidad | [Física](physical/index.md) | Arranque, salud, cierre, conexión, migraciones y respaldo/restauración. |
| Integrador: entradas y salidas HTTP | [OpenAPI](../openapi/index.md) | Métodos, rutas, autenticación, cuerpos, respuestas y errores. |

## Criterios de documentación

- Cada figura responde una pregunta, indica su alcance y distingue dependencia,
  llamada, despliegue o relación de datos mediante su notación y leyenda.
- Separar aplicaciones ejecutables de módulos internos; mostrar protocolos y fronteras
  de confianza donde haya comunicación o acceso a datos.
- En cada escenario técnico, identificar autorización, transacción y resultado ante
  conflicto o fallo. Las notificaciones posteriores no forman parte de la confirmación.
- Contrastar componentes con archivos y rutas existentes. Declarar como propuesta una
  topología que no esté implementada; una configuración local no acredita el estado del proveedor.
- Mantener las reglas de negocio en requisitos de `front/`, los contratos en OpenAPI
  y los comandos de preparación y ejecución en Desarrollo.

El detalle de funciones se consulta en el mapa generado. Los diagramas de contexto y
componentes resumen responsabilidades, sin repetir cada función o endpoint.
