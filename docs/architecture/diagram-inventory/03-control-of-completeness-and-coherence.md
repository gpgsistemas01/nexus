# 3. Control de completitud y coherencia

El total se obtiene de cada bloque Mermaid de `docs`: arquitectura (183), generados
(6), requisitos (106), pruebas (2) y manual de usuario (1). Al agregar, retirar o mover
un bloque se actualiza su fila, cantidad y enlace en el mismo cambio. Los diagramas
generados nunca se editan a
mano. Los de caso individual conservan el `CU-*`; una vista agrupada enumera los casos a
los que aplica y no suplanta sus fichas.

Antes de crear otra vista se consulta la matriz de decisión de frontend/backend y las
convenciones. Una secuencia muestra orden y participantes; una actividad, decisiones;
una máquina de estados, transiciones persistentes; componentes/containers, estructura;
ER, relaciones persistentes. Esta separación evita representar el mismo hecho con tipos
incompatibles.
