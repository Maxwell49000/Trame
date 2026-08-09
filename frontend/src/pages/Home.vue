<template>
  <q-page class="trame-dashboard">
    <header class="dashboard-hero">
      <div>
        <div class="trame-eyebrow">VOS COMPOSITIONS / {{ String(sites.length).padStart(2, '0') }}</div>
        <h1>L’atelier</h1>
        <p>Imaginez, composez et livrez des pages statiques qui vous ressemblent.</p>
      </div>
      <q-btn color="primary" no-caps icon="add" label="Nouveau projet" class="trame-primary-btn dashboard-create" @click="templateDialog = true" />
    </header>

    <section v-if="loading" class="dashboard-loading">
      <q-spinner-grid color="primary" size="42px" /><span>Ouverture de l’atelier…</span>
    </section>

    <section v-else-if="sites.length === 0" class="dashboard-empty">
      <div class="empty-number">00</div>
      <div>
        <h2>La grille est encore vierge.</h2>
        <p>Choisissez une trame de départ et créez votre première page.</p>
        <q-btn outline no-caps color="dark" icon-right="arrow_forward" label="Choisir une trame" @click="templateDialog = true" />
      </div>
    </section>

    <section v-else class="project-grid">
      <article v-for="(site, index) in sites" :key="site.id" class="project-card">
        <button class="project-visual" type="button" @click="editSite(site)" :aria-label="`Éditer ${site.name}`">
          <div class="project-browser">
            <div class="project-browser-bar"><span></span><span></span><span></span><small>/{{ site.slug }}</small></div>
            <div class="project-mock" :style="previewStyle(site)">
              <div class="mock-header">{{ site.config?.header?.logoText || site.name }}</div>
              <div class="mock-hero" :style="{ background: site.config?.theme?.primaryColor || '#4054d8' }">
                <strong>{{ firstTitle(site) }}</strong><i></i>
              </div>
              <div class="mock-lines"><i></i><i></i><i></i></div>
            </div>
          </div>
          <span class="project-index">{{ String(index + 1).padStart(2, '0') }}</span>
        </button>
        <div class="project-info">
          <div class="project-title-row">
            <div>
              <h2>{{ site.name }}</h2>
              <p>/{{ site.slug }}</p>
            </div>
            <span class="project-status"><i></i> Projet</span>
          </div>
          <div class="project-meta">
            <span>Modifié {{ relativeDate(site.updated_at) }}</span>
            <span v-if="isAdmin">{{ site.owner?.name || 'Non attribué' }}</span>
          </div>
          <div class="project-actions">
            <q-btn flat dense no-caps icon="edit" label="Éditer" @click="editSite(site)" />
            <q-btn flat dense no-caps icon="visibility" label="Aperçu" @click="previewSite(site)" />
            <q-space />
            <q-btn flat round dense icon="archive" :loading="exportingId === site.id" @click="exportSite(site)"><q-tooltip>Exporter en ZIP</q-tooltip></q-btn>
            <q-btn flat round dense icon="more_horiz">
              <q-menu auto-close class="trame-menu">
                <q-list style="min-width: 190px">
                  <q-item clickable @click="generateSite(site)"><q-item-section avatar><q-icon name="publish" /></q-item-section><q-item-section>Générer</q-item-section></q-item>
                  <q-item clickable @click="duplicateSite(site)"><q-item-section avatar><q-icon name="content_copy" /></q-item-section><q-item-section>Dupliquer</q-item-section></q-item>
                  <q-separator />
                  <q-item clickable class="text-negative" @click="removeSite(site)"><q-item-section avatar><q-icon name="delete" /></q-item-section><q-item-section>Supprimer</q-item-section></q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
        </div>
      </article>
    </section>

    <q-dialog v-model="templateDialog">
      <q-card class="template-dialog">
        <q-card-section class="template-heading">
          <div class="trame-eyebrow">NOUVELLE COMPOSITION</div>
          <h2>Choisissez votre point de départ.</h2>
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>
        <q-card-section class="template-grid">
          <button v-for="template in templates" :key="template.value" class="template-card" @click="openEditor(template.value)">
            <div class="template-art" :class="`template-${template.value}`"><i></i><i></i><i></i></div>
            <span>{{ template.number }}</span>
            <h3>{{ template.label }}</h3>
            <p>{{ template.description }}</p>
          </button>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'

const $q = useQuasar()
const router = useRouter()
const { apiFetch, isAdmin } = useAuth()
const sites = ref([])
const loading = ref(false)
const exportingId = ref(null)
const templateDialog = ref(false)
const templates = [
  { number: '01', value: 'blank', label: 'Page vierge', description: 'Une grille libre pour partir de zéro.' },
  { number: '02', value: 'portfolio', label: 'Portfolio', description: 'Une entrée forte, des projets et un contact.' },
  { number: '03', value: 'studio', label: 'Studio', description: 'Une page de service claire et éditoriale.' }
]

