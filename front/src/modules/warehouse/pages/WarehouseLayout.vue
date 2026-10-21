<script setup lang="ts">
import { PERMISSIONS } from '@nexus/permissions';
import { computed, ref } from 'vue';
import { RouterView } from 'vue-router';
import { VApp } from 'vuetify/components/VApp';
import { VBtn } from 'vuetify/components/VBtn';
import WarehouseNavigation from '../components/WarehouseNavigation.vue';
import { useAuthSession } from '../../auth/session.js';

const session = useAuthSession();
const isNavigationOpen = ref(false);
const links = computed(() =>
    [
        {
            label: 'Materiales',
            to: '/almacen/materiales',
            permission: PERMISSIONS.MATERIALS_READ,
            isVue: true,
        },
        {
            label: 'Consumibles',
            to: '/almacen/consumibles',
            permission: PERMISSIONS.MATERIALS_READ,
            isVue: true,
        },
        {
            label: 'Mermas',
            to: '/almacen/mermas',
            permission: PERMISSIONS.WASTES_PAGE_VIEW,
            isVue: true,
        },
        {
            label: 'Compras · Materiales',
            to: '/compras/materiales',
            permission: PERMISSIONS.GOODS_RECEIPTS_PAGE_VIEW,
            isVue: false,
        },
        {
            label: 'Compras · Consumibles',
            to: '/compras/consumibles',
            permission: PERMISSIONS.GOODS_RECEIPTS_PAGE_VIEW,
            isVue: false,
        },
        {
            label: 'Salidas · Materiales',
            to: '/salidas/materiales',
            permission: PERMISSIONS.GOODS_ISSUES_PAGE_VIEW,
            isVue: false,
        },
        {
            label: 'Salidas · Consumibles',
            to: '/salidas/consumibles',
            permission: PERMISSIONS.GOODS_ISSUES_PAGE_VIEW,
            isVue: false,
        },
        {
            label: 'Salidas · Mermas',
            to: '/salidas/mermas',
            permission: PERMISSIONS.WASTE_ISSUES_PAGE_VIEW,
            isVue: false,
        },
        {
            label: 'Movimientos',
            to: '/movimientos/materiales',
            permission: PERMISSIONS.MOVEMENTS_READ,
            isVue: false,
        },
        {
            label: 'Catálogos',
            to: '/catalogos/presentations',
            permission: PERMISSIONS.CATALOGS_MANAGE,
            isVue: false,
        },
    ].filter((link) => session.user.value?.permissions.includes(link.permission)),
);
</script>

<template>
    <VApp theme="warehouse">
        <div class="warehouse-shell">
            <header class="mobile-header">
                <strong>Nexus · Almacén</strong
                ><VBtn
                    variant="text"
                    :aria-expanded="isNavigationOpen"
                    @click="isNavigationOpen = !isNavigationOpen"
                    >Menú</VBtn
                >
            </header>
            <aside :class="{ 'is-open': isNavigationOpen }">
                <WarehouseNavigation
                    :user-name="session.user.value?.name ?? ''"
                    :links="links"
                    @navigate="isNavigationOpen = false"
                />
            </aside>
            <main class="warehouse-main">
                <RouterView v-slot="{ Component, route }"
                    ><component
                        :is="Component"
                        :key="route.name"
                /></RouterView>
            </main>
        </div>
    </VApp>
</template>

<style scoped>
.warehouse-shell {
    display: grid;
    grid-template-columns: 240px minmax(0, 1fr);
    min-height: 100vh;
    background: #f3faf5;
}
aside {
    position: sticky;
    top: 0;
    height: 100dvh;
    overflow-y: auto;
}
.warehouse-main {
    min-width: 0;
    padding: clamp(1rem, 3vw, 2.5rem);
}
.mobile-header {
    display: none;
}
@media (max-width: 900px) {
    .warehouse-shell {
        display: block;
    }
    .mobile-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.6rem 1rem;
        background: white;
        border-bottom: 1px solid #d7e6dc;
    }
    aside {
        display: none;
        position: static;
        height: auto;
    }
    aside.is-open {
        display: block;
    }
}
</style>
