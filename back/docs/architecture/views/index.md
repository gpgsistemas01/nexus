# Vistas del backend

| Vista | Contenido |
| --- | --- |
| [Lógica](logical/index.md) | Dominios, capas, componentes, identidad y persistencia. |
| [Procesos](processes/index.md) | Secuencias HTTP, validaciones, transacciones y auditoría. |
| [Desarrollo](development/index.md) | Organización del código, patrones y dependencias. |
| [Física](physical/index.md) | Procesos, contenedores, configuración y PostgreSQL. |

La descripción usa como referencia [ISO/IEC/IEEE 42010:2022](https://www.iso.org/standard/74393.html).

## Diagramas

| Representación | Notación |
| --- | --- |
| Colaboraciones HTTP y transacciones | Mermaid `sequenceDiagram`. |
| Ciclos de los registros | Mermaid `stateDiagram-v2`. |
| Clases y relaciones | Mermaid `classDiagram`, con multiplicidades. |
| Modelo persistente | ER con claves y cardinalidades. |
| Componentes, dependencias y despliegue | Diagramas con leyenda del significado de nodos y conexiones. |

Los contratos se consultan en [OpenAPI](../openapi/index.md) y las convenciones de
implementación en [Estándares de código](../coding-standards/index.md).
