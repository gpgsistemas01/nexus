# 3. Registro selectivo de casos de prueba automatizados

## Alcance

Las fichas concretan captura, sesión, concurrencia, documentos, selección contextual y
seguridad con datos reproducibles. Cada una utiliza el formato de seis columnas del
[plan](01-test-plan.md): ID, precondiciones, datos, pasos, resultado esperado y limpieza.
Los archivos de pruebas conservan su especificación ejecutable; la ficha enlaza su
título y declara el límite de simulación. No se transcribe cada `it` ni se atribuye
una ejecución aprobada por estar documentado.

## Ambiente y preparación

Cada caso declara su preparación y limpieza. Un recorrido parte del estado inicial
de su propia prueba, sin depender de otra ficha. La [guía de ejecución](06-test-files-and-credentials.md)
explica las herramientas, archivos y credenciales de cada nivel.

## Fichas

| Caso | Objetivo | Diseño |
| --- | --- | --- |
| [CP-VUE-AUT-001](cases/cp-vue-aut-001.md) | captura de login y credencial histórica. | DP-VUE-AUTH-002 |
| [CP-VUE-SESSION-001-01](cases/cp-vue-session-001-01.md) | renovación transparente. | DP-VUE-SESSION-001 |
| [CP-VUE-SESSION-002-01](cases/cp-vue-session-002-01.md) | recuperar un refresh con 502. | DP-VUE-SESSION-002 |
| [CP-VUE-CAT-002-01](cases/cp-vue-cat-002-01.md) | conflicto de versión en un catálogo. | DP-VUE-CAT-002 |
| [CP-VUE-COM-003-01](cases/cp-vue-com-003-01.md) | confirmar una corrección de compra. | DP-VUE-COM-003 |
| [CP-VUE-ISS-002-01](cases/cp-vue-iss-002-01.md) | surtir un detalle seleccionado. | DP-VUE-ISS-002 |
| [CP-VUE-ISS-002-02](cases/cp-vue-iss-002-02.md) | devolución por la interfaz. | DP-VUE-ISS-002 |
| [CP-VUE-ISS-002-03](cases/cp-vue-iss-002-03.md) | precisión y reintento de devolución. | DP-VUE-ISS-002 |
| [CP-VUE-ISS-005-01](cases/cp-vue-iss-005-01.md) | área automática, bloqueo y conservación de la edición. | DP-VUE-ISS-005 |
| [CP-VUE-WH-011-01](cases/cp-vue-wh-011-01.md) | trasladar un duplicado con cantidad positiva. | DP-VUE-WH-011 |
| [CP-VUE-WH-011-02](cases/cp-vue-wh-011-02.md) | trasladar un duplicado con cantidad cero. | DP-VUE-WH-011 |
| [CP-VUE-SESSION-004-01](cases/cp-vue-session-004-01.md) | cierre y rechazo posterior. | DP-VUE-SESSION-004 |
| [CP-VUE-REC-003-01](cases/cp-vue-rec-003-01.md) | reportes por recurso con recuperación. | DP-VUE-REC-003 |
| [CP-VUE-SYS-001-01](cases/cp-vue-sys-001-01.md) | recorrido cliente, servidor y persistencia. | DP-VUE-SYS-001 |
| [CP-VUE-SEL-001-01](cases/cp-vue-sel-001-01.md) | proveedor desde la captura de inventario. | DP-VUE-SEL-001 |
| [CP-VUE-SEL-001-02](cases/cp-vue-sel-001-02.md) | proveedor y artículo desde una compra. | DP-VUE-SEL-001 |
| [CP-VUE-SEL-001-03](cases/cp-vue-sel-001-03.md) | cliente desde una salida. | DP-VUE-SEL-001 |
| [CP-VUE-IDA-001-01](cases/cp-vue-ida-001-01.md) | editar responsabilidades sin duplicar área. | DP-VUE-IDA-001 |
| [CP-VUE-IDA-002-01](cases/cp-vue-ida-002-01.md) | contrato específico de cambio de contraseña. | DP-VUE-IDA-002 |
| [CP-VUE-SEC-001-01](cases/cp-vue-sec-001-01.md) | texto hostil en confirmación y error. | DP-VUE-SEC-001 |
| [CP-VUE-WH-002-01](cases/cp-vue-wh-002-01.md) | rechazo de edición con versión original. | DP-VUE-WH-002 |
| [CP-VUE-MAN-001-01](cases/cp-vue-man-001-01.md) | selección y capturas del manual por acceso. | DP-VUE-MAN-001 |

## Reproducción y resultados

Los comandos y la selección de archivos o títulos están en la
[guía de ejecución](06-test-files-and-credentials.md). Los resultados se registran
con el [formato EP](01-test-plan.md#3-registro-de-ejecución-y-resultado-real).
