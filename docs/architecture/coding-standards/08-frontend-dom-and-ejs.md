# 8. Frontend, DOM y EJS

- Los selectores compartidos, eventos, modos de formulario y mensajes se importan desde
  sus constantes.
- Una página registra eventos y configura componentes; no duplica validación, requests o
  manipulación ya encapsulada en `application`, `ui` o plugins.
- Se reutilizan parciales bajo `views/shared` antes de crear markup equivalente. Un
  parcial nuevo debe representar una unidad configurable, no una copia con otro nombre.
- Los atributos `id`, `name` y `data-*` expresan recurso y propósito. JavaScript consulta
  primero los selectores compartidos del flujo.
- Se evita insertar HTML construido con datos no confiables. Se usan APIs de texto,
  plantillas y escape EJS según el contrato existente.
- Al tocar una vista EJS se preserva en su posición la última línea de `contentFor`; no
  se elimina y vuelve a agregar como efecto del formato.
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
