<script setup lang="ts">
import WelcomePanel from '../components/WelcomePanel.vue';
import { useWelcomeCounter } from '../composables/useWelcomeCounter.js';

const { count, increment } = useWelcomeCounter();
</script>

<template>
  <WelcomePanel :count="count" @increment="increment" />
</template>
