<template>
  <q-expansion-item
    :default-opened="defaultOpened"
    :header-class="headerClass"
    expand-icon-class="text-white"
    :icon="icon"
    :label="label"
    class="q-mt-md"
  >
    <q-card-section class="q-gutter-md">
      <slot />
    </q-card-section>
  </q-expansion-item>
</template>

<script setup>
  // Définition des props du composant
defineProps({
  label: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  headerClass: {
    type: String,
    default: 'bg-grey-8 text-white'
  },
  defaultOpened: {
    type: Boolean,
    default: false
  }
})
</script>
