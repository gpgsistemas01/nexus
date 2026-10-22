<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import { useDisplay } from 'vuetify';
import { VApp } from 'vuetify/components/VApp';
import { VAppBar, VAppBarTitle } from 'vuetify/components/VAppBar';
import { VNavigationDrawer } from 'vuetify/components/VNavigationDrawer';
import { VMain } from 'vuetify/components/VMain';
import { VBtn } from 'vuetify/components/VBtn';
import { VDefaultsProvider } from 'vuetify/components/VDefaultsProvider';
import { controlDefaults } from '../../shared/ui/controlDefaults.js';
import AppNavigation from '../components/AppNavigation.vue';
import { APP_NAVIGATION_GROUPS } from '../navigation.js';
import { useAuthSession } from '../../modules/auth/session.js';

const session = useAuthSession();
const { mobile } = useDisplay({ mobileBreakpoint: 900 });
const isNavigationOpen = ref(false);
const currentRoute = useRoute();
const activeGroup = computed(() => String(currentRoute.meta.navigationGroup ?? 'warehouse'));
const groups = computed(() =>
    APP_NAVIGATION_GROUPS.map((group) => ({
        ...group,
        links: group.links.filter((link) =>
            session.user.value?.permissions.includes(link.permission),
        ),
    })).filter((group) => group.links.length),
);
</script>

<template>
    <VDefaultsProvider :defaults="controlDefaults">
        <VApp
            theme="warehouse"
            class="app-shell"
        >
            <VNavigationDrawer
                v-model:expanded="isNavigationOpen"
                :model-value="mobile ? isNavigationOpen : true"
                :temporary="mobile"
                :permanent="!mobile"
                :rail="!mobile"
                :modal="!mobile"
                :width="208"
                :rail-width="64"
                @update:model-value="isNavigationOpen = $event"
                @keydown.esc="isNavigationOpen = false"
            >
                <AppNavigation
                    :user-name="session.user.value?.name ?? ''"
                    :groups="groups"
                    :active-group="activeGroup"
                    :is-compact="!mobile && !isNavigationOpen"
                    :is-temporary="mobile"
                    @expand="isNavigationOpen = true"
                    @navigate="isNavigationOpen = false"
                />
            </VNavigationDrawer>
            <VAppBar
                flat
                height="48"
                class="app-bar"
            >
                <VBtn
                    icon="$menu"
                    size="small"
                    :aria-label="
                        mobile ? 'Menú' : isNavigationOpen ? 'Contraer menú' : 'Expandir menú'
                    "
                    :aria-expanded="isNavigationOpen"
                    @click="isNavigationOpen = !isNavigationOpen"
                />
                <VAppBarTitle>
                    Nexus
                    <span class="bar-section"
                        >/ {{ activeGroup === 'catalogs' ? 'Catálogos' : 'Almacén' }}</span
                    >
                </VAppBarTitle>
            </VAppBar>
            <VMain>
                <div class="app-content">
                    <RouterView v-slot="{ Component, route }">
                        <component
                            :is="Component"
                            :key="route.name"
                        />
                    </RouterView>
                </div>
            </VMain>
        </VApp>
    </VDefaultsProvider>
</template>

<style scoped>
.app-shell {
    background: rgb(var(--v-theme-background));
}
.app-bar {
    border-bottom: 1px solid #dce7df;
}
.app-bar :deep(.v-toolbar-title) {
    font-size: 0.9rem;
    font-weight: 700;
}
.bar-section {
    color: #698171;
    font-weight: 400;
    font-size: 0.8rem;
    margin-left: 0.35rem;
}
.app-content {
    min-width: 0;
    padding: clamp(0.8rem, 2vw, 1.5rem);
}
</style>
