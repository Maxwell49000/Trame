<template>
  <SectionExpansion label="🎨 Thème Global" icon="palette" header-class="bg-purple text-white" :default-opened="true">
    <!-- Couleurs des palettes prédéfinies -->
    <div class="text-subtitle2 q-mb-md">Palette de couleurs prédéfinie</div>
    <div class="row q-col-gutter-md q-mb-lg">
      <div 
        v-for="palette in colorPalettes" 
        :key="palette.name"
        class="col-6 col-sm-4 col-md-3"
      >
        <q-card 
          flat 
          bordered 
          class="cursor-pointer transition-all"
          :class="{ 'ring-2 ring-primary': site.config.theme.colorPalette === palette.name }"
          @click="applyPalette(palette)"
          style="overflow: hidden;"
        >
          <div style="display: flex; height: 60px;">
            <div :style="{ flex: 1, background: palette.primary }"></div>
            <div :style="{ flex: 1, background: palette.secondary }"></div>
            <div :style="{ flex: 1, background: palette.accent }"></div>
          </div>
          <q-card-section class="q-pa-sm text-center">
            <div class="text-caption text-weight-bold">{{ palette.label }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-separator class="q-my-md" />

    <!-- Couleurs personnalisées -->
    <div class="text-subtitle2 q-mb-md">Personnalisation des couleurs</div>
    <div class="q-mb-sm text-caption text-grey-7">
      <div>🔷 <strong>Primaire</strong> : Titres, boutons principaux, overlay des hero</div>
      <div>⬛ <strong>Secondaire</strong> : Texte du contenu, descriptions</div>
      <div>✨ <strong>Accent</strong> : Éléments décoratifs, liens, boutons secondaires</div>
    </div>
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-6 col-sm-4">
        <ColorPickerField 
          :model-value="site.config.theme.primaryColor" 
          @update:model-value="updateThemeColor('primaryColor', $event)" 
          label="🔷 Couleur primaire" 
        />
      </div>
      <div class="col-6 col-sm-4">
        <ColorPickerField 
          :model-value="site.config.theme.secondaryColor" 
          @update:model-value="updateThemeColor('secondaryColor', $event)" 
          label="⬛ Couleur secondaire" 
        />
      </div>
      <div class="col-6 col-sm-4">
        <ColorPickerField 
          :model-value="site.config.theme.accentColor" 
          @update:model-value="updateThemeColor('accentColor', $event)" 
          label="✨ Couleur accent" 
        />
      </div>
    </div>

    <q-separator class="q-my-md" />

    <!-- Typographie -->
    <div class="text-subtitle2 q-mb-md">Typographie couplée</div>
    <div class="row q-col-gutter-md q-mb-lg">
      <div 
        v-for="typo in typographyPairs" 
        :key="typo.name"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card 
          flat 
          bordered 
          class="cursor-pointer transition-all"
          :class="{ 'ring-2 ring-primary': isTypographySelected(typo) }"
          @click="applyTypography(typo)"
        >
          <q-card-section>
            <div class="text-weight-bold q-mb-xs" :style="{ fontFamily: typo.titleFont }">
              {{ typo.label }}
            </div>
            <div class="text-caption" :style="{ fontFamily: typo.bodyFont }">
              Titre: {{ typo.titleLabel }}<br>
              Corps: {{ typo.bodyLabel }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-separator class="q-my-md" />

    <!-- Rayon des bordures -->
    <div class="text-subtitle2 q-mb-md">🔳 Rayon des bordures</div>
    <q-btn-toggle
      v-model="site.config.theme.borderRadius"
      :options="borderRadiusOptions"
      toggle-color="primary"
      class="q-mb-lg"
      spread
    />

    <div class="row q-col-gutter-sm q-mb-lg">
      <div v-for="option in borderRadiusOptions" :key="option.value" class="col-3">
        <div 
          class="text-center q-pa-md" 
          :style="{ 
            background: '#e0e0e0', 
            borderRadius: getBorderRadiusValue(option.value)
          }"
        >
          <div class="text-caption">{{ option.label }}</div>
        </div>
      </div>
    </div>

    <q-separator class="q-my-md" />

    <!-- Échelle d'espacement -->
    <div class="text-subtitle2 q-mb-md">📏 Échelle d'espacement</div>
    <q-btn-toggle
      v-model="site.config.theme.spacing"
      :options="spacingOptions"
      toggle-color="primary"
      class="q-mb-lg"
      spread
    />

    <div class="q-pa-md bg-grey-2" style="border-radius: 8px;">
      <div class="text-caption q-mb-sm">Prévisualisation du thème:</div>
      <div 
        class="bg-white q-pa-md" 
        :style="{ 
          borderRadius: getBorderRadiusValue(site.config.theme.borderRadius),
          padding: getSpacingValue(site.config.theme.spacing)
        }"
      >
        <div 
          class="text-h6 q-mb-sm" 
          :style="{ 
            fontFamily: site.config.theme.titleFont,
            color: site.config.theme.primaryColor 
          }"
        >
          🔷 Titre (Primaire)
        </div>
        <div 
          class="q-mb-md"
          :style="{ 
            fontFamily: site.config.theme.bodyFont,
            color: site.config.theme.secondaryColor 
          }"
        >
          ⬛ Texte de contenu (Secondaire). Cette couleur est utilisée pour le corps du texte et assure une bonne lisibilité.
        </div>
        <button 
          :style="{
            backgroundColor: site.config.theme.accentColor,
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: getBorderRadiusValue(site.config.theme.borderRadius),
            cursor: 'pointer',
            fontFamily: site.config.theme.bodyFont,
            fontWeight: '500'
          }"
        >
          ✨ Bouton (Accent)
        </button>
      </div>
    </div>
  </SectionExpansion>
