<script setup lang="ts">
const reloadPage = () => window.location.reload();
</script>

<template>
    <main class="startup-error" aria-labelledby="startup-error-title">
        <h1 id="startup-error-title">No se pudo cargar la aplicación</h1>
        <p>Revisa tu conexión e intenta nuevamente.</p>
        <button type="button" @click="reloadPage">Volver a intentar</button>
    </main>
</template>

<style scoped>
.startup-error {
    max-width: 36rem;
    margin: auto;
    padding: 4rem 1.5rem;
}

p {
    margin-block: 1rem 1.5rem;
}

button {
    padding: 0.75rem 1.25rem;
    border: 0;
    border-radius: 0.5rem;
    background: #0f7f3a;
    color: #fff;
    cursor: pointer;
}
</style>
