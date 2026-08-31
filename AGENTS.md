# Reglas generales del proyecto

- Antes de implementar un cambio, revisa el código relacionado y las implementaciones similares existentes.
- Prioriza reutilizar componentes, *helpers*, servicios y flujos existentes. No dupliques reglas de negocio.
- No realices refactorizaciones ni cambios fuera del alcance solicitado.

## EJS

- No elimines, muevas ni vuelvas a agregar innecesariamente la última línea de un archivo EJS.
- Conserva los cierres y llamadas a `contentFor`, salvo que la tarea requiera cambiarlos.
- Modifica sólo la sección necesaria y revisa el inicio y el final de cada EJS modificado.

## Pruebas

- Antes de crear una prueba, identifica una equivalente y conserva su ubicación, *setup* y convenciones.
- Separa pruebas unitarias, de integración y de base de datos conforme a `docs/testing/`.
- En CRUD, valida el comportamiento CRUD correspondiente y reutiliza *factories*, *fixtures*, *helpers* y *mocks* existentes.

## Reutilización y estándar

- Antes de crear un componente, *helper*, servicio, flujo, función o validación, busca una implementación equivalente.
- Respeta nombres, estructura, errores, validaciones, acceso a datos, respuestas HTTP y organización de pruebas vigentes.
- No introduzcas otro patrón cuando el proyecto ya tenga una convención establecida.

## Documentación

- Revisa la documentación relacionada con cada cambio funcional: comportamiento, reglas, endpoints, flujos, validaciones, estructura y pruebas.
- No modifiques documentación ajena al cambio.

## Imports y exports

- Después de agregar, eliminar, mover o renombrar código, revisa imports, exports y referencias.
- Elimina imports sin uso y no cambies el mecanismo de módulos sin necesidad.
- Nunca envuelvas imports en bloques `try/catch`.

## Validación final

1. Revisa el diff y descarta cambios accidentales.
2. Comprueba imports, exports y referencias.
3. Revisa las últimas líneas de los EJS modificados.
4. Ejecuta las pruebas relacionadas y `npm run docs:check` cuando aplique.
5. Confirma que documentación y patrones existentes permanecen sincronizados.
