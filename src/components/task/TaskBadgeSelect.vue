<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: number
  options: { value: number; label: string; colorClass: string }[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
  (e: 'change', value: number): void
}>()

const currentColorClass = computed(() => {
  const selectedOption = props.options.find(opt => opt.value === props.modelValue)
  return selectedOption ? selectedOption.colorClass : 'bg-gray-100 text-gray-700'
})

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const newValue = Number(target.value)
  emit('update:modelValue', newValue)
  emit('change', newValue)
}
</script>

<template>
  <select
    class="text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer outline-none focus:ring-2 focus:ring-ring border border-transparent shadow-sm transition-all duration-200 hover:brightness-95"
    :class="currentColorClass"
    :value="modelValue"
    @change="handleChange"
  >
    <option
      v-for="opt in options"
      :key="opt.value"
      :value="opt.value"
      :class="opt.colorClass"
    >
      {{ opt.label }}
    </option>
  </select>
</template>
