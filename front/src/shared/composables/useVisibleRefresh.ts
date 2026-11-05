import { onBeforeUnmount, onMounted } from 'vue';

export const useVisibleRefresh = (options: {
    refresh: () => unknown;
    canRefresh: () => boolean;
    lastAttemptAt: () => number;
    intervalMs?: number;
}) => {
    const intervalMs = options.intervalMs ?? 30_000;
    let interval: ReturnType<typeof setInterval> | undefined;

    const refreshVisible = () => {
        if (
            document.visibilityState === 'visible' &&
            options.canRefresh() &&
            Date.now() - options.lastAttemptAt() >= intervalMs
        )
            void options.refresh();
    };

    onMounted(() => {
        window.addEventListener('focus', refreshVisible);
        document.addEventListener('visibilitychange', refreshVisible);
        interval = setInterval(refreshVisible, intervalMs);
    });
    onBeforeUnmount(() => {
        clearInterval(interval);
        window.removeEventListener('focus', refreshVisible);
        document.removeEventListener('visibilitychange', refreshVisible);
    });
};
