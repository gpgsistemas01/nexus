<script setup lang="ts">
import { VChip } from 'vuetify/components/VChip';

defineProps<{ isActive: boolean }>();
</script>

<template>
    <VChip
        :color="isActive ? 'primary' : 'filter-clear'"
        size="small"
        variant="tonal"
    >
        {{ isActive ? 'Sí' : 'No' }}
    </VChip>
</template>
