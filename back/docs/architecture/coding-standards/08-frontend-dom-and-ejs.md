# 8. Frontend, DOM y EJS

- Los selectores compartidos, eventos, modos de formulario y mensajes se importan desde
  sus constantes.
- Una página registra eventos y configura componentes; no duplica validación, requests o
  manipulación ya encapsulada en `application`, `ui` o plugins.
- Se reutilizan parciales bajo `views/shared` antes de crear markup equivalente. Un
  parcial nuevo debe representar una unidad configurable, no una copia con otro nombre.
- Los atributos `id`, `name` y `data-*` expresan recurso y propósito. JavaScript consulta
  primero los selectores compartidos del flujo.
- Mostrar datos no confiables mediante `textContent` o `<%=`. Reservar `<%-` para
  parciales y HTML de confianza; no usarlo para imprimir entrada del usuario.
- Al tocar una vista EJS se preservan la última línea, los cierres y las llamadas a
  `contentFor`, salvo cambios funcionales necesarios. Conservar exactamente el fin
  de archivo original: no añadir ni quitar su salto final.
- Una refactorización no reindenta toda la vista si sólo cambia un bloque. Esto reduce
  ruido y permite revisar que las etiquetas continúen balanceadas.

### 8.1 Ejemplo de reutilización y preservación EJS

Una página configura un parcial existente en lugar de repetir el modal:

```ejs
<%- include('../../../shared/layout/modal', { modalId: 'materialModal', form }) %>

<%- contentFor('layoutType') %>
site
```

Si el cambio afecta el include, las dos últimas líneas permanecen exactamente en esa
posición: no se eliminan para volver a agregarlas al final. Un nuevo parcial sólo se
justifica si requiere un contrato visual reutilizable que el parcial vigente no puede
expresar mediante configuración.

Al reinicializar un componente, evitar listeners duplicados y reutilizar su mecanismo
de registro o limpieza. Las escrituras usan el manejo compartido del formulario para
evitar envíos simultáneos y recuperar controles ante errores admitidos por el flujo.
Una modificación visible revisa permisos, comportamiento responsivo, manual y capturas
relacionadas; la captura automática no crea datos de operación.

### 8.2 Componentes Vue y TypeScript

- Aplicar la indentación de cuatro espacios de la sección 2 a TypeScript, templates
  y estilos de componentes nuevos o modificados; conservar dos espacios en pruebas.
- En `front/`, Prettier y `.editorconfig` aplican ese formato; el manifiesto
  `package.json` conserva dos espacios. Ejecutar
  `npm run format` para corregir y `npm run format:check` para comprobar; esta
  comprobación forma parte de `npm run check` y CI. ESLint usa el preset Vue
  `recommended` y valida responsabilidades y convenciones; el formateador sólo
  normaliza sintaxis y no sustituye la revisión de diseño.
- `npm run format` corrige primero las reglas de ESLint y después ejecuta Prettier.
  `@stylistic/eslint-plugin` comprueba la separación tras imports y guardas, y entre
  funciones y bloques; Vue comprueba una línea vacía entre `script`, `template`
  y `style`. Los templates separan contenido y cierres de etiquetas con
  `htmlWhitespaceSensitivity: 'ignore'`. Las fases semánticas se revisan según
  la sección 2: no se agrega una línea vacía entre cada sentencia.
- Componentes `.vue` en PascalCase, con `<script setup lang="ts">`. Composables en
  `useNombre.ts`, módulos TypeScript en camelCase e imports relativos con `.js`,
  resueltos por TypeScript/Vite. Las convenciones de nombres y booleanos de la sección
  3 también aplican a props y estado reactivo.
- Páginas y composables coordinan valores, validación y operaciones. Los componentes
  de presentación reciben props tipadas y emiten acciones o `update:<prop>`; no mutan
  props, consultan HTTP, persisten datos ni deciden autenticación.
- La biblioteca visual presenta controles; VeeValidate conecta las reglas públicas
  con el formulario. No copiar los validadores ni trasladar las reglas privadas del
  servidor al bundle. Importar desde su módulo propietario, sin reexports de comodidad.
- Liberar operaciones pendientes al desmontar y descartar respuestas tardías.
  Separar errores HTTP de efectos posteriores a un acceso confirmado, como recordar
  el usuario o navegar. Un fallo opcional de almacenamiento admite continuar sin esa
  preferencia; no debe convertir el acceso confirmado en un rechazo de credenciales.
- La configuración de proveedores pertenece a `app/plugins`; no se mezcla con los
  módulos de negocio. Un rechazo durante la preparación asíncrona del arranque debe
  tener una recuperación visible.

Las responsabilidades por módulo se mantienen en la
[arquitectura del frontend](../../../../front/docs/architecture.md).
