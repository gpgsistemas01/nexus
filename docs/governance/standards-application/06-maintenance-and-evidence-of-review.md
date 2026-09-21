# 6. Mantenimiento y evidencia de revisión

Al modificar requisitos se debe:

1. aplicar la tabla binaria de ISO/IEC/IEEE 29148 a cada requisito afectado;
2. comprobar que casos de uso y diagramas conservan los mismos `CU-*`;
3. revisar actores, glosario, matriz de operaciones y estados;
4. mantener las pruebas unitarias junto a su artefacto y las integraciones CRUD en
   `tests/integration/controllers`;
5. ejecutar `npm run docs:check` y las pruebas relacionadas;
6. registrar cualquier criterio no aplicable, brecha aceptada o aprobación externa en
   la incidencia que origina el cambio.

La reevaluación completa ocurre al cambiar la edición contractual de una norma, el
alcance del producto, los actores, las características de calidad o la estructura de los
artefactos documentales.
