<template>
  <SectionExpansion label="Sections" icon="dashboard" header-class="bg-teal text-white" :default-opened="true">
    <div class="q-gutter-md">
      <draggable :list="sections" item-key="id" class="q-gutter-md" @update:list="$emit('update:sections', $event)">
        <template #item="{ element, index }">
          <SectionEditor :element="element" :section-type-btns="sectionTypeBtns" @remove="() => emit('remove-section', index)" />
        </template>
      </draggable>

      <q-btn label="+ Ajouter une section" color="primary" @click="emit('add-section')" outline size="lg" class="full-width" />
    </div>
  </SectionExpansion>
</template>

<script setup>
import draggable from 'vuedraggable'
import SectionExpansion from './SectionExpansion.vue'
import SectionEditor from './SectionEditor.vue'

// Définition des props du composant
defineProps({
  sections: {
    type: Array,
    required: true
  },
  sectionTypeBtns: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['add-section', 'remove-section'])
</script>
