# 3. Resultado de la revisión

| Artefacto | Decisión | Motivo |
| --- | --- | --- |
| Especificación de requisitos | Dividido | Propósito, convenciones, actores, catálogo normativo, terminado y mantenimiento son responsabilidades estables; el índice conserva su orden normativo. |
| Visión, alcance y requisitos | Dividido | Visión, contexto, interesados, alcance, calidad y trazabilidad responden consultas independientes; el índice conserva el recorrido del documento. |
| Modelo de dominio, casos de uso y relación entre vistas | Dividido | El modelo conceptual, los casos, los estados afectados y las vistas de diseño tienen responsabilidades diferenciadas y un orden estable. |
| Documentos de gobierno | Divididos | Normas, prácticas, revisión estructural, aplicación y publicación conservan entradas propias; dentro de cada artefacto, sus decisiones y criterios se consultan como capítulos numerados. |
| Patrones de diseño y construcción | Dividido | Cada patrón responde una pregunta técnica independiente y puede cambiar sin obligar a abrir el catálogo completo. |
| Convenciones de diagramas | Dividido | Lectura, notación, vistas reutilizadas, relación con código y reglas de generación tienen consumidores distintos. |
| Guía de exportación y capturas | Separada del índice | La instalación de herramientas y el procedimiento de publicación no pertenecen al índice de fuentes de verdad. |
| Secuencias frontend y backend | Divididas por `CU-*` | Aunque son arquitectura técnica, cada secuencia acompaña un caso concreto; los índices de perspectiva y grupo conservan la navegación. |
| Guía técnica común | Dividida | Propósito, ubicación, entornos, incorporación y criterios de diagramación son consultas independientes; la entrada conserva el recorrido recomendado. |
| Documentación técnica frontend y backend | Conservada | Sus matrices permiten comparar cobertura de toda una perspectiva; el detalle por caso ya vive en las colecciones de secuencias. |
| Arquitectura y vistas web | Dividida | Contexto, arquitectura, vistas web, organización de capas y herramientas conservan un orden progresivo, pero pueden consultarse y mantenerse como capítulos independientes. |
| Navegación y catálogo web | Dividido | El mapa de navegación, el catálogo de pantallas y sus reglas de mantenimiento responden preguntas separadas y la entrada mantiene su alcance común. |
| Diagramas vigentes del código | Dividido | Organización, estructura, dinámica y reutilización son puntos de vista estables; cada capítulo conserva su vista canónica sin duplicarla. |
| Estándar de codificación | Dividido | Cada grupo de reglas tiene un alcance técnico estable y consultable; la entrada sigue siendo la única portada normativa del estándar. |
| Contrato API | Conservado | Los endpoints comparten reglas de transporte, error y precisión que deben revisarse juntas. |
| Glosario y matrices de trazabilidad u operaciones | Conservados | Son instrumentos de comparación y búsqueda; fragmentarlos ocultaría duplicados o brechas entre filas. |
| Mapa de código, esquema y diccionario generados | Conservados | Se regeneran atómicamente desde código o Prisma y no deben editarse ni reorganizarse manualmente. |
| Catálogos y resultados de pruebas | Conservados | Su función es comparar cobertura y evidencia de una ejecución; se dividirán sólo si cambia su fuente ejecutable o nivel de prueba. |
