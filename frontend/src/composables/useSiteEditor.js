import { nextTick, onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from './useAuth.js'
import { useSiteInitialization } from './useSiteInitialization.js'
import { createStarterSite } from '../data/starterTemplates.js'
import { createSection, nextSectionId, normalizeSection, serializeSection } from '../utils/siteSections.js'
import { createSitePayload } from '../utils/sitePayload.js'

export function useSiteEditor() {
  const route = useRoute()
  const router = useRouter()
  const $q = useQuasar()
  const { apiFetch } = useAuth()
  const { initializeHeader, initializeFooter, initializeSite, sectionTypeBtns } = useSiteInitialization()
  const site = ref(initializeSite())
  const headerLogoPreviewUrl = ref(null)
  const footerLogoPreviewUrl = ref(null)
  const hasUnsavedChanges = ref(false)
  const isSaving = ref(false)
  const isExporting = ref(false)
  const isReady = ref(false)
  let suppressTracking = false
  let nextId = 1

  function mergedSite(loaded) {
    const defaults = initializeSite()
    const config = loaded.config || {}
    const sections = (config.sections || []).map((section, index) => normalizeSection(section, index + 1))
    return {
      id: loaded.id,
      name: loaded.name,
      slug: loaded.slug,
      config: {
        ...defaults.config,
        ...config,
        theme: { ...defaults.config.theme, ...(config.theme || {}) },
        header: { ...initializeHeader(), ...(config.header || {}) },
        footer: { ...initializeFooter(), ...(config.footer || {}) },
        desktopBackground: { ...defaults.config.desktopBackground, ...(config.desktopBackground || {}) },
        sections
      },
      sections
    }
  }

  async function initializeEditor() {
    suppressTracking = true
    try {
      if (route.params.id) {
        const response = await apiFetch(`/sites/${route.params.id}`)
        if (!response.ok) throw new Error(`Chargement impossible (HTTP ${response.status})`)
        site.value = mergedSite(await response.json())
        hasUnsavedChanges.value = false
      } else {
        const template = typeof route.query.template === 'string' ? route.query.template : 'blank'
        site.value = createStarterSite(template, initializeSite)
        hasUnsavedChanges.value = template !== 'blank'
      }
      nextId = nextSectionId(site.value.sections)
    } catch (error) {
      $q.notify({ type: 'negative', message: error.message, position: 'top' })
      await router.replace('/')
    } finally {
      await nextTick()
      suppressTracking = false
      isReady.value = true
    }
  }

  function addSection() {
    site.value.sections.push(createSection(nextId++))
  }

  function removeSection(index) {
    const [removed] = site.value.sections.splice(index, 1)
    if (removed?._previewUrl) URL.revokeObjectURL(removed._previewUrl)
  }

  async function saveSite({ redirect = false, notify = true } = {}) {
    isSaving.value = true
    try {
      if (!site.value.name.trim()) throw new Error('Le nom du site est requis')
      if (!site.value.slug.trim()) throw new Error('Le slug du site est requis')
      const wasNew = !site.value.id
      const response = await apiFetch(wasNew ? '/sites' : `/sites/${site.value.id}`, {
        method: wasNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(await createSitePayload(site.value))
      })
      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(Array.isArray(data?.error) ? data.error[0]?.message : data?.error || `Sauvegarde impossible (HTTP ${response.status})`)
      }
      const saved = await response.json()
      suppressTracking = true
      site.value.id = saved.id
      site.value.config.sections = site.value.sections.map(serializeSection)
      hasUnsavedChanges.value = false
      if (redirect) await router.push('/')
      else if (wasNew) await router.replace({ name: 'EditorEdit', params: { id: saved.id } })
      await nextTick()
      suppressTracking = false
      if (notify) $q.notify({ type: 'positive', message: 'Projet enregistré', position: 'top' })
      return saved
    } catch (error) {
      if (notify) {
        $q.notify({ type: 'negative', message: error.message, position: 'top' })
        return null
      }
      throw error
    } finally {
      suppressTracking = false
      isSaving.value = false
    }
  }

  async function downloadExport() {
    isExporting.value = true
    try {
      if (!site.value.id || hasUnsavedChanges.value) await saveSite({ redirect: false, notify: false })
      const response = await apiFetch(`/sites/${site.value.id}/export`, { method: 'POST' })
      if (!response.ok) throw new Error(`Export impossible (HTTP ${response.status})`)
      const url = URL.createObjectURL(await response.blob())
      const link = document.createElement('a')
      link.href = url
      link.download = `${site.value.slug}.zip`
      link.click()
      URL.revokeObjectURL(url)
      $q.notify({ type: 'positive', message: 'Export ZIP prêt' })
    } catch (error) {
      $q.notify({ type: 'negative', message: error.message })
    } finally {
      isExporting.value = false
    }
  }

  watch(site, () => {
    if (isReady.value && !suppressTracking && !isSaving.value) hasUnsavedChanges.value = true
  }, { deep: true })

  onMounted(initializeEditor)

  return {
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
  }
}
