<template>
  <div class="preview-canvas" :style="canvasStyle">
    <div class="live-preview" :style="shellStyle">
    <header v-if="header.enabled && (header.logoText || header.logo || headerLogo)" class="site-header" :style="headerStyle">
      <img v-if="headerLogo || header.logo" :src="headerLogo || header.logo" alt="" :style="logoStyle(header.logoShape, 42)" />
      <strong v-if="header.logoText">{{ header.logoText }}</strong>
    </header>

    <main>
      <section v-for="section in site.sections" :key="section.id" class="preview-section" :class="`section-${section.type}`" :style="sectionStyle(section)">
        <template v-if="section.type === 'hero'">
          <div class="hero-image" :style="heroImageStyle(section)"></div>
          <div class="hero-overlay" :style="heroOverlayStyle(section)"></div>
          <div class="hero-copy">
            <h1>{{ section.heroTitle || section.title }}</h1>
            <p v-if="section.heroSubtitle">{{ section.heroSubtitle }}</p>
            <span v-if="section.ctaLabel" class="hero-cta">{{ section.ctaLabel }}</span>
          </div>
        </template>
        <template v-else>
          <img v-if="sectionImage(section) && section.imagePosition !== 'after'" :src="sectionImage(section)" :alt="section.alt || ''" :style="sectionImageStyle(section)" />
          <h2 v-if="section.title" :style="{ textAlign: section.titleAlign || 'left', color: theme.primaryColor || '#4054d8', fontFamily: theme.titleFont || 'inherit' }">{{ section.title }}</h2>
          <p v-if="section.content" class="section-copy" :style="{ textAlign: section.textAlign || 'left' }">{{ section.content }}</p>
          <img v-if="sectionImage(section) && section.imagePosition === 'after'" :src="sectionImage(section)" :alt="section.alt || ''" :style="sectionImageStyle(section)" />
        </template>
      </section>
    </main>

    <footer v-if="footer.enabled" :style="footerStyle">
      <img v-if="footerLogo || footer.logo" :src="footerLogo || footer.logo" alt="" :style="logoStyle(footer.logoShape, 36)" />
      <strong v-if="footer.companyName">{{ footer.companyName }}</strong>
      <p v-if="footer.companyDescription">{{ footer.companyDescription }}</p>
      <div class="footer-contact">
        <span v-if="footer.email">{{ footer.email }}</span><span v-if="footer.phone">{{ footer.phone }}</span>
      </div>
      <div v-if="footer.socialLinks?.length" class="social-links">
        <span v-for="social in footer.socialLinks" :key="social.platform">{{ social.platform?.charAt(0).toUpperCase() }}</span>
      </div>
    </footer>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  site: { type: Object, required: true },
  mode: { type: String, default: 'mobile' },
  headerLogo: { type: String, default: null },
  footerLogo: { type: String, default: null }
})

const config = computed(() => props.site.config || {})
const header = computed(() => config.value.header || {})
const footer = computed(() => config.value.footer || {})
const theme = computed(() => config.value.theme || {})
const canvasStyle = computed(() => {
  if (props.mode !== 'desktop') return { background: '#fff' }
  const background = config.value.desktopBackground || {}
  if (background.type === 'image' && (background._previewUrl || background.image)) {
    return { background: `url(${background._previewUrl || background.image}) center / cover fixed` }
  }
  if (background.type === 'gradient') {
    return { background: `linear-gradient(${background.gradientDirection || 'to bottom'}, ${background.gradientStart || '#eef1f5'}, ${background.gradientEnd || '#dfe5ec'})` }
  }
  return { background: background.color || '#eef1f5' }
})
const shellStyle = computed(() => ({
  backgroundColor: config.value.backgroundColor || '#fff',
  color: theme.value.secondaryColor || config.value.textColor || '#171714',
  fontFamily: theme.value.bodyFont || config.value.fontFamily || 'sans-serif',
  fontSize: props.mode === 'mobile' ? '14px' : '16px',
  width: props.mode === 'desktop' ? 'min(82%, 820px)' : '100%',
  margin: props.mode === 'desktop' ? '0 auto' : '0'
}))
const headerStyle = computed(() => ({
  minHeight: props.mode === 'mobile' ? '58px' : (header.value.height || '80px'),
  background: header.value.backgroundColor || '#fff', color: header.value.textColor || '#171714',
  justifyContent: ({ left: 'flex-start', right: 'flex-end', center: 'center' })[header.value.logoAlign] || 'center'
}))
const footerStyle = computed(() => ({ background: footer.value.backgroundColor || '#222', color: footer.value.textColor || '#fff' }))

function radius() { return ({ none: '0', small: '4px', medium: '8px', large: '16px' })[theme.value.borderRadius] || '8px' }
function sectionImage(section) { return section._previewUrl || section.image }
function logoStyle(shape, height) { return { maxHeight: `${height}px`, maxWidth: '180px', borderRadius: shape === 'circle' ? '50%' : shape === 'rounded' ? '8px' : '0' } }
function sectionStyle(section) {
  if (section.type === 'hero') return { minHeight: props.mode === 'mobile' ? '210px' : (section.heroHeight || '60vh'), borderRadius: radius() }
  return {
    background: section.style?.background || 'transparent', color: section.style?.textColor || 'inherit',
    fontFamily: section.style?.fontFamily || 'inherit', padding: section.style?.padding || (props.mode === 'mobile' ? '24px 16px' : '56px 7%'),
    margin: section.style?.margin || '0', borderRadius: radius()
  }
}
function heroImageStyle(section) { return { backgroundImage: sectionImage(section) ? `url(${sectionImage(section)})` : 'none' } }
function heroOverlayStyle(section) { return { background: section.heroOverlayColor || theme.value.primaryColor || '#4054d8', opacity: Number(section.heroOverlayOpacity ?? .3) } }
function sectionImageStyle(section) {
  return { width: `${section.imageWidth || 100}%`, maxWidth: '100%', borderRadius: section.imageShape === 'circle' ? '50%' : section.imageShape === 'rounded' ? '12px' : '0', margin: '14px auto', display: 'block' }
}
</script>

<style scoped>
.preview-canvas,.live-preview { min-height: 100%; }.live-preview { overflow-wrap: anywhere; box-shadow: 0 0 28px rgba(15,23,42,.14); }.site-header { display: flex; align-items: center; gap: 12px; padding: 10px 4%; }.preview-section { position: relative; overflow: hidden; }.section-hero { display: grid; place-items: center; }.hero-image,.hero-overlay { position: absolute; inset: 0; }.hero-image { background-size: cover; background-position: center; }.hero-copy { position: relative; z-index: 2; color: #fff; text-align: center; padding: 32px 20px; max-width: 850px; }.hero-copy h1 { margin: 0; font: 700 clamp(1.6rem, 5vw, 4.5rem)/1.04 Georgia, serif; }.hero-copy p { font-size: 1.08em; }.hero-cta { display: inline-block; margin-top: 10px; padding: 10px 16px; background: rgba(255,255,255,.18); border: 1px solid rgba(255,255,255,.55); }.preview-section h2 { margin: 0 0 14px; }.section-copy { white-space: pre-wrap; line-height: 1.65; margin: 0; }.live-preview footer { padding: 30px 6%; display: grid; gap: 10px; }.live-preview footer p { margin: 0; }.footer-contact { display: flex; flex-wrap: wrap; gap: 12px; }.social-links { display: flex; gap: 8px; }.social-links span { display: grid; place-items: center; width: 26px; height: 26px; border: 1px solid currentColor; border-radius: 50%; font-size: 10px; font-weight: 800; }
</style>
