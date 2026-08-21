# Estrategia de pruebas

La suite automatizada se concentra en operaciones que **registran o consultan datos**.
Su objetivo es detectar errores en un CRUD, sus reglas de negocio y sus efectos
persistentes; no certificar detalles de presentación o de implementación.

## Qué se prueba

- altas, modificaciones, cancelaciones o eliminaciones;
- consultas, filtros, paginación y representaciones de datos;
- validaciones y decisiones que permiten o impiden esas operaciones;
- relaciones, inventario, movimientos y atomicidad derivados de una escritura;
- serialización y transformación cuando alteran lo que se guarda o devuelve.

No se mantienen pruebas unitarias de constantes, selectores, marcado EJS, estilos,
apertura de modales, eventos de interfaz, wrappers HTTP ni organización de archivos.
Esos detalles sólo justifican una prueba cuando cambian el resultado de un registro o
una consulta y no quedan cubiertos en un nivel más representativo.

## Pruebas unitarias

Las unitarias viven bajo `tests/unit` en una ruta paralela al módulo propietario. Por
ejemplo, un controller de almacén se prueba en
`tests/unit/controllers/api/warehouse`; no se crean raíces alternativas por tipo de
técnica ni carpetas organizadas por servicio.

Una unitaria debe aislar una regla relevante para escritura o lectura y aplicar al
menos una estrategia explícita:

- **valores límite:** último valor admitido y primero rechazado;
- **particiones de equivalencia:** representante válido e inválido;
- **tabla de decisiones:** combinaciones de condiciones del negocio;
- **propagación de errores:** error operacional que el CRUD debe comunicar;
- **efecto negativo:** una entrada inválida no consulta ni escribe.

No se repite con mocks el camino feliz que una integración ya demuestra. Las tablas de
casos y helpers se reutilizan entre contextos cuando conservan la misma regla.

## Pruebas de integración

Las integraciones viven exclusivamente en `tests/integration/controllers` y deben:

1. ejecutar la ruta HTTP con Supertest;
2. comprobar estado y respuesta observables;
3. usar controller, servicios y Prisma reales;
4. consultar con Prisma el registro creado o actualizado;
5. verificar relaciones o efectos derivados relevantes;
6. limpiar sólo los datos creados por el caso.

Una prueba que importa directamente un servicio no es una integración de controller.
Para escrituras compuestas se comprueba también que un error no deje datos parciales.

## Ejecución

- `npm run test:unit` ejecuta las reglas de registro y consulta sin base de datos.
- `npm run test:integration` valida `DATABASE_TEST_URL`, aplica migraciones y ejecuta
  las integraciones sin paralelismo.
- `npm run test:db` es alias de la ejecución de integración.

La base de pruebas debe ser distinta de desarrollo. La limpieza global es sólo una red
de seguridad: la lectura con Prisma dentro del caso constituye la evidencia de
persistencia.

## Criterio para agregar una prueba

Antes de crearla se responde afirmativamente: **¿qué fallo observable de registro o
consulta detecta?** Después se reutiliza el harness, factory o flujo CRUD existente. Si
la respuesta sólo describe estructura interna o comportamiento visual, no se agrega a
la suite unitaria.
