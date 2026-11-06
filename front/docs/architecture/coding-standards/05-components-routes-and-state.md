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

Usar `.value` en script; Vue desempaqueta las refs expuestas en el template. Calcular
derivados con `computed` y conservar una sola fuente por dato. Distinguir precarga de
cambios del usuario. Cada instancia de un composable tiene estado propio, salvo el
contrato compartido de aplicación.

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

La Page conecta permisos, composables y presentación. El Workspace coordina módulos y
conserva la captura principal al abrir auxiliares. El dominio permanece en su módulo; la
UI no gestiona persistencia. Extraer capas sólo con una responsabilidad y consumidores
distintos.
