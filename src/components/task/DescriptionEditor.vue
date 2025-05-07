<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { watch, onMounted } from 'vue'

const props = defineProps({
    modelValue: String
})

const emit = defineEmits(['update:modelValue', 'validation'])

const editor = useEditor({
	content: props.modelValue,
	extensions: [StarterKit],
	onUpdate: () => validateContent(),
	editorProps: {
    attributes: {
      class: 'prose prose-sm focus:outline-none min-h-[100px] p-2',
    },
  },
})

const validateContent = () => {
  const html = editor.value?.getHTML() || ''
  const isEmpty = html === '<p></p>' || html.trim() === ''
  
  emit('update:modelValue', isEmpty ? '' : html)
  emit('validation', !isEmpty)
}

onMounted(() => {
  validateContent()
})

watch(() => props.modelValue, (value: any) => {
  const isSame = editor.value?.getHTML() === value
  if (!isSame) {
    editor.value?.commands.setContent(value || '', false)
    validateContent()
  }
})

const handleBlur = () => {
  validateContent()
}
</script>

<template>
	<div class="editor border rounded-md p-4 min-h-[150px]" @blur="handleBlur">
		<editor-content :editor="editor" />
	</div>
</template>
