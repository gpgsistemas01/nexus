# 11. Pruebas

## Diseño antes del caso

Identificar requisito/riesgo, condición observable, nivel y técnica de diseño. Usar
particiones de equivalencia, valores frontera, decisiones o transiciones según el
contrato. Un mock, `it.each`, concurrencia o Playwright son mecanismos de ejecución;
no explican por sí solos por qué se eligieron los datos.

El [plan de pruebas](../../testing/01-test-plan.md) define los formatos de diseño DP,
especificación CP y resultado EP. Las fichas críticas conservan precondiciones, datos,
pasos, resultado esperado y limpieza. El resultado real permanece en CI o revisión.

## Ubicación y preparación

| Suite | Ubicación | Datos y límites |
| --- | --- | --- |
| Unitaria/colaboración | `tests/unit` con dominio paralelo. | Vitest, Vue Test Utils y jsdom; mocks/adaptador cuando corresponde. |
| Navegador | `tests/e2e`. | Chromium real y API simulada; fixtures nuevas por caso. |
| Sistema | `tests/system`. | Vue, API y PostgreSQL aislados; manifiesto de fixtures y limpieza propia. |

Reutilizar `mountComposable`, fixtures y escenarios existentes. Restaurar dobles/timers
y desmontar wrappers. Cada caso puede ejecutarse solo; un tramo de un recorrido utiliza
el setup del propio test, no depende de otra ficha documental.

## Aserciones

Comprobar captura, payload, respuesta y ausencia de requests al cancelar/rechazar.
Cubrir consulta, alta, edición y baja sólo donde existan, además de conflicto y permisos
pertinentes. Mantener fronteras extensas en unitarias y representantes en navegador.
No fijar clases CSS, HTML literal ni delegaciones privadas sin un riesgo observable.

Las pruebas con API simulada no demuestran escritura, atomicidad o autorización real.
En sistema, comprobar datos persistidos además de la UI cuando sea el objetivo, y usar
únicamente una base de prueba diferente de desarrollo. La preparación debe rechazar
una configuración insegura antes de arrancar servidores.

## Ejecución

Desde `front/`: `npm run test:unit`, `npm run test:e2e` y, con preparación explícita,
`npm run test:e2e:system`. `npm run check` reúne formato, lint, unitarias y build.
Usar comandos sin watch en revisión/CI. Registrar bloqueos reales sin atribuir un
resultado aprobado por la existencia de una ficha.

Retirar cobertura sólo por regla obsoleta, duplicidad comprobada o límite aceptado,
indicando evidencia que permanece. Los conteos no constituyen cobertura completa ni
una medida de capacidad de producción.
