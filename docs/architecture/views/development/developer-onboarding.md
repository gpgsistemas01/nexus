# Incorporación de desarrolladores a Nexus

Nexus es una aplicación web de control operativo de materiales, consumibles y mermas. Para modificarla, primero identifique el resultado de negocio afectado y después siga la petición desde la pantalla hasta el servicio que conserva sus reglas. Esta guía orienta el primer recorrido; los contratos y decisiones detallados permanecen en sus documentos propietarios.

## Entender las responsabilidades

| Parte del sistema | Responsabilidad | Qué revisar al cambiarla |
| --- | --- | --- |
| Rutas web y controladores web | Autorizar la página y preparar sus datos para las plantillas EJS | Menú, permiso de página, contexto y composición de la pantalla |
| Página y componentes del navegador | Mostrar datos, recoger entradas y coordinar formularios y peticiones | Estado local, callbacks, controles compartidos y presentación de errores |
| Rutas API, middleware, validadores y DTO | Autorizar la petición, validar y normalizar la entrada | Contrato HTTP, permiso de operación y campos admitidos; DTO significa objeto de transferencia de datos |
| Controlador API | Traducir HTTP y delegar la operación | Parámetros, resultado y tratamiento común de errores |
| Servicio | Aplicar reglas de negocio y coordinar cambios completos | Precondiciones, estado, transacción, existencia y trazabilidad |
| Repositorios y Prisma | Resolver acceso y representación persistente | Consultas reutilizables, cliente de la transacción y relaciones del modelo |

Una página visible no autoriza todas sus operaciones. Consulte las políticas de `src/constants/permissions.js` y la ruta API de cada acción. El navegador usa los permisos derivados para presentar controles; el servidor vuelve a comprobarlos y es quien protege los datos.

## Seguir una recepción de materiales

1. Lea `CU-ENT-02` en [casos de uso de compras](../../../requirements/use-cases/purchases/index.md): explica por qué el operador registra la recepción y qué resultado debe conservar.
2. Localice la página `/compras/materiales` en la [navegación web](../scenarios/web-navigation-and-screen-catalog/index.md) y siga su formulario en la [referencia frontend](frontend-technical-documentation/index.md). El selector puede crear un material con existencia cero; abrir o guardar ese catálogo no debe registrar lo recibido.
3. Revise la solicitud en el [contrato API](../../openapi/api-contract.md) y la ruta registrada. La ruta fija el contexto de materiales o consumibles; la entrada del navegador no debe cambiarlo.
4. Siga el controlador y el servicio en la [secuencia backend de la recepción](../processes/backend-code-sequences/purchases/cu-ent-02.md). Al confirmar la compra, documento, detalles, existencias y movimientos deben conservarse juntos; un fallo no debe dejar una recepción parcial.
5. Prepare el cliente y las migraciones con la [guía de Prisma](code-structure/06-prisma-and-persistence.md). Compruebe el modelo en `prisma/schema.prisma` y la [vista de datos](../logical/data-and-persistence/index.md). El diccionario generado explica la representación, mientras la SRS explica la garantía funcional.
6. Localice las comprobaciones pertinentes en el [plan de pruebas](../../../testing/test-plan.md), verificando tanto la respuesta como los datos guardados cuando la prueba usa persistencia.

En el repositorio, use el [mapa generado](code-map.md) para localizar archivos y símbolos. No lo edite manualmente: sus datos se obtienen del código. Una secuencia muestra colaboración interna; la ficha del caso de uso define el comportamiento esperado por el actor.

## Preparar y verificar un cambio

Siga la instalación y configuración del [README de la aplicación](../../../../README.md). Use Node.js 22–24. Las pruebas persistentes requieren una base de pruebas distinta de desarrollo; la configuración se comprueba antes de ejecutar integración.

Antes de agregar un módulo, busque una fábrica, servicio o componente equivalente. Mantenga una sola transacción en escrituras compuestas y transmita su cliente a los colaboradores. No mezcle consultas del cliente global con la transacción que está guardando un documento. Revise los [patrones](design-and-construction-patterns/index.md) y el [estándar de código](../../coding-standards/index.md) para preservar la organización local.

Ejecute las pruebas específicas, `npm run test:unit` y `npm run docs:check`. Si cambian rutas, imports o Prisma, regenere con `npm run docs:architecture`. Si cambia una pantalla o permiso visible, revise manuales y capturas del perfil afectado. La documentación curada se actualiza con la decisión; un inventario regenerado no explica por sí solo por qué se tomó.

Las brechas de seguridad, auditoría y alcance están identificadas en [acceso y auditoría](../logical/02-identity-access-and-audit.md) y en la [visión](../../../requirements/vision-scope-and-requirements/10-known-gaps-and-pending-decisions.md). Una entidad modelada o un servicio aislado no demuestra que exista un recorrido operativo completo.
