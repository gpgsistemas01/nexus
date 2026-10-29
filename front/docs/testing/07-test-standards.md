# 7. Estándar de construcción de pruebas

## Alcance

Estas convenciones regulan el código de pruebas en `front/tests`. El
[plan](01-test-plan.md) mantiene niveles, selección por riesgo, técnicas y criterios
de entrada/salida; también define las plantillas DP, CP y EP. La
[guía de ejecución](06-test-files-and-credentials.md) reúne preparación y comandos.

## Organización y aislamiento

| Aspecto | Regla |
| --- | --- |
| Ubicación | Unitarias y colaboración en `tests/unit`, navegador simulado en `tests/e2e` y sistema real en `tests/system`. |
| Nombres | Unitarias con sufijo `Test.ts`; recorridos de navegador/sistema con `.spec.ts`. El título expresa condición y resultado observable. |
| Preparación | Reutilizar `mountComposable`, fixtures y escenarios del dominio; datos nuevos por caso cuando exista estado mutable. |
| Independencia | Cada caso puede ejecutarse solo. Los pasos de un recorrido utilizan el setup del propio test, sin depender de otra ficha. |
| Limpieza | Desmontar wrappers, restaurar dobles/globals/timers y retirar recursos propios. |
| Storage | Mantener el enlace del setup con Storage de jsdom para evitar diferencias con el Storage nativo de Node. |
| Persistencia | Usar únicamente el entorno aislado validado por la preparación de sistema; nunca la base habitual de desarrollo. |

## Aserciones y dobles

Comprobar valores, transición visible, payload, respuesta y ausencia de solicitudes
al cancelar o rechazar. No fijar HTML literal, clases internas de Vuetify ni llamadas
privadas sin un contrato observable que lo justifique. Un adaptador simulado permite
observar transporte; una prueba de sistema comprueba persistencia cuando ése sea
su objetivo.

La matriz CRUD y las condiciones de conflicto/permisos se eligen desde el
[plan](01-test-plan.md#cobertura-crud-mínima). Las matrices extensas pertenecen al
nivel más pequeño que las demuestra; los recorridos de navegador conservan
representantes de interacción.

## Mantenimiento y revisión

Actualizar fixtures, aserciones y trazabilidad cuando cambie el contrato observado.
No retirar una aserción para aprobar una corrida. La sustitución o retirada de
cobertura sigue los criterios de [salida del plan](01-test-plan.md#entrada-suspensión-y-salida)
e identifica la evidencia que permanece. Usar comandos sin watch en revisión y CI.
