<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue'
import Dialog from '@/components/ui/dialog/Dialog.vue'
import DialogContent from '@/components/ui/dialog/DialogContent.vue'
import DialogFooter from '@/components/ui/dialog/DialogFooter.vue'
import DialogHeader from '@/components/ui/dialog/DialogHeader.vue'
import DialogTitle from '@/components/ui/dialog/DialogTitle.vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import Spinner from '@/components/ui/spinner/Spinner.vue'
import DescriptionEditor from '@/components/task/DescriptionEditor.vue'
import { ref, watch } from 'vue'
import type { Task } from '@/services/taskService'
import { TaskService, TaskPriority } from '@/services/taskService'

interface Props {
  taskId: string
  open: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'task-updated', task: Task): void
}>()

const isDialogOpen = ref(props.open)
const task = ref<Task | null>(null)
const name = ref('')
const description = ref('')
const priority = ref<TaskPriority>(TaskPriority.LOW)
const isSubmitting = ref(false)
const isLoading = ref(false)
const errors = ref<Record<string, string>>({})

watch(() => props.open, async (val: any) => {
  isDialogOpen.value = val
  if (val) {
    await fetchTask()
  } else {
    resetForm()
  }
})

watch(isDialogOpen, (val: any) => {
  if (!val) {
    closeDialog()
  }
})

const fetchTask = async () => {
  try {
    isLoading.value = true
    const data = await TaskService.getTask(props.taskId)
    task.value = data
    name.value = data.name
    description.value = data.description
    priority.value = data.priority
    errors.value = {}
  } catch (error) {
    errors.value.general = 'Failed to load task'
    closeDialog()
  } finally {
    isLoading.value = false
  }
}

const closeDialog = () => {
  isDialogOpen.value = false
  emit('update:open', false)
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
    const response = await TaskService.update(props.taskId, {
      name: name.value,
      description: description.value,
      priority: Number(priority.value)
    })
    
    if (response.success) {
      emit('task-updated', response.data)
      closeDialog()
    }
  } catch (error: any) {
    if (error.response?.status === 422) {
      errors.value = error.response.data.errors
    } else {
      errors.value.general = 'Failed to update task. Please try again.'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="isDialogOpen">
    <DialogContent class="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Edit Task</DialogTitle>
      </DialogHeader>
      
      <div v-if="isLoading" class="py-8 text-center">
        <Spinner class="w-8 h-8 mx-auto" />
      </div>

      <template v-else-if="task">
        <div class="grid gap-4 py-4">
          <div class="grid gap-2">
            <Label for="name">Task Name</Label>
            <Input
              id="name"
              v-model="name"
              :class="{ 'border-destructive': errors.name }"
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
            <Label for="edit-priority">Priority</Label>
            <select 
              id="edit-priority" 
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
      </template>
      
      <div v-else class="py-8 text-center text-destructive">
        Failed to load task
      </div>

      <DialogFooter class="gap-2">
        <Button variant="outline" @click="closeDialog()" class="cursor-pointer">
          Cancel
        </Button>
        <Button :disabled="isSubmitting" @click="handleSubmit" class="cursor-pointer">
          <Spinner v-if="isSubmitting" class="w-4 h-4 mr-2" />
          {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
