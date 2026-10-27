# 1. Requisitos, identificadores y trazabilidad

## Alcance

Los requisitos de negocio y del cliente se mantienen en la [especificación](requirements-specification/index.md).
Los objetivos tienen fichas completas en [Casos de uso](use-cases/index.md), con la
misma plantilla para todas las familias y un archivo por operación. Una alta, una
edición y una devolución son objetivos distintos con datos y postcondiciones propios.

## Identificadores

| Elemento | Propietario y significado |
| --- | --- |
| RF/RN/RD/RC de negocio | Criterios del producto, reproducidos en el catálogo local. |
| RF/RD/RN/RC-VUE | Navegación, captura, datos, interacción y restricciones del cliente. |
| CU-AUT/ALM/CAT/IDA/ENT/SAL | Objetivos observables de acceso, inventario/catálogos, identidad, compras y salidas. |
| DIA-VUE | Figura identificable de arquitectura o patrón. |
| DP | Requisito/riesgo, condición, nivel, técnica y casos asociados. |
| CP o prueba ejecutable | Precondiciones, datos concretos, pasos, resultado esperado y limpieza. |
| EP | Ejecución con revisión, ambiente, fecha, responsable, resultado real y evidencia. |

La cadena es requisito → CU → realización/contrato → DP → CP/prueba → EP. Los
identificadores se conservan al mover una guía. Una relación de navegación o un
componente compartido no crea una inclusión/extensión UML entre objetivos.

## Revisión de una ficha

Comprobar actor, disparador y precondiciones separadas; pasos alternados actor–Nexus;
referencias a alternativas/excepciones desde el punto que las origina; destino explícito
de cada alternativa; postcondiciones de éxito y fallo. Los nombres de métodos,
componentes y endpoints pertenecen a la realización, fuera del flujo del actor.

Los resultados esperados incluyen los efectos de negocio que confirma el sistema.
La prueba con API simulada sólo demuestra interacción/contrato. La persistencia,
autorización y ausencia de cambios parciales requieren servidor/base reales.

## Mantenimiento y aceptación

Cambiar una regla requiere revisar sus CU, realización, DP/CP y condiciones afectadas.
La [matriz](../testing/04-use-case-coverage.md) declara evidencia y límites; una ficha
no aprobada no se convierte en aceptada porque exista código. Los resultados reales
permanecen asociados a la revisión y al ambiente donde se ejecutó.
