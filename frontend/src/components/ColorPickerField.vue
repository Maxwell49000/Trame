<template>
  <div class="q-gutter-sm">
    <div class="text-caption">{{ label }}</div>
    <q-color :model-value="modelValue" format="hex" hide-canvas hide-slate flat bordered @update:model-value="emit('update:modelValue', $event)" />
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true
  },
  modelValue: {
    type: String,
    required: true
  }
})

// Emission des événements de mise à jour
const emit = defineEmits(['update:modelValue'])
</script>
