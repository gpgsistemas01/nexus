# 3. Aplicación de ISO/IEC/IEEE 29148 a la especificación

La revisión usa preguntas binarias en lugar de una puntuación subjetiva. Un requisito se
considera listo para revisión sólo cuando todas las respuestas aplicables son «sí».

| Criterio adoptado | Pregunta de revisión | Evidencia documental |
| --- | --- | --- |
| Identificación | ¿Tiene un ID único, estable y un tipo definido (`RF`, `RN` o `RC`)? | Convenciones e inventario de requisitos. |
| Singularidad | ¿Expresa una capacidad o restricción principal y separa criterios enumerables? | Una fila por requisito; criterios `CA-*` cuando una capacidad necesita varias comprobaciones. |
| Necesidad | ¿Existe actor, regla de negocio, obligación o atributo de calidad que lo justifique? | Alcance, casos de uso, reglas o decisión registrada. |
| Claridad | ¿Usa sujeto, verbo obligatorio, objeto y condiciones sin «adecuado», «rápido» o «cuando sea posible»? | Texto normativo y glosario. |
| Factibilidad | ¿La evidencia o el estado distingue implementado, parcial, modelado y propuesto? | Columna Estado y decisiones pendientes. |
| Verificabilidad | ¿Indica un resultado observable y una forma de comprobación reproducible? | Criterio de aceptación y evidencia/prueba. |
| Consistencia | ¿Usa términos del glosario y no contradice casos, diagramas, matriz de operaciones o permisos? | Revisión de referencias `CU-*`, `RF-*`, rutas y actores. |
| Trazabilidad | ¿Se puede recorrer requisito → permiso/validación → servicio/persistencia → prueba? | Evidencia principal, mapa generado y estrategia de pruebas. |
| Modificabilidad | ¿El cambio puede localizarse sin repetir la misma regla normativa en varios archivos? | Fuente de verdad declarada y documentos complementarios enlazados. |

### Forma de redacción adoptada

Cada requisito funcional sigue esta lectura, aunque se presente de forma compacta en una
tabla:

1. **Sujeto:** actor o sistema responsable.
2. **Obligación:** «debe» o una capacidad inequívoca en presente normativo.
3. **Objeto y condición:** dato o comportamiento afectado y situación aplicable.
4. **Resultado observable:** estado que permite decidir si se cumplió.
5. **Criterios de aceptación:** escenarios numerados cuando una sola oración dejaría de
   ser comprensible.
6. **Estado y evidencia:** grado de implementación y artefactos que permiten comprobarlo.

La implementación no se copia dentro de la obligación. Los nombres de archivos se
mantienen en Evidencia; decisiones de interfaz o algoritmos sólo aparecen en criterios
cuando son parte del comportamiento comprometido.
