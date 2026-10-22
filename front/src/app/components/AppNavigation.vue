<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { VList, VListItem, VListSubheader } from 'vuetify/components/VList';
import { VAvatar } from 'vuetify/components/VAvatar';
import { VBtn } from 'vuetify/components/VBtn';
import type { NavigationLink } from '../navigation.js';

defineProps<{
    userName: string;
    links: readonly NavigationLink[];
    isCompact: boolean;
    isTemporary: boolean;
}>();
const emit = defineEmits<{ navigate: [] }>();
</script>

<template>
    <nav
        aria-label="Navegación principal"
        class="app-navigation"
    >
        <RouterLink
            to="/almacen"
            class="brand"
            aria-label="Nexus, Almacén"
            @click="emit('navigate')"
        >
            <VAvatar
                color="primary"
                variant="flat"
                size="30"
            >
                N
            </VAvatar>
            <strong v-if="!isCompact">Nexus</strong>
        </RouterLink>
        <VBtn
            v-if="isTemporary"
            class="close-navigation"
            variant="text"
            size="small"
            @click="emit('navigate')"
        >
            Cerrar menú
        </VBtn>
        <VList
            bg-color="transparent"
            base-color="menu-text"
            density="compact"
            nav
            slim
            class="nav-items"
        >
            <VListSubheader v-if="!isCompact">ALMACÉN</VListSubheader>
            <VListItem
                v-for="link in links"
                :key="link.to"
                :to="link.to"
                :title="link.title"
                :aria-label="link.title"
                color="menu-accent"
                rounded="lg"
                @click="emit('navigate')"
            >
                <template #prepend>
                    <VAvatar
                        color="menu-accent"
                        variant="tonal"
                        size="24"
                        class="nav-initial"
                    >
                        {{ link.initial }}
                    </VAvatar>
                </template>
            </VListItem>
        </VList>
        <div class="navigation-account">
            <span
                v-if="!isCompact"
                class="account-name"
            >
                {{ userName }}
            </span>
            <form
                action="/cerrar-sesion"
                method="post"
            >
                <VBtn
                    type="submit"
                    variant="text"
                    size="small"
                    block
                    :title="isCompact ? 'Cerrar sesión' : undefined"
                    :aria-label="'Cerrar sesión'"
                >
                    {{ isCompact ? 'Salir' : 'Cerrar sesión' }}
                </VBtn>
            </form>
        </div>
    </nav>
</template>

<style scoped>
.app-navigation {
    display: flex;
    flex-direction: column;
    min-height: 100%;
    background: rgb(var(--v-theme-menu-surface));
    color: rgb(var(--v-theme-menu-text));
}
.brand {
    height: 56px;
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0 16px;
    color: rgb(var(--v-theme-menu-text));
    border-bottom: 3px solid rgb(var(--v-theme-accent));
    text-decoration: none;
}
.brand strong {
    font-size: 1.1rem;
}
.nav-items {
    padding: 0.35rem 0.5rem;
}
.nav-items :deep(.v-list-subheader) {
    color: rgba(var(--v-theme-menu-text), 0.7);
}
.nav-items :deep(.v-list-item) {
    min-height: 36px;
    font-size: 0.8rem;
    margin-bottom: 0.15rem;
}
.nav-items :deep(.v-list-item__spacer) {
    width: 10px;
}
.nav-initial {
    font-size: 0.7rem;
    font-weight: 700;
}
.navigation-account {
    margin-top: auto;
    padding: 0.75rem 0.35rem;
    border-top: 1px solid rgba(var(--v-theme-menu-text), 0.15);
}
.account-name {
    display: block;
    padding: 0.25rem 0.75rem;
    color: rgba(var(--v-theme-menu-text), 0.8);
    font-size: 0.75rem;
}
</style>
