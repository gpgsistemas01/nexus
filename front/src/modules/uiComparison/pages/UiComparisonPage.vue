<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { LOGIN_LIBRARIES } from '../loginPreview.js';
import type { LoginLibrary } from '../loginPreview.js';

const route = useRoute();
const router = useRouter();
const selected = computed(() => LOGIN_LIBRARIES.find(item => item.id === route.query.ui) ?? LOGIN_LIBRARIES[0]);
const previewUrl = computed(() => `${import.meta.env.BASE_URL}comparar/login/${selected.value.id}`);
const selectLibrary = (id: LoginLibrary) => router.replace({ name: 'comparison', query: { ui: id } });
</script>

<template>
  <div class="comparison-shell">
    <header class="comparison-header">
      <a class="nexus-wordmark" href="/inicio" aria-label="Nexus, inicio"><span aria-hidden="true">N</span>NEXUS</a>
      <span class="header-tag">Laboratorio de interfaz <span class="status-dot" /></span>
    </header>
    <main class="comparison-content">
      <section class="comparison-intro">
        <p class="eyebrow">DISEÑO DE LA NUEVA PLATAFORMA</p>
        <h1>Un mismo acceso.<br><span>Tres formas de verlo.</span></h1>
        <p class="intro-copy">Compara las bibliotecas sobre el mismo inicio de sesión. Cambia de opción y prueba sus campos, estados y botones.</p>
      </section>
      <nav class="library-selector" aria-label="Biblioteca de componentes">
        <button v-for="(library, index) in LOGIN_LIBRARIES" :key="library.id" type="button"
          :class="['library-button', { selected: selected.id === library.id }]"
          :aria-pressed="selected.id === library.id" @click="selectLibrary(library.id)">
          <span class="library-number">0{{ index + 1 }}</span>
          <span class="library-name">{{ library.name }}</span>
          <span class="library-indicator" aria-hidden="true">
            <svg v-if="selected.id === library.id" width="14" height="14" viewBox="0 0 16 16"><circle cx="8" cy="8" r="3" fill="currentColor" /></svg>
            <svg v-else width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M4 12 12 4M4 4h8v8" /></svg>
          </span>
        </button>
      </nav>
      <section class="comparison-grid" aria-label="Vista previa del inicio de sesión">
        <div class="preview-frame">
          <div class="preview-toolbar"><span><i :style="{ background: selected.color }" />{{ selected.name }}</span><span>INICIO DE SESIÓN</span></div>
          <iframe :key="selected.id" :src="previewUrl" :title="`Login con ${selected.name}`" class="library-preview" />
        </div>
        <aside class="comparison-notes">
          <p class="eyebrow">{{ selected.eyebrow }}</p>
          <h2>{{ selected.name }}</h2>
          <p>{{ selected.description }}</p>
          <p class="library-detail">{{ selected.detail }}</p>
          <div class="notes-divider" />
          <h3>Qué puedes probar</h3>
          <ol class="try-list">
            <li><span>01</span>Presiona Ingresar con los campos vacíos.</li>
            <li><span>02</span>Escribe y muestra u oculta la contraseña.</li>
            <li><span>03</span>Completa los datos y compara la respuesta.</li>
          </ol>
          <a :href="previewUrl" target="_blank" rel="noopener" class="open-preview">Abrir esta variante <svg aria-hidden="true" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M4 12 12 4M4 4h8v8" /></svg></a>
          <p class="comparison-disclaimer">Prototipo visual. Los datos no se envían ni se guardan. El acceso actual del sistema sigue en EJS.</p>
        </aside>
      </section>
      <footer class="comparison-footer"><span>Mismo formulario · componentes reales · comportamiento compartido</span><span>NEXUS / UI EXPLORER</span></footer>
    </main>
  </div>
</template>

