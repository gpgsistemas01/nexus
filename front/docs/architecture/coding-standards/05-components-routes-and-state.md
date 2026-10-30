# 5. Componentes, rutas y propietario del estado

## SFC presentacionales

Se usa `<script setup lang="ts">`. Props, eventos y slots se tipan con las macros
oficiales. El orden de macros, si existen, es `defineOptions`, `defineProps`,
`defineEmits`, `defineSlots`. Las props son entrada: no mutarlas ni mutar sus objetos
anidados para actualizar al contenedor. Emitir intención y datos suficientes.

### Ejemplo de props y eventos

Versión abreviada de [TableAction.vue](../../../src/shared/components/TableAction.vue),
centrada en el contrato del botón:

```vue
<script setup lang="ts">
import { VBtn } from 'vuetify/components/VBtn';

defineProps<{ label: string; isDisabled?: boolean }>();
const emit = defineEmits<{ click: [] }>();
</script>

<template>
    <VBtn
        :disabled="isDisabled"
        @click="emit('click')"
    >
        {{ label }}
    </VBtn>
</template>
```

Las props determinan la presentación; `click` comunica la intención al consumidor.
El componente no modifica la prop ni decide qué registro editar. Del mismo modo,
`create` en [RemoteSelect.vue](../../../src/shared/components/RemoteSelect.vue)
solicita un alta; el Workspace abre el auxiliar y devuelve la opción confirmada.

## Estado reactivo

Acceder con `.value` en script; el template desempaqueta las refs expuestas según Vue.
Usar `computed` para derivados y una única fuente de verdad para cada dato. Evitar dos
refs para la misma selección o duplicar un total que puede derivarse de la captura.
Los cambios programáticos de precarga se distinguen de los cambios del usuario.
Una llamada a un composable crea estado por instancia, salvo el contrato proporcionado
explícitamente por aplicación.

Los modos fijos por instancia se tipan y el contenedor recrea el editor al cambiarlos.
La sesión se crea una vez en `main.ts` y se proporciona con una InjectionKey tipada.
No se agrega Pinia para compartir cada formulario: la [decisión de estado](../views/logical/states/04-state-ownership-and-save.md)
identifica propietarios y condiciones para reconsiderarla.

## Rutas y permisos de interfaz

Registrar rutas en `createAppRouter` y configuración del recurso. Usar RouterLink
para navegación interna y nombres de rutas donde su contrato exista. El historial
HTML5 exige fallback del alojamiento estático. La guarda decide login, permiso o
indisponibilidad con el destino interno conservado; no resuelve autorización definitiva.
No añadir al menú rutas de otra aplicación ni construir destinos externos desde input.

## Página y Workspace

Una Page conecta sesión/permisos, composables y presentación. Un Workspace coordina
módulos mediante contratos públicos, preserva el formulario principal y controla el
auxiliar. La lógica de dominio permanece en el módulo; la UI no conoce transacciones
ni persistencia. Extraer otra capa sólo cuando se pueda identificar su responsabilidad
y consumidores sin repetir el coordinador existente.
