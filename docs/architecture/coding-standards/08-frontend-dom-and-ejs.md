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
