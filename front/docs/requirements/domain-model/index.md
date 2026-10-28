# Modelo de dominio del cliente

## Propósito y alcance

El dominio explica qué significan los datos que el usuario consulta y modifica en
Nexus. Sus conceptos son independientes de los componentes Vue y de los nombres de
las tablas. Las figuras se agrupan en cinco cortes del mismo modelo: repetir Persona o
Proveedor mantiene su significado y permite leer cada operación sin una figura única saturada.

| Corte | Pregunta | Figura |
| --- | --- | --- |
| [Personas, usuarios y asignaciones](01-identity-and-organization.md) | ¿Qué distingue una cuenta, una persona y sus asignaciones? | `DIA-VUE-DOM-001` |
| [Artículos y existencias](02-items-and-stock.md) | ¿De quién es cada existencia y qué distingue una merma? | `DIA-VUE-DOM-002/006` |
| [Compras](03-purchases.md) | ¿Qué se recibe y qué identifica cada detalle? | `DIA-VUE-DOM-003` |
| [Salidas](04-issues.md) | ¿Quién solicita, para qué área y de qué existencia se surte? | `DIA-VUE-DOM-004/007` |
| [Movimientos y trazabilidad](05-movements.md) | ¿Qué hecho explica un cambio de existencia? | `DIA-VUE-DOM-005` |

## Lectura de las relaciones

Se usa UML de clases conceptuales en Mermaid. Las asociaciones sólidas describen
vínculos de negocio con multiplicidades; la generalización apunta al concepto general;
la composición expresa pertenencia exclusiva del detalle al documento. Los atributos
se desarrollan en los contratos técnicos; estos cortes priorizan conceptos y relaciones, sin convertirse en un diccionario de campos.
Los nombres de roles en una relación distinguen participaciones de un mismo concepto.

El modelo conceptual puede omitir atributos cuando explica conceptos y relaciones.
Una característica necesaria para distinguir un concepto se incorpora como atributo
de negocio, sin copiar claves ni estructuras internas de la base de datos.

El documento registrado tiene detalles; la captura temporal puede estar vacía. Por eso
un documento del dominio contiene `1..*` detalles y un array TypeScript admite `0..*`.
La validación comprueba esa diferencia antes de guardar y la API vuelve a verificarla.

## Correspondencia con la arquitectura

El [glosario](../business-glossary.md) define el vocabulario y la
[especificación](../requirements-specification/index.md) establece obligaciones.
Los [casos de uso](../use-cases/index.md) explican las acciones del actor.
Los [modelos de interfaces y tipos](../../architecture/views/logical/class-and-type-models/index.md)
representan cómo esos conceptos se proyectan en memoria: IDs, etiquetas, filas,
capturas y documentos. No se deduce una clase de implementación por cada concepto.

Las cifras de existencia, costos, permisos y efectos persistentes proceden de la API.
El modelo no atribuye al navegador autorización ni contabilidad definitiva de inventario.
