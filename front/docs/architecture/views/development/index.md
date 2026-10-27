# Vista de desarrollo

Para una primera lectura, comenzar por la [guía de incorporación](developer-onboarding.md).

## Organización

1. [Estructura y dirección de dependencias](code-structure.md).
2. [Patrones de diseño y construcción](design-and-construction-patterns/index.md).
3. [Realización técnica por módulo](frontend-technical-documentation/index.md).
4. [Referencia generada de código](code-reference.md).

La estructura se organiza por dominio (`modules`), composición de aplicación (`app`)
y capacidades transversales (`shared`). Cada módulo conserva contratos, servicios,
composables, páginas y presentación según sus consumidores. Las restricciones de
imports verifican parte de esas fronteras; los contratos y motivos de cambio requieren
revisión del código.

## Lectura de una capacidad

Partir de la ruta y su configuración; localizar la Page/Workspace; seguir props y
eventos hasta el coordinador; revisar esquema, mapper y servicio; consultar prueba y
caso de uso correspondiente. La referencia generada permite localizar símbolos e
imports, y la guía curada explica por qué colaboran.

## Construcción y revisión

El [estándar](../../coding-standards/index.md) regula nombres, formato, funciones,
SFC, datos y errores. Las [decisiones](../../decisions.md) conservan justificación y
consecuencias. El [plan de pruebas](../../../testing/01-test-plan.md) define el nivel de
evidencia necesario para un contrato modificado.
