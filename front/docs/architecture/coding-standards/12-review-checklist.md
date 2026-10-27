# 12. Lista de revisión

## Responsabilidades y contratos

- La ruta y el menú corresponden al módulo Vue y al permiso público correcto.
- Page/Workspace coordina; presentación recibe props/emite intenciones.
- El estado tiene propietario único y el composable libera sus recursos.
- Servicios/mappers no importan renderizado ni sesión; `shared` no depende de dominios.
- La abstracción reutiliza contratos reales sin convertir todos los CRUD en uno.
- Las operaciones de lectura y escritura están tipadas y separadas por modo.

## Datos e interacción

- El formulario abre sin errores prematuros y distingue precarga de edición.
- Los payloads incluyen sólo campos permitidos; contraseñas conservan su contenido.
- Versión leída e idempotencia conservan el contrato específico de su operación.
- Error, carga, vacío, conflicto y éxito tienen resultados observables y recuperables.
- Consultas obsoletas y respuestas tras desmontar no cambian otra captura.
- Un aviso o callback no confirma una operación rechazada o no ejecutada.
- Tema, tabla, filtros, foco, menú y modal móvil mantienen los contratos visuales.

## Evidencia y entrega

1. Revisar diff, nombres, imports, extensiones, referencias y cambios accidentales.
2. Ejecutar las pruebas pertinentes y el chequeo frontend exigido por el alcance.
3. Actualizar caso/requisito, DP/CP y cobertura si cambia comportamiento.
4. Actualizar vistas y diagramas si cambia una colaboración o responsabilidad.
5. Regenerar referencia técnica cuando cambian fuentes; ejecutar `docs:check`.
6. Revisar una exportación y las figuras afectadas cuando cambia documentación gráfica.
7. Conservar resultados reales de ejecución en CI/revisión y artefactos fuera de Git.

La lista orienta revisión; una marca no sustituye la evidencia o la lectura del código.
