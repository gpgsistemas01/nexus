# 1. Criterio de identificación

Este inventario es el catálogo equivalente al inventario de capturas del manual. Cada
fuente Mermaid tiene un identificador estable y se localiza por documento y encabezado,
no por número de línea. `DIA-REQ-CU-<CU>` reutiliza el identificador normativo del caso;
los demás siguen `DIA-<familia>-<tipo>-<número>`. Los rangos de la tabla son inclusivos:
cada `CU-*` dentro del rango identifica un diagrama individual.

El **tipo semántico** prevalece sobre la directiva Mermaid. Un `flowchart` puede
representar contexto, actividad, dependencia, navegación o trazabilidad; no se etiqueta
como “diagrama de flujo” genérico si las flechas tienen otra semántica. El inventario
registra **276 diagramas vigentes**: 270 curados y 6 generados.
