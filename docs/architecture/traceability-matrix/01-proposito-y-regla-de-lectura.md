# 1. Propósito y regla de lectura

Los requisitos definen **qué y por qué**; frontend y backend explican **cómo** dentro de
su límite; el contrato API une ambos; Prisma evidencia persistencia; y las pruebas
registran el resultado verificable. Ningún documento sustituye al anterior. El recorrido
bidireccional es:

`RF/RN/RC ↔ CU ↔ procedimiento del manual ↔ vista frontend ↔ API ↔ ruta/controller/servicio ↔ datos ↔ prueba`.

Esta matriz agrupa capacidades que comparten implementación. La fila no afirma cobertura
completa: “brecha” significa que existe código o requisito sin evidencia automatizada
suficiente. Los archivos exactos de rutas y exports se localizan en el mapa generado.
