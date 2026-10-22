<script setup lang="ts">
import { ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { VList, VListGroup, VListItem } from 'vuetify/components/VList';
import { VAvatar } from 'vuetify/components/VAvatar';
import { VBtn } from 'vuetify/components/VBtn';
import { VIcon } from 'vuetify/components/VIcon';
import { VTooltip } from 'vuetify/components/VTooltip';
import { APP_ICONS } from '../icons.js';
import type { NavigationGroup } from '../navigation.js';

const props = defineProps<{
    userName: string;
    groups: readonly NavigationGroup[];
    activeGroup: string;
    isCompact: boolean;
    isTemporary: boolean;
}>();
const emit = defineEmits<{ navigate: []; expand: [] }>();
const openedGroups = ref([props.activeGroup]);
watch(
    () => props.activeGroup,
    (group) => {
        openedGroups.value = [group];
    },
);
const updateOpenedGroups = (groups: unknown[]) => {
    if (!props.isCompact)
        openedGroups.value = groups.filter((group): group is string => typeof group === 'string');
};
const expandNavigation = (group: string) => {
    if (!props.isCompact) return;
    openedGroups.value = [group];
    emit('expand');
};
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
            v-if="groups.length"
            :opened="isCompact ? [] : openedGroups"
            open-strategy="single"
            bg-color="transparent"
            base-color="menu-text"
            density="compact"
            nav
            slim
            class="nav-items"
            :class="{ 'nav-items--compact': isCompact }"
            @update:opened="updateOpenedGroups"
        >
            <VListGroup
                v-for="group in groups"
                :key="group.id"
                :value="group.id"
                fluid
            >
                <template #activator="{ props: activatorProps, isOpen }">
                    <VListItem
                        v-bind="activatorProps"
                        :title="group.title"
                        :prepend-icon="group.icon"
                        :append-icon="isCompact ? '' : undefined"
                        role="button"
                        :aria-label="group.title"
                        :aria-expanded="isOpen"
                        rounded="lg"
                        class="nav-group-heading"
                        @click="expandNavigation(group.id)"
                    >
                        <VTooltip
                            v-if="isCompact"
                            activator="parent"
                            location="end"
                        >
                            {{ group.title }}
                        </VTooltip>
                    </VListItem>
                </template>
                <VListItem
                    v-for="link in group.links"
                    :key="link.to"
                    :to="link.to"
                    :title="link.title"
                    :aria-label="link.title"
                    :prepend-icon="link.icon"
                    color="menu-accent"
                    rounded="lg"
                    @click="emit('navigate')"
                />
            </VListGroup>
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
                    :block="!isCompact"
                    :icon="isCompact"
                    aria-label="Cerrar sesión"
                >
                    <VIcon
                        v-if="isCompact"
                        :icon="APP_ICONS.logout"
                    />
                    <span v-else>Cerrar sesión</span>
                    <VTooltip
                        v-if="isCompact"
                        activator="parent"
                        location="end"
                    >
                        Cerrar sesión
                    </VTooltip>
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
.nav-items :deep(.v-list-item) {
    min-height: 36px;
    font-size: 0.8rem;
    margin-bottom: 0.15rem;
}
.nav-items :deep(.v-list-item__spacer) {
    width: 10px;
}
.nav-items:not(.nav-items--compact) :deep(.v-list-item-title) {
    white-space: normal;
    line-height: 1.3;
}
.nav-group-heading {
    color: rgb(var(--v-theme-menu-text));
    font-weight: 700;
    border-bottom: 1px solid rgba(var(--v-theme-menu-text), 0.12);
}
.nav-items :deep(.v-list-group__items) {
    border-left: 1px solid rgba(var(--v-theme-menu-accent), 0.25);
    margin-left: 0.65rem;
}
.nav-items--compact :deep(.v-list-group__items) {
    margin-left: 0;
    border-left: 0;
}
.nav-items :deep(.v-list-group__items .v-list-item) {
    padding-inline-start: 12px;
}
.nav-items :deep(.v-list-item__prepend > .v-icon) {
    opacity: 1;
    font-size: 1.25rem;
}
.navigation-account {
    margin-top: auto;
    padding: 0.75rem 0.35rem;
    border-top: 1px solid rgba(var(--v-theme-menu-text), 0.15);
}
.navigation-account form {
    display: flex;
    justify-content: center;
}
.account-name {
    display: block;
    padding: 0.25rem 0.75rem;
    color: rgba(var(--v-theme-menu-text), 0.8);
    font-size: 0.75rem;
}
</style>
