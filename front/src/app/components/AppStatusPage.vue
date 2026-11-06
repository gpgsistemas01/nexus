<script setup lang="ts">
defineProps<{
    code: string;
    icon: string;
    title: string;
    description: string;
    notice?: string;
}>();
</script>

<template>
    <main
        class="status-page"
        aria-labelledby="status-title"
    >
        <section class="status-card">
            <header class="status-brand">
                <span
                    class="status-monogram"
                    aria-hidden="true"
                >
                    N
                </span>
                <span>Nexus</span>
            </header>
            <div class="status-content">
                <div
                    class="status-symbol"
                    aria-hidden="true"
                >
                    <svg viewBox="0 0 24 24">
                        <path :d="icon" />
                    </svg>
                    <span>{{ code }}</span>
                </div>
                <div class="status-details">
                    <h1 id="status-title">{{ title }}</h1>
                    <p class="status-description">{{ description }}</p>
                    <p
                        v-if="notice"
                        class="status-notice"
                        role="alert"
                    >
                        {{ notice }}
                    </p>
                    <div class="status-actions">
                        <slot name="actions" />
                    </div>
                </div>
            </div>
        </section>
    </main>
</template>

<style scoped>
.status-page {
    min-height: 100vh;
    min-height: 100dvh;
    display: grid;
    place-items: center;
    padding: clamp(1rem, 4vw, 3rem);
    background:
        radial-gradient(ellipse at top left, #bddbc9, transparent 65%),
        radial-gradient(ellipse at bottom right, #faeac6, transparent 55%), #e9f0ec;
    color: #20382a;
}

.status-card {
    width: min(100%, 54rem);
    border: 1px solid #cadbcf;
    border-top: 5px solid #11743e;
    border-radius: 1.5rem;
    padding: clamp(1.5rem, 4vw, 3rem);
    background: #fbfdfb;
    box-shadow: 0 1.25rem 4rem #173c2821;
}

.status-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.125rem;
    font-weight: 800;
}

.status-monogram {
    display: grid;
    place-items: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.75rem;
    background: #11743e;
    color: #fff;
}

.status-content {
    display: grid;
    grid-template-columns: 10rem minmax(0, 1fr);
    align-items: center;
    gap: clamp(1.5rem, 4vw, 3rem);
    margin-top: 2.5rem;
}

.status-symbol {
    display: grid;
    place-items: center;
    gap: 0.75rem;
    padding: 1.5rem 0.5rem;
    border-radius: 1.25rem;
    background: #e7f1eb;
    color: #12683b;
    font-size: 1.25rem;
    font-weight: 800;
}

.status-symbol svg {
    width: 4rem;
    height: 4rem;
    fill: currentColor;
}

h1 {
    margin: 0;
    font-size: clamp(1.5rem, 3vw, 2rem);
    line-height: 1.25;
    text-wrap: balance;
}

.status-description {
    margin: 1rem 0 0;
    color: #435b4b;
    line-height: 1.65;
}

.status-notice {
    margin: 1.25rem 0 0;
    padding: 0.875rem 1rem;
    border-left: 3px solid #a5660e;
    border-radius: 0.5rem;
    background: #fff4df;
    color: #624211;
    line-height: 1.5;
}

.status-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
    margin-top: 1.75rem;
}

:slotted(.status-action) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 2.875rem;
    padding: 0.75rem 1rem;
    border: 1px solid #c1d5c7;
    border-radius: 0.75rem;
    background: #fbfdfb;
    color: #155f36;
    font: inherit;
    font-size: 0.875rem;
    font-weight: 700;
    line-height: 1.4;
    text-align: center;
    text-decoration: none;
    cursor: pointer;
}

:slotted(.status-action--primary) {
    border-color: #11743e;
    background: #11743e;
    color: #fff;
}

:slotted(.status-action:focus-visible) {
    outline: 3px solid #24693e;
    outline-offset: 4px;
}

:slotted(.status-action:disabled) {
    opacity: 0.65;
    cursor: wait;
}

@media (max-width: 40rem) {
    .status-content {
        grid-template-columns: minmax(0, 1fr);
        gap: 1.5rem;
        margin-top: 1.75rem;
    }

    .status-symbol {
        display: flex;
        gap: 0.75rem;
        justify-content: flex-start;
        padding: 0.75rem 1rem;
    }

    .status-symbol svg {
        width: 2rem;
        height: 2rem;
    }

    .status-actions {
        align-items: stretch;
        flex-direction: column;
    }
}
</style>
