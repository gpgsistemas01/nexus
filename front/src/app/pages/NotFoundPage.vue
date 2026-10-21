<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <main class="not-found">
    <h1>Página no encontrada</h1>
    <p>La dirección que abriste no corresponde a una página de Nexus.</p>
    <RouterLink :to="{ name: 'login' }">Volver al inicio</RouterLink>
  </main>
</template>

<style scoped>
.not-found {
  padding: 48px 24px;
}

p {
  margin-bottom: 24px;
}
</style>
