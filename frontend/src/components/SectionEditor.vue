<template>
  <q-expansion-item
    :key="element.id"
    header-class="bg-grey-3"
    icon="drag_handle"
    :label="`${element.title || 'Section sans titre'} (${element.type})`"
    class="bordered"
  >
    <q-card-section class="q-gutter-md">
      <div class="row q-col-gutter-md items-start">
        <div class="col-12 col-sm-8">
          <q-input v-model="element.title" label="Titre de section" outlined dense />
        </div>
        <div class="col-12 col-sm-4 text-right">
          <q-btn-toggle v-model="element.type" :options="sectionTypeBtns" dense />
        </div>
      </div>

      <q-separator />

      <!-- Onglets pour le contenu et le style de la section -->
      <q-tabs v-model="currentTab" dense class="text-grey-7" active-color="primary" indicator-color="primary" align="left">
        <q-tab name="content" label="Contenu" icon="edit" :style="{ color: element.type === 'text' ? '#1976d2' : '#666' }" />
        <q-tab name="style" label="Style" icon="palette" />
        <q-tab v-if="element.type === 'image' || element.type === 'hero'" name="image" label="Image" icon="image" :style="{ color: element.type === 'image' ? '#ff9800' : '#666' }" />
        <q-tab v-if="element.type === 'hero'" name="hero" label="Hero" icon="landscape" :style="{ color: element.type === 'hero' ? '#7b1fa2' : '#666' }" />
      </q-tabs>

      <q-tab-panels v-model="currentTab" animated class="bg-white">
        <!-- Onglet Contenu -->
        <q-tab-panel name="content" class="q-gutter-md">
          <q-input v-model="element.content" type="textarea" label="Contenu" outlined rows="4" />

          <div v-if="element.type === 'text'">
            <div class="text-caption q-mb-sm">Alignement du titre</div>
            <q-btn-group dense>
              <q-btn flat icon="format_align_left" @click="() => (element.titleAlign = 'left')" :color="element.titleAlign === 'left' ? 'primary' : 'grey-7'" />
              <q-btn flat icon="format_align_center" @click="() => (element.titleAlign = 'center')" :color="element.titleAlign === 'center' ? 'primary' : 'grey-7'" />
              <q-btn flat icon="format_align_right" @click="() => (element.titleAlign = 'right')" :color="element.titleAlign === 'right' ? 'primary' : 'grey-7'" />
            </q-btn-group>
          </div>

          <div v-if="element.type === 'text'">
            <div class="text-caption q-mb-sm">Alignement du contenu</div>
            <q-btn-group dense>
              <q-btn flat icon="format_align_left" @click="() => (element.textAlign = 'left')" :color="element.textAlign === 'left' ? 'primary' : 'grey-7'" />
              <q-btn flat icon="format_align_center" @click="() => (element.textAlign = 'center')" :color="element.textAlign === 'center' ? 'primary' : 'grey-7'" />
              <q-btn flat icon="format_align_right" @click="() => (element.textAlign = 'right')" :color="element.textAlign === 'right' ? 'primary' : 'grey-7'" />
            </q-btn-group>
          </div>
        </q-tab-panel>

        <!-- Onglet Style -->
        <q-tab-panel name="style" class="q-gutter-md">
          <div class="q-mb-md q-pa-sm bg-blue-1" style="border-radius: 4px; border-left: 3px solid #1976d2;">
            <div class="text-caption">
              💡 <strong>Personnalisation optionnelle</strong> : Par défaut, cette section hérite du thème global.
              Modifiez ces valeurs uniquement pour créer une section avec un style différent.
            </div>
          </div>

          <div class="text-subtitle2 q-mb-sm">Couleurs personnalisées</div>
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-sm-6">
              <ColorPickerField 
                :model-value="element.style.background" 
                @update:model-value="element.style.background = $event" 
                label="Couleur de fond" 
              />
              <div class="text-caption text-grey-7 q-mt-xs">Laissez vide pour fond transparent</div>
            </div>
            <div class="col-12 col-sm-6">
              <ColorPickerField 
                :model-value="element.style.textColor" 
                @update:model-value="element.style.textColor = $event" 
                label="Couleur du texte" 
              />
              <div class="text-caption text-grey-7 q-mt-xs">Laissez vide pour utiliser le thème</div>
            </div>
          </div>

          <div class="text-subtitle2 q-mb-sm">Police personnalisée</div>
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12">
              <q-select
                v-model="element.style.fontFamily"
                :options="fontOptions"
                label="Police de caractères"
                outlined
                dense
                clearable
                emit-value
                map-options
              >
                <template v-slot:hint>
                  Laissez vide pour utiliser la police du thème
                </template>
              </q-select>
            </div>
          </div>

          <div class="text-subtitle2 q-mb-sm">Bordures arrondies</div>
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12">
              <q-input
                v-model="element.style.borderRadius"
                label="Rayon des bordures"
                outlined
                dense
                placeholder="8px"
                clearable
              >
                <template v-slot:hint>
                  Ex: 0px (carré), 4px, 8px, 50% (rond). Laissez vide pour le thème
                </template>
              </q-input>
            </div>
          </div>

          <div class="text-subtitle2 q-mb-sm">Espacement</div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <q-input
                v-model="element.style.padding"
                label="Padding intérieur"
                outlined
                dense
                placeholder="40px ou 2rem"
                clearable
              >
                <template v-slot:hint>
                  Espace à l'intérieur de la section
                </template>
              </q-input>
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model="element.style.margin"
                label="Marge extérieure"
                outlined
                dense
                placeholder="20px 0"
                clearable
              >
                <template v-slot:hint>
                  Espace autour de la section
                </template>
              </q-input>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-toggle
                v-model="element.style.fullWidth"
                label="Pleine largeur (sans conteneur centré)"
              />
            </div>
          </div>
        </q-tab-panel>

        <!-- Onglet Image -->
        <q-tab-panel v-if="element.type === 'image' || element.type === 'hero'" name="image" class="q-gutter-md">
          <q-btn color="primary" label="Uploader Image" @click="openSectionFilePicker" icon="upload" class="full-width" />

          <q-input v-model="element.alt" label="Texte alternatif (accessibilité)" outlined dense />

          <div v-if="element.type !== 'hero'">
            <div class="text-caption q-mb-sm">Position de l'image</div>
            <q-btn-toggle
              v-model="element.imagePosition"
              :options="[
                { label: 'Avant le titre', value: 'before' },
                { label: 'Après le titre', value: 'after' }
              ]"
              toggle-color="primary"
              dense
            />
          </div>

          <div class="text-caption q-mb-sm">Alignement</div>
          <q-btn-group dense>
            <q-btn flat icon="format_align_left" @click="() => (element.align = 'left')" :color="element.align === 'left' ? 'primary' : 'grey-7'" />
            <q-btn flat icon="format_align_center" @click="() => (element.align = 'center')" :color="element.align === 'center' ? 'primary' : 'grey-7'" />
            <q-btn flat icon="format_align_right" @click="() => (element.align = 'right')" :color="element.align === 'right' ? 'primary' : 'grey-7'" />
          </q-btn-group>

          <div>
            <div class="text-caption q-mb-sm">Forme de l'image</div>
            <q-btn-toggle
              v-model="element.imageShape"
              :options="[
                { label: 'Carré', value: 'square', icon: 'crop_square' },
                { label: 'Arrondi', value: 'rounded', icon: 'rounded_corner' },
                { label: 'Rond', value: 'circle', icon: 'circle' }
              ]"
              toggle-color="primary"
              dense
            />
          </div>

          <q-input v-model.number="element.imageWidth" type="number" label="Taille de l'image" outlined dense suffix="%" min="10" max="100" />

          <div v-if="element._previewUrl || element.image" class="q-mt-md" :style="{ display: 'flex', justifyContent: element.align === 'left' ? 'flex-start' : element.align === 'right' ? 'flex-end' : 'center', padding: '12px', background: '#f5f5f5', borderRadius: '4px' }">
            <img :src="element._previewUrl || element.image" :alt="element.alt || ''" :style="{ maxWidth: (element.imageWidth ? element.imageWidth + '%' : '80%'), height: 'auto', borderRadius: '4px', objectFit: 'cover' }" />
          </div>
        </q-tab-panel>

        <!-- Onglet Hero -->
        <q-tab-panel v-if="element.type === 'hero'" name="hero" class="q-gutter-md">
          <div class="q-mb-md q-pa-sm bg-purple-1" style="border-radius: 4px; border-left: 3px solid #7b1fa2;">
            <div class="text-caption">
              💡 <strong>Section Hero</strong> : Par défaut, l'overlay utilise la couleur primaire du thème.
              Personnalisez uniquement si nécessaire.
            </div>
          </div>

          <div class="text-subtitle2 q-mb-md">Contenu Hero</div>
          <q-input v-model="element.heroTitle" label="Titre principal" outlined dense class="q-mb-md" />
          <q-input v-model="element.heroSubtitle" label="Sous-titre" outlined dense class="q-mb-md" />

          <div class="text-subtitle2 q-mb-md">Bouton CTA (Call-to-Action)</div>
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-sm-6">
              <q-input v-model="element.ctaLabel" label="Label du bouton" outlined dense placeholder="En savoir plus" />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="element.ctaUrl" label="URL du bouton" outlined dense placeholder="https://..." />
            </div>
          </div>

          <q-separator class="q-my-md" />

          <div class="text-subtitle2 q-mb-md">Apparence</div>
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12">
              <q-input 
                v-model="element.heroHeight" 
                label="Hauteur de la section" 
                outlined 
                dense 
                placeholder="60vh"
              >
                <template v-slot:hint>
                  Utilisez vh (hauteur viewport) ou px. Ex: 60vh, 500px
                </template>
              </q-input>
            </div>
          </div>

          <div class="text-subtitle2 q-mb-md">Overlay (calque coloré sur l'image)</div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <ColorPickerField 
                :model-value="element.heroOverlayColor" 
                @update:model-value="element.heroOverlayColor = $event" 
                label="Couleur overlay (optionnel)" 
              />
              <div class="text-caption text-grey-7 q-mt-xs">Laissez vide pour utiliser la couleur primaire du thème</div>
            </div>
            <div class="col-12 col-sm-6">
              <q-input 
                v-model.number="element.heroOverlayOpacity" 
                label="Opacité de l'overlay" 
                outlined 
                dense 
                type="number" 
                min="0" 
                max="1" 
                step="0.1"
                placeholder="0.3"
              >
                <template v-slot:hint>
                  0 = transparent, 1 = opaque
                </template>
              </q-input>
            </div>
          </div>
        </q-tab-panel>

      </q-tab-panels>

      <q-separator class="q-my-md" />

      <div class="row q-gutter-md justify-end">
        <q-btn flat label="Supprimer" color="negative" @click="emit('remove')" icon="delete" />
      </div>
    </q-card-section>
  </q-expansion-item>
</template>

<script setup>
import { ref } from 'vue'
import ColorPickerField from './ColorPickerField.vue'

const props = defineProps({
  element: {
    type: Object,
    required: true
  },
  sectionTypeBtns: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['remove'])
const currentTab = ref('content')

// Options de police personnalisée
const fontOptions = [
  { label: 'System Sans (défaut)', value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" },
  { label: 'Arial', value: "Arial, sans-serif" },
  { label: 'Georgia (serif)', value: "Georgia, serif" },
  { label: 'Times New Roman', value: "'Times New Roman', Times, serif" },
  { label: 'Courier New (monospace)', value: "'Courier New', monospace" },
  { label: 'Verdana', value: "Verdana, sans-serif" },
  { label: 'Trebuchet MS', value: "'Trebuchet MS', sans-serif" }
]

// Ouvre le sélecteur de fichiers pour l'image de la section
function openSectionFilePicker() {
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
      alert('Veuillez sélectionner une image (jpeg, png, ...).')
      return
    }
    // Lecture du fichier et mise à jour de l'aperçu
    try {
      if (props.element._previewUrl) URL.revokeObjectURL(props.element._previewUrl)
      props.element._file = f
      props.element._previewUrl = URL.createObjectURL(f)
      props.element.image = null
    } catch (err) {
      console.error('Erreur lecture image section', err)
      alert('Erreur lors de la lecture du fichier')
    }
  }
  input.click()
}
</script>
