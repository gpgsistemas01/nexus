# Entradas, normalización y salida segura en Vue

Los módulos actuales capturan texto plano, números, fechas, opciones y partidas.
No admiten contenido HTML escrito por usuarios. La regla general es conservar
el significado de la captura y tratarla como dato en todo el recorrido.

## Responsabilidades

| Operación | Frontend | Backend |
| --- | --- | --- |
| Normalización | El modelo del formulario recorta texto cuando su contrato lo indica y construye el payload permitido. | Validators y DTOs vuelven a normalizar el contrato antes de usarlo. |
| Validación | VeeValidate ejecuta reglas públicas para orientar la captura y presentar errores. | Express valida incluso si se omite Vue y resuelve permisos, relaciones, versiones y estado. |
| Escape de salida | Interpolación/props de texto y SweetAlert2 `titleText`/`text`. | JSON con tipo de respuesta correcto; EJS usa escape HTML o serializador específico para JSON en scripts. |
| Sanitización HTML | No hay consumidor que la necesite. No se usa `v-html`. | Tampoco se transforman nombres en HTML “limpio”. Un futuro editor enriquecido necesita contrato propio. |

La fuente normativa y el diagrama de las fronteras están en
[el estándar del servidor](../../back/docs/architecture/coding-standards/09-errors-security-audit-and-logging.md#fronteras-de-una-escritura-de-formulario).
La separación de estas operaciones sigue [OWASP: prevención de XSS](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html).

## Captura y transporte existentes

- Nombres y observaciones usan reglas compartidas por alias `@nexus/*`; conservan
  signos admitidos, Unicode y límites por campo. Los controles no imprimibles se
  rechazan, no se borran para convertir una captura inválida en otra válida.
- El número de proyecto admite hasta 10 caracteres y signos propios de su contrato;
  `PROJECT_NUMBER_PATTERN` rechaza controles internos. El mensaje de longitud toma
  `FORM_FIELD_LIMITS.PROJECT_NUMBER`, evitando anunciar 50 cuando el límite es 10.
- Una contraseña no recibe `trim`, `.normalize()`, cambio de mayúsculas ni escape HTML.
  El login conserva su política histórica; no se le impone la política de alta.
- Los payloads seleccionan campos; `expectedVersion` y `operationId` conservan
  su semántica de concurrencia. El tipo TypeScript no valida por sí solo una respuesta HTTP.
- Axios transporta y renueva sesión; no recorre recursivamente requests/responses
  para borrar etiquetas o escapar strings. Ese filtro rompería contratos y no conoce
  el contexto donde se muestra cada dato.

Las restricciones de signos de `TEXT_INPUT_PATTERN` pertenecen al contrato vigente
de esos campos; no son un sanitizador de HTML ni una garantía contra SQL/XSS.
El origen API tampoco vuelve confiable una cadena: datos antiguos o recibidos desde
otro sistema se presentan como texto igual que la captura actual.

## Salidas de Vue, Vuetify y SweetAlert2

```vue
<!-- Correcto: mostrar texto, incluso cuando contiene signos de marcado. -->
<span>{{ row.name }}</span>
```

`CatalogTable` y las tablas compuestas con `ServerTable` delegan la presentación de
texto a Vue/Vuetify. Los formularios asignan el dato a valores de controles; no lo
concatenan para construir una plantilla. `feedback.ts` utiliza `titleText` y `text`
tanto al abrir la confirmación como al actualizar un error; `showValidationMessage`
recibe una cadena estática del proyecto.

`vue/no-v-html` se configura como error. Esta regla no detecta todas las formas de
manipulación del DOM: la revisión también comprueba `innerHTML`, templates dinámicos,
contenido `html` de plugins y fuentes de URL/estilos. Los enlaces actuales del menú
proceden de la configuración de Router, no de URLs capturadas por un usuario.

Si en el futuro se capturan URLs, el servidor debe admitir protocolos y destinos
concretos. El escape automático de un atributo no valida un protocolo. Si aparece
HTML enriquecido, se revisará una biblioteca mantenida como DOMPurify y una política
de etiquetas/atributos antes de habilitar su presentación. No se instala ahora.
Estas precauciones se basan en [seguridad de Vue](https://vuejs.org/guide/best-practices/security.html).

## Evidencia y límites

`feedbackTest.ts` usa SweetAlert2 real en jsdom para comprobar título, descripción
y error como texto, sin nodos inyectados. `catalogs.spec.ts` usa Chromium con un
nombre de API que contiene un `img` y un manejador: aparece como texto en tabla y
valor de edición, sin crear el elemento ni ejecutar el manejador. Es una fixture
de respuesta histórica/externa, no un payload que el alta actual deba aceptar.

`formValidationParityTest.js` comprueba reglas compartidas y fronteras en el
backend; sus integraciones verifican rechazo sin escrituras. Las pruebas del
frontend no sustituyen esas garantías. El [registro de diseño](tooling.md#seguridad-de-texto-y-avisos)
identifica los oráculos; esta revisión no se presenta como una auditoría de seguridad
completa del sistema ni como prueba de carga.
