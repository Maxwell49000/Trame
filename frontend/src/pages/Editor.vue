<template>
  <q-page class="trame-editor-page">
    <header class="editor-heading">
      <div>
        <div class="trame-editor-eyebrow">COMPOSITION / {{ site.id ? String(site.id).padStart(2, '0') : 'NOUVEAU' }}</div>
        <h1>{{ site.name || 'Projet sans titre' }}</h1>
        <div class="save-state" :class="{ dirty: hasUnsavedChanges }">
          <i></i>{{ hasUnsavedChanges ? 'Modifications non enregistrées' : 'À jour' }}
        </div>
      </div>
      <div class="editor-heading-actions">
        <q-btn flat no-caps icon="arrow_back" label="Atelier" to="/" />
        <q-btn v-if="site.id" outline no-caps icon="archive" label="Exporter ZIP" :loading="isExporting" @click="downloadExport" />
        <q-btn color="primary" no-caps icon-right="save" label="Enregistrer" class="trame-primary-btn" :loading="isSaving" @click="saveSite()" />
      </div>
    </header>

    <div class="row q-col-gutter-xl">
      <div class="col-12 col-lg-5">
        <q-card class="editor-controls-card">
          <q-card-section class="row items-center editor-panel-heading">
            <div><div class="trame-editor-eyebrow">PARAMÈTRES</div><div class="text-h6">Construire la page</div></div>
            <q-space />
            <q-icon name="tune" size="28px" />
          </q-card-section>
          <q-separator />
          <ThemeSection :site="site" />
          <GeneralSettingsSection :site="site" />
          <HeaderSection v-model="headerLogoPreviewUrl" :site="site" />
          <SectionsList
            :sections="site.sections"
            :section-type-btns="sectionTypeBtns"
            @add-section="addSection"
            @remove-section="removeSection"
          />
          <FooterSection v-model="footerLogoPreviewUrl" :site="site" />
          <q-card-actions align="right" class="q-pa-lg q-gutter-md editor-bottom-actions">
            <q-btn flat no-caps label="Fermer" to="/" />
            <q-btn color="primary" no-caps icon-right="save" label="Enregistrer sans quitter" :loading="isSaving" @click="saveSite()" />
          </q-card-actions>
        </q-card>
      </div>

      <div class="col-12 col-lg-7">
        <q-card class="preview-workbench sticky">
          <q-card-section class="preview-toolbar">
            <div>
              <div class="trame-editor-eyebrow">APERÇU EN DIRECT</div>
              <div class="text-h6">{{ previewMode === 'mobile' ? 'Format mobile · 375 px' : 'Format desktop · fluide' }}</div>
            </div>
            <q-btn-toggle
              v-model="previewMode"
              no-caps unelevated toggle-color="dark" color="white" text-color="dark"
              :options="[
                { label: 'Mobile', value: 'mobile', icon: 'smartphone' },
                { label: 'Desktop', value: 'desktop', icon: 'desktop_windows' }
              ]"
              class="preview-toggle"
            />
          </q-card-section>
          <q-card-section class="preview-stage" :class="`is-${previewMode}`">
            <div class="device-frame" :class="`device-${previewMode}`">
              <div v-if="previewMode === 'mobile'" class="device-notch"></div>
              <div class="preview-scroll" :style="{ height: previewMode === 'mobile' ? '760px' : '680px', paddingTop: previewMode === 'mobile' ? '28px' : '0' }">
                <LivePreview
                  :site="site"
                  :mode="previewMode"
                  :header-logo="headerLogoPreviewUrl"
                  :footer-logo="footerLogoPreviewUrl"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import ThemeSection from '../components/ThemeSection.vue'
import GeneralSettingsSection from '../components/GeneralSettingsSection.vue'
import HeaderSection from '../components/HeaderSection.vue'
import FooterSection from '../components/FooterSection.vue'
import SectionsList from '../components/SectionsList.vue'
import LivePreview from '../components/editor/LivePreview.vue'
import { useSiteEditor } from '../composables/useSiteEditor.js'

