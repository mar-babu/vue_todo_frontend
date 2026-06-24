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
import type { Task } from '@/services/taskService'
import { TaskService, TaskPriority } from '@/services/taskService'

const emit = defineEmits<{
	(e: 'task-created', task: Task): void
}>()

const isDialogOpen = ref(false)
const name = ref('')
const description = ref('')
const priority = ref<TaskPriority>(TaskPriority.LOW)
const isSubmitting = ref(false)
const errors = ref<Record<string, string>>({})

const closeDialog = () => {
  isDialogOpen.value = false
  resetForm()
}

const resetForm = () => {
  name.value = ''
  description.value = ''
  priority.value = TaskPriority.LOW
  errors.value = {}
}

const handleSubmit = async () => {
  errors.value = {}

  try {
    isSubmitting.value = true
    const newTask = await TaskService.create({
      name: name.value,
      description: description.value,
      priority: Number(priority.value)
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
			<Button variant="outline" class="gap-2 cursor-pointer">
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
            {{ errors.name[0] }}
          </p>
				</div>
				
				<div class="grid gap-2">
					<Label>Description</Label>
					<DescriptionEditor v-model="description" />
					<p v-if="errors.description" class="text-sm text-destructive">
            {{ errors.description[0] }}
          </p>
				</div>

        <div class="grid gap-2">
					<Label for="priority">Priority</Label>
					<select 
            id="priority" 
            v-model="priority"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option :value="TaskPriority.LOW">Low</option>
            <option :value="TaskPriority.MEDIUM">Medium</option>
            <option :value="TaskPriority.HIGH">High</option>
          </select>
          <p v-if="errors.priority" class="text-sm text-destructive">
            {{ errors.priority[0] }}
          </p>
				</div>
			</div>
			
			<DialogFooter>
        <Button variant="outline" @click="closeDialog()" class="cursor-pointer">
          Cancel
        </Button>
				<Button :disabled="isSubmitting" @click="handleSubmit" class="cursor-pointer">
					<Spinner v-if="isSubmitting" class="w-4 h-4 mr-2" />
					{{ isSubmitting ? 'Processing...' : 'Submit' }}
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</template>