</template>

<script setup>
import SectionExpansion from './SectionExpansion.vue'
import ColorPickerField from './ColorPickerField.vue'

const props = defineProps({
  site: {
    type: Object,
    required: true
  }
})

// Définitions des palettes de couleurs prédéfinies
const colorPalettes = [
  {
    name: 'default',
    label: 'Par défaut',
    primary: '#1976d2',
    secondary: '#424242',
    accent: '#82b1ff',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336'
  },
  {
    name: 'ocean',
    label: 'Océan',
    primary: '#0288d1',
    secondary: '#006064',
    accent: '#4dd0e1',
    success: '#00897b',
    warning: '#ffa726',
    error: '#e53935'
  },
  {
    name: 'sunset',
    label: 'Coucher de soleil',
    primary: '#ff6f00',
    secondary: '#d84315',
    accent: '#ffb74d',
    success: '#66bb6a',
    warning: '#ffa726',
    error: '#ef5350'
  },
  {
    name: 'forest',
    label: 'Forêt',
    primary: '#388e3c',
    secondary: '#1b5e20',
    accent: '#81c784',
    success: '#66bb6a',
    warning: '#ffb74d',
    error: '#e57373'
  },
  {
    name: 'purple',
    label: 'Violet',
    primary: '#7b1fa2',
    secondary: '#4a148c',
    accent: '#ba68c8',
    success: '#66bb6a',
    warning: '#ffb74d',
    error: '#ef5350'
  },
  {
    name: 'elegant',
    label: 'Élégant',
    primary: '#37474f',
    secondary: '#212121',
    accent: '#90a4ae',
    success: '#66bb6a',
    warning: '#ffb74d',
    error: '#ef5350'
  },
  {
    name: 'fresh',
    label: 'Frais',
    primary: '#00bcd4',
    secondary: '#00838f',
    accent: '#80deea',
    success: '#66bb6a',
    warning: '#ffb74d',
    error: '#ef5350'
  },
  {
    name: 'warm',
    label: 'Chaleureux',
    primary: '#d32f2f',
    secondary: '#c62828',
    accent: '#ff8a80',
    success: '#66bb6a',
    warning: '#ffb74d',
    error: '#ef5350'
  }
]

