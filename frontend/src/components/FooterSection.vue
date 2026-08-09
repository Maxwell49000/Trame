<template>
  <SectionExpansion label="Pied de page (Footer)" icon="folder_special" header-class="bg-orange text-white">
    <q-checkbox v-model="site.config.footer.enabled" label="Activer le pied de page" />

    <template v-if="site.config.footer.enabled">
      <q-separator />

      <!-- Information de l'entreprise -->
      <div class="text-subtitle2 q-mb-md">Informations Entreprise</div>
      <div class="row q-col-gutter-md">
        <div class="col-12 col-sm-8">
          <q-input v-model="site.config.footer.companyName" label="Nom de l'entreprise" outlined dense />
        </div>
        <div class="col-12 col-sm-4">
          <q-btn color="primary" label="Upload Logo" @click="openFooterLogoFilePicker" icon="upload" class="full-width" />
        </div>
      </div>
      <!-- Logo et forme -->
      <div v-if="footerLogoPreviewUrl || site.config.footer.logo" class="q-my-md q-gutter-md">
        <div>
          <div class="text-caption q-mb-sm">Forme du logo</div>
          <q-btn-toggle
            v-model="site.config.footer.logoShape"
            :options="[
              { label: 'Carré', value: 'square', icon: 'crop_square' },
              { label: 'Arrondi', value: 'rounded', icon: 'rounded_corner' },
              { label: 'Rond', value: 'circle', icon: 'circle' }
            ]"
            toggle-color="primary"
            dense
          />
        </div>
        <img 
          :src="footerLogoPreviewUrl || site.config.footer.logo" 
          alt="Logo" 
          :style="{ 
            maxHeight: '60px', 
            maxWidth: '100%', 
            borderRadius: site.config.footer.logoShape === 'circle' ? '50%' : site.config.footer.logoShape === 'rounded' ? '8px' : '0'
          }" 
        />
      </div>

      <q-input v-model="site.config.footer.companyDescription" label="Description entreprise" outlined dense type="textarea" rows="2" />

      <q-separator class="q-my-md" />

      <!-- Coordonnées -->
      <div class="text-subtitle2 q-mb-md">Coordonnées</div>
      <div class="row q-col-gutter-md">
        <div class="col-12 col-sm-6">
          <q-input v-model="site.config.footer.email" label="Email" outlined dense type="email" />
        </div>
        <div class="col-12 col-sm-6">
          <q-input v-model="site.config.footer.phone" label="Téléphone" outlined dense />
        </div>
      </div>

      <q-input v-model="site.config.footer.address" label="Adresse" outlined dense type="textarea" rows="2" class="q-mt-md" />

      <q-separator class="q-my-md" />

      <!-- Réseaux Sociaux -->
      <div class="text-subtitle2 q-mb-md">🔗 Réseaux Sociaux</div>
      <div class="q-gutter-md">
        <div v-for="(social, idx) in site.config.footer.socialLinks" :key="'social-' + idx" class="row q-col-gutter-md items-center">
          <div class="col-12 col-sm-6">
            <q-select
              v-model="social.platform"
              :options="socialPlatformOptions"
              label="Plateforme"
              outlined
              dense
              emit-value
              map-options
              @update:model-value="onSocialPlatformChange(social)"
            >
              <template v-slot:prepend>
                <q-icon name="link" />
              </template>
            </q-select>
          </div>
          <div class="col-12 col-sm-6">
            <q-input 
              v-model="social.url" 
              label="URL du profil" 
              outlined 
              dense 
              placeholder="https://..." 
              type="url"
            />
          </div>
          <div class="col-auto">
            <q-btn flat icon="delete" color="negative" @click="removeFooterSocial(idx)" size="md" />
          </div>
        </div>
      </div>
      <q-btn outline color="primary" label="+ Ajouter réseau" @click="addFooterSocial" icon="add" size="sm" />

      <q-separator class="q-my-md" />

      <!-- Style du footer -->
      <div class="text-subtitle2 q-mb-md">Style du footer</div>
      <div class="row q-col-gutter-md">
        <div class="col-12 col-sm-4">
          <ColorPickerField :model-value="site.config.footer.backgroundColor" @update:model-value="site.config.footer.backgroundColor = $event" label="Couleur de fond" />
        </div>
        <div class="col-12 col-sm-4">
          <ColorPickerField :model-value="site.config.footer.textColor" @update:model-value="site.config.footer.textColor = $event" label="Couleur du texte" />
        </div>
      </div>

      <q-input v-model="site.config.footer.copyrightText" label="Texte copyright" outlined dense class="q-mt-md" placeholder="© 2024 Mon Entreprise. Tous droits réservés." />
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

const emit = defineEmits(['update:modelValue'])
const footerLogoPreviewUrl = ref(props.modelValue || null)

// Préréglages des plateformes de réseaux sociaux
const socialPlatformOptions = [
  { label: '👍 Facebook', value: 'facebook', icon: 'fab fa-facebook-f' },
  { label: '📷 Instagram', value: 'instagram', icon: 'fab fa-instagram' },
  { label: '𝕏 Twitter/X', value: 'twitter', icon: 'fab fa-twitter' },
  { label: '💼 LinkedIn', value: 'linkedin', icon: 'fab fa-linkedin-in' },
  { label: '🎥 YouTube', value: 'youtube', icon: 'fab fa-youtube' },
  { label: '🐙 GitHub', value: 'github', icon: 'fab fa-github' },
  { label: '📌 Pinterest', value: 'pinterest', icon: 'fab fa-pinterest-p' },
  { label: '🎮 Twitch', value: 'twitch', icon: 'fab fa-twitch' },
  { label: '💬 Discord', value: 'discord', icon: 'fab fa-discord' },
  { label: '🎵 TikTok', value: 'tiktok', icon: 'fab fa-tiktok' }
]

// Met à jour l'aperçu du logo du footer
function updatePreviewUrl(val) {
  footerLogoPreviewUrl.value = val
  emit('update:modelValue', val)
}

// Ajoute un nouveau lien social
function addFooterSocial() {
  props.site.config.footer.socialLinks.push({ platform: '', url: '', icon: '' })
}

// Supprime un lien social
function removeFooterSocial(idx) {
  props.site.config.footer.socialLinks.splice(idx, 1)
}

function onSocialPlatformChange(social) {
  // Met à jour l'icône en fonction de la plateforme sélectionnée
  const selected = socialPlatformOptions.find(opt => opt.value === social.platform)
  if (selected) {
    social.icon = selected.icon
  }
}

// Ouvre le sélecteur de fichiers pour le logo du footer
function openFooterLogoFilePicker() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  // Gestion du changement de fichier
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
      if (footerLogoPreviewUrl.value) URL.revokeObjectURL(footerLogoPreviewUrl.value)
      props.site.config.footer._logoFile = f
      const url = URL.createObjectURL(f)
      updatePreviewUrl(url)
      props.site.config.footer.logo = null
    } catch (err) {
      console.error('Erreur lecture logo footer', err)
      alert('Erreur lors de la lecture du fichier')
    }
  }
  input.click()
}
</script>
