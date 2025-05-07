<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue'
import Dialog from '@/components/ui/dialog/Dialog.vue'
import DialogContent from '@/components/ui/dialog/DialogContent.vue'
import DialogFooter from '@/components/ui/dialog/DialogFooter.vue'
import DialogHeader from '@/components/ui/dialog/DialogHeader.vue'
import DialogTitle from '@/components/ui/dialog/DialogTitle.vue'
import DialogTrigger from '@/components/ui/dialog/DialogTrigger.vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import Spinner from '@/components/ui/spinner/Spinner.vue'
import DescriptionEditor from '@/components/task/DescriptionEditor.vue'
import { ref } from "vue";
import { PlusIcon } from 'lucide-vue-next'
import { Task } from '@/services/taskService'
import { TaskService } from '@/services/taskService'

const emit = defineEmits<{
	(e: 'task-created', task: Task): void
}>()

const isDialogOpen = ref(false)
const name = ref('')
const description = ref('')
const isSubmitting = ref(false)
const errors = ref<Record<string, string>>({})

const resetForm = () => {
  name.value = ''
  description.value = ''
  errors.value = {}
}

const handleSubmit = async () => {
  errors.value = {}
  
  if (!name.value.trim()) {
    errors.value.name = 'Task name is required'
    return
  }

  try {
    isSubmitting.value = true
    const newTask = await TaskService.create({
      name: name.value,
      description: description.value || '<p></p>'
    })
    emit('task-created', newTask)
    isDialogOpen.value = false
    resetForm()
  } catch (error: any) {
    if (error.response?.status === 422) {
      errors.value = error.response.data.errors
    } else {
      errors.value.general = 'Failed to create task. Please try again.'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
	<Dialog v-model:open="isDialogOpen">
		<DialogTrigger as-child>
			<Button variant="outline" class="gap-2">
				<PlusIcon class="w-4 h-4" />
				Add Task
			</Button>
		</DialogTrigger>
		
		<DialogContent class="sm:max-w-[600px]">
			<DialogHeader>
				<DialogTitle>Create New Task</DialogTitle>
			</DialogHeader>
			
			<div class="grid gap-4 py-4">
				<div class="grid gap-2">
					<Label for="name">Task Name</Label>
					<Input
            id="name"
            v-model="name"
            placeholder="Enter task name"
            :class="{ 'border-destructive': errors.name }"
            @keyup.enter="handleSubmit"
          />
          <p v-if="errors.name" class="text-sm text-destructive">
            {{ errors.name }}
          </p>
				</div>
				
				<div class="grid gap-2">
					<Label>Description</Label>
					<DescriptionEditor v-model="description" />
					<p v-if="errors.description" class="text-sm text-destructive">
            {{ errors.description }}
          </p>
				</div>
			</div>
			
			<DialogFooter>
				<Button :disabled="isSubmitting" @click="handleSubmit">
					<Spinner v-if="isSubmitting" class="w-4 h-4 mr-2" />
					{{ isSubmitting ? 'Processing...' : 'Submit' }}
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</template>
