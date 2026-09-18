# 5. Criterio de terminado y trazabilidad

Cualquier requisito o regla nuevo o modificado se considera listo para revisión cuando:

1. conserva un identificador estable y criterios observables en este documento;
2. usa la terminología canónica o actualiza el glosario con validación funcional;
3. enlaza su ruta, permiso, validadores, controller/DTO, servicio y persistencia;
4. reutiliza el proceso CRUD o componente aplicable antes de introducir otro flujo,
   consultando los [patrones aplicados](../../architecture/design-and-construction-patterns/index.md);
5. incluye pruebas relacionadas con el CRUD en la ubicación y con las estrategias de
   [pruebas](../../testing/service-test-coverage.md) correspondientes, y actualiza la matriz del
   [plan de pruebas](../../testing/test-plan.md) cuando cambia el alcance;
6. actualiza la matriz de operaciones y los diagramas curados afectados, y ejecuta el
   generador cuando cambia rutas o Prisma;
7. distingue explícitamente comportamiento implementado, parcial y pendiente.

La evidencia puede enlazarse desde una incidencia hacia el ID del requisito. No se
añade una matriz duplicada de cada endpoint: el mapa generado ya conserva ese
inventario y evita que dos listas manuales diverjan.

No todo requisito debe crear un caso de uso independiente. Los requisitos de soporte
para selectores operativos, unicidad de relaciones, validaciones compartidas, permisos
transversales o cálculos de reportes pueden estar relacionados con varias fichas o con
ninguna ficha exclusiva cuando describen una responsabilidad interna de Nexus. La
completitud se verifica en sentido inverso: cada caso vigente debe enlazar al menos un
`RF-*` o una regla `RN-*`, y cada requisito de soporte debe conservar evidencia técnica
o una relación explícita con los flujos que regula.
