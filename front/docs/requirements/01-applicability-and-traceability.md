# 1. Aplicación y trazabilidad de requisitos y casos de uso

## Alcance y propiedad

El frontend tiene [especificación propia](02-client-specification.md) y fichas completas de interacción. Se puede entender la captura y el resultado de un caso Vue con sus fichas y documentos locales. La repetición de conceptos necesarios entre aplicaciones es admisible; cada descripción explica la responsabilidad y realización de su aplicación.

Se aplica 29148 selectivamente para identificar obligaciones observables y conservar trazabilidad. Las tablas y numeración son convenciones del proyecto, no una plantilla impuesta por ISO. Los requisitos locales describen el cliente implementado y permanecen En revisión hasta la aceptación correspondiente.

## Identificadores y cadena de evidencia

La cadena es `requisito Vue → CU-VUE → módulo/código → DP → CP/prueba → EP`.

| Elemento | Contenido y propietario |
| --- | --- |
| `RF-VUE-*` | Comportamiento funcional observable de la SPA. |
| `RD-VUE-*` | Datos, identidad, versiones y contratos que conserva el cliente. |
| `RN-VUE-*` | Interacción, seguridad, mantenibilidad y comportamiento asíncrono verificable. |
| `RC-VUE-*` | Restricciones de tecnología, construcción, origen y publicación. |
| `CU-VUE-*` | Actor, objetivo, datos, precondiciones, flujo, alternativas/excepciones y postcondiciones de una interacción. |
| Realización | Páginas, componentes, composables, mappers y servicios del módulo. Los nombres de archivo no son pasos del actor. |
| `DP-*` | Riesgo/requisito, técnica, nivel, condición y oráculo de prueba. |
| `CP-*` / prueba ejecutable | Datos/fixture, pasos, resultado esperado y limpieza. El registro añade fichas a casos críticos sin transcribir cada `it`. |
| `EP-*` | Ejecución: commit/estado local, ambiente, fecha, comando, resultado real y discrepancias. Vive en CI o revisión, no como aprobación perpetua de la ficha. |

La [matriz de cobertura](../testing/03-use-case-coverage.md) permite recorrer la cadena local. Conserva además la relación con IDs existentes del producto (`CU-AUT-*`, `CU-ALM-*`, `CU-ENT-*`, `CU-SAL-*`, `CU-IDA-*`, `CU-CAT-*`) cuando aplica. Se explican los efectos compartidos en ambas aplicaciones; esos IDs no se renumeran por cambiar el renderizado.

## Cómo redactar y revisar un caso Vue

1. Identificar actor, permiso y disparador. Sesión/permisos recibidos orientan la UI; la API autoriza cada petición.
2. Describir qué captura y observa el actor. Separar esos pasos de props, callbacks, endpoints o métodos que los realizan.
3. Especificar modo y campos editables/de consulta. Crear, editar, ajustar, surtir o devolver no son una única operación con campos opcionales arbitrarios.
4. Indicar alternativas: cancelar, validación, conflicto, falla de conexión, rechazo de sesión y respuesta tardía, cuando correspondan al flujo.
5. Declarar postcondición y ausencia de efectos: abrir un auxiliar o una confirmación no guarda el formulario principal.
6. Enlazar implementación y pruebas locales; distinguir cliente simulado, navegador real y sistema con persistencia real.
7. Revisar el requisito y sus consumidores si cambia el contrato; mantener IDs estables y registrar la diferencia en la matriz.

La renovación automática es soporte de los casos protegidos, no un objetivo nuevo por cada request. Un componente o modal reutilizado tampoco crea por sí mismo un caso de negocio distinto; `CU-VUE-012` documenta la colaboración visible de alta auxiliar y sus consumidores.

## Aceptación y discrepancias

Una coincidencia de interfaces o un build correcto no demuestra equivalencia funcional. La API simulada comprueba la captura y respuesta del cliente; stock, auditoría, atomicidad y revocación real requieren evidencia de sistema/servidor.

La transición de merma duplicada se describe íntegramente en `CU-VUE-007`: tras rechazo definitivo, cancelar conserva el alta; confirmar abre entrada con referencia/cantidad/observaciones y exige otro Guardar. Su seguimiento conserva `BRE-VUE-001` y las pruebas asociadas; no basta con enlazar la ficha del backend para afirmar que Vue lo realiza.

Desarrollo contrasta código y pruebas; la aceptación funcional/técnica registra responsable y evidencia. Atender una brecha no aprueba toda la colección. Las correspondencias generales del producto pueden consultarse como referencia complementaria en su documentación, sin sustituir estas fichas.
