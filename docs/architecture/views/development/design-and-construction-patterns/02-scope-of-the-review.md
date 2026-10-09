# 2. Alcance de la revisión

Este documento registra patrones que tienen evidencia repetida en el código. Distingue
un **patrón formal o arquitectónico** de una simple función con un nombre parecido. El
objetivo no es asignar etiquetas GoF a todo el repositorio, sino saber qué solución debe
reutilizarse antes de construir otro flujo y dónde terminan sus límites.

Cada mecanismo se explica con una colaboración verificable: problema que se repite,
implementación común, contrato configurable, consumidores actuales, variación que
permanece local y efectos de cambiarlo. Una figura genérica sirve como orientación;
la aplicación concreta se acredita con símbolos, archivos y pruebas existentes.

El alcance incluye estructura, contratos y construcción. Los recorridos completos por
caso permanecen en procesos y sus reglas normativas en requisitos. Los procedimientos
de extracción y orden son convenciones de mantenimiento, no algoritmos de producción
ni patrones GoF por el mero hecho de usar una función compartida.