<style scoped>
.comparison-shell { min-height: 100vh; background: #f7f8fc; color: #17243d; }
.comparison-header { height: 78px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e5e8f0; padding: 0 max(24px, calc((100vw - 1120px) / 2)); background: #fff; }
.nexus-wordmark { display: flex; align-items: center; gap: 11px; font-size: 16px; letter-spacing: .15em; font-weight: 750; color: #17243d; text-decoration: none; }
.nexus-wordmark > span { display: grid; place-items: center; width: 33px; height: 33px; border-radius: 10px; background: #17243d; color: #fff; font-size: 19px; letter-spacing: 0; }
.header-tag { display: flex; align-items: center; gap: 10px; color: #788299; font-size: 12px; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; background: #6eae8f; }
.comparison-content { max-width: 1120px; margin: auto; padding: 48px 24px 22px; }
.eyebrow { color: #687aa4; font-size: 10px; font-weight: 750; letter-spacing: .16em; line-height: 1.6; margin: 0 0 12px; }
h1 { font-size: clamp(31px, 4vw, 45px); letter-spacing: -.045em; line-height: 1.16; font-weight: 650; margin: 0 0 18px; }
h1 > span { color: #6c7890; font-weight: 450; }
.intro-copy { max-width: 580px; font-size: 14px; color: #707c91; line-height: 1.8; margin: 0; }
.library-selector { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 30px 0 24px; }
.library-button { display: flex; align-items: center; gap: 13px; min-height: 66px; padding: 15px 20px; border: 1px solid #e1e5ef; border-radius: 12px; background: #fff; color: #596780; cursor: pointer; text-align: left; transition: border-color .15s, box-shadow .15s; }
.library-button:hover { border-color: #879ccf; }
.library-button:focus-visible { outline: 3px solid #9aaee8; outline-offset: 3px; }
.library-button.selected { border-color: #4e6eba; background: #eff3ff; box-shadow: 0 2px 6px #35589908; color: #294a93; }
.library-number { font-size: 10px; color: #96a0b4; }
.library-name { font-size: 15px; font-weight: 650; }
.library-indicator { margin-left: auto; font-size: 14px; }
.comparison-grid { display: grid; grid-template-columns: minmax(0, 1.8fr) minmax(240px, 1fr); gap: 32px; align-items: start; }
.preview-frame { border: 1px solid #e1e5ef; border-radius: 16px; overflow: hidden; background: #fff; }
.preview-toolbar { height: 47px; padding: 0 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e7eaf1; font-size: 11px; color: #53617a; }
.preview-toolbar > span:first-child { display: flex; align-items: center; gap: 8px; font-weight: 600; }
.preview-toolbar > span:last-child { color: #929bae; font-size: 9px; letter-spacing: .12em; }
.preview-toolbar i { width: 6px; height: 6px; border-radius: 50%; }
.library-preview { display: block; width: 100%; height: 600px; border: 0; background: #f6f7fb; }
.comparison-notes { padding: 28px 4px 0; }
h2 { font-size: 25px; letter-spacing: -.04em; margin: 0 0 12px; font-weight: 650; }
.comparison-notes > p:not(.eyebrow) { font-size: 13px; color: #758197; line-height: 1.8; }
.library-detail { margin-top: 12px; }
.notes-divider { height: 1px; background: #e1e5ef; margin: 27px 0; }
h3 { font-size: 12px; font-weight: 700; margin: 0 0 20px; }
.try-list { list-style: none; padding: 0; display: grid; gap: 18px; margin: 0 0 26px; }
.try-list li { display: flex; align-items: baseline; gap: 13px; color: #6b7890; font-size: 12px; line-height: 1.7; }
.try-list span { color: #a0a9ba; font-size: 10px; }
.open-preview { color: #38578e; text-decoration: none; font-size: 12px; font-weight: 650; display: inline-flex; align-items: center; gap: 15px; padding-bottom: 5px; border-bottom: 1px solid #cad4e7; }
.comparison-notes > .comparison-disclaimer { font-size: 10px !important; line-height: 1.8; margin-top: 28px; color: #929bae !important; }
.comparison-footer { display: flex; justify-content: space-between; gap: 20px; margin-top: 26px; padding-top: 20px; border-top: 1px solid #e1e5ef; color: #99a2b3; font-size: 10px; line-height: 1.5; }
.comparison-footer > span:last-child { letter-spacing: .12em; }
@media (max-width: 760px) { .comparison-header { height: 65px; padding: 0 20px; } .comparison-content { padding: 32px 18px 20px; } .comparison-grid { grid-template-columns: 1fr; gap: 0; } .comparison-notes { padding: 26px 4px; } .library-button { padding: 13px 10px; gap: 7px; min-height: 60px; } .library-name { font-size: 12px; } .library-number { display: none; } .library-selector { gap: 8px; } .header-tag { font-size: 10px; } .comparison-footer { flex-direction: column; margin-top: 0; gap: 8px; } }
</style>
