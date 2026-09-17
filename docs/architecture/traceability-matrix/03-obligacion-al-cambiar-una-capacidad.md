# 3. Obligación al cambiar una capacidad

1. partir del identificador normativo y confirmar su `CU-*` y actor;
2. contrastar nombre, disparador, precondiciones, flujo principal, alternativas, excepciones y
   postcondiciones en la [ficha normativa](../../requirements/use-cases/index.md), y actualizarla
   cuando cambie cualquiera de esos elementos;
3. revisar el [procedimiento del manual](../../user-manual/procedures.md#casos-por-grupo-funcional):
   debe conservar el mismo identificador y nombre, describir los controles observables y no
   atribuir una pantalla de consulta a un caso que exige una escritura;
4. actualizar la ficha frontend si cambian interacción, payload o endpoint;
5. actualizar contrato y ficha backend si cambian middleware, DTO, regla o transacción;
6. conservar el nombre normativo junto al `CU-*` en los encabezados de las secuencias frontend y
   backend; el identificador permite comparar cobertura y el nombre hace explícito el objetivo;
7. regenerar ER/mapa si cambian Prisma, rutas o imports;
8. elegir la vista dinámica desde las matrices; si representa un caso, debe identificar
   un único `CU-*` y sus participantes concretos;
9. registrar prueba unitaria para la regla aislada y de integración para contrato,
   persistencia o rollback; actualizar la fila si se cierra una brecha.