const previewMode = ref('mobile')
const {
  site,
  sectionTypeBtns,
  headerLogoPreviewUrl,
  footerLogoPreviewUrl,
  hasUnsavedChanges,
  isSaving,
  isExporting,
  addSection,
  removeSection,
  saveSite,
  downloadExport
} = useSiteEditor()

onBeforeRouteLeave(() => !hasUnsavedChanges.value || window.confirm('Quitter sans enregistrer les modifications ?'))
</script>

<style scoped>
.trame-editor-page { padding: clamp(24px, 4vw, 54px); max-width: 1800px; margin: 0 auto; }
.editor-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 30px; margin-bottom: 34px; padding-bottom: 24px; border-bottom: 1px solid var(--trame-ink); }
.trame-editor-eyebrow { color: var(--trame-red); font: 750 10px/1.3 "IBM Plex Mono", monospace; letter-spacing: .14em; }
.editor-heading h1 { margin: 9px 0 8px; font: 750 clamp(34px, 5vw, 58px)/.95 Georgia, serif; letter-spacing: -.045em; }
.save-state { display: flex; align-items: center; gap: 7px; color: var(--trame-muted); font-size: 11px; }.save-state i { width: 7px; height: 7px; border-radius: 50%; background: var(--trame-green); }.save-state.dirty i { background: var(--trame-red); }
.editor-heading-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; }
.editor-controls-card,.preview-workbench { background: var(--trame-paper-light); border: 1px solid var(--trame-ink); }
.editor-controls-card :deep(.q-expansion-item) { border-top: 1px solid var(--trame-line); margin-top: 0 !important; }.editor-controls-card :deep(.q-item) { min-height: 58px; background: transparent !important; color: var(--trame-ink) !important; }.editor-controls-card :deep(.q-item__label) { font-weight: 700; }.editor-controls-card :deep(.q-expansion-item__toggle-icon) { color: var(--trame-ink) !important; }.editor-controls-card :deep(.q-card__section) { background: var(--trame-paper-light); }
.editor-panel-heading { min-height: 82px; }.editor-bottom-actions { border-top: 1px solid var(--trame-line); }
.preview-workbench { top: 88px; overflow: hidden; }.preview-toolbar { min-height: 82px; display: flex; align-items: center; justify-content: space-between; gap: 20px; border-bottom: 1px solid var(--trame-ink); }.preview-toggle { border: 1px solid var(--trame-ink); border-radius: 2px; }
.preview-stage { min-height: 820px; padding: 28px; display: flex; justify-content: center; align-items: flex-start; overflow: auto; background-color: #d8d3c7; background-image: linear-gradient(rgba(23,23,20,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(23,23,20,.12) 1px,transparent 1px); background-size: 24px 24px; }
.device-frame { position: relative; overflow: hidden; background: #171714; border: 8px solid #171714; box-shadow: 12px 12px 0 rgba(23,23,20,.3); transition: width .25s,border-radius .25s; }.device-mobile { width: 375px; max-width: 100%; border-width: 11px; border-radius: 38px; }.device-desktop { width: min(100%,1050px); border-radius: 5px; }.device-notch { position: absolute; top: -1px; left: 50%; z-index: 10; transform: translateX(-50%); width: 130px; height: 25px; background: #171714; border-radius: 0 0 24px 24px; }.preview-scroll { overflow-y: auto; width: 100%; background: #fff; }
@media(max-width:1199px){.preview-workbench{position:relative!important;top:0}.preview-stage{min-height:500px}}@media(max-width:700px){.trame-editor-page{padding:22px 14px}.editor-heading{align-items:flex-start;flex-direction:column}.editor-heading-actions{width:100%}.editor-heading-actions .trame-primary-btn{flex:1}.preview-toolbar{align-items:flex-start;flex-direction:column}.preview-toggle{width:100%}.preview-stage{padding:13px}.device-mobile{border-width:8px}}
</style>
