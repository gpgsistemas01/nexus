<script setup lang="ts">
import { RouterLink } from 'vue-router';

defineProps<{ userName: string; links: { label: string; to: string; isVue: boolean }[] }>();
const emit = defineEmits<{ navigate: [] }>();
</script>

<template>
    <nav
        aria-label="Navegación principal"
        class="warehouse-navigation"
    >
        <RouterLink
            to="/almacen"
            class="brand"
            @click="emit('navigate')"
            >N<span>Nexus</span></RouterLink
        >
        <p class="navigation-heading">ALMACÉN</p>
        <template
            v-for="link in links"
            :key="link.to"
        >
            <RouterLink
                v-if="link.isVue"
                :to="link.to"
                class="navigation-link"
                @click="emit('navigate')"
                >{{ link.label }}</RouterLink
            >
            <a
                v-else
                :href="link.to"
                class="navigation-link"
                >{{ link.label }}</a
            >
        </template>
        <div class="navigation-account">
            <span>{{ userName }}</span>
            <form
                action="/cerrar-sesion"
                method="post"
            >
                <button type="submit">Cerrar sesión</button>
            </form>
        </div>
    </nav>
</template>

<style scoped>
.warehouse-navigation {
    display: flex;
    flex-direction: column;
    min-height: 100%;
    padding: 1.5rem 1rem;
    color: #e8f6ee;
    background: #10251b;
}
.brand {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    color: #9ce7b5;
    font-size: 1.75rem;
    font-weight: 800;
    text-decoration: none;
    margin-bottom: 2rem;
}
.brand span {
    color: white;
    font-size: 1.25rem;
}
.navigation-heading {
    font-size: 0.7rem;
    letter-spacing: 0.15em;
    color: #99b7a5;
    margin: 0 0.75rem 0.75rem;
}
.navigation-link {
    color: #d7e6dc;
    text-decoration: none;
    padding: 0.85rem 0.75rem;
    border-radius: 0.75rem;
    margin-bottom: 0.3rem;
    font-size: 0.9rem;
}
.navigation-link:hover,
.router-link-exact-active {
    color: white;
    background: #1f6541;
}
.navigation-account {
    margin-top: auto;
    padding: 2rem 0.75rem 0;
    font-size: 0.9rem;
}
.navigation-account button {
    background: none;
    border: 0;
    color: #b9dbc5;
    cursor: pointer;
    padding: 0.75rem 0;
}
a:focus-visible,
button:focus-visible {
    outline: 2px solid #9ce7b5;
    outline-offset: 2px;
}
</style>
