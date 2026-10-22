<script setup lang="ts">
import { RouterLink } from 'vue-router';

defineProps<{ isUnavailable?: boolean }>();
</script>

<template>
    <main class="access-error">
        <h1>{{ isUnavailable ? 'No se pudo comprobar la sesión' : 'Acceso no permitido' }}</h1>
        <p>
            {{
                isUnavailable
                    ? 'Revisa tu conexión y vuelve a intentarlo.'
                    : 'Tu cuenta no tiene permiso para abrir este módulo.'
            }}
        </p>
        <RouterLink to="/almacen">Volver a comprobar el acceso</RouterLink>
        <RouterLink to="/inicio-sesion">Iniciar sesión</RouterLink>
    </main>
</template>

<style scoped>
.access-error {
    max-width: 650px;
    padding: 3rem 1.5rem;
    margin: 0 auto;
}
p {
    margin: 1rem 0;
}
a {
    display: block;
    color: #14844c;
    margin: 1rem 0;
}
</style>
