<template>
  <q-page class="trame-preview-page">
    <div v-if="loading" class="preview-loading"><q-spinner-grid color="primary" size="44px" /><span>Préparation de l’aperçu…</span></div>
    <div v-else-if="error" class="preview-error">
      <div class="trame-preview-eyebrow">APERÇU INDISPONIBLE</div><h1>Quelque chose bloque le rendu.</h1><p>{{ error }}</p>
      <q-btn outline no-caps icon="arrow_back" label="Retour à l’atelier" @click="router.back()" />
    </div>
    <template v-else>
      <header class="preview-bar">
        <div class="preview-title">
          <q-btn flat round icon="arrow_back" @click="router.back()" />
          <div><span class="trame-preview-eyebrow">MODE PRÉSENTATION</span><h1>{{ site.name }}</h1></div>
        </div>
        <q-btn-toggle
          v-model="devicePreview" no-caps unelevated toggle-color="dark" color="white" text-color="dark"
          :options="[
            { label: 'Mobile', value: 'mobile', icon: 'smartphone' },
            { label: 'Desktop', value: 'desktop', icon: 'desktop_windows' }
          ]"
          class="preview-device-toggle"
        />
        <div class="preview-actions">
          <q-btn flat no-caps icon="edit" label="Éditer" @click="editSite" />
          <q-btn color="primary" no-caps icon="archive" label="Exporter ZIP" :loading="exporting" @click="downloadExport" />
        </div>
      </header>

      <main class="preview-canvas" :class="`canvas-${devicePreview}`">
        <div class="preview-device" :class="`preview-${devicePreview}`">
          <div v-if="devicePreview === 'mobile'" class="preview-notch"></div>
          <iframe :src="`/published/${site.slug}`" title="Aperçu du site généré"></iframe>
        </div>
      </main>
    </template>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuth } from '../composables/useAuth.js'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const { apiFetch } = useAuth()
const site = ref({ id: null, name: '', slug: '' })
const loading = ref(true)
const error = ref(null)
const devicePreview = ref('mobile')
const exporting = ref(false)

async function fetchSite() {
  loading.value = true
  try {
    const response = await apiFetch(`/sites/${route.params.id}`)
    if (!response.ok) throw new Error(`Chargement impossible (HTTP ${response.status})`)
    site.value = await response.json()
    const generated = await apiFetch(`/sites/${site.value.id}/generate`, { method: 'POST' })
    if (!generated.ok) throw new Error(`Génération impossible (HTTP ${generated.status})`)
  } catch (err) { error.value = err.message }
  finally { loading.value = false }
}
function editSite() { router.push(`/editor/${site.value.id}`) }
async function downloadExport() {
  exporting.value = true
  try {
    const response = await apiFetch(`/sites/${site.value.id}/export`, { method: 'POST' })
    if (!response.ok) throw new Error(`Export impossible (HTTP ${response.status})`)
    const url = URL.createObjectURL(await response.blob())
    const link = document.createElement('a'); link.href = url; link.download = `${site.value.slug}.zip`; link.click()
    URL.revokeObjectURL(url)
  } catch (err) { $q.notify({ type: 'negative', message: err.message }) }
  finally { exporting.value = false }
}
onMounted(fetchSite)
</script>

<style scoped>
.trame-preview-page { min-height: calc(100vh - 68px) !important; background: #d8d3c7; }
.preview-bar { position: sticky; top: 0; z-index: 20; min-height: 86px; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 20px; padding: 12px clamp(16px, 3vw, 42px); background: var(--trame-paper); border-bottom: 1px solid var(--trame-ink); }
.preview-title { display: flex; align-items: center; gap: 11px; }.preview-title h1 { margin: 3px 0 0; font: 700 22px/1 Georgia, serif; }.trame-preview-eyebrow { color: var(--trame-red); font: 750 9px "IBM Plex Mono", monospace; letter-spacing: .14em; }
.preview-device-toggle { border: 1px solid var(--trame-ink); border-radius: 2px; }.preview-actions { justify-self: end; display: flex; gap: 8px; }
.preview-canvas { min-height: calc(100vh - 154px); padding: clamp(20px, 4vw, 54px); display: flex; justify-content: center; align-items: flex-start; overflow: auto; background-image: linear-gradient(rgba(23,23,20,.13) 1px, transparent 1px), linear-gradient(90deg, rgba(23,23,20,.13) 1px, transparent 1px); background-size: 30px 30px; }
.preview-device { position: relative; background: var(--trame-ink); border: 9px solid var(--trame-ink); box-shadow: 14px 14px 0 rgba(23,23,20,.28); overflow: hidden; transition: width .25s, border-radius .25s; }.preview-device iframe { display: block; width: 100%; height: 100%; border: 0; background: white; }
.preview-mobile { width: 375px; height: 812px; max-width: 100%; border-width: 11px; border-radius: 40px; }.preview-desktop { width: min(1440px, 100%); height: min(900px, calc(100vh - 205px)); min-height: 620px; border-radius: 4px; }
.preview-notch { position: absolute; z-index: 3; top: -1px; left: 50%; transform: translateX(-50%); width: 135px; height: 26px; background: var(--trame-ink); border-radius: 0 0 22px 22px; }
.preview-loading, .preview-error { min-height: calc(100vh - 68px); display: grid; place-items: center; align-content: center; gap: 15px; }.preview-error { max-width: 600px; margin: auto; text-align: center; }.preview-error h1 { font: 700 40px Georgia, serif; margin: 0; }.preview-error p { color: var(--trame-muted); }
@media(max-width: 800px) { .preview-bar { grid-template-columns: 1fr auto; }.preview-device-toggle { grid-row: 2; grid-column: 1 / -1; width: 100%; }.preview-actions { display: none; }.preview-canvas { padding: 16px 8px 35px; }.preview-desktop { min-width: 760px; }.canvas-desktop { justify-content: flex-start; } }
</style>
