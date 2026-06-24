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
	<div class="editor flex flex-col border rounded-md min-h-[150px] overflow-hidden" @blur="handleBlur">
		<div class="flex gap-2 p-2 border-b bg-muted/50" v-if="editor">
			<button type="button" @click.prevent="editor.chain().focus().toggleBold().run()" :class="{ 'bg-muted-foreground/20 font-bold': editor.isActive('bold'), 'font-bold': true }" class="px-2 py-1 text-sm rounded hover:bg-muted cursor-pointer">B</button>
			<button type="button" @click.prevent="editor.chain().focus().toggleItalic().run()" :class="{ 'bg-muted-foreground/20 italic': editor.isActive('italic'), 'italic': true }" class="px-2 py-1 text-sm rounded hover:bg-muted cursor-pointer">I</button>
			<button type="button" @click.prevent="editor.chain().focus().toggleStrike().run()" :class="{ 'bg-muted-foreground/20 line-through': editor.isActive('strike'), 'line-through': true }" class="px-2 py-1 text-sm rounded hover:bg-muted cursor-pointer">S</button>
		</div>
		<editor-content :editor="editor" class="p-2 flex-1 max-h-[300px] overflow-y-auto"/>
	</div>
</template>
