# 1. Guía de documentación frontend

Esta referencia cubre el código del navegador y su composición EJS en `src/public/js`,
`src/views/pages` y `src/views/shared`. Enlaza el contrato API, pero no vuelve a declarar
permisos ni reglas de negocio que el servidor debe hacer cumplir.

## Responsabilidades por capa

| Ubicación | Responsabilidad |
| --- | --- |
| `public/js/services` | Método, URL, parámetros y cuerpo enviados mediante el cliente HTTP común. |
| `public/js/application` | Adaptación de respuestas y coordinación sin acceso directo al DOM. |
| `public/js/pages` | Composición e inicialización de la pantalla, formulario o modal del recurso. |
| `public/js/ui` y `public/js/plugins` | Comportamiento visual o integración reutilizable, configurados por sus consumidores. |
| `public/js/utils` | Transformaciones sin propiedad visual ni de un dominio específico. |
| `views/pages` y `views/shared` | Estructura propietaria de una página y parciales compartidos, respectivamente. |

Una ficha registra el contrato entre módulos, la factory reutilizada, la configuración
inyectada, los eventos relevantes y los nombres de dominio exportados. En formularios
se documentan campos, modo, validación visual y mutación; no se inventaría cada selector
o listener cuando el código ya responde esa pregunta.

## Cuándo usar un diagrama

| Cambio | Representación útil | Evitar |
| --- | --- | --- |
| Reutilización de UI, plugins o factories | Componentes o dependencias. | Una secuencia por consumidor. |
| Llamadas encadenadas o efectos posteriores | Secuencia. | Un ER o una copia del backend. |
| Alternativas de validación que cambian el recorrido | Actividad. | Una máquina de estados sin estados persistentes. |
| Estado persistente | Referencia al estado normativo de requisitos. | Transiciones paralelas sólo para frontend. |
| Petición directa, CRUD homogéneo o exportación | Secuencia `DIA-FE-CU-*` del caso propietario. | Un grupo genérico de “Reportes” o una segunda secuencia trivial. |

Los diagramas frontend terminan en método y URL. La vista de
[componentes y reutilización](../architecture-and-web-views/02-organization-consistent-of-frontend-and-back.md#reutilización-comprobada-en-el-frontend)
concentra las factories compartidas; cada secuencia conserva únicamente participantes,
datos y efectos propios del caso.

## Revisión

- comprobar que `pages` compone, `application` coordina, `services` transporta y `ui`
  no conoce un recurso concreto;
- revisar EJS, imports, exports, selectores, eventos y consumidores modificados;
- enlazar contrato API, secuencia propietaria y prueba real sin atribuir seguridad al
  navegador;
- ejecutar `npm run docs:check` y, si cambiaron rutas o imports, regenerar primero con
  `npm run docs:architecture`.
