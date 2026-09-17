# 3. Tipos de contenido y fuentes propietarias

La separación se decide por la intención del contenido, no sólo por su extensión:

| Necesidad | Tipo | Familia o artefacto propietario |
| --- | --- | --- |
| Aprender mediante un recorrido acompañado | Tutorial | Se crea sólo si existe una necesidad de aprendizaje distinta de los procedimientos operativos. |
| Completar una tarea | Guía práctica | `user-manual/`; se organiza por recorrido funcional y ofrece entradas por actor sin duplicar los capítulos. |
| Conocer una obligación verificable | Contenido normativo | `requirements/`; la especificación y las fichas conservan la regla, mientras matrices y diagramas aportan trazabilidad. |
| Consultar un contrato o elemento exacto | Referencia | `architecture/api-contract/index.md`, documentación técnica, secuencias, inventarios, glosarios y catálogos de pruebas. |
| Comprender estructura, motivos o consecuencias | Explicación | Descripción de arquitectura, patrones, estrategia de pruebas y análisis de datos. |
| Comprender por qué se eligió una alternativa | Decisión | `architecture/decisions/` para decisiones arquitectónicas y el documento normativo correspondiente para decisiones de gobierno. |
| Comprobar hechos derivados | Evidencia generada o ejecutable | `generated/` y `tests/`; no sustituye una decisión curada. |

Un documento puede apoyar otra familia, pero conserva una intención dominante y una sola
fuente propietaria. Las demás vistas enlazan esa fuente en lugar de repetir su contenido.
