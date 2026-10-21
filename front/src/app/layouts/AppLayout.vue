<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterView } from 'vue-router';
import { useDisplay } from 'vuetify';
import { VApp } from 'vuetify/components/VApp';
import { VAppBar, VAppBarTitle } from 'vuetify/components/VAppBar';
import { VNavigationDrawer } from 'vuetify/components/VNavigationDrawer';
import { VMain } from 'vuetify/components/VMain';
import { VBtn } from 'vuetify/components/VBtn';
import AppNavigation from '../components/AppNavigation.vue';
import { APP_NAVIGATION } from '../navigation.js';
import { useAuthSession } from '../../modules/auth/session.js';

const session = useAuthSession();
const { mobile } = useDisplay({ mobileBreakpoint: 900 });
const isNavigationOpen = ref(false);
const isCompact = ref(false);
const links = computed(() =>
    APP_NAVIGATION.filter((link) => session.user.value?.permissions.includes(link.permission)),
);
const toggleNavigation = () => {
    if (mobile.value) isNavigationOpen.value = !isNavigationOpen.value;
    else isCompact.value = !isCompact.value;
};
</script>

<template>
    <VApp
        theme="warehouse"
        class="app-shell"
    >
        <VNavigationDrawer
            :model-value="mobile ? isNavigationOpen : true"
            :temporary="mobile"
            :permanent="!mobile"
            :rail="!mobile && isCompact"
            :width="208"
            :rail-width="64"
            @update:model-value="isNavigationOpen = !!$event"
        >
            <AppNavigation
                :user-name="session.user.value?.name ?? ''"
                :links="links"
                :is-compact="!mobile && isCompact"
                :is-temporary="mobile"
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
                :aria-label="mobile ? 'Menú' : isCompact ? 'Expandir menú' : 'Contraer menú'"
                :aria-expanded="mobile ? isNavigationOpen : !isCompact"
                @click="toggleNavigation"
            />
            <VAppBarTitle>
                Nexus
                <span class="bar-section">/ Almacén</span>
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
</template>

<style scoped>
.app-shell {
    background: #f3f7f4;
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
