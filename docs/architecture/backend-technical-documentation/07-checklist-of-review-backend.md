# 7. Lista de revisión backend

1. Comparar las carpetas de `controllers` y `services` con ambas secciones del mapa
   generado y asignar cada módulo nuevo a una ficha.
2. Comprobar método, URL, middleware, DTO, argumentos, retorno y código HTTP contra la
   ruta y el contrato API.
3. Verificar errores, modelos afectados, propagación de `tx` y efectos posteriores sin
   atribuirlos a la capa incorrecta.
4. Aplicar la matriz: actualizar la secuencia canónica enlazada en
   `backend-code-sequences/index.md`; mantener aquí sólo actividades, estados u otras vistas
   que respondan una pregunta técnica adicional.
5. Revisar imports, exports y referencias después de renombrar o mover símbolos.
6. Localizar pruebas unitarias/de base de datos sin afirmar cobertura no ejecutada.
7. Ejecutar `npm run docs:check`; si cambió código fuente del inventario, ejecutar antes
   `npm run docs:architecture`.
