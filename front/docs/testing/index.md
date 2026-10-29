# Pruebas del frontend Vue

Esta colección documenta diseño, casos críticos y evidencia funcional del cliente.
Aplica el [plan propio de Vue](01-test-plan.md), que adapta 29119-2, -3 y -4 sin
declarar conformidad. Los [requisitos y casos de uso locales](../requirements/index.md)
contienen su especificación y flujos completos.

## Orden de lectura

1. [Plan de pruebas](01-test-plan.md): alcance, riesgos, niveles, técnicas y criterios de ejecución.
2. [Diseño y trazabilidad](02-test-design.md): condiciones DP y evidencia asociada, agrupadas en [diseños por ámbito](design/index.md).
3. [Registro de casos](03-test-cases.md): datos, pasos, resultado esperado y limpieza de las fichas CP.
4. [Cobertura por caso de uso](04-use-case-coverage.md): objetivos representados y límites de evidencia.
5. [Preparación de sistema](05-system-tests.md): ambiente aislado, ejecución y limpieza con API/base reales.
6. [Archivos, credenciales y ejecución](06-test-files-and-credentials.md): instalación, configuración local, origen de usuarios de prueba y significado de los resultados.

El resultado de una corrida se conserva como EP en CI o revisión. El plan precede
al diseño; el caso concreta sus datos; la cobertura relaciona esa evidencia con los
objetivos funcionales. La preparación de sistema se consulta al ejecutar ese nivel.

## Estándar de construcción

El [estándar de pruebas](07-test-standards.md) define nombres, aislamiento, aserciones
y mantenimiento del código de prueba.

## Elegir el nivel y ejecutar

El [plan](01-test-plan.md#niveles-y-entornos) define herramientas, oráculos y límites
por nivel. La [guía de ejecución](06-test-files-and-credentials.md) reúne los comandos,
archivos de preparación y resultados. Las integraciones de `back/tests` permanecen
en su propia suite; un recorrido simulado no demuestra sus garantías.