// Définitions des paires de typographies
const typographyPairs = [
  {
    name: 'system',
    label: 'Système',
    titleFont: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    bodyFont: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    titleLabel: 'System Sans',
    bodyLabel: 'System Sans'
  },
  {
    name: 'modern',
    label: 'Moderne',
    titleFont: "'Roboto', sans-serif",
    bodyFont: "'Roboto', sans-serif",
    titleLabel: 'Roboto',
    bodyLabel: 'Roboto'
  },
  {
    name: 'classic',
    label: 'Classique',
    titleFont: "Georgia, serif",
    bodyFont: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    titleLabel: 'Georgia Serif',
    bodyLabel: 'System Sans'
  },
  {
    name: 'elegant',
    label: 'Élégant',
    titleFont: "'Times New Roman', Times, serif",
    bodyFont: "Georgia, serif",
    titleLabel: 'Times',
    bodyLabel: 'Georgia'
  },
  {
    name: 'tech',
    label: 'Tech',
    titleFont: "'Courier New', monospace",
    bodyFont: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    titleLabel: 'Courier',
    bodyLabel: 'System Sans'
  }
]

// Définitions des options de rayon des bordures
const borderRadiusOptions = [
  { label: 'Aucun', value: 'none' },
  { label: 'Petit', value: 'small' },
  { label: 'Moyen', value: 'medium' },
  { label: 'Grand', value: 'large' }
]

// Définitions des options d'échelle d'espacement
const spacingOptions = [
  { label: 'Compact', value: 'compact' },
  { label: 'Moyen', value: 'medium' },
  { label: 'Spacieux', value: 'spacious' }
]

// Fonctions pour appliquer les modifications
function applyPalette(palette) {
  props.site.config.theme.colorPalette = palette.name
  props.site.config.theme.primaryColor = palette.primary
  props.site.config.theme.secondaryColor = palette.secondary
  props.site.config.theme.accentColor = palette.accent
  props.site.config.theme.successColor = palette.success
  props.site.config.theme.warningColor = palette.warning
  props.site.config.theme.errorColor = palette.error
  
  // Met à jour aussi les couleurs de fond et de texte globales
  props.site.config.backgroundColor = '#ffffff'
  props.site.config.textColor = palette.secondary
}

// Met à jour une couleur spécifique du thème
function updateThemeColor(colorKey, value) {
  props.site.config.theme[colorKey] = value
  props.site.config.theme.colorPalette = 'custom'
}

// Applique une paire de typographies
function applyTypography(typo) {
  props.site.config.theme.titleFont = typo.titleFont
  props.site.config.theme.bodyFont = typo.bodyFont
  props.site.config.fontFamily = typo.bodyFont
}

// Vérifie si une paire de typographies est sélectionnée
function isTypographySelected(typo) {
  return props.site.config.theme.titleFont === typo.titleFont && 
         props.site.config.theme.bodyFont === typo.bodyFont
}

// Obtenir la valeur CSS du rayon des bordures
function getBorderRadiusValue(radius) {
  const values = {
    none: '0px',
    small: '4px',
    medium: '8px',
    large: '16px'
  }
  return values[radius] || values.medium
}

// Obtenir la valeur CSS de l'espacement
function getSpacingValue(spacing) {
  const values = {
    compact: '12px',
    medium: '20px',
    spacious: '32px'
  }
  return values[spacing] || values.medium
}
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.transition-all {
  transition: all 0.2s ease;
}

.ring-2 {
  outline: 2px solid;
  outline-offset: 2px;
}

.ring-primary {
  outline-color: #1976d2;
}

.cursor-pointer:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
