# Estándar de seguridad del cliente

## Alcance

Estas reglas se aplican a captura, presentación, sesión y datos públicos del cliente.
La [integración de reglas públicas](views/development/input-handling.md) identifica
los validadores, alias y fronteras concretos. La API conserva autorización,
validación definitiva e integridad de los datos persistidos.

## Reglas y controles

| Frontera | Regla | Control del cliente |
| --- | --- | --- |
| Captura | Normalizar por campo y contrato; conservar signos y Unicode admitidos. No aplicar un limpiador global ni borrar caracteres para convertir una entrada inválida en válida. | Esquemas públicos y adaptación en el composable. |
| Contraseña | Conservar exactamente su contenido, sin trim, normalización, cambio de mayúsculas ni escape HTML. | Contrato específico de login o cambio de contraseña. |
| Salida visual | Presentar datos como texto mediante interpolación/props. No usar `v-html`, plantillas dinámicas ni `innerHTML` con datos recibidos. | ESLint y revisión de los puntos de presentación. |
| Confirmaciones | SweetAlert2 recibe `titleText` y `text`; no insertar contenido de API como HTML. | `shared/ui/feedback.ts` y pruebas de texto hostil. |
| Sesión | Cookies HttpOnly administradas por navegador/servidor; no almacenar tokens, cookies o contraseñas en Storage. Recordar usuario conserva sólo el nombre. | Servicio de sesión y preferencias de login. |
| Datos locales | Conservar únicamente los datos y el plazo previstos por la funcionalidad; la recuperación de merma no habilita almacenamiento de credenciales. | Contrato de recuperación y limpieza del propietario. |
| Compilación | Tratar `VITE_*` y los alias incorporados al bundle como públicos; excluir secretos, políticas privadas y fórmulas confidenciales. | Configuración de build y revisión de imports. |
| Diagnóstico | Excluir datos privados de consola, errores, fixtures y capturas publicables. | Revisión de salidas y artefactos. |
| Retorno de navegación | Admitir sólo rutas internas protegidas registradas; descartar destinos externos, arrays, login y pantallas de error. | Normalización del destino en Router. |

Los permisos visibles no conceden autorización. Los payloads seleccionan campos
admitidos conforme al [estándar de datos](coding-standards/07-objects-collections-and-payloads.md);
el servidor resuelve identidad, relaciones, estado y resultados definitivos.

## Cambios de contexto de salida

El cliente actual presenta texto. Incorporar URLs capturadas o HTML enriquecido
requiere definir protocolos/destinos o etiquetas/atributos permitidos y revisar su
tratamiento antes de habilitar la función. El escape de texto no valida una URL.

## Evidencia

Los oráculos y límites se mantienen en el
[diseño de seguridad de texto](../testing/design/07-shared.md#seguridad-de-texto-y-avisos)
y sus casos. Las pruebas del cliente no acreditan controles internos del servidor.
