<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { VApp } from 'vuetify/components/VApp';
import LoginForm from '../components/LoginForm.vue';
import { useLoginForm } from '../composables/useLoginForm.js';
import { protectedDestination } from '../../../app/router/protectedDestination.js';

const router = useRouter();
const route = useRoute();
const {
    name,
    password,
    errors,
    isSubmitting,
    isPasswordVisible,
    shouldRememberUser,
    message,
    updateField,
    blurField,
    submit,
} = useLoginForm({
    onSuccess: () => {
        const destination = protectedDestination(router, route.query.returnTo);
        void router.replace(destination).catch(() => {
            // Una carga diferida fallida recupera la ruta con el arranque y su pantalla de reintento.
            window.location.assign(destination);
        });
    },
});
const logoUrl = import.meta.env.VITE_LOGIN_LOGO_URL || '';
const hasLogoFailed = ref(false);

onMounted(() => {
    document.title = 'Nexus | Iniciar sesión';
});
</script>

<template>
    <VApp theme="nexus">
        <main
            class="login-shell"
            aria-labelledby="login-title"
        >
            <section class="login-card">
                <div
                    class="login-brand"
                    aria-hidden="true"
                >
                    <img
                        v-if="logoUrl && !hasLogoFailed"
                        :src="logoUrl"
                        alt=""
                        class="login-logo"
                        @error="hasLogoFailed = true"
                    />
                    <div
                        v-else
                        class="login-logo login-monogram"
                    >
                        N
                    </div>
                </div>
                <div class="login-content">
                    <p class="login-eyebrow">Nexus</p>
                    <h1 id="login-title">Iniciar sesión</h1>
                    <p class="login-description">Accede con tu usuario y contraseña.</p>
                    <LoginForm
                        :name="name"
                        :password="password"
                        :errors="errors"
                        :is-submitting="isSubmitting"
                        :is-password-visible="isPasswordVisible"
                        :should-remember-user="shouldRememberUser"
                        :message="message"
                        @update:name="updateField('name', $event)"
                        @update:password="updateField('password', $event)"
                        @update:should-remember-user="shouldRememberUser = $event"
                        @toggle-password="isPasswordVisible = !isPasswordVisible"
                        @blur="blurField"
                        @submit="submit"
                    />
                </div>
            </section>
        </main>
    </VApp>
</template>

<style scoped>
.login-shell {
    --login-border: #ffffff24;
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(1.25rem, 4vw, 3rem);
    position: relative;
    overflow: hidden;
    background:
        radial-gradient(circle at 12% 18%, #14a44d52, transparent 19rem),
        radial-gradient(circle at 88% 80%, #fca31133, transparent 21rem),
        linear-gradient(135deg, #07110c, #0f2519 48%, #030705);
}

.login-shell::before,
.login-shell::after {
    content: '';
    position: absolute;
    border: 1px solid #ffffff14;
    border-radius: 50%;
    pointer-events: none;
}

.login-shell::before {
    width: 18rem;
    height: 18rem;
    top: -8rem;
    left: -7rem;
    box-shadow: inset 0 0 4rem #14a44d29;
}

.login-shell::after {
    width: 24rem;
    height: 24rem;
    bottom: -10rem;
    right: -8rem;
    box-shadow: inset 0 0 5rem #fca3111a;
}

.login-card {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(0, 0.85fr) minmax(22rem, 1fr);
    width: min(100%, 58rem);
    border: 1px solid var(--login-border);
    border-radius: 2rem;
    overflow: hidden;
    background: linear-gradient(145deg, #0b1612f0, #07100cf5);
    backdrop-filter: blur(18px);
    box-shadow: 0 2rem 5rem #0000006b;
}

.login-brand {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    border-right: 1px solid var(--login-border);
    padding: clamp(2rem, 6vw, 4rem);
    background:
        radial-gradient(circle at 30% 20%, #ffffff29, transparent 11rem),
        linear-gradient(160deg, #14a44d3d, #14a44d14);
}

.login-brand::before {
    content: '';
    position: absolute;
    width: 15rem;
    height: 15rem;
    border-radius: 50%;
    background: #14a44d2e;
    top: -5rem;
    right: -5rem;
}

.login-logo {
    position: relative;
    width: clamp(7rem, 14vw, 10rem);
    height: clamp(7rem, 14vw, 10rem);
    object-fit: contain;
    padding: 1.15rem;
    border: 1px solid #ffffffb3;
    border-radius: 1.75rem;
    background: #fffffff5;
    box-shadow: 0 1rem 2.5rem #00000047;
}

.login-monogram {
    display: grid;
    place-items: center;
    color: #0f7f3a;
    font-size: clamp(4rem, 8vw, 6rem);
    font-weight: 800;
    line-height: 1;
}

.login-content {
    min-width: 0;
    padding: clamp(2rem, 5vw, 3.5rem);
    color: #f6fff9;
}

.login-eyebrow {
    color: #8fe0ac;
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin: 0 0 0.45rem;
}

h1 {
    font-size: clamp(2rem, 5vw, 2.75rem);
    font-weight: 800;
    line-height: 1.05;
    margin: 0 0 0.55rem;
}

.login-description {
    color: #f6fff9b8;
    margin: 0 0 1.85rem;
}

@media (max-width: 768px) {
    .login-shell {
        padding: 1rem;
    }

    .login-card {
        grid-template-columns: 1fr;
        border-radius: 1.5rem;
    }

    .login-brand {
        padding: 1.5rem;
        border-right: 0;
        border-bottom: 1px solid var(--login-border);
    }

    .login-logo {
        height: 6.5rem;
        width: 6.5rem;
        font-size: 4rem;
    }

    .login-content {
        padding: 1.5rem;
    }
}
</style>
