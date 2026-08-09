<template>
  <SectionExpansion label="En-tête (Header)" icon="folder_special" header-class="bg-cyan text-white">
    <q-checkbox v-model="site.config.header.enabled" label="Activer l'en-tête" />

    <template v-if="site.config.header.enabled">
      <q-separator />

      <div class="row q-col-gutter-md">
        <div class="col-12 col-sm-8">
          <q-input v-model="site.config.header.logoText" label="Texte du logo / Nom site" outlined dense />
        </div>
        <div class="col-12 col-sm-4">
          <q-btn dense color="primary" label="Upload Logo" @click="openHeaderLogoFilePicker" icon="upload" class="full-width" />
        </div>
      </div>

      <div v-if="headerLogoPreviewUrl || site.config.header.logo" class="q-gutter-md">
        <q-separator />

        <div>
          <div class="text-caption q-mb-sm">Alignement du logo</div>
          <q-btn-group dense>
            <q-btn flat icon="format_align_left" @click="() => (site.config.header.logoAlign = 'left')" :color="site.config.header.logoAlign === 'left' ? 'primary' : 'grey-7'" />
            <q-btn flat icon="format_align_center" @click="() => (site.config.header.logoAlign = 'center')" :color="site.config.header.logoAlign === 'center' ? 'primary' : 'grey-7'" />
            <q-btn flat icon="format_align_right" @click="() => (site.config.header.logoAlign = 'right')" :color="site.config.header.logoAlign === 'right' ? 'primary' : 'grey-7'" />
          </q-btn-group>
        </div>

        <div>
          <div class="text-caption q-mb-sm">Forme du logo</div>
          <q-btn-toggle
            v-model="site.config.header.logoShape"
            :options="[
              { label: 'Carré', value: 'square', icon: 'crop_square' },
              { label: 'Arrondi', value: 'rounded', icon: 'rounded_corner' },
              { label: 'Rond', value: 'circle', icon: 'circle' }
            ]"
            toggle-color="primary"
            dense
          />
        </div>

        <div class="text-caption q-mb-sm">Aperçu du logo</div>
        <div :style="{ display: 'flex', justifyContent: site.config.header.logoAlign === 'left' ? 'flex-start' : site.config.header.logoAlign === 'right' ? 'flex-end' : 'center', padding: '12px', background: '#f5f5f5', borderRadius: '4px' }">
          <img 
            :src="headerLogoPreviewUrl || site.config.header.logo" 
            alt="Logo" 
            :style="{ 
              maxHeight: '50px', 
              maxWidth: '100%', 
              borderRadius: site.config.header.logoShape === 'circle' ? '50%' : site.config.header.logoShape === 'rounded' ? '8px' : '0'
            }" 
          />
        </div>
      </div>

      <q-separator class="q-my-md" />

      <div class="text-subtitle2 q-mb-md">Style du header</div>
      <div class="row q-col-gutter-md">
        <div class="col-12 col-sm-4">
          <ColorPickerField :model-value="site.config.header.backgroundColor" @update:model-value="site.config.header.backgroundColor = $event" label="Couleur de fond" />
        </div>
        <div class="col-12 col-sm-4">
          <ColorPickerField :model-value="site.config.header.textColor" @update:model-value="site.config.header.textColor = $event" label="Couleur du texte" />
        </div>
        <div class="col-12 col-sm-4">
          <q-input v-model="site.config.header.height" label="Hauteur" outlined dense placeholder="80px" suffix="px" />
        </div>
      </div>
    </template>
  </SectionExpansion>
</template>

<script setup>
import { ref } from 'vue'
import SectionExpansion from './SectionExpansion.vue'
import ColorPickerField from './ColorPickerField.vue'

const props = defineProps({
  site: {
    type: Object,
    required: true
  },
  modelValue: String
})

// Émission des événements de mise à jour
const emit = defineEmits(['update:modelValue'])
const headerLogoPreviewUrl = ref(props.modelValue || null)

// Met à jour l'URL de l'aperçu du logo
function updatePreviewUrl(val) {
  headerLogoPreviewUrl.value = val
  emit('update:modelValue', val)
}

// Ouvre le sélecteur de fichiers pour le logo du header
function openHeaderLogoFilePicker() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (ev) => {
    const f = ev.target.files && ev.target.files[0]
    if (!f) return
    const maxSize = 5 * 1024 * 1024
    if (f.size > maxSize) {
      alert('Fichier trop grand — taille maximale 5MB')
      return
    }
    if (!f.type || !f.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image')
      return
    }
    // Lecture du fichier et mise à jour de l'aperçu
    try {
      if (headerLogoPreviewUrl.value) URL.revokeObjectURL(headerLogoPreviewUrl.value)
      props.site.config.header._logoFile = f
      const url = URL.createObjectURL(f)
      updatePreviewUrl(url)
      props.site.config.header.logo = null
    } catch (err) {
      console.error('Erreur lecture logo header', err)
      alert('Erreur lors de la lecture du fichier')
    }
  }
  input.click()
}
</script>
