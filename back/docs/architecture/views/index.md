# Vistas de arquitectura de la API

[ISO/IEC/IEEE 42010:2022](https://www.iso.org/standard/74393.html) guía la selección
de puntos de vista según las preocupaciones de quienes integran, mantienen y operan
la API. Se usa como referencia; no se declara conformidad integral.

## Estilo y estructura de la API

| Aspecto | Evidencia en el código | Vista adecuada |
| --- | --- | --- |
| Interfaz cliente-servidor | Express recibe HTTP del cliente Vue y responde con JSON, errores o archivos; no sirve la SPA. Swagger UI sólo se habilita en desarrollo. | Contexto API y contratos OpenAPI. |
| Solicitud-respuesta HTTP | Las rutas agrupan operaciones por dominio (`/api/auth`, `/api/warehouse`, `/api/admin`). No se declara conformidad REST estricta. | OpenAPI para métodos y esquemas; secuencias para el recorrido de cada operación. |
| Monolito modular por dominio y capas | Rutas, controladores, servicios y persistencia colaboran en una aplicación Node. | Componentes y dependencias; las capas no son servicios desplegables. |
| Persistencia relacional | Repositories y Prisma consultan PostgreSQL; las escrituras compuestas usan transacciones. | Modelo ER y secuencias de confirmación, conflicto y rollback. |
| Procesamiento de archivos | El análisis de Excel crea workers temporales `worker_threads` dentro del backend. | Secuencia de la operación; el worker no es un servicio independiente. |
| Notificación complementaria | La API publica eventos Socket.IO después de operaciones; el cliente Vue actual no se suscribe a ese canal. | Contrato de tiempo real separado de HTTP y mostrado sólo donde sea relevante. |

## Métodos de descripción

Estas referencias organizan preguntas sobre la API; no se adoptan como plantillas
completas ni describen la arquitectura interna de Vue.

| Método o notación | Aplicación a estas vistas |
| --- | --- |
| [ISO/IEC/IEEE 42010:2022](https://www.iso.org/standard/74393.html) | Seleccionar vistas para integradores de la API, mantenedores y operación. |
| [C4](https://c4model.com/diagrams) | Contexto para ubicar consumidor, frontera API y PostgreSQL; contenedor para el proceso desplegable. No se requieren todos los niveles C4. |
| UML | Componentes para módulos internos, despliegue para proceso y dependencias, secuencias para solicitudes y fallos. Mermaid renderiza las figuras, pero no es el estándar. |
| OpenAPI 3.1 | Contrato HTTP de rutas, parámetros, cuerpos, seguridad y respuestas; no sustituye las vistas internas. |
| ER | Modelo relacional persistido por la API. |

El diagrama de contexto del [sistema completo](../../../../front/docs/architecture/views/overview.md#arquitectura-general-aplicada)
ubica Vue como consumidor. Estas vistas delimitan la API y explican sus contratos,
estructura interna, ejecución y dependencias de persistencia.

## Vistas por preocupación

| Pregunta sobre la API | Vista | Contenido |
| --- | --- | --- |
| ¿Qué operaciones puede solicitar un consumidor? | [OpenAPI](../openapi/index.md) | Rutas, métodos, autenticación, formatos, respuestas y errores públicos. |
| ¿Qué atiende una ruta? | [Lógica](logical/index.md) | Middleware, controladores, servicios de dominio y persistencia. |
| ¿Qué ocurre en una operación? | [Procesos](processes/index.md) | Validación, autorización, transacción, worker y respuesta HTTP. |
| ¿Dónde vive la implementación? | [Desarrollo](development/index.md) | Módulos, imports, patrones y mapa generado. |
| ¿Cómo se ejecuta la API? | [Física](physical/index.md) | Proceso Node, rutas de salud, conexión PostgreSQL, migraciones y despliegue. |
| ¿Qué datos persiste? | [Modelo persistente](logical/data-and-persistence/index.md) | Entidades, claves, relaciones e índices. |

## Criterios

- Separar contratos HTTP públicos de las llamadas internas; mostrar autenticación,
  autorización y formato de error en el nivel que corresponda.
- Distinguir el proceso API de módulos, workers temporales, PostgreSQL y el cliente.
- En escrituras, identificar validación, transacción, respuesta y resultado ante
  conflicto o fallo. Los eventos posteriores no confirman la solicitud.
- Vincular cada figura con rutas, código o contratos vigentes; marcar como propuesta
  cualquier topología que no esté desplegada.
- Mantener requisitos y navegación en `front/`, contratos HTTP en OpenAPI y comandos
  de ejecución en Desarrollo.

OpenAPI es la referencia de cada endpoint. Los diagramas explican sólo los límites y
colaboraciones que el contrato no expresa.
