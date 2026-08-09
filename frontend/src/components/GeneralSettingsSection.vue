<template>
  <SectionExpansion label="Paramètres Généraux" icon="settings" header-class="bg-primary text-white">
    <!-- Informations de base -->
    <div class="text-subtitle2 q-mb-md">🏷️ Informations de base</div>
    <div class="row q-col-gutter-md">
      <div class="col-12 col-sm-6">
        <q-input
          v-model="site.name"
          label="Nom du site"
          outlined
          dense
          required
          hint="Nom affiché dans votre gestionnaire"
          :rules="[val => val && val.length > 0 || 'Le nom est requis']"
        />
      </div>
      <div class="col-12 col-sm-6">
        <q-input
          v-model="site.slug"
          label="Slug (URL)"
          outlined
          dense
          required
          hint="Utilisé pour l'URL et le dossier du site (a-z, 0-9 et tirets)"
          :rules="[
            val => val && val.length > 0 || 'Le slug est requis',
            val => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(val) || 'Utilisez uniquement des minuscules, chiffres et tirets'
          ]"
          @blur="validateSlug"
        >
          <template v-slot:hint>
            <span v-if="!isSlugValid" class="text-negative">❌ Slug invalide</span>
            <span v-else>✅ Slug valide</span>
          </template>
        </q-input>
      </div>
      <div class="col-12">
        <q-input
          v-model="site.config.title"
          label="Titre du site (balise <title>)"
          outlined
          dense
          hint="Affiché dans l'onglet du navigateur et les résultats de recherche"
        />
      </div>
      <div class="col-12">
        <q-input
          v-model="site.config.description"
          label="Description du site (meta description)"
          outlined
          dense
          type="textarea"
          rows="2"
          hint="Description pour le référencement (SEO) - 150-160 caractères recommandés"
          maxlength="200"
          counter
        />
      </div>
      <div class="col-12 col-sm-6">
        <q-input
          v-model="site.config.author"
          label="Auteur"
          outlined
          dense
          hint="Nom de l'auteur ou entreprise"
        />
      </div>
      <div class="col-12 col-sm-6">
        <q-input
          v-model="site.config.language"
          label="Langue"
          outlined
          dense
          hint="Code de langue (ex: fr, en, es)"
          placeholder="fr"
        />
      </div>
    </div>

    <q-separator class="q-my-lg" />

    <!-- Branding & Partage -->
    <div class="text-subtitle2 q-mb-md">🔍 Branding & Partage</div>
    <div class="row q-col-gutter-md">
      <div class="col-12 col-sm-6">
        <div class="text-caption q-mb-sm">Image de partage (Open Graph)</div>
        <q-file 
          v-model="ogImageFile" 
          @update:model-value="onOgImageChange" 
          accept="image/*" 
          outlined 
          dense 
          label="Sélectionner une image (1200x630px recommandé)"
          clearable
        >
          <template v-slot:prepend>
            <q-icon name="share" />
          </template>
        </q-file>
        <div v-if="site.config._ogImagePreviewUrl || site.config.ogImage" class="q-mt-sm">
          <img 
            :src="site.config._ogImagePreviewUrl ?? site.config.ogImage" 
            alt="Open Graph" 
            style="max-width:100%;height:auto;border-radius:4px;border:1px solid #ddd;max-height:150px;"
          />
        </div>
      </div>
      <div class="col-12 col-sm-6">
        <div class="text-caption q-mb-sm">Favicon</div>
        <q-file 
          v-model="faviconFile" 
          @update:model-value="onFaviconChange" 
          accept="image/x-icon,image/png,image/svg+xml" 
          outlined 
          dense 
          label="Sélectionner une icône (32x32px recommandé)"
          clearable
        >
          <template v-slot:prepend>
            <q-icon name="star" />
          </template>
        </q-file>
        <div v-if="site.config._faviconPreviewUrl || site.config.favicon" class="q-mt-sm">
          <img 
            :src="site.config._faviconPreviewUrl ?? site.config.favicon" 
            alt="Favicon" 
            style="max-width:64px;height:auto;border-radius:4px;border:1px solid #ddd;"
          />
        </div>
      </div>
    </div>

    <q-separator class="q-my-lg" />

    <!-- Fond Desktop (Format Mobile-First) -->
    <div class="text-subtitle2 q-mb-md">🖥️ Fond Desktop (Format Mobile-First 400px)</div>
    <div class="text-caption q-mb-md text-grey-7">
      Votre contenu s'affiche dans un format mobile (~400px) centré. Sur desktop, habiller l'espace vide avec un fond décoratif (couleur, image ou dégradé).
    </div>
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <q-btn-toggle
          v-model="site.config.desktopBackground.type"
          :options="[
            { label: 'Couleur unie', value: 'color', icon: 'palette' },
            { label: 'Image', value: 'image', icon: 'image' },
            { label: 'Dégradé', value: 'gradient', icon: 'gradient' }
          ]"
          toggle-color="primary"
          spread
        />
      </div>

      <!-- Couleur unie -->
      <div v-if="site.config.desktopBackground.type === 'color'" class="col-12">
        <ColorPickerField 
          :model-value="site.config.desktopBackground.color"
          @update:model-value="(val) => site.config.desktopBackground.color = val"
          label="Couleur du fond desktop"
        />
      </div>

      <!-- Image -->
      <div v-if="site.config.desktopBackground.type === 'image'" class="col-12">
        <q-file 
          v-model="desktopBgFile" 
          @update:model-value="onDesktopBgChange" 
          accept="image/*" 
          outlined 
          dense 
          label="Sélectionner une image de fond desktop"
          clearable
        >
          <template v-slot:prepend>
            <q-icon name="wallpaper" />
          </template>
        </q-file>
        <div v-if="site.config.desktopBackground._previewUrl || site.config.desktopBackground.image" class="q-mt-sm">
          <img 
            :src="site.config.desktopBackground._previewUrl ?? site.config.desktopBackground.image" 
            alt="Fond Desktop" 
            style="max-width:100%;max-height:200px;border-radius:6px;border:1px solid #ddd;"
          />
          <q-btn
            flat
            dense
            color="negative"
            icon="delete"
            label="Retirer"
            class="q-mt-sm"
            size="sm"
            @click="removeDesktopBg"
          />
        </div>
      </div>

      <!-- Dégradé -->
      <div v-if="site.config.desktopBackground.type === 'gradient'" class="col-12">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6">
            <ColorPickerField 
              :model-value="site.config.desktopBackground.gradientStart"
              @update:model-value="(val) => site.config.desktopBackground.gradientStart = val"
              label="Couleur de départ"
            />
          </div>
          <div class="col-12 col-sm-6">
            <ColorPickerField 
              :model-value="site.config.desktopBackground.gradientEnd"
              @update:model-value="(val) => site.config.desktopBackground.gradientEnd = val"
              label="Couleur de fin"
            />
          </div>
          <div class="col-12">
            <q-select
              v-model="site.config.desktopBackground.gradientDirection"
              :options="[
                { label: 'Haut vers Bas', value: 'to bottom' },
                { label: 'Gauche vers Droite', value: 'to right' },
                { label: 'Diagonale (↘)', value: 'to bottom right' },
                { label: 'Diagonale (↙)', value: 'to bottom left' }
              ]"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              label="Direction du dégradé"
              outlined
              dense
            />
          </div>
          <!-- Aperçu du dégradé -->
          <div class="col-12">
            <div class="text-caption q-mb-xs">Aperçu :</div>
            <div 
              :style="{
                width: '100%',
                height: '100px',
                borderRadius: '6px',
                background: `linear-gradient(${site.config.desktopBackground.gradientDirection}, ${site.config.desktopBackground.gradientStart}, ${site.config.desktopBackground.gradientEnd})`
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <q-separator class="q-my-lg" />


    <q-separator class="q-my-lg" />

    <!-- Options avancées -->
    <div class="text-subtitle2 q-mb-md">⚙️ Options avancées</div>
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <q-toggle
          v-model="site.config.smoothScroll"
          label="📜 Défilement fluide (smooth scroll)"
          hint="Active l'animation fluide au défilement"
        />
      </div>
    </div>
  </SectionExpansion>
