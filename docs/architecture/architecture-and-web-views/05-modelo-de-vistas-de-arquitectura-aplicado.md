# 5. Modelo de vistas de arquitectura aplicado

Nexus usa un modelo **Viewpoint/View inspirado en ISO/IEC/IEEE 42010**, organizado como
una adaptación práctica de **4+1** y apoyado por los niveles contexto/contenedor de C4.
No declara conformidad formal con esas normas: las combina para responder preguntas sin
duplicar diagramas. La vista de escenarios (`CU-*`) conecta las otras cuatro.

| Vista adaptada | Pregunta | Diagramas canónicos |
| --- | --- | --- |
| Escenarios (+1) | ¿Qué objetivo cumple cada actor? | Casos de uso, flujos y trazabilidad de requisitos. |
| Lógica | ¿Qué dominios, capas, componentes, estados y datos colaboran? | Dominio conceptual, componentes, dependencias y ER generado. |
| Procesos | ¿En qué orden se coordinan y dónde están decisiones/transacciones? | Secuencias, actividades y máquinas de estados. |
| Desarrollo | ¿Cómo se organiza y reutiliza el código de frontend y backend? | Superficie HTTP, fábrica CRUD, componentes y mapa generado. |
| Física | ¿Dónde se ejecuta y despliega? | Contexto, contenedores y despliegues actual/objetivo. |

La combinación mínima recomendada para comprender un cambio es: **caso de uso +
contexto/contenedores + componentes/capas + una vista dinámica sólo si existe
coordinación no trivial + ER cuando cambia persistencia + despliegue cuando cambia
infraestructura**. Frontend y backend comparten el escenario y el contrato API; cada uno
mantiene únicamente el tramo dinámico de su responsabilidad. El
[inventario de diagramas](../diagram-inventory/index.md) permite localizar cada vista y la
[matriz de trazabilidad](../traceability-matrix/index.md) recorre requisito, implementación y
prueba.