function previewStyle(site) {
  return { background: site.config?.backgroundColor || '#fff', color: site.config?.theme?.secondaryColor || '#171714' }
}
function firstTitle(site) {
  const first = site.config?.sections?.find(section => section.heroTitle || section.title)
  return first?.heroTitle || first?.title || site.name
}
function relativeDate(value) {
  const days = Math.floor((Date.now() - new Date(value).getTime()) / 86400000)
  if (days <= 0) return 'aujourd’hui'
  if (days === 1) return 'hier'
  if (days < 30) return `il y a ${days} jours`
  return new Date(value).toLocaleDateString('fr-FR')
}
async function responseError(response) {
  const data = await response.json().catch(() => null)
  return data?.error || `Erreur HTTP ${response.status}`
}
async function fetchSites() {
  loading.value = true
  try {
    const response = await apiFetch('/sites')
    if (!response.ok) throw new Error(await responseError(response))
    sites.value = await response.json()
  } catch (error) {
    $q.notify({ type: 'negative', message: `Impossible de récupérer les projets : ${error.message}` })
  } finally { loading.value = false }
}
function openEditor(template = 'blank') { router.push({ path: '/editor', query: { template } }) }
function editSite(site) { router.push(`/editor/${site.id}`) }
function previewSite(site) { router.push(`/preview/${site.id}`) }

async function generateSite(site) {
  try {
    const response = await apiFetch(`/sites/${site.id}/generate`, { method: 'POST' })
    if (!response.ok) throw new Error(await responseError(response))
    $q.notify({ type: 'positive', message: 'Version statique générée' })
  } catch (error) { $q.notify({ type: 'negative', message: error.message }) }
}