</template>

<script setup>
import { ref, watch } from 'vue'
import SectionExpansion from './SectionExpansion.vue'
import ColorPickerField from './ColorPickerField.vue'
import { generateSlug, isValidSlug as checkSlug } from '../utils/siteSlug.js'

const props = defineProps({
  site: {
    type: Object,
    required: true
  }
})

const bgFile = ref(null)
const ogImageFile = ref(null)
const faviconFile = ref(null)
const desktopBgFile = ref(null)
const isSlugValid = ref(true)

// Watcher pour auto-générer le slug quand le nom change
watch(() => props.site.name, (newName) => {
  // Regenerer le slug à partir du nom si le nom existe
  if (newName && newName.trim().length > 0) {
    props.site.slug = generateSlug(newName)
  }
})

// Valider et nettoyer le slug
function validateSlug() {
  if (!props.site.slug) return
  
  // Convertir en slug valide
  const validSlug = generateSlug(props.site.slug)
  
  if (validSlug !== props.site.slug) {
    props.site.slug = validSlug
    isSlugValid.value = false
    setTimeout(() => { isSlugValid.value = true }, 2000)
  }
  
  isSlugValid.value = checkSlug(props.site.slug)
}

// Gestion du changement de l'image Open Graph
async function onOgImageChange(f) {
  if (!f) return
  try {
    if (props.site.config._ogImagePreviewUrl) URL.revokeObjectURL(props.site.config._ogImagePreviewUrl)
    props.site.config._ogImageFile = f
    props.site.config._ogImagePreviewUrl = URL.createObjectURL(f)
    props.site.config.ogImage = null
  } catch (err) {
    console.error('Erreur lecture image OG', err)
  }
}

// Gestion du changement du favicon
async function onFaviconChange(f) {
  if (!f) return
  try {
    if (props.site.config._faviconPreviewUrl) URL.revokeObjectURL(props.site.config._faviconPreviewUrl)
    props.site.config._faviconFile = f
    props.site.config._faviconPreviewUrl = URL.createObjectURL(f)
    props.site.config.favicon = null
  } catch (err) {
    console.error('Erreur lecture favicon', err)
  }
}

// Gestion du changement de l'image de fond desktop
async function onDesktopBgChange(f) {
  if (!f) return
  try {
    if (props.site.config.desktopBackground._previewUrl) URL.revokeObjectURL(props.site.config.desktopBackground._previewUrl)
    props.site.config.desktopBackground._file = f
    props.site.config.desktopBackground._previewUrl = URL.createObjectURL(f)
    props.site.config.desktopBackground.image = null
  } catch (err) {
    console.error('Erreur lecture image fond desktop', err)
  }
}

// Retire l'image de fond desktop
function removeDesktopBg() {
  if (props.site.config.desktopBackground._previewUrl) {
    URL.revokeObjectURL(props.site.config.desktopBackground._previewUrl)
  }
  props.site.config.desktopBackground._file = null
  props.site.config.desktopBackground._previewUrl = null
  props.site.config.desktopBackground.image = null
  desktopBgFile.value = null
}
</script>
