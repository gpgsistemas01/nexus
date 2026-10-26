# 1. Aplicación y trazabilidad de requisitos y casos de uso

## Fuente normativa y alcance

La [SRS](../../../back/docs/requirements/requirements-specification/index.md), sus
[reglas de trazabilidad](../../../back/docs/requirements/requirements-specification/05-requirement-traceability-rules.md)
y las [fichas CU](../../../back/docs/requirements/use-cases/index.md) conservan
qué debe hacer Nexus. Vue realiza esos objetivos con otros componentes. Migrar
tecnología no crea otro actor ni otro caso de uso por cada componente o URL.

Se aplica 29148 selectivamente para identificar, enlazar y revisar obligaciones.
La estructura de las fichas es una convención del proyecto; no se atribuye a ISO
la tabla de dos columnas ni se declara conformidad integral.

## Cadena que debe poder recorrerse

La revisión conserva `requisito → CU → realización Vue → DP → CP/prueba → EP`:

| Elemento | Propietario y contenido |
| --- | --- |
| `RF-*`, `RN-*`, `RD-*`, `RC-*` | Catálogo normativo de la SRS. No se cambian sus estados sólo porque compile Vue o pase una prueba simulada. |
| `CU-*` | Ficha canónica: actor, disparador, precondiciones, flujo, alternativas/excepciones, postcondiciones y requisitos. |
| Realización Vue | Guía del módulo y archivos del contenedor, composable, mapper y servicio. Describe cómo realiza el objetivo, sin convertir esos archivos en acciones del actor. |
| `DP-*` | [Diseño de pruebas](../testing/01-test-design.md): riesgo/requisito, nivel, técnica, condición y oráculo. |
| `CP-*` o caso ejecutable | [Fichas críticas](../testing/02-test-cases.md), archivo/fixture y nombre exacto del caso. Las fichas selectivas añaden datos y pasos reproducibles. |
| `EP-*` | Evidencia de una ejecución en CI o en la revisión: revisión de código, ambiente, fecha, resultado real, estado y defecto cuando exista. No se registra como aprobación permanente en estas guías. |

La [vista de cobertura](../testing/03-use-case-coverage.md) enlaza los IDs revisados
con el cliente y declara límites. No replica el catálogo completo de obligaciones.
Las demás pruebas permanecen especificadas por sus nombres, datos y aserciones.

## Cómo aplicar las fichas de caso de uso

Antes de modificar un flujo se revisan estos elementos del `CU-*` existente:

1. **Actor y precondiciones:** sesión y permisos reales del servidor; el cliente
   sólo decide navegación y presentación con el usuario recibido.
2. **Flujo principal:** acciones y resultados visibles que deben conservarse.
   Props, endpoints o callbacks son realización técnica, no pasos nuevos del actor.
3. **Alternativas y excepciones:** datos inválidos, conflicto, fallo o rechazo
   deben conservar sus efectos. Un comportamiento distinto de Vue se registra
   como diferencia pendiente, no como equivalencia automática.
4. **Postcondiciones:** una respuesta simulada demuestra el comportamiento del
   cliente. Stock, auditoría, transacción y ausencia de escrituras parciales
   necesitan evidencia del servidor y persistencia real cuando corresponda.
5. **Requisitos relacionados:** conservar los IDs y añadir evidencia del cliente
   sin sustituir la evidencia backend de la misma obligación.

Por ejemplo, `RF-AUT-002` es soporte interno de los casos protegidos; la renovación
automática no requiere inventar otro objetivo del usuario. Del mismo modo, un
modal de confirmación o un componente reutilizado no crea un `CU-*` independiente.

## Diferencias y aceptación

La revisión inicial encontró una diferencia concreta en
[`CU-ALM-10`, alternativa A2](../../../back/docs/requirements/use-cases/catalogs/cu-alm-10.md):
la ficha permite abrir Agregar stock desde el rechazo de duplicado, trasladando
merma, cantidad y observaciones. Vue ahora ofrece esa transición tras un rechazo
definitivo y con permiso de entrada. Cancelar conserva el alta; confirmar abre
Agregar stock sin escribir, y una cantidad inicial cero deja la cantidad vacía.
El composable y el contenedor realizan el flujo original, sin redefinir el CU.
**BRE-VUE-001** conserva su seguimiento y evidencia en
[cobertura](../testing/03-use-case-coverage.md#brechas-y-decisiones-pendientes).

Desarrollo verifica código y pruebas; el responsable funcional acepta el resultado
conforme a gobernanza. Una brecha atendida no convierte toda la colección en aprobada:
la documentación conserva sus límites y el estado de revisión.