async function exportSite(site) {
  exportingId.value = site.id
  try {
    const response = await apiFetch(`/sites/${site.id}/export`, { method: 'POST' })
    if (!response.ok) throw new Error(await responseError(response))
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${site.slug}.zip`
    link.click()
    URL.revokeObjectURL(url)
    $q.notify({ type: 'positive', message: 'Export ZIP prêt' })
  } catch (error) { $q.notify({ type: 'negative', message: error.message }) }
  finally { exportingId.value = null }
}

async function duplicateSite(site) {
  try {
    const suffix = Date.now().toString().slice(-5)
    const response = await apiFetch('/sites', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: `${site.name} — copie`, slug: `${site.slug}-copie-${suffix}`, config: site.config })
    })
    if (!response.ok) throw new Error(await responseError(response))
    await fetchSites()
    $q.notify({ type: 'positive', message: 'Projet dupliqué' })
  } catch (error) { $q.notify({ type: 'negative', message: error.message }) }
}

async function removeSite(site) {
  if (!confirm(`Supprimer le projet « ${site.name} » ?`)) return
  try {
    const response = await apiFetch(`/sites/${site.id}`, { method: 'DELETE' })
    if (!response.ok) throw new Error(await responseError(response))
    await fetchSites()
  } catch (error) { $q.notify({ type: 'negative', message: error.message }) }
}

onMounted(fetchSites)
</script>

<style scoped>
.trame-dashboard { padding: clamp(30px, 5vw, 72px); max-width: 1500px; margin: 0 auto; }
.dashboard-hero { display: flex; align-items: flex-end; justify-content: space-between; gap: 30px; margin-bottom: 50px; padding-bottom: 28px; border-bottom: 1px solid var(--trame-ink); }
.trame-eyebrow { color: var(--trame-red); font: 750 11px/1.3 "IBM Plex Mono", monospace; letter-spacing: .15em; }
.dashboard-hero h1 { font: 750 clamp(50px, 8vw, 96px)/.85 Georgia, serif; letter-spacing: -.06em; margin: 17px 0 20px; }
.dashboard-hero p { margin: 0; color: var(--trame-muted); font-size: 17px; }
.dashboard-create { min-width: 190px; }
.project-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: clamp(28px, 4vw, 58px) clamp(24px, 4vw, 48px); }
.project-card { min-width: 0; }
.project-visual { position: relative; width: 100%; display: block; padding: 22px; background: #ded9cd; border: 1px solid var(--trame-ink); cursor: pointer; text-align: initial; overflow: hidden; }
.project-visual::before { content: ""; position: absolute; inset: 0; opacity: .26; background-image: linear-gradient(var(--trame-ink) 1px, transparent 1px), linear-gradient(90deg, var(--trame-ink) 1px, transparent 1px); background-size: 30px 30px; }
.project-browser { position: relative; width: 80%; margin: 7% auto; background: white; border: 1px solid var(--trame-ink); box-shadow: 9px 9px 0 var(--trame-ink); transition: transform .25s ease; }
.project-visual:hover .project-browser { transform: translateY(-5px) rotate(-.5deg); }
.project-browser-bar { height: 24px; border-bottom: 1px solid #bbb; display: flex; align-items: center; gap: 4px; padding: 0 8px; }
.project-browser-bar span { width: 5px; height: 5px; background: #888; border-radius: 50%; }
.project-browser-bar small { margin-left: auto; color: #888; font-size: 8px; }
.project-mock { height: 210px; padding: 12px; }
.mock-header { height: 28px; font-size: 9px; font-weight: 800; letter-spacing: .08em; }
.mock-hero { height: 95px; padding: 18px; color: white; display: flex; flex-direction: column; justify-content: center; }
.mock-hero strong { font: 700 17px/1 Georgia, serif; max-width: 70%; }
.mock-hero i { width: 32px; height: 5px; margin-top: 10px; background: white; }
.mock-lines { padding: 17px 10px; display: grid; gap: 7px; }
.mock-lines i { display: block; height: 4px; background: currentColor; opacity: .2; }
.mock-lines i:nth-child(2) { width: 80%; }.mock-lines i:nth-child(3) { width: 55%; }
.project-index { position: absolute; right: 10px; bottom: 5px; font: 800 35px/1 Georgia, serif; }
.project-info { border-bottom: 1px solid var(--trame-line); padding: 19px 0 8px; }
.project-title-row { display: flex; justify-content: space-between; gap: 20px; }
.project-title-row h2 { margin: 0; font: 700 25px/1.1 Georgia, serif; }
.project-title-row p { margin: 5px 0 0; color: var(--trame-muted); font: 11px "IBM Plex Mono", monospace; }
.project-status { font: 700 10px "IBM Plex Mono", monospace; text-transform: uppercase; letter-spacing: .08em; }
.project-status i { display: inline-block; width: 7px; height: 7px; background: var(--trame-green); border-radius: 50%; }
.project-meta { display: flex; justify-content: space-between; margin-top: 17px; color: var(--trame-muted); font-size: 11px; }
.project-actions { display: flex; align-items: center; margin-top: 9px; }
.dashboard-loading { min-height: 350px; display: grid; place-items: center; align-content: center; gap: 15px; color: var(--trame-muted); }
.dashboard-empty { min-height: 390px; border: 1px solid var(--trame-ink); display: grid; grid-template-columns: .6fr 1fr; align-items: center; padding: 50px; background: var(--trame-paper-light); }
.empty-number { color: var(--trame-red); font: 700 clamp(100px, 18vw, 240px)/1 Georgia, serif; }
.dashboard-empty h2 { font: 700 36px/1 Georgia, serif; margin: 0 0 14px; }.dashboard-empty p { color: var(--trame-muted); }
.template-dialog { width: 94vw; max-width: 1000px !important; border: 1px solid var(--trame-ink); background: var(--trame-paper); }
.template-heading { display: grid; grid-template-columns: 1fr auto; padding: 30px; border-bottom: 1px solid var(--trame-ink); }.template-heading .trame-eyebrow { grid-column: 1; }.template-heading h2 { grid-column: 1; margin: 9px 0 0; font: 700 34px/1 Georgia, serif; }.template-heading .q-btn { grid-column: 2; grid-row: 1 / 3; }
.template-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; padding: 0; }.template-card { padding: 25px; border: 0; border-right: 1px solid var(--trame-ink); background: transparent; text-align: left; cursor: pointer; }.template-card:last-child { border-right: 0; }.template-card:hover { background: var(--trame-paper-light); }
.template-art { height: 170px; border: 1px solid var(--trame-ink); margin-bottom: 20px; padding: 18px; display: grid; gap: 8px; background: white; }.template-art i { display: block; background: var(--trame-ink); }.template-art i:nth-child(2) { background: var(--trame-red); }.template-art i:nth-child(3) { background: var(--trame-blue); }.template-portfolio { grid-template-columns: 1.4fr .6fr; }.template-portfolio i:first-child { grid-row: 1 / 3; }.template-studio { grid-template-rows: 1.2fr .5fr .5fr; }.template-blank i { opacity: .12; }
.template-card > span { color: var(--trame-red); font: 700 10px "IBM Plex Mono", monospace; }.template-card h3 { margin: 7px 0; font: 700 23px Georgia, serif; }.template-card p { color: var(--trame-muted); margin: 0; font-size: 13px; }
@media(max-width: 850px) { .project-grid { grid-template-columns: 1fr; }.template-grid { grid-template-columns: 1fr; }.template-card { border-right: 0; border-bottom: 1px solid var(--trame-ink); }.dashboard-empty { grid-template-columns: 1fr; }.empty-number { font-size: 100px; } }
@media(max-width: 600px) { .trame-dashboard { padding: 28px 18px; }.dashboard-hero { align-items: flex-start; flex-direction: column; }.dashboard-create { width: 100%; }.project-visual { padding: 12px; }.project-browser { width: 90%; }.project-mock { height: 170px; } }
</style>
