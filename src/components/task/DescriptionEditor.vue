<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

const props = defineProps({
    modelValue: String
})

const emit = defineEmits(['update:modelValue'])

const editor = useEditor({
	content: props.modelValue,
	extensions: [StarterKit],
	onUpdate: () => {
			emit('update:modelValue', editor.value?.getHTML())
	}
})
</script>

<template>
	<div class="editor border rounded-md p-4 min-h-[150px]">
		<editor-content :editor="editor" />
	</div>
</template>
