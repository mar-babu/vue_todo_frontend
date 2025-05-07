<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

import Button from '@/components/ui/button/Button.vue'
import Spinner from "@/components/ui/spinner/Spinner.vue"
import TaskAddForm from "@/components/task/TaskAddForm.vue"
import TaskItem from "@/components/task/TaskItem.vue"
import TaskEditForm from "@/components/task/TaskEditForm.vue"
import { TaskService } from "@/services/taskService"
import { TaskStatus } from "@/services/taskService"
import type { Task } from "@/services/taskService"

type Filter = 'All' | 'Pending' | 'In Progress' | 'Completed' | 'Cancelled'
const filters: Filter[] = ['All', 'Pending', 'In Progress', 'Completed', 'Cancelled']
const activeFilter = ref<Filter>('All')

const apiFilterMap: Record<Filter, TaskStatus | 'all'> = {
  'All': 'all',
  'Pending': TaskStatus.PENDING,
  'In Progress': TaskStatus.IN_PROGRESS,
  'Completed': TaskStatus.COMPLETED,
  'Cancelled': TaskStatus.CANCELLED
}

const tasks = ref<Task[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const selectedTaskId = ref<string>('')
const isEditDialogOpen = ref(false)

const fetchTasks = async () => {
  try {
    loading.value = true
    tasks.value = await TaskService.getAll(apiFilterMap[activeFilter.value])
    error.value = null
  } catch (err) {
    error.value = 'Failed to load tasks'
    tasks.value = []
  } finally {
    loading.value = false
  }
}

// watch filter changes
watch(activeFilter, fetchTasks)

// initial fetch
onMounted(fetchTasks)

const remainingTasks = computed(() => 
  tasks.value.filter((t: any) => t.status !== TaskStatus.COMPLETED).length
)

const completedCount = computed(() =>
  tasks.value.filter((t: any) => t.status === TaskStatus.COMPLETED).length
)

const handleTaskCreated = async () => {
  await fetchTasks()
}

const handleToggleTask = async (taskId: string, newStatus: TaskStatus) => {
  try {
    await TaskService.updateStatus(taskId, newStatus)
    tasks.value = tasks.value.map((task: Task) => 
      task.id === taskId ? { ...task, status: newStatus } : task
    )
    await fetchTasks()
  } catch (err) {
    error.value = 'Failed to update task status'
  }
}

const handleDeleteTask = async (taskId: string) => {
  try {
    await TaskService.delete(taskId)
    await fetchTasks()
  } catch (err) {
    error.value = 'Failed to delete task'
  }
}

const clearCompleted = async () => {
  try {
    const completedTasks = tasks.value.filter((t: any) => t.status === TaskStatus.COMPLETED)
    await Promise.all(completedTasks.map((t: any) => TaskService.delete(t.id)))
    await fetchTasks()
  } catch (err) {
    error.value = 'Failed to clear completed tasks'
  }
}

const handleEditTask = (task: Task) => {
  selectedTaskId.value = task.id
  isEditDialogOpen.value = true
}

const handleTaskUpdated = (updatedTask: Task) => {
  tasks.value = tasks.value.map((t: any) => 
    t.id === updatedTask.id ? updatedTask : t
  )
}
</script>

<template>
  <div class="max-w-3xl p-6 mx-auto">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-bold">Todo App</h1>
      <TaskAddForm @task-created="handleTaskCreated" />
    </div>

    <div class="flex gap-2 mb-6">
      <Button
        v-for="filter in filters"
        :key="filter"
        :variant="activeFilter === filter ? 'default' : 'outline'"
        @click="activeFilter = filter"
      >
        {{ filter }}
      </Button>
    </div>

    <div v-if="loading" class="py-8 text-center">
      <Spinner class="w-8 h-8 mx-auto" />
    </div>

    <div v-else-if="error" class="p-4 mb-6 text-red-700 bg-red-100 rounded">
      {{ error }}
    </div>

    <template v-else>
      <div class="mb-6 space-y-4">
        <TransitionGroup name="list">
          <TaskItem
            v-for="task in tasks"
            :key="task.id"
            :task="task"
            @toggle="handleToggleTask"
            @delete="handleDeleteTask"
            @edit="handleEditTask"
          />
        </TransitionGroup>
      </div>

      <div
        class="flex items-center justify-between text-sm text-muted-foreground"
      >
        <span>{{ remainingTasks }} items left</span>
        <Button
          variant="ghost"
          @click="clearCompleted"
          :disabled="completedCount === 0"
        >
          Clear completed ({{ completedCount }})
        </Button>
      </div>
      <TaskEditForm
        :task-id="selectedTaskId"
        :open="isEditDialogOpen"
        @update:open="isEditDialogOpen = $event"
        @task-updated="handleTaskUpdated"
      />
    </template>
  </div>
</template>

<style>
	.list-enter-active,
	.list-leave-active {
		transition: all 0.3s ease;
	}
	.list-enter-from,
	.list-leave-to {
		opacity: 0;
		transform: translateX(30px);
	}
</style>
