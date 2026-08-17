# Estrategia de pruebas

La suite evita repetir cada operación interna de cada servicio. La cobertura se divide por propósito y se concentra en casos capaces de revelar errores concretos.

El [plan de pruebas](test-plan.md) complementa esta estrategia con alcance, matriz CRUD,
criterios de entrada/salida, ejecución, responsabilidades y trazabilidad. La estrategia
define **cómo y dónde** probar; el plan define **qué, cuándo y con qué evidencia**.

## Pruebas unitarias

Las pruebas unitarias de controllers viven en `tests/unit/controllers`. Sólo se conserva una unitaria cuando aísla una regla que aporta valor diagnóstico y usa al menos una estrategia explícita:

- **valores límite:** el máximo aceptado y el primer valor rechazado;
- **particiones de equivalencia:** un representante válido y uno inválido por formato;
- **tabla de decisiones:** combinaciones de campos dependientes, por ejemplo base y altura;
- **propagación de errores:** tipo, código y estado de un error operacional;
- **efectos negativos:** confirmar que una entrada inválida no llama al servicio ni escribe datos.

No se crean unitarias para repetir consultas felices ya cubiertas desde una integración. Los casos tabulados comparten preparación y aserciones, de modo que agregar datos específicos no implica duplicar pruebas completas.

## Pruebas de integración

Las integraciones viven en `tests/integration/controllers`. Cada flujo debe:

1. enviar datos por HTTP al controller con Supertest;
2. comprobar el código y el cuerpo de la respuesta;
3. atravesar los servicios reales, sin mocks de repositorio;
4. consultar con Prisma el registro creado o actualizado para demostrar el cambio en `DATABASE_TEST_URL`;
5. limpiar exclusivamente sus datos de prueba.

Una integración que sólo importe un servicio no debe ubicarse en esta carpeta. Los flujos que todavía no cumplen el contrato se retiraron hasta migrarlos correctamente desde su controller.

## Ejecuciones separadas

- `npm run test:unit` usa `vitestConfig.js`, excluye `tests/integration` y no necesita base de datos.
- `npm run test:integration` exige una `DATABASE_TEST_URL` distinta de desarrollo, despliega migraciones, genera Prisma y ejecuta únicamente `vitestIntegrationConfig.js`.
- `npm run test:db` es un alias de `test:integration`.

Las integraciones no usan `describe.skip`: si falta la URL o el cliente Prisma, la preparación falla antes de ejecutar Vitest. Además, los archivos se ejecutan sin paralelismo y `tests/teardownTestDatabase.js` limpia los datos al finalizar. Que los registros ya no existan después del teardown no significa que no se hayan escrito; la lectura con Prisma dentro de cada caso es la evidencia de persistencia.

## Pendientes

Se deben incorporar como integraciones desde controller, no restaurar como pruebas directas de servicio:

- personas y usuarios con sus relaciones;
- salidas de material y afectación de stock (las salidas de merma ya cuentan con
  integración HTTP, persistencia, movimiento y verificación de rollback);
- cancelación de detalles de entradas de compra y su efecto relacionado (creación y
  corrección de cantidad/costos ya tienen integración desde controller);
- ajustes de material y movimientos de inventario;
- requisiciones de compra completas.
